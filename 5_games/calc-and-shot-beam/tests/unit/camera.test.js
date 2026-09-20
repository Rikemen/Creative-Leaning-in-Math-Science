import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraController } from '../../public/js/input/camera.js';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

test('default browser timers keep the global receiver', async t => {
  const schedule = globalThis.setTimeout, cancel = globalThis.clearTimeout;
  t.mock.method(globalThis, 'setTimeout', function (...args) {
    assert.equal(this, globalThis); return schedule(...args);
  });
  t.mock.method(globalThis, 'clearTimeout', function (...args) {
    assert.equal(this, globalThis); return cancel(...args);
  });
  const f = fixture({ setTimer: undefined, clearTimer: undefined });
  assert.equal(await f.camera.start(), true);
  f.camera.stop();
});

function fixture(overrides = {}) {
  const events = [], poses = [], timers = new Map();
  let id = 0, stops = 0, disposals = 0, constraints;
  const track = new EventTarget();
  track.stop = () => { stops++; };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const video = { srcObject: null, play: async () => {}, pause() {}, videoWidth: 640, videoHeight: 480 };
  const model = { detect: async () => [{ keypoints: [] }], model: { dispose: () => { disposals++; } } };
  const camera = new CameraController({ video,
    now: () => 0,
    getUserMedia: async value => { constraints = value; return stream; },
    loadModel: async () => model,
    onState: value => events.push(value), onPoses: value => poses.push(value),
    setTimer: (callback, ms) => { timers.set(++id, { callback, ms }); return id; },
    clearTimer: key => timers.delete(key), ...overrides,
  });
  const fire = ms => {
    const entry = [...timers].find(([, timer]) => timer.ms === ms);
    assert.ok(entry, `timer ${ms} exists`);
    timers.delete(entry[0]); entry[1].callback();
  };
  return { camera, stream, video, model, track, events, poses, timers, fire,
    get stops() { return stops; }, get disposals() { return disposals; }, get constraints() { return constraints; } };
}

test('video-only success, first inference, idempotent stop and resource disposal', async () => {
  const f = fixture();
  assert.equal(await f.camera.start(), true);
  assert.equal(f.constraints.audio, false);
  assert.deepEqual(f.events.map(e => e.state), ['requesting', 'loading', 'ready']);
  assert.equal(f.video.srcObject, f.stream);
  assert.equal(f.poses.at(-1).length, 1);
  f.camera.stop(); f.camera.stop();
  assert.equal(f.stops, 1); assert.equal(f.disposals, 1);
  assert.equal(f.video.srcObject, null); assert.equal(f.timers.size, 0);
  assert.deepEqual(f.poses.at(-1), []);
});

test('pose metadata records inference start time and coordinate dimensions, not completion time', async () => {
  const pending = deferred(); let now = 100; const received = [];
  const f = fixture({ now: () => now, onPoses: (poses, frame) => received.push({ poses, frame }) });
  f.model.detect = () => pending.promise;
  const starting = f.camera.start(); await flush(); now = 500;
  pending.resolve([{ keypoints: [] }]); await starting;
  assert.deepEqual(received[0].frame, { capturedAt: 100, width: 640, height: 480 });
  f.camera.stop();
  assert.equal(received.at(-1).frame, undefined);
});

test('slow inference starts the next capture without another 80ms wait, while fast inference is paced', async () => {
  for (const duration of [20, 180]) {
    let now = 100, detects = 0;
    const frames = [];
    const f = fixture({ now: () => now, onPoses: (poses, frame) => { if (frame) frames.push(frame); } });
    f.model.detect = async () => { detects++; now += duration; return [{ keypoints: [] }]; };
    await f.camera.start();
    const delay = Math.max(0, 80 - duration);
    assert.equal(detects, 1);
    assert.ok([...f.timers.values()].some(timer => timer.ms === delay));
    assert.equal(frames[0].capturedAt, 100);
    now += delay;
    f.fire(delay); await flush();
    assert.equal(detects, 2);
    assert.equal(frames[1].capturedAt, 100 + Math.max(80, duration));
    f.camera.stop();
    assert.equal(f.timers.size, 0);
  }
});

