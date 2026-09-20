const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { api: { chromium } } = require('../browser/playwright-runtime.cjs')();
const { mockBody, answerIndex, snapshot, calibrateAndStart } = require('./fixtures.cjs');
let server, browser;
before(async () => {
  server = await require('../browser/serve-public.cjs')();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => { await browser?.close(); await server?.close(); });

async function settingsPage() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.testErrors = []; page.on('pageerror', error => page.testErrors.push(error.message));
  await mockBody(page); await page.goto(server.url); await page.locator('#choose-camera').click();
  await page.waitForFunction(() => !document.querySelector('#aim-calibrate').disabled);
  return page;
}

async function aimAtAnswer(page) {
  const index = await answerIndex(page);
  await page.evaluate(offset => { poseOffset = offset; }, [200, 50, -50, -200][index]);
  await page.waitForFunction(i => document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'), index);
}

test('camera calibration and wrist practice stay in settings until the explicit start button', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    assert.equal(await page.locator('#camera-setup').isVisible(), true);
    assert.equal(await page.locator('.play-stage').isHidden(), true);
    assert.equal(await page.locator('#choices button').count(), 0);
    assert.equal(await page.locator('#body-start').isDisabled(), true);
    assert.equal(await page.locator('#settings-preview-slot #camera-view').count(), 1);
    const initial = await snapshot(page);
    assert.equal(initial.time, '60'); assert.equal(initial.score, '0');
    await page.evaluate(() => { savedCameraView = document.querySelector('#camera-view'); savedStream = testStream; });
    await page.locator('#aim-calibrate').click();
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#camera-setup').isVisible(), true, 'calibration does not automatically start');
    assert.deepEqual(await snapshot(page), initial);
    await page.evaluate(() => { wristsNear = true; poseOffset = 200; });
    await page.waitForFunction(() => document.querySelector('#aim-cards .is-firing') !== null);
    await page.waitForFunction(() => document.querySelector('#aim-cards .is-aimed') !== null);
    assert.equal(await page.locator('#body-start').isEnabled(), true, 'a calibrated player can enter the game with wrists together');
    await page.waitForTimeout(1100);
    assert.deepEqual(await snapshot(page), initial, 'practice never advances the game');
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.locator('#body-start').click();
    await page.waitForFunction(() => document.querySelector('#camera-setup').hidden);
    await page.waitForFunction(() => !document.querySelector('#camera-preview').paused);
    assert.equal(await page.locator('.arena').isVisible(), true);
    assert.equal(await page.locator('#choices button').count(), 4);
    for (const selector of ['#camera-panel', '#aim-calibrate', '#aim-range', '#body-start', '#camera-monitor']) {
      assert.equal(await page.locator(selector).isHidden(), true, `${selector} is absent from gameplay`);
    }
    assert.equal(await page.locator('#camera-monitor-content #camera-view').count(), 1);
    assert.ok(await page.evaluate(() => document.querySelector('#camera-view') === savedCameraView && document.querySelector('#camera-preview').srcObject === savedStream && testStream === savedStream && testStream.getTracks().every(track => track.readyState === 'live')));
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'tracking');
    assert.equal(await page.locator('#score').textContent(), '0');
    assert.ok((await snapshot(page)).hp.every(hp => hp === 'scaleX(1)'));
    assert.notEqual(await page.locator('#game-canvas').getAttribute('data-pose'), 'fire', 'wrists held together at entry do not fire');
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});

