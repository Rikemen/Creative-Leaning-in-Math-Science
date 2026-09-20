// Optional integration check: install Playwright separately or pass its module path as argv[2].
// Serve public/ on localhost:5100 before running node tests/browser/pose-preview.cjs.
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.poseMode = 'valid'; window.poseOffset = 0;
      window.makePose = () => [
        { name: 'left_shoulder', x: 300 + poseOffset, y: 200, confidence: .9 },
        { name: 'right_shoulder', x: 700 + poseOffset, y: 200, confidence: .9 },
        { name: 'left_elbow', x: 220 + poseOffset, y: 350, confidence: .9 },
        { name: 'right_elbow', x: 780 + poseOffset, y: 350, confidence: .9 },
        { name: 'left_wrist', x: 280 + poseOffset, y: 100, confidence: poseMode === 'low' ? .1 : .9 },
        { name: 'right_wrist', x: 850 + poseOffset, y: 480, confidence: .9 },
      ];
      navigator.mediaDevices.getUserMedia = async constraints => {
        if (constraints.audio !== false) throw new Error('unexpected microphone request');
        const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
        const ctx = canvas.getContext('2d');
        const paint = () => {
          ctx.fillStyle = '#263a56'; ctx.fillRect(0, 0, 1280, 720);
          ctx.strokeStyle = '#e1e7e9'; ctx.lineWidth = 10;
          const points = makePose();
          for (const [a, b] of [[0, 1], [0, 2], [2, 4], [1, 3], [3, 5]]) {
            ctx.beginPath(); ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); ctx.stroke();
          }
          for (const p of points) { ctx.fillStyle = '#fbb985'; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill(); }
        };
        paint(); window.paintTimer = setInterval(paint, 40);
        window.testStream = canvas.captureStream(25); return testStream;
      };
    });
    await page.route('https://unpkg.com/ml5@1.3.0/dist/ml5.min.js', route => route.fulfill({
      contentType: 'text/javascript', body: `window.ml5 = { bodyPose: async () => ({
        model: { dispose() {} }, detect: async () => {
          const points = makePose();
          if (poseMode === 'slow') await new Promise(resolve => setTimeout(resolve, 600));
          return poseMode === 'missing' ? [] : [{ keypoints: points }];
        }
      }) };`,
    }));
    await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5100/');
    await page.locator('#camera-start').click();
    if (process.argv.includes('--recovery')) {
      await require('./recovery-check.cjs')(page);
      assert.deepEqual(errors, []);
      return;
    }
    if (process.argv.includes('--gesture')) {
      await require('./body-game-check.cjs')(page);
      assert.deepEqual(errors, []);
      return;
    }
    if (process.argv.includes('--aim')) {
      await require('./aim-practice-check.cjs')(page);
      assert.deepEqual(errors, []);
      return;
    }
    const shoulder = page.locator('[data-joint="left_shoulder"]');
    await shoulder.waitFor();
    assert.equal(await shoulder.getAttribute('cx'), '490');
    assert.equal(await shoulder.getAttribute('cy'), '160'); // 16:9 within 4:3 => 60px top bar.
    assert.equal(await page.locator('#camera-pose circle').count(), 6);
    const alignment = await page.evaluate(() => {
      const video = document.querySelector('#camera-preview');
      const svg = document.querySelector('#camera-pose');
      const rect = video.getBoundingClientRect();
      const dot = document.querySelector('[data-joint="left_shoulder"]');
      const p = new DOMPoint(Number(dot.getAttribute('cx')), Number(dot.getAttribute('cy'))).matrixTransform(svg.getScreenCTM());
      const scale = Math.min(rect.width / video.videoWidth, rect.height / video.videoHeight);
      return { xError: Math.abs(p.x - (rect.left + rect.width - 300 * scale)),
        yError: Math.abs(p.y - (rect.top + (rect.height - video.videoHeight * scale) / 2 + 200 * scale)),
        mirror: getComputedStyle(video).transform };
    });
    assert.ok(alignment.xError < .1 && alignment.yError < .1);
    assert.ok(alignment.mirror.startsWith('matrix(-1,'));
    const docs = path.resolve(__dirname, '../../docs');
    await page.screenshot({ path: path.join(docs, 'loop09-pose-pc.png'), fullPage: true });
    await page.evaluate(() => { poseOffset = 80; });
    await page.waitForFunction(() => document.querySelector('[data-joint="left_shoulder"]')?.getAttribute('cx') === '450');
    await page.evaluate(() => { poseMode = 'low'; });
    await page.waitForFunction(() => document.querySelectorAll('#camera-pose circle').length === 5);
    assert.equal(await page.locator('[data-joint="left_wrist"]').count(), 0);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(docs, 'loop09-pose-mobile.png'), fullPage: true });
    await page.evaluate(() => { poseMode = 'missing'; });
    await page.waitForFunction(() => !document.querySelector('#camera-pose circle'));
    await page.evaluate(() => { poseMode = 'valid'; });
    await shoulder.waitFor();
    await page.evaluate(() => { poseMode = 'slow'; });
    await page.waitForTimeout(400);
    assert.equal(await page.locator('#camera-pose circle').count(), 0);
    await page.locator('#camera-touch').click();
    assert.equal(await page.locator('#camera-view').isHidden(), true);
    assert.equal(await page.locator('#choices button').count(), 4);
    assert.equal(await page.evaluate(() => testStream.getTracks().every(t => t.readyState === 'ended')), true);
    await page.waitForTimeout(700); // A late inference must not redraw the stopped preview.
    assert.equal(await page.locator('#camera-pose circle').count(), 0);
    assert.deepEqual(errors, []);
    const result = { alignment, errors, mirroredMovement: 'passed', letterbox: 'passed', lowConfidence: 'passed',
      lossAndExpiry: 'passed', touchFallback: 'passed', mobileOverflow: false, input: 'synthetic video and mock poses' };
    fs.writeFileSync(path.join(docs, 'loop09-browser-results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
