import test from 'node:test';
import assert from 'node:assert/strict';
import {GameSession} from '../../public/js/game/session.js';

test('manual, hidden and navigation pauses preserve problem/HP/clock and disarm held input',()=>{
  for(const reason of ['manual','hidden','blur','pagehide','camera','camera-setup','tracking']){
    const g=new GameSession({rng:()=>.4});g.start(0);
    const correct=g.choices.indexOf(g.problem.answer);g.press(correct,0);g.pause(200,reason);
    const paused=g.snapshot();assert.equal(paused.pauseReason,reason);assert.equal(paused.hp,75);assert.equal(paused.target,null);assert.equal(paused.held,false);
    g.pause(500,'manual');g.tick(9000);assert.deepEqual(g.snapshot(),paused);
    g.resume(10000);g.tick(10100);assert.equal(g.elapsed,300);assert.equal(g.hp,75);assert.equal(g.pauseReason,null);
    g.press(correct,10100);g.tick(10200);assert.equal(g.hp,62.5);
  }
});
test('pause during breaking resumes remaining transition without scoring twice',()=>{
  const g=new GameSession({rng:()=>.4});g.start(0);g.press(g.choices.indexOf(g.problem.answer),0);g.pause(850);
  assert.equal(g.score,1);assert.equal(g.previousPhase,'breaking');const id=g.questionId;
  g.resume(10000);g.tick(10299);assert.equal(g.questionId,id);g.tick(10300);assert.equal(g.questionId,id+1);assert.equal(g.score,1);
});
test('ready/result are not resumable pauses and a fresh round clears the reason',()=>{
  const g=new GameSession();g.pause(0);assert.equal(g.phase,'ready');g.start(1);g.tick(60001);g.pause(60002);assert.equal(g.phase,'result');assert.equal(g.pauseReason,null);
  g.start(60003);g.pause(60004,'hidden');g.start(60005);assert.equal(g.pauseReason,null);assert.equal(g.score,0);
});
