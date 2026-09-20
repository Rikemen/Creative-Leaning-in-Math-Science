const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async function checkAim(page) {
  const selected = page.locator('#aim-cards .is-aimed');
  const calibrate = page.locator('#aim-calibrate');
  const waitPose = () => page.waitForFunction(() => !document.querySelector('#aim-calibrate').disabled);
  const aimAt = async (offset, index) => {
    await page.evaluate(x => { poseOffset = x; }, offset);
    await page.waitForFunction(i => document.querySelectorAll('#aim-cards .aim-card')[i].classList.contains('is-aimed'), index);
    assert.equal(await selected.count(), 1);
  };
  await waitPose();
  assert.equal(await selected.count(), 0);
  // Establish a live game state to test pause/preservation as well as training.
  await page.locator('#camera-touch').click();
  const numbers = (await page.locator('#problem').textContent()).match(/\d+/g).map(Number);
  const answer = numbers[0] + numbers[1];
  await page.getByRole('button', { name: `答え ${answer}、押し続けて発射`, exact: true }).focus();
  await page.keyboard.down('Space');
  await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
  await page.keyboard.up('Space'); await page.waitForTimeout(400);
  await page.locator('#camera-start').click(); await waitPose();
  const time = await page.locator('#time').textContent();
  const problem = await page.locator('#problem').textContent();
  await calibrate.click();
  await page.waitForFunction(() => document.querySelector('#aim-cards [aria-current]'));
  await page.evaluate(() => {
    const original = makePose;
    window.makePose = () => original().map(p => p.name === 'left_wrist' ? { ...p, x: 650 + poseOffset, y: 260 }
      : p.name === 'right_wrist' ? { ...p, x: 350 + poseOffset, y: 260 } : p);
  });
  for (const [offset, index] of [[200, 0], [50, 1], [-50, 2], [-200, 3]]) await aimAt(offset, index);
  const docs = path.resolve(__dirname, '../../docs');
  await page.locator('#aim-practice').screenshot({ path: path.join(docs, 'loop10-aim-pc.png') });
  await page.locator('#aim-range').selectOption('0.25');
  await page.waitForFunction(() => !document.querySelector('#aim-cards .is-aimed'));
  await page.evaluate(() => { poseOffset = 0; }); await page.waitForTimeout(200);
  await calibrate.click(); await aimAt(100, 0); await aimAt(-100, 3);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('#aim-practice').screenshot({ path: path.join(docs, 'loop10-aim-mobile.png') });
  await page.evaluate(() => { poseMode = 'missing'; });
  await page.waitForFunction(() => !document.querySelector('#aim-cards .is-aimed'));
  assert.equal(await calibrate.isDisabled(), true);
  await page.evaluate(() => { poseMode = 'valid'; }); await waitPose(); await aimAt(100, 0);
  await page.evaluate(() => { poseMode = 'slow'; }); await page.waitForTimeout(400);
  assert.equal(await selected.count(), 0);
  assert.equal(await page.locator('#time').textContent(), time);
  assert.equal(await page.locator('#score').textContent(), '1');
  await page.locator('#camera-touch').click();
  assert.equal(await page.locator('#aim-practice').isHidden(), true);
  assert.equal(await page.locator('#problem').textContent(), problem);
  assert.equal(await page.locator('#score').textContent(), '1');
  assert.equal(await page.evaluate(() => testStream.getTracks().every(t => t.readyState === 'ended')), true);
  await page.waitForTimeout(700);
  assert.equal(await selected.count(), 0);
  const result = { input: 'synthetic video, crossed-arm mock poses', calibration: 'passed', allFourCards: 'passed',
    rangeChange: 'passed', lossAndExpiry: 'passed', scoreAndTimePreserved: 'passed', touchResume: 'passed', mobileOverflow: false };
  fs.writeFileSync(path.join(docs, 'loop10-browser-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
};