test('opening settings pauses a damaged round and resumes its score, problem and HP without reconnecting', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    await calibrateAndStart(page);
    await aimAtAnswer(page);
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(() => { wristsNear = true; });
    await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
    await page.evaluate(() => { wristsNear = false; });
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await aimAtAnswer(page);
    await page.evaluate(() => { wristsNear = true; savedStream = testStream; });
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.kind === 'hit');
    await page.locator('#open-camera-settings').click();
    await page.waitForFunction(() => !document.querySelector('#camera-preview').paused);
    assert.equal(await page.locator('#camera-setup').isVisible(), true);
    assert.equal(await page.locator('.play-stage').isHidden(), true);
    const paused = await snapshot(page);
    assert.equal(paused.score, '1');
    assert.ok(paused.hp.some(hp => hp !== 'scaleX(1)'), 'partial card damage is retained');
    await page.waitForTimeout(1200);
    assert.deepEqual(await snapshot(page), paused);
    assert.equal(await page.locator('#body-start').isEnabled(), true);
    await page.evaluate(() => { wristsNear = false; });
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.waitForTimeout(1100);
    assert.deepEqual(await snapshot(page), paused, 'reopening settings never automatically resumes');
    assert.ok(await page.evaluate(() => document.querySelector('#camera-preview').srcObject === savedStream && testStream === savedStream && testStream.getTracks().every(track => track.readyState === 'live')));
    await page.locator('#body-start').click();
    await page.waitForFunction(() => document.querySelector('#camera-setup').hidden);
    await page.waitForFunction(() => !document.querySelector('#camera-preview').paused);
    assert.equal(await page.locator('#overlay').isHidden(), true, 'the game stays visible during the recovery countdown');
    assert.deepEqual(await snapshot(page), paused);
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'tracking');
    const resumed = await snapshot(page);
    assert.equal(resumed.problem, paused.problem); assert.deepEqual(resumed.hp, paused.hp); assert.equal(resumed.score, paused.score);
    assert.ok(await page.evaluate(() => testStream === savedStream));
    await page.locator('#change-mode').click();
    const switched = await snapshot(page);
    assert.ok(await page.evaluate(() => testStream.getTracks().every(track => track.readyState === 'ended')));
    await page.locator('#start').click();
    assert.equal(await page.locator('.game-shell').getAttribute('data-mode'), 'mouse');
    const mouse = await snapshot(page);
    assert.equal(mouse.problem, switched.problem); assert.deepEqual(mouse.hp, switched.hp); assert.equal(mouse.score, switched.score);
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});

test('range changes and camera stop require recalibration; a missing pose does not block entering the game', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    await page.locator('#aim-calibrate').click();
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.locator('#aim-range').selectOption('1');
    await page.waitForFunction(() => document.querySelector('#body-start').disabled);
    assert.match(await page.locator('#aim-status').textContent(), /まんなか/);
    await calibrateAndStart(page);
    await page.locator('#open-camera-settings').click();
    assert.equal(await page.locator('#aim-range').inputValue(), '1', 'the active camera retains its selected range');
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.evaluate(() => { poseMissing = true; });
    await page.waitForFunction(() => document.querySelector('#aim-calibrate').disabled);
    assert.equal(await page.locator('#body-start').isEnabled(), true);
    await page.evaluate(() => { poseMissing = false; });
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.locator('#camera-stop').click();
    assert.equal(await page.locator('#body-start').isDisabled(), true);
    assert.ok(await page.evaluate(() => testStream.getTracks().every(track => track.readyState === 'ended')));
    await page.locator('#camera-start').click();
    await page.waitForFunction(() => !document.querySelector('#aim-calibrate').disabled);
    assert.equal(await page.locator('#body-start').isDisabled(), true);
    await page.locator('#settings-back').click();
    assert.equal(await page.locator('#camera-setup').isHidden(), true);
    assert.equal(await page.locator('#choose-camera').isVisible(), true);
    assert.ok(await page.evaluate(() => testStream.getTracks().every(track => track.readyState === 'ended')));
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});

