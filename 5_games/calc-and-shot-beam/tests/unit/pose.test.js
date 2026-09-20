import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePose, projectPoint, PoseNormalizer } from '../../public/js/input/pose-normalizer.js';

const points = [
  { name: 'left_shoulder', x: 200, y: 160, confidence: .9 },
  { name: 'right_shoulder', x: 400, y: 160, confidence: .9 },
  { name: 'left_elbow', x: 180, y: 260, confidence: .9 },
  { name: 'left_wrist', x: 240, y: 300, confidence: .9 },
];
const frame = (capturedAt = 100, keypoints = points) => ({ capturedAt, width: 640, height: 480, poses: [{ keypoints }] });
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('mirrors horizontal coordinates once without swapping anatomical names or mutating input', () => {
  const source = frame(), copy = structuredClone(source);
  const p = normalizePose(source);
  close(p.keypoints.left_shoulder.x, 1 - 200 / 640);
  close(p.keypoints.left_shoulder.y, 160 / 480);
  close(p.shoulderCenter.x, 1 - 300 / 640);
  close(p.shoulderWidth, 200 / 640);
  assert.deepEqual(source, copy);
  close(normalizePose(source, { mirrored: false }).keypoints.left_shoulder.x, 200 / 640);
});

test('contain projection matches horizontal and vertical letterboxing and viewport offsets', () => {
  assert.deepEqual(projectPoint({ x: 0, y: 0 }, { width: 640, height: 480 }, { x: 10, y: 20, width: 160, height: 160 }), { x: 10, y: 40 });
  assert.deepEqual(projectPoint({ x: 1, y: 1 }, { width: 480, height: 640 }, { width: 160, height: 160 }), { x: 140, y: 160 });
  assert.deepEqual(projectPoint({ x: .5, y: .5 }, { width: 1920, height: 1080 }, { width: 640, height: 480 }), { x: 320, y: 240 });
});

test('shoulder-relative body units are invariant to resolution, translation and body size', () => {
  const a = normalizePose(frame());
  const b = normalizePose({ ...frame(), keypoints: undefined, width: 1280, height: 960,
    poses: [{ keypoints: points.map(p => ({ ...p, x: p.x * 2, y: p.y * 2 })) }] });
  assert.deepEqual(a.body, b.body);
  const c = normalizePose(frame(100, points.map(p => ({ ...p, x: p.x * .5 + 60, y: p.y * .5 + 50 }))));
  for (const name of Object.keys(a.body)) {
    close(a.body[name].x, c.body[name].x); close(a.body[name].y, c.body[name].y);
  }
  close(a.body.left_shoulder.x, .5);
  close(a.body.left_wrist.y, .7);
});

test('low confidence wrists are omitted; missing/low confidence/degenerate shoulders invalidate the pose', () => {
  const keypoints = points.map(p => ({ ...p, confidence: p.name === 'left_wrist' ? .29 : .9 }));
  assert.equal(normalizePose(frame(100, keypoints)).keypoints.left_wrist, undefined);
  for (const replacement of [{ confidence: .29 }, { x: 400, y: 160 }, { x: NaN }, { x: -1 }]) {
    assert.equal(normalizePose(frame(100, points.map(p => p.name === 'left_shoulder' ? { ...p, ...replacement } : p))), null);
  }
  assert.equal(normalizePose(frame(100, points.slice(1))), null);
});

test('invalid dimensions, coordinates, ambiguous people and duplicate joints are rejected', () => {
  for (const width of [0, -1, Infinity, NaN]) assert.equal(normalizePose({ ...frame(), width }), null);
  assert.equal(normalizePose({ ...frame(), poses: [] }), null);
  assert.equal(normalizePose({ ...frame(), poses: [{ keypoints: points }, { keypoints: points }] }), null);
  assert.equal(normalizePose(frame(100, [...points, points[0]])), null);
  assert.equal(projectPoint({ x: .5, y: .5 }, { width: 0, height: 480 }, { width: 640, height: 480 }), null);
});

test('age is measured from inference start; expired results never become current', () => {
  const n = new PoseNormalizer();
  assert.ok(n.update(frame(100), 349));
  assert.equal(n.get(350), null);
  assert.equal(n.update(frame(200), 450), null);
  assert.equal(n.get(451), null);
});

test('out-of-order, duplicate and future timestamps cannot overwrite a newer pose', () => {
  const n = new PoseNormalizer();
  const current = n.update(frame(200), 210);
  assert.equal(n.update(frame(190), 220), current);
  assert.equal(n.update(frame(200, []), 230), current);
  assert.equal(n.update(frame(999), 240), current);
  assert.equal(n.update(frame(NaN), 240), current);
  assert.ok(n.update(frame(250), 260));
});

test('missing detection clears previous pose and reset allows a fresh session', () => {
  const n = new PoseNormalizer();
  n.update(frame(100), 110);
  assert.equal(n.update({ ...frame(120), poses: [] }, 130), null);
  assert.equal(n.get(140), null);
  n.reset();
  assert.ok(n.update(frame(1), 2));
});
