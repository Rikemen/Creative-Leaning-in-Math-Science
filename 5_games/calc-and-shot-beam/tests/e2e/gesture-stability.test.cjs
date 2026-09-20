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

test('wrist sensitivity and the live distance diagnostic remain effective in the game', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    assert.equal(await page.locator('#gesture-sensitivity').inputValue(), 'normal');
    await page.locator('#aim-calibrate').click();
    await page.evaluate(() => { wristGap = .7; });
    await page.locator('#gesture-sensitivity').selectOption('strict');
    await page.waitForFunction(() => document.querySelector('#gesture-distance').dataset.range === 'open');
    await page.waitForTimeout(400);
    assert.equal(await page.locator('#aim-cards .is-firing').count(), 0, 'strict treats this distance as released');
    await page.locator('#gesture-sensitivity').selectOption('easy');
    await page.waitForFunction(() => document.querySelector('#gesture-distance').dataset.range === 'near');
    await page.waitForFunction(() => document.querySelector('#aim-cards .is-firing') !== null);
    await page.screenshot({ path: path.resolve(__dirname, '../../docs/gesture-settings-1280.png') });
    assert.equal(await page.locator('#body-start').isEnabled(), true);
    await page.locator('#body-start').click();
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.tracking === 'tracking');
    assert.equal(await page.locator('#gesture-sensitivity').inputValue(), 'easy');
    assert.equal(await page.locator('#gesture-sensitivity').isHidden(), true);
    assert.equal(await page.locator('#score').textContent(), '0');
    await page.evaluate(() => { wristGap = 1.3; });
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await aimAtAnswer(page);
    await page.evaluate(() => { wristGap = .7; });
    await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
    await page.locator('#open-camera-settings').click();
    assert.equal(await page.locator('#gesture-sensitivity').inputValue(), 'easy', 'reopening settings preserves sensitivity');
    await page.evaluate(() => { wristsMissing = true; });
    await page.waitForFunction(() => !document.querySelector('#camera-pose [data-joint=left_wrist]'));
    await page.waitForFunction(() => document.querySelector('#gesture-distance').dataset.range === 'unknown');
    assert.match(await page.locator('#gesture-distance').textContent(), /手首|認識|映/);
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});

test('brief wrist occlusion stops damage and resumes the same shot, while a long occlusion needs release', { timeout: 30000 }, async () => {
  const page = await settingsPage();
  try {
    await calibrateAndStart(page);
    await aimAtAnswer(page);
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(() => { wristsNear = true; });
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.kind === 'hit');
    const short = await page.evaluate(async () => {
      const read = () => ({ problem: document.querySelector('#problem').textContent,
        score: document.querySelector('#score').textContent,
        hp: [...document.querySelectorAll('#choices .card-hp i')].map(element => element.style.transform) });
      const began = performance.now(); wristsMissing = true;
      try {
        while (document.querySelector('#camera-pose [data-joint=left_wrist]') || document.querySelector('#game-canvas').dataset.pose === 'fire') {
          if (performance.now() - began > 1000) throw Error('wrist loss did not stop the visible beam');
          await new Promise(requestAnimationFrame);
        }
        const stopped = read();
        await new Promise(resolve => setTimeout(resolve, 80));
        return { stopped, held: read(), missingMs: performance.now() - began };
      } finally { wristsMissing = false; }
    });
    assert.ok(short.missingMs < 500, `short occlusion was ${short.missingMs}ms`);
    assert.deepEqual(short.held, short.stopped, 'damage stops while wrists are unavailable');
    assert.equal(short.stopped.score, '0');
    await page.waitForFunction(() => document.querySelector('#game-canvas').dataset.pose === 'fire');
    assert.equal((await snapshot(page)).problem, short.stopped.problem, 'fresh near samples resume the same question without opening');
    await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
    await page.evaluate(() => { wristsNear = false; });
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await aimAtAnswer(page);
    await page.evaluate(() => { wristsNear = true; });
    await page.waitForFunction(() => document.querySelector('#feedback').dataset.kind === 'hit');
    await page.evaluate(() => { wristsMissing = true; });
    await page.waitForFunction(() => !document.querySelector('#camera-pose [data-joint=left_wrist]') && document.querySelector('#game-canvas').dataset.pose !== 'fire');
    const stopped = await snapshot(page);
    await page.waitForTimeout(700);
    assert.deepEqual((await snapshot(page)).hp, stopped.hp);
    await page.evaluate(() => { wristsMissing = false; });
    await page.waitForFunction(() => document.querySelector('#aim-cards .is-firing') !== null);
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('#score').textContent(), '1');
    assert.deepEqual((await snapshot(page)).hp, stopped.hp, 'long occlusion does not automatically rearm');
    assert.notEqual(await page.locator('#game-canvas').getAttribute('data-pose'), 'fire');
    await page.evaluate(() => { wristsNear = false; });
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(() => { wristsNear = true; });
    await page.waitForFunction(() => document.querySelector('#score').textContent === '2');
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});