test('shoulder recognition starts the visible game without wrist recognition and firing still requires release', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    await page.locator('#aim-calibrate').click();
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.evaluate(() => { wristsMissing = true; });
    await page.waitForFunction(() => !document.querySelector('#camera-pose [data-joint=left_wrist]') && !document.querySelector('#camera-pose [data-joint=right_wrist]'));
    assert.equal(await page.locator('#body-start').isEnabled(), true, 'missing wrist landmarks must not block the mouse click');
    await page.evaluate(() => { poseMissing = true; });
    await page.waitForFunction(() => document.querySelector('#aim-calibrate').disabled);
    assert.equal(await page.locator('#body-start').isEnabled(), true, 'moving out of frame to reach the mouse must not disable the button');
    await page.locator('#body-start').click();
    await page.waitForFunction(() => document.querySelector('#camera-setup').hidden);
    assert.equal(await page.locator('.arena').isVisible(), true);
    assert.equal(await page.locator('#overlay').isHidden(), true);
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'waiting');
    await page.waitForFunction(() => document.querySelector('#game-canvas').dataset.assets === 'ready');
    await page.locator('#game-canvas canvas').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#choices button:visible').count(), 4);
    assert.equal(await page.locator('#game-canvas canvas').isVisible(), true);
    await page.screenshot({ path: path.resolve(__dirname, '../../docs/camera-ready-waiting.png') });
    const waiting = await snapshot(page);
    assert.equal(waiting.time, '60'); assert.equal(waiting.score, '0');
    assert.ok(waiting.hp.length === 4 && waiting.hp.every(hp => hp === 'scaleX(1)'));
    await page.waitForTimeout(1100);
    assert.deepEqual(await snapshot(page), waiting, 'a missing body cannot consume time or damage cards');
    await page.evaluate(() => { poseMissing = false; });
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'countdown');
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('#overlay').isHidden(), true);
    assert.deepEqual(await snapshot(page), waiting, 'the countdown preserves all game state');
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'tracking');
    assert.equal(await page.locator('#choices button:enabled').count(), 4);
    const started = await snapshot(page);
    assert.equal(started.problem, waiting.problem); assert.deepEqual(started.hp, waiting.hp); assert.equal(started.score, '0');
    assert.equal(await page.locator('#camera-pose [data-joint=left_wrist]').count(), 0);
    await page.waitForFunction(() => Number(document.querySelector('#time').textContent) < 60);
    assert.equal(await page.locator('#score').textContent(), '0');
    assert.deepEqual((await snapshot(page)).hp, waiting.hp);
    await page.screenshot({ path: path.resolve(__dirname, '../../docs/camera-ready-playing.png') });
    await page.evaluate(() => { wristsMissing = false; wristsNear = true; });
    await page.waitForFunction(() => document.querySelector('#aim-cards .is-firing') !== null);
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#feedback').getAttribute('data-tracking'), 'tracking');
    assert.equal(await page.locator('#score').textContent(), '0');
    assert.deepEqual((await snapshot(page)).hp, waiting.hp, 'a held firing gesture cannot arm the first shot');
    await page.evaluate(() => { wristsNear = false; });
    await aimAtAnswer(page);
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(() => { wristsNear = true; });
    await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});

test('manual pause cancels automatic camera recovery while keeping settings reachable', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    await page.locator('#aim-calibrate').click();
    await page.waitForFunction(() => !document.querySelector('#body-start').disabled);
    await page.evaluate(() => { poseMissing = true; });
    await page.waitForFunction(() => document.querySelector('#aim-calibrate').disabled);
    await page.locator('#body-start').click();
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'waiting');
    assert.equal(await page.locator('#overlay').isHidden(), true);
    await page.locator('#pause').click();
    assert.equal(await page.locator('#overlay').isVisible(), true);
    const paused = await snapshot(page);
    await page.evaluate(() => { poseMissing = false; wristsNear = false; });
    await page.waitForTimeout(3500);
    assert.equal(await page.locator('#overlay').isVisible(), true);
    assert.equal(await page.locator('#feedback').getAttribute('data-tracking'), 'inactive');
    assert.deepEqual(await snapshot(page), paused, 'manual pause never resumes from recognition alone');
    await page.locator('#open-camera-settings').click();
    assert.equal(await page.locator('#camera-setup').isVisible(), true);
    assert.equal(await page.locator('#body-start').isEnabled(), true);
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});
