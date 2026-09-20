const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { api: { chromium } } = require('../browser/playwright-runtime.cjs')();
const { mockBody, calibrateAndStart } = require('./fixtures.cjs');
let server, browser;
before(async () => {
  server = await require('../browser/serve-public.cjs')();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => { await browser?.close(); await server?.close(); });

async function measure(page) {
  return page.evaluate(() => {
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const bounds = selector => rect(document.querySelector(selector));
    const visible = selector => document.querySelector(selector).getClientRects().length > 0;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      page: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      arena: bounds('.arena'), monitor: bounds('#camera-monitor'), settings: bounds('#camera-setup'),
      arenaVisible: visible('.arena'), monitorVisible: visible('#camera-monitor'), settingsVisible: visible('#camera-setup'),
      pause: bounds('#pause'), track: bounds('.time-track'),
      cards: [...document.querySelectorAll('#choices button')].map(rect),
      controls: [...document.querySelectorAll('#camera-setup button, #camera-setup select, .topbar button')]
        .filter(element => element.getClientRects().length > 0).map(element => ({ id: element.id, ...rect(element) })),
    };
  });
}

async function settleGameLayout(page) {
  await page.waitForFunction(() => {
    const arena = document.querySelector('.arena').getBoundingClientRect();
    const canvas = document.querySelector('#game-canvas canvas')?.getBoundingClientRect();
    return canvas && Math.abs((arena.width - 2) / (arena.height - 2) - 16 / 9) < .01
      && Math.abs(canvas.width - (arena.width - 2)) < 2;
  });
}

function assertFits(layout, settings) {
  assert.ok(layout.page.width <= layout.viewport.width, `page width: ${JSON.stringify(layout)}`);
  assert.ok(layout.page.height <= layout.viewport.height, `page height: ${JSON.stringify(layout)}`);
  assert.equal(layout.settingsVisible, settings);
  assert.equal(layout.arenaVisible, !settings);
  layout.controls.forEach(control => {
    assert.ok(control.width >= 44 && control.height >= 44, `${control.id} is a 44px target`);
    assert.ok(control.x >= 0 && control.right <= layout.viewport.width && control.y >= 0 && control.bottom <= layout.viewport.height, `${control.id} fits without scrolling`);
  });
  if (settings) {
    assert.equal(layout.monitorVisible, false);
    assert.ok(layout.settings.y >= 0 && layout.settings.bottom <= layout.viewport.height, 'dedicated settings fit the viewport');
    return;
  }
  assert.ok(layout.arena.y >= 0 && layout.arena.bottom <= layout.viewport.height);
  assert.ok(Math.abs((layout.arena.width - 2) / (layout.arena.height - 2) - 16 / 9) < .01, 'arena retains 16:9');
  if (layout.monitorVisible) assert.ok(layout.monitor.x >= layout.arena.right && layout.monitor.bottom <= layout.viewport.height, 'optional monitor stays beside the arena');
  assert.ok(layout.pause.width >= 44 && layout.pause.height >= 44 && layout.pause.bottom <= layout.track.y, 'pause target stays clear of the time track');
  layout.cards.forEach(card => {
    assert.ok(card.width >= 44 && card.height >= 44);
    assert.ok(card.x >= layout.arena.x && card.right <= layout.arena.right);
    assert.ok(card.bottom < layout.arena.y + layout.arena.height * .8, 'cards leave the lower arena for the hero');
  });
}

for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080]]) {
  test(`separate camera settings and game fit a ${width}×${height} TV without page scrolling`, { timeout: 30000 }, async () => {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    try {
      await mockBody(page); await page.goto(server.url);
      await page.waitForFunction(() => document.querySelector('#game-canvas').dataset.assets === 'ready');
      await page.locator('#choose-camera').click();
      await page.waitForFunction(() => !document.querySelector('#aim-calibrate').disabled);
      await page.waitForFunction(() => !document.querySelector('#camera-preview').paused);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.resolve(__dirname, `../../docs/tv-camera-setup-${width}.png`) });
      assertFits(await measure(page), true);
      await calibrateAndStart(page);
      await settleGameLayout(page);
      await page.waitForFunction(() => !document.querySelector('#camera-preview').paused);
      assert.equal(await page.locator('#camera-monitor').isHidden(), true);
      assertFits(await measure(page), false);
      const fullArena = await page.locator('.arena').boundingBox();
      await page.screenshot({ path: path.resolve(__dirname, `../../docs/tv-camera-play-${width}.png`) });
      await page.locator('#toggle-camera-preview').click();
      assert.equal(await page.locator('#camera-monitor').isVisible(), true);
      await settleGameLayout(page);
      assertFits(await measure(page), false);
      assert.ok((await page.locator('.arena').boundingBox()).width <= fullArena.width, 'hiding the monitor leaves more room for the game');
      await page.locator('#toggle-camera-preview').click();
      assert.equal(await page.locator('#camera-monitor').isHidden(), true);
      await settleGameLayout(page);
      assertFits(await measure(page), false);
      await page.locator('#open-camera-settings').click();
      await page.waitForFunction(() => !document.querySelector('#camera-preview').paused);
      assertFits(await measure(page), true);
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}