test('denied / missing / unavailable camera explains failure and allows retry', async () => {
  for (const [name, reason] of [['NotAllowedError', 'denied'], ['NotFoundError', 'missing'], ['NotReadableError', 'unavailable']]) {
    const f = fixture();
    const original = f.camera.getUserMedia;
    f.camera.getUserMedia = async () => { throw Object.assign(new Error(), { name }); };
    assert.equal(await f.camera.start(), false);
    assert.deepEqual(f.events.at(-1), { state: 'error', reason });
    f.camera.getUserMedia = original;
    assert.equal(await f.camera.start(), true);
    f.camera.stop();
  }
});

test('permission timeout frees a stream even if permission arrives late', async () => {
  const pending = deferred();
  const f = fixture({ getUserMedia: () => pending.promise });
  const starting = f.camera.start(); f.fire(30000);
  assert.equal(await starting, false);
  pending.resolve(f.stream); await flush();
  assert.equal(f.stops, 1); assert.equal(f.video.srcObject, null);
  assert.deepEqual(f.events.at(-1), { state: 'error', reason: 'timeout' });
});

test('model timeout stops camera immediately and disposes late model', async () => {
  const pending = deferred();
  const f = fixture({ loadModel: () => pending.promise });
  const starting = f.camera.start(); await flush(); f.fire(30000);
  assert.equal(await starting, false); assert.equal(f.stops, 1);
  pending.resolve(f.model); await flush();
  assert.equal(f.disposals, 1); assert.equal(f.video.srcObject, null);
});

test('model failure and blocked video playback release camera', async () => {
  const f = fixture({ loadModel: async () => { throw new Error('network'); } });
  assert.equal(await f.camera.start(), false);
  assert.equal(f.events.at(-1).reason, 'model'); assert.equal(f.stops, 1);
  const v = fixture(); v.video.play = async () => { throw new Error('play'); };
  assert.equal(await v.camera.start(), false); assert.equal(v.stops, 1);
});

test('stop during permission and retry cannot attach stale stream', async () => {
  const pending = deferred();
  const f = fixture(); const original = f.camera.getUserMedia;
  f.camera.getUserMedia = () => pending.promise;
  const first = f.camera.start(); f.camera.stop();
  assert.equal(await first, false);
  f.camera.getUserMedia = original; assert.equal(await f.camera.start(), true);
  let staleStops = 0;
  pending.resolve({ getTracks: () => [{ stop: () => { staleStops++; } }] }); await flush();
  assert.equal(staleStops, 1); assert.equal(f.video.srcObject, f.stream);
  assert.equal(f.camera.state, 'ready'); f.camera.stop();
});

test('stop during inference ignores old poses and defers model disposal until settled', async () => {
  const pending = deferred(); const f = fixture();
  f.model.detect = () => pending.promise;
  const starting = f.camera.start(); await flush();
  f.camera.stop(); assert.equal(await starting, false);
  assert.equal(f.stops, 1); assert.equal(f.disposals, 0);
  pending.resolve([{ keypoints: [] }]); await flush();
  assert.equal(f.disposals, 1); assert.deepEqual(f.poses.at(-1), []);
  assert.equal(f.camera.state, 'stopped');
});

test('camera disconnection and runtime inference failure release resources', async () => {
  const f = fixture(); await f.camera.start();
  f.track.dispatchEvent(new Event('ended'));
  assert.equal(f.events.at(-1).reason, 'disconnected'); assert.equal(f.stops, 1);
  const g = fixture(); await g.camera.start();
  g.model.detect = async () => { throw new Error('gpu'); };
  g.fire(80); await flush();
  assert.equal(g.events.at(-1).reason, 'model');
  assert.equal(g.stops, 1); assert.equal(g.disposals, 1); assert.equal(g.timers.size, 0);
});

test('first inference and subsequent inference both have a timeout', async () => {
  for (const subsequent of [false, true]) {
    const pending = deferred(); const f = fixture();
    if (subsequent) await f.camera.start();
    f.model.detect = () => pending.promise;
    const starting = subsequent ? (f.fire(80), null) : f.camera.start();
    await flush(); f.fire(30000); if (starting) await starting;
    assert.equal(f.stops, 1); assert.equal(f.events.at(-1).reason, 'timeout');
    pending.reject(new Error('late failure')); await flush();
    assert.equal(f.disposals, 1); assert.equal(f.timers.size, 0);
  }
});
