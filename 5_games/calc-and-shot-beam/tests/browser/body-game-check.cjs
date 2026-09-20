const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
module.exports = async function checkBodyGame(page) {
  await page.waitForFunction(() => !document.querySelector('#aim-calibrate').disabled);
  await page.locator('#aim-calibrate').click();
  await page.evaluate(() => {
    window.crossArms = false; const original = makePose;
    window.makePose = () => original().map(p => crossArms && p.name === 'left_wrist' ? { ...p, x: 650 + poseOffset, y: 260 }
      : crossArms && p.name === 'right_wrist' ? { ...p, x: 350 + poseOffset, y: 280 } : p);
  });
  await page.locator('#body-start').click();
  await page.waitForFunction(() => document.querySelectorAll('#choices button').length === 4);
  const answerIndex = async () => page.evaluate(() => {
    const n = document.querySelector('#problem').textContent.match(/\d+/g).map(Number);
    return [...document.querySelectorAll('#choices .number')].findIndex(e => Number(e.textContent) === n[0] + n[1]);
  });
  const aim = async index => {
    await page.evaluate(offset => { poseOffset = offset; }, [200, 50, -50, -200][index]);
    await page.waitForFunction(i => document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'), index);
  };
  const correct = await answerIndex();
  await page.locator('#choices button').nth(correct).focus(); await page.keyboard.down('Space');
  await page.waitForTimeout(1000); await page.keyboard.up('Space');
  assert.equal(await page.locator('#score').textContent(), '0');
  await aim((correct + 1) % 4);
  await page.evaluate(() => { crossArms = true; });
  await page.waitForFunction(() => document.querySelector('#feedback').dataset.kind === 'barrier');
  assert.equal(await page.locator('#score').textContent(), '0');
  await aim(correct);
  await page.waitForFunction(() => document.querySelector('#score').textContent === '1');
  await page.waitForTimeout(450);
  await aim(await answerIndex()); await page.waitForTimeout(1200);
  assert.equal(await page.locator('#score').textContent(), '1');
  await page.evaluate(() => { crossArms = false; }); await page.waitForTimeout(250);
  await page.evaluate(() => { crossArms = true; });
  await page.waitForFunction(() => document.querySelector('#score').textContent === '2');
  const docs = path.resolve(__dirname, '../../docs');
  await page.locator('.arena').screenshot({ path: path.join(docs, 'loop11-body-game.png') });
  await page.evaluate(() => { poseMode = 'missing'; }); await page.waitForTimeout(350);
  await page.evaluate(() => { poseMode = 'valid'; }); await aim(await answerIndex());
  await page.waitForTimeout(1200); assert.equal(await page.locator('#score').textContent(), '2');
  await page.locator('#camera-stop').click();
  await page.waitForFunction(() => !document.querySelector('#overlay').hidden);
  const time = await page.locator('#time').textContent();
  await page.waitForTimeout(1100); assert.equal(await page.locator('#time').textContent(), time);
  await page.locator('#camera-touch').click();
  assert.equal(await page.locator('#overlay').isHidden(), true);
  assert.equal(await page.locator('#score').textContent(), '2');
  assert.equal(await page.evaluate(() => testStream.getTracks().every(t => t.readyState === 'ended')), true);
  const index = await answerIndex(); await page.locator('#choices button').nth(index).focus();
  await page.keyboard.down('Space'); await page.waitForFunction(() => document.querySelector('#score').textContent === '3');
  await page.keyboard.up('Space');
  const result = { input: 'synthetic video and mock poses', wrongBarrier: 'passed', bodyScoring: 2,
    releaseBeforeNextShot: 'passed', unknownDisarms: 'passed', inputExclusion: 'passed', cameraStopPauses: 'passed', touchResumeScoring: 'passed' };
  fs.writeFileSync(path.join(docs, 'loop11-browser-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
};
