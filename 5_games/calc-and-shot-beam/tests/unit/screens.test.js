import test from 'node:test';import assert from 'node:assert/strict';import {ScreenFlow} from '../../public/js/ui/screens.js';import {GameSession} from '../../public/js/game/session.js';
test('practice returns to ready, chosen range reaches game and replay resets score',()=>{
  const flow=new ScreenFlow();flow.practice();assert.equal(flow.screen,'practice');flow.finishPractice();assert.equal(flow.screen,'ready');
  flow.selectLevel('wide');const game=new GameSession({settings:flow.start(),rng:()=>.999});game.start(0);assert.equal(game.problem.answer,18);
  game.score=3;game.tick(60000);flow.result();assert.equal(flow.screen,'result');flow.selectLevel('easy');game.settings=flow.start();game.start(60001);assert.equal(game.score,0);assert.ok(game.problem.answer<=5);
  assert.throws(()=>flow.selectLevel('unknown'));
});
