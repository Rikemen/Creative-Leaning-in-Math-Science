import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../../public/js/game/session.js';

function setup() {
  const game = new GameSession({ rng: () => 0 });
  game.start(0);
  const s = game.snapshot();
  return { game, correct: s.choices.indexOf(s.problem.answer), wrong: s.choices.findIndex(n => n !== s.problem.answer) };
}
test('誤答はバリア、途中HP維持、破壊で1点、次問への押しっぱなしは禁止', () => {
  const { game, correct, wrong } = setup();
  game.press(wrong, 0);
  game.tick(1000);
  assert.equal(game.snapshot().hp, 100);
  assert.equal(game.snapshot().feedback, 'barrier');
  game.move(correct, 1000);
  game.tick(1400);
  assert.equal(game.snapshot().hp, 50);
  game.release(1400);
  game.tick(2000);
  assert.equal(game.snapshot().hp, 50);
  game.press(correct, 2000);
  game.tick(2400);
  assert.equal(game.snapshot().score, 1);
  assert.equal(game.snapshot().phase, 'breaking');
  game.tick(2750);
  assert.equal(game.snapshot().questionId, 2);
  game.move(correct, 3000);
  game.press(correct, 3000);
  game.tick(5000);
  assert.equal(game.snapshot().hp, 100);
  assert.equal(game.snapshot().score, 1);
  game.release(5000);
  game.press(correct, 5000);
  game.tick(5800);
  assert.equal(game.snapshot().score, 2);
});
test('画面外に離れた時間と再入場の前の時間にはダメージを与えない', () => {
  const { game, correct } = setup();
  game.press(correct, 0);
  game.move(null, 200);
  game.tick(800);
  assert.equal(game.snapshot().hp, 75);
  game.move(correct, 1000);
  game.release(1200);
  assert.equal(game.snapshot().hp, 50);
});
test('60秒ちょうどの破壊は加点せず、終了後入力も無効', () => {
  const { game, correct } = setup();
  game.press(correct, 59200);
  game.tick(60000);
  assert.equal(game.snapshot().phase, 'result');
  assert.equal(game.snapshot().score, 0);
  game.release(61000);
  game.press(correct, 61000);
  game.tick(62000);
  assert.equal(game.snapshot().score, 0);
});
test('フレームが遅れても60秒より前に成立した破壊だけ1回加点', () => {
  const { game, correct } = setup();
  game.press(correct, 59199);
  game.tick(60500);
  assert.equal(game.snapshot().score, 1);
  assert.equal(game.snapshot().phase, 'result');
});
test('一時停止でHP・問題・時間を維持し、再開に新しい入力が必要', () => {
  const { game, correct } = setup();
  game.press(correct, 0);
  game.pause(200);
  game.tick(10000);
  assert.equal(game.snapshot().hp, 75);
  assert.equal(game.snapshot().elapsed, 200);
  game.resume(10000);
  game.tick(10500);
  assert.equal(game.snapshot().hp, 75);
  game.press(correct, 10500);
  game.tick(11100);
  assert.equal(game.snapshot().score, 1);
});
test('再プレイは状態を初期化し、古い時刻は拒否する', () => {
  const { game, correct } = setup();
  game.press(correct, 0);
  game.tick(800);
  assert.throws(() => game.tick(799), /時刻/);
  game.tick(60000);
  game.start(70000);
  assert.equal(game.snapshot().score, 0);
  assert.equal(game.snapshot().elapsed, 0);
  assert.equal(game.snapshot().hp, 100);
  assert.equal(game.snapshot().target, null);
});
