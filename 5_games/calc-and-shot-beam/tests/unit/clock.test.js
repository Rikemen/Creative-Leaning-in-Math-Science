import test from 'node:test';
import assert from 'node:assert/strict';
import { GameClock } from '../../public/js/game/clock.js';

test('開始前・59.999秒・60秒と表示の切り上げ', () => {
  const clock = new GameClock();
  assert.equal(clock.elapsed(1000), 0);
  clock.start(1000);
  assert.equal(clock.remainingSeconds(60999), 1);
  assert.equal(clock.elapsed(60999), 59999);
  assert.equal(clock.remainingSeconds(61000), 0);
  assert.equal(clock.elapsed(90000), 60000);
});
test('重複停止・再開で時間を二重に足さず、中断時間は除外', () => {
  const clock = new GameClock();
  clock.start(0);
  clock.pause(1000);
  clock.pause(2000);
  assert.equal(clock.elapsed(10000), 1000);
  clock.resume(10000);
  clock.resume(11000);
  assert.equal(clock.elapsed(12000), 3000);
  clock.start(13000);
  assert.equal(clock.elapsed(13000), 0);
});
