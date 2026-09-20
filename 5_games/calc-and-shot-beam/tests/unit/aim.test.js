import test from 'node:test';
import assert from 'node:assert/strict';
import { AimController } from '../../public/js/input/aim.js';

const pose = (x = .5, capturedAt = 100, shoulderWidth = .2) => ({
  shoulderCenter: { x, y: .4 }, shoulderWidth, capturedAt,
});
test('requires fresh central calibration and can recalibrate without retaining a target', () => {
  const a = new AimController();
  assert.equal(a.update(pose(), 100), null);
  assert.equal(a.calibrate(null, 100), false);
  assert.equal(a.calibrate(pose(), 350), false);
  assert.equal(a.calibrate(pose(), 100), true);
  assert.equal(a.update(pose(), 100), 2);
  assert.equal(a.calibrate(pose(.7, 200), 200), true);
  assert.equal(a.update(pose(.7, 200), 200), 2);
});
test('reaches all four cards using half a calibrated shoulder width on each side', () => {
  for (const [x, expected] of [[.4, 0], [.475, 1], [.525, 2], [.6, 3], [0, 0], [1, 3]]) {
    const a = new AimController(); a.calibrate(pose(), 100);
    assert.equal(a.update(pose(x, 200), 200), expected);
  }
});
test('aim depends on shoulders only, and remains invariant to body scale', () => {
  for (const width of [.1, .2, .4]) {
    const a = new AimController(); a.calibrate(pose(.5, 100, width), 100);
    const p = pose(.5 + width * .5, 200, width * .8);
    p.body = { left_wrist: { x: 1 }, right_wrist: { x: -1 } };
    assert.equal(a.update(p, 200), 3);
  }
});
test('hysteresis holds both sides of a boundary until the margin is crossed', () => {
  const a = new AimController({ smoothingMs: 0 }); a.calibrate(pose(), 100);
  assert.equal(a.update(pose(.44, 200), 200), 0);
  for (const [time, x] of [[210, .451], [220, .449], [230, .453]]) assert.equal(a.update(pose(x, time), time), 0);
  assert.equal(a.update(pose(.46, 240), 240), 1);
  assert.equal(a.update(pose(.449, 250), 250), 1);
  assert.equal(a.update(pose(.44, 260), 260), 0);
});
test('smoothing uses sample time rather than render frequency', () => {
  const simulate = steps => {
    const a = new AimController(); a.calibrate(pose(), 100); a.update(pose(), 100);
    for (const time of steps) a.update(pose(.6, time), time);
    return a.filtered;
  };
  assert.ok(Math.abs(simulate([200]) - simulate([125, 150, 175, 200])) < 1e-10);
  const a = new AimController(); a.calibrate(pose(), 100); a.update(pose(), 100);
  a.update(pose(.6, 150), 150); const once = a.filtered;
  for (let now = 151; now < 200; now++) a.update(pose(.6, 150), now);
  assert.equal(a.filtered, once);
});
test('loss and stale poses remove aim; reset requires new calibration', () => {
  const a = new AimController(); a.calibrate(pose(), 100); a.update(pose(), 100);
  assert.equal(a.update(null, 200), null);
  assert.equal(a.update(pose(.6, 210), 210), 3);
  assert.equal(a.update(pose(.6, 210), 460), null);
  a.reset(); assert.equal(a.update(pose(.6, 470), 470), null);
});
test('invalid and future coordinates never select a card; old samples cannot move aim', () => {
  const a = new AimController(); a.calibrate(pose(), 100);
  assert.equal(a.update(pose(.6, 200), 200), 3);
  assert.equal(a.update(pose(.4, 190), 210), 3);
  for (const p of [pose(NaN, 220), pose(.5, 220, 0), pose(2, 220), pose(.5, 999)]) {
    assert.equal(a.update(p, 220), null);
  }
});
test('movement range is configurable and bad settings are rejected', () => {
  const a = new AimController({ halfRangeShoulders: 1 }); a.calibrate(pose(), 100);
  assert.equal(a.update(pose(.6, 200), 200), 3);
  a.setRange(.25);
  assert.equal(a.calibrated, false);
  assert.throws(() => a.setRange(0), RangeError);
  assert.throws(() => new AimController({ smoothingMs: -1 }), RangeError);
  assert.throws(() => new AimController({ hysteresis: .25 }), RangeError);
});
