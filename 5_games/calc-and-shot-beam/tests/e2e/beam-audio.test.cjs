const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api: { chromium } } = require('../browser/playwright-runtime.cjs')();
const { mockBody, answerIndex, calibrateAndStart } = require('./fixtures.cjs');

const beamPaths = ['/assets/audio/beam-fire-v2.wav', '/assets/audio/beam-loop-v2.wav'];
let server, browser;
before(async () => {
  server = await require('../browser/serve-public.cjs')();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => { await browser?.close(); await server?.close(); });

function observeNativeAudio() {
  const NativeAudio = window.Audio;
  window.testBeamAudio = []; window.testAudioRejections = [];
  window.addEventListener('unhandledrejection', event => testAudioRejections.push(String(event.reason)));
  window.Audio = function (src) {
    const audio = new NativeAudio(src);
    audio.testPlays = 0;
    const nativePlay = audio.play.bind(audio);
    audio.play = () => { audio.testPlays += 1; return nativePlay(); };
    testBeamAudio.push(audio);
    return audio;
  };
}

async function open({ camera = false, failBeam = false, preview = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.testErrors = []; page.testFailedAudio = [];
  page.on('pageerror', error => page.testErrors.push(error.message));
  await page.addInitScript(observeNativeAudio);
  if (camera) await mockBody(page);
  if (failBeam) {
    for (const audioPath of beamPaths) await page.route(`**${audioPath}`, async route => {
      page.testFailedAudio.push(new URL(route.request().url()).pathname);
      await route.abort();
    });
  }
  await page.goto(`${server.url}${preview ? '/asset-preview.html' : '/'}`);
  if (preview) await page.waitForFunction(() => testBeamAudio.length === 7);
  else await page.waitForFunction(() => document.querySelector('#game-canvas').dataset.assets === 'ready');
  return page;
}

async function readBeam(page) {
  return page.evaluate(paths => paths.map(path => {
    const audio = testBeamAudio.find(item => new URL(item.src).pathname === path);
    return audio && { path, plays: audio.testPlays, paused: audio.paused, currentTime: audio.currentTime, loop: audio.loop };
  }), beamPaths);
}

async function waitForBothPlaying(page, plays) {
  await page.waitForFunction(({ paths, plays }) => paths.every(path => {
    const audio = testBeamAudio.find(item => new URL(item.src).pathname === path);
    return audio && audio.testPlays === plays && !audio.paused;
  }), { paths: beamPaths, plays });
}

async function waitForBothStopped(page) {
  await page.waitForFunction(paths => paths.every(path => {
    const audio = testBeamAudio.find(item => new URL(item.src).pathname === path);
    return audio && audio.paused && audio.currentTime === 0;
  }), beamPaths);
}

async function holdWrongCard(page) {
  const index = (await answerIndex(page) + 1) % 4;
  await page.locator('#choices button').nth(index).focus();
  await page.keyboard.down('Space');
}

test('both v2 beam WAV files decode in the browser and have reusable native audio elements', { timeout: 30000 }, async () => {
  const page = await open();
  try {
    const decoded = await page.evaluate(async paths => {
      const context = new AudioContext();
      try {
        return await Promise.all(paths.map(async path => {
          const response = await fetch(path);
          if (!response.ok) throw Error(`${path}: HTTP ${response.status}`);
          const buffer = await context.decodeAudioData(await response.arrayBuffer());
          return { path, duration: buffer.duration, channels: buffer.numberOfChannels,
            sampleRate: buffer.sampleRate, audible: buffer.getChannelData(0).some(value => Math.abs(value) > .001) };
        }));
      } finally { await context.close(); }
    }, beamPaths);
    for (const sound of decoded) {
      assert.ok(sound.duration > .05 && sound.duration < 10, `${sound.path} has a usable duration`);
      assert.ok(sound.channels >= 1 && sound.sampleRate >= 8000);
      assert.equal(sound.audible, true, `${sound.path} contains non-silent samples`);
    }
    assert.equal(await page.evaluate(() => testBeamAudio.length), 7);
    const [fire, loop] = await readBeam(page);
    assert.equal(fire.loop, false); assert.equal(loop.loop, true);
    assert.equal(fire.plays, 0); assert.equal(loop.plays, 0);
    assert.deepEqual(page.testErrors, []);
  } finally { await page.close(); }
});

test('mouse beams play one launch per hold and release, pause and mute stop both sounds', { timeout: 30000 }, async () => {
  const page = await open();
  try {
    await page.locator('#start').click();
    await holdWrongCard(page);
    await waitForBothPlaying(page, 1);
    await page.waitForTimeout(1100);
    const held = await readBeam(page);
    assert.deepEqual(held.map(audio => audio.plays), [1, 1], 'a held beam does not replay its launch sound');
    assert.equal(held[1].paused, false, 'the sustain sound keeps looping');
    assert.ok(held[1].currentTime > 0, 'the native loop playback position advances');
    await page.keyboard.up('Space');
    await waitForBothStopped(page);

    await holdWrongCard(page);
    await waitForBothPlaying(page, 2);
    await page.keyboard.up('Space');
    await waitForBothStopped(page);

    await holdWrongCard(page);
    await waitForBothPlaying(page, 3);
    // Keep the held card focused so this exercises the pause handler, not blur release.
    await page.evaluate(() => document.querySelector('#pause').click());
    await waitForBothStopped(page);
    assert.equal(await page.locator('#overlay').isVisible(), true);
    await page.keyboard.up('Space');
    await page.locator('#start').click();

    await holdWrongCard(page);
    await waitForBothPlaying(page, 4);
    await page.evaluate(() => document.querySelector('#mute').click());
    await waitForBothStopped(page);
    assert.equal(await page.locator('#mute').getAttribute('aria-pressed'), 'true');
    await page.waitForTimeout(250);
    assert.deepEqual((await readBeam(page)).map(audio => audio.plays), [4, 4], 'holding while muted does not restart audio');
    await page.keyboard.up('Space');
    await page.locator('#mute').click();
    assert.deepEqual(page.testErrors, []);
    assert.deepEqual(await page.evaluate(() => testAudioRejections), []);
  } finally { await page.close(); }
});

test('camera input uses the same launch and looping beam sounds and release stops them', { timeout: 30000 }, async () => {
  const page = await open({ camera: true });
  try {
    await page.locator('#choose-camera').click();
    await calibrateAndStart(page);
    const index = (await answerIndex(page) + 1) % 4;
    await page.evaluate(offset => { poseOffset = offset; }, [200, 50, -50, -200][index]);
    await page.waitForFunction(i => document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'), index);
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(() => { wristsNear = true; });
    await waitForBothPlaying(page, 1);
    await page.waitForTimeout(350);
    const beaming = await readBeam(page);
    assert.deepEqual(beaming.map(audio => audio.plays), [1, 1]);
    assert.ok(beaming[1].currentTime > 0);
    await page.evaluate(() => { wristsNear = false; });
    await waitForBothStopped(page);
    assert.deepEqual(page.testErrors, []);
    assert.deepEqual(await page.evaluate(() => testAudioRejections), []);
  } finally { await page.close(); }
});

test('failed beam audio downloads do not prevent correct answers from scoring', { timeout: 30000 }, async () => {
  const page = await open({ failBeam: true });
  try {
    await page.locator('#start').click();
    await page.locator('#choices button').nth(await answerIndex(page)).focus();
    await page.keyboard.down('Space');
    await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
    await page.keyboard.up('Space');
    for (const audioPath of beamPaths) assert.ok(page.testFailedAudio.includes(audioPath), `${audioPath} was blocked`);
    assert.deepEqual(page.testErrors, []);
    assert.deepEqual(await page.evaluate(() => testAudioRejections), []);
  } finally { await page.close(); }
});

test('the asset preview module starts both beam layers and stops them for idle or unchecked sound', { timeout: 30000 }, async () => {
  const page = await open({ preview: true });
  try {
    assert.equal(await page.locator('.audio-grid audio').count(), 7);
    assert.deepEqual((await readBeam(page)).map(audio => audio.plays), [0, 0]);
    await page.locator('#sound').check();
    const loopPlayer = page.locator('.audio-grid audio[src$="beam-loop-v2.wav"]');
    await loopPlayer.evaluate(audio => audio.play());
    assert.equal(await loopPlayer.evaluate(audio => audio.paused), false);
    await page.locator('#fire').click();
    await waitForBothPlaying(page, 1);
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('.audio-grid audio')].every(audio => audio.paused)), true, 'beam pose stops standalone previews');
    assert.equal(await page.locator('#fire').getAttribute('aria-pressed'), 'true');
    await loopPlayer.evaluate(audio => audio.play());
    await waitForBothStopped(page);
    assert.equal(await loopPlayer.evaluate(audio => audio.paused), false, 'standalone preview stops the layered beam');
    await page.locator('#fire').click();
    await waitForBothPlaying(page, 2);
    assert.equal(await loopPlayer.evaluate(audio => audio.paused), true);
    await page.locator('#idle').click();
    await waitForBothStopped(page);
    assert.equal(await page.locator('#idle').getAttribute('aria-pressed'), 'true');
    await page.locator('#fire').click();
    await waitForBothPlaying(page, 3);
    await page.locator('#sound').uncheck();
    await waitForBothStopped(page);
    assert.deepEqual(page.testErrors, []);
    assert.deepEqual(await page.evaluate(() => testAudioRejections), []);
  } finally { await page.close(); }
});
