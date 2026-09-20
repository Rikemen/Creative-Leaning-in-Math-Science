import test from 'node:test';
import assert from 'node:assert/strict';
import { RecoveryController } from '../../public/js/input/recovery.js';
import { BodyInput } from '../../public/js/input/body-input.js';
import { GameSession } from '../../public/js/game/session.js';
function setup() {
  const game = new GameSession({ rng: () => .2 }); game.start(0);
  const input = new BodyInput(game), recovery = new RecoveryController(game, input); recovery.start();
  const target = game.choices.indexOf(game.problem.answer);
  const c = (time, gesture = 'open') => ({ target, calibrated: true, gesture, capturedAt: time });
  const step = (time, control = c(time)) => { recovery.update(control, time); game.tick(time); };
  return { game, input, recovery, c, step };
}
const lost = { target: null, calibrated: true, gesture: 'unknown' };
test('short shoulder loss stops damage, keeps clock running, and needs open wrists before firing again', () => {
  const f = setup(); f.step(0); f.step(100, f.c(100, 'firing'));
  f.step(200, lost); const hp = f.game.hp;
  f.step(500, lost); assert.equal(f.game.hp, hp); assert.equal(f.game.elapsed, 500);
  f.step(600, f.c(600, 'firing')); assert.equal(f.game.target, null);
  f.step(700); f.step(800, f.c(800, 'firing')); assert.notEqual(f.game.target, null);
});
test('one second of shoulder loss pauses exactly and preserves problem, HP, score and elapsed time', () => {
  const f = setup(); f.step(0); f.step(100, f.c(100, 'firing')); f.step(200, lost);
  f.step(1199, lost); assert.equal(f.game.phase, 'playing');
  f.step(1200, lost); assert.equal(f.game.phase, 'paused');
  const before = f.game.snapshot(); f.step(5000, lost);
  assert.deepEqual(f.game.snapshot(), before); assert.equal(f.recovery.state, 'waiting');
});
test('shoulder countdown resumes without using the countdown frame as a firing input', () => {
  const f = setup(); f.step(0); f.step(100, lost); f.step(1100, lost);
  f.step(1200, f.c(1200, 'firing')); assert.equal(f.recovery.state, 'countdown');
  for (let t = 1300; t <= 4100; t += 100) { f.step(t); assert.equal(f.game.phase, 'paused'); }
  f.step(4200); assert.equal(f.game.phase, 'playing'); assert.equal(f.input.armed, false);
  f.step(4201, f.c(4200)); assert.equal(f.input.armed, false);
  f.step(4300, f.c(4300, 'firing')); assert.equal(f.game.target, null);
  f.step(4400); f.step(4500, f.c(4500, 'firing')); assert.notEqual(f.game.target, null);
});
test('hand pose does not reset countdown, shoulder loss does; reset cancels auto-resume', () => {
  const f = setup(); f.step(0); f.step(100, lost); f.step(1100, lost);
  for (let t = 1200; t <= 3200; t += 100) f.step(t);
  f.step(3300, f.c(3300, 'charging')); assert.equal(f.recovery.state, 'countdown');
  f.step(3400, f.c(3400, 'unknown')); assert.equal(f.recovery.remaining, 1);
  f.step(3500, lost); assert.equal(f.recovery.remaining, null);
  f.step(3600); f.recovery.reset(); f.step(9000);
  assert.equal(f.game.phase, 'paused'); assert.equal(f.recovery.state, 'inactive');
});
test('initial countdown starts the clock with near or missing wrists but cannot fire until opened', () => {
  for (const gesture of ['charging', 'firing', 'unknown']) {
    const f = setup(); f.game.pause(0, 'tracking'); f.recovery.prepareResume(0);
    for (let t = 0; t < 3000; t += 100) {
      f.step(t, f.c(t, gesture));
      assert.equal(f.game.phase, 'paused'); assert.equal(f.game.elapsed, 0);
      assert.equal(f.game.hp, 100); assert.equal(f.game.score, 0);
    }
    f.step(3000, f.c(3000, gesture));
    assert.equal(f.game.phase, 'playing'); assert.equal(f.input.armed, false);
    f.step(3100, f.c(3100, gesture));
    assert.equal(f.game.elapsed, 100); assert.equal(f.game.target, null);
    assert.equal(f.game.hp, 100); assert.equal(f.game.score, 0);
    f.step(3200); f.step(3300, f.c(3300, 'firing'));
    assert.notEqual(f.game.target, null);
  }
});
test('missing wrists stop damage while fresh shoulders keep the clock running', () => {
  const f = setup(); f.step(0); f.step(100, f.c(100, 'firing'));
  f.step(200, f.c(200, 'unknown')); const hp = f.game.hp;
  assert.equal(hp, 87.5); assert.equal(f.game.target, null); assert.equal(f.input.armed, true);
  for (let t = 300; t <= 4000; t += 100) {
    f.step(t, f.c(t, 'unknown'));
    assert.equal(f.game.phase, 'playing'); assert.equal(f.game.elapsed, t);
    assert.equal(f.game.hp, hp); assert.equal(f.recovery.state, 'tracking');
  }
  assert.equal(f.input.armed, false);
  f.step(4100, f.c(4100, 'firing')); assert.equal(f.game.target, null);
  f.step(4200); f.step(4300, f.c(4300, 'firing')); assert.notEqual(f.game.target, null);
  f.step(4400, lost); const shoulderLostHp = f.game.hp;
  f.step(5399, lost); assert.equal(f.game.phase, 'playing');
  f.step(5400, lost); assert.equal(f.game.phase, 'paused');
  assert.equal(f.game.elapsed, 5400); assert.equal(f.game.hp, shoulderLostHp);
});
test('delayed RAF cannot deal damage beyond pose expiry, even when a new fresh pose arrives', () => {
  for (const fresh of [false, true]) {
    const f = setup(); f.step(0); f.step(100, f.c(100, 'firing'));
    f.step(5000, fresh ? f.c(5000, 'firing') : lost);
    assert.equal(f.game.hp, 68.75); assert.equal(f.game.score, 0);
    assert.equal(f.game.elapsed, 1350); assert.equal(f.game.phase, 'paused');
  }
});
test('manual paused camera restart uses the same countdown, reset permits touch resume only', () => {
  const f = setup(); f.step(0); f.game.pause(100); f.recovery.prepareResume(200);
  assert.equal(f.recovery.state, 'waiting');
  for (let t = 300; t <= 1000; t += 100) f.step(t);
  f.recovery.reset(); f.game.resume(1100); f.step(5000);
  assert.equal(f.game.phase, 'playing'); assert.equal(f.game.held, false);
});
test('old or future samples cannot begin a countdown and gaps restart preparation', () => {
  const f = setup(); f.step(0); f.step(100, lost); f.step(1100, lost);
  f.step(1200, f.c(900)); f.step(1300, f.c(5000));
  assert.equal(f.recovery.state, 'waiting');
  f.step(1400); f.step(2000); assert.equal(f.recovery.state, 'waiting');
  f.step(2100); assert.equal(f.recovery.remaining, 3);
});
