const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
module.exports = async function checkRecovery(page) {
  await page.waitForFunction(() => !document.querySelector('#aim-calibrate').disabled);
  await page.locator('#aim-calibrate').click();
  await page.evaluate(() => {
    window.crossArms = false; const original = makePose;
    window.makePose = () => original().map(p => crossArms && p.name === 'left_wrist' ? { ...p, x: 650 + poseOffset, y: 260 }
      : crossArms && p.name === 'right_wrist' ? { ...p, x: 350 + poseOffset, y: 280 } : p);
  });
  await page.locator('#body-start').click();
  const correct = await page.evaluate(() => {
    const n = document.querySelector('#problem').textContent.match(/\d+/g).map(Number);
    return [...document.querySelectorAll('#choices .number')].findIndex(e => Number(e.textContent) === n[0] + n[1]);
  });
  await page.evaluate(offset => { poseOffset = offset; }, [200, 50, -50, -200][correct]);
  await page.waitForFunction(i => document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'), correct);
  await page.evaluate(() => { crossArms = true; });
  await page.waitForFunction(i => {
    const value = Number(document.querySelectorAll('#choices .card-hp i')[i].style.transform.match(/[\d.]+/)[0]);
    return value < .8;
  }, correct);
  await page.evaluate(() => { poseMode = 'missing'; });
  await page.waitForTimeout(250);
  const state = async () => ({ problem: await page.locator('#problem').textContent(), score: await page.locator('#score').textContent(),
    hp: await page.locator('#choices .card-hp i').nth(correct).getAttribute('style') });
  const preserved = await state(); assert.equal(preserved.score, '0');
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent === 'からだを うつしてね');
  const time = await page.locator('#time').textContent();
  await page.waitForTimeout(1100); assert.equal(await page.locator('#time').textContent(), time);
  assert.deepEqual(await state(), preserved);
  await page.evaluate(() => { poseMode = 'valid'; }); // Crossed arms must not start countdown.
  await page.waitForTimeout(600); assert.equal(await page.locator('#dialog-title').textContent(), 'からだを うつしてね');
  await page.evaluate(() => { crossArms = false; });
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent.includes('3 びょう'));
  await page.waitForTimeout(1100);
  await page.evaluate(() => { poseMode = 'missing'; });
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent === 'からだを うつしてね');
  await page.evaluate(() => { poseMode = 'valid'; });
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent.includes('3 びょう'));
  const docs = path.resolve(__dirname, '../../docs');
  await page.locator('.arena').screenshot({ path: path.join(docs, 'loop12-countdown.png') });
  await page.waitForFunction(() => document.querySelector('#overlay').hidden);
    assert.deepEqual(await state(), preserved);
    await page.waitForFunction(() => document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(() => { crossArms = true; });
  await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
  await page.evaluate(() => { poseMode = 'missing'; });
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent === 'からだを うつしてね');
  await page.evaluate(() => { poseMode = 'valid'; crossArms = false; });
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent.includes('3 びょう'));
  await page.locator('#recovery-cancel').click();
  await page.waitForTimeout(3300); assert.equal(await page.locator('#dialog-title').textContent(), 'ひとやすみ');
  await page.locator('#body-start').click();
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent.includes('3 びょう'));
  await page.locator('#camera-touch').click();
  await page.waitForTimeout(3300);
  assert.equal(await page.locator('#overlay').isHidden(), true);
  assert.equal(await page.locator('#score').textContent(), '1');
  assert.equal(await page.evaluate(() => testStream.getTracks().every(t => t.readyState === 'ended')), true);
  const result = { input: 'synthetic video and mock poses', preserved, autoPause: 'passed', countdownRestart: 'passed',
    resumeAndScore: 'passed', manualCancellation: 'passed', touchCancellation: 'passed' };
  fs.writeFileSync(path.join(docs, 'loop12-browser-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
};
