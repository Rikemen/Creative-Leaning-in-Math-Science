import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyWrists, GestureController, GESTURE_PRESETS } from '../../public/js/input/gesture.js';
import { BodyInput } from '../../public/js/input/body-input.js';
import { GameSession } from '../../public/js/game/session.js';
const pose = (time, near = true) => ({ capturedAt: time, body: {
  left_shoulder: { x: .5, y: 0 }, right_shoulder: { x: -.5, y: 0 },
  left_wrist: { x: near ? .15 : .6, y: .35 }, right_wrist: { x: near ? -.15 : -.6, y: .4 },
} });
test('near wrists work without crossing, elbows, or left/right ordering', () => {
  const p=pose(0);assert.equal(classifyWrists(p),'near');
  for(const point of Object.values(p.body))point.x*=-1;
  assert.equal(classifyWrists(p),'near');
  [p.body.left_wrist,p.body.right_wrist]=[p.body.right_wrist,p.body.left_wrist];
  assert.equal(classifyWrists(p),'near');
  p.body.left_wrist.y+=2;p.body.right_wrist.y+=2;
  assert.equal(classifyWrists(p),'near');
});
test('Euclidean wrist separation and hysteresis band are measured in shoulder widths', () => {
  assert.equal(classifyWrists(pose(0,false)),'open');
  const p=pose(0);p.body.left_wrist={x:0,y:0};p.body.right_wrist={x:0,y:1};
  assert.equal(classifyWrists(p),'open');
  p.body.right_wrist.y=.8;assert.equal(classifyWrists(p),'between');
});
test('missing or non-finite wrists are unknown while missing elbows are accepted', () => {
  for(const name of ['left_wrist','right_wrist']){
    const p=pose(0);delete p.body[name];assert.equal(classifyWrists(p),'unknown');
  }
  const p=pose(0);p.body.left_wrist.x=NaN;assert.equal(classifyWrists(p),'unknown');
});
test('distance jitter does not chatter and reacquisition needs a fresh hold',()=>{
  const g=new GestureController();
  const at=(t,d)=>{const p=pose(t);p.body.left_wrist={x:0,y:0};p.body.right_wrist={x:d,y:0};return g.update(p,t);};
  assert.equal(at(0,.8),'unknown');
  assert.equal(at(50,1),'open');assert.equal(at(100,.8),'open');
  assert.equal(at(150,.3),'charging');assert.equal(at(250,.7),'charging');
  assert.equal(at(400,.8),'firing');assert.equal(at(480,1),'open');
  assert.equal(g.update(null,500),'unknown');assert.equal(at(550,.8),'unknown');
  assert.equal(at(600,.3),'charging');
});
test('sensitivity presets change distance thresholds and reset an in-progress hold', () => {
  const p = pose(0); p.body.left_wrist = { x: 0, y: 0 }; p.body.right_wrist = { x: .7, y: 0 };
  assert.equal(classifyWrists(p, GESTURE_PRESETS.strict), 'open');
  assert.equal(classifyWrists(p, GESTURE_PRESETS.normal), 'between');
  assert.equal(classifyWrists(p, GESTURE_PRESETS.easy), 'near');
  const g = new GestureController(GESTURE_PRESETS.easy);
  assert.equal(g.update(p, 0), 'charging');
  g.update({ ...p, capturedAt: 160 }, 160);
  g.setSettings(GESTURE_PRESETS.strict);
  assert.equal(g.update({ ...p, capturedAt: 250 }, 250), 'open');
  g.setSettings(GESTURE_PRESETS.easy);
  assert.equal(g.update({ ...p, capturedAt: 320 }, 320), 'charging');
  g.update({ ...p, capturedAt: 480 }, 480);
  assert.equal(g.update({ ...p, capturedAt: 570 }, 570), 'firing');
  for (const invalid of [{ nearDistance: 1, releaseDistance: .5 }, { nearDistance: NaN }, { holdMs: 0 }]) {
    assert.throws(() => g.setSettings(invalid), RangeError);
  }
});
test('250ms continuous sample hold, release and re-fire', () => {
  const g = new GestureController();
  for (const time of [0, 80, 160, 249]) assert.equal(g.update(pose(time), time), 'charging');
  assert.equal(g.update(pose(250), 250), 'firing');
  assert.equal(g.update(pose(300, false), 300), 'open');
  for (const time of [320, 400, 500]) assert.equal(g.update(pose(time), time), 'charging');
  assert.equal(g.update(pose(570), 570), 'firing');
});
test('a brief detection, duplicate frame or gap cannot complete a hold', () => {
  const g = new GestureController(); g.update(pose(0), 0);
  assert.equal(g.update(pose(0), 200), 'charging');
  g.update(pose(210, false), 210);
  assert.equal(g.update(pose(220), 220), 'charging');
  assert.equal(g.update(pose(500), 500), 'charging');
  assert.equal(g.update(pose(500), 750), 'unknown');
  assert.equal(g.update(pose(999), 800), 'unknown');
  assert.equal(g.update(pose(-1), 0), 'unknown');
});
const control = (target, gesture = 'firing') => ({ target, gesture, calibrated: true });
test('body input must see open wrists and does not auto-fire the next question', () => {
  const game = new GameSession({ rng: () => .2 }); game.start(0); const input = new BodyInput(game);
  const correct = game.choices.indexOf(game.problem.answer);
  input.update(control(correct), 0); assert.equal(game.target, null);
  input.update(control(correct, 'open'), 10); input.update(control(correct), 20);
  input.update(control(correct), 820); assert.equal(game.score, 1);
  input.update(control(correct), 1200); input.update(control(correct), 2200);
  assert.equal(game.score, 1); assert.equal(game.target, null);
  const next = game.choices.indexOf(game.problem.answer);
  input.update(control(next, 'open'), 2210); input.update(control(next), 2220);
  input.update(control(next), 3020); assert.equal(game.score, 2);
});
test('wrong card is a barrier, aim can move during firing, long wrist loss requires opening again', () => {
  const game = new GameSession({ rng: () => .2 }); game.start(0); const input = new BodyInput(game);
  const right = game.choices.indexOf(game.problem.answer), wrong = (right + 1) % 4;
  input.update(control(wrong, 'open'), 0); input.update(control(wrong), 10);
  input.update(control(right), 510); assert.equal(game.hp, 100);
  input.update(control(right), 710); assert.equal(game.hp, 75);
  input.update(control(right, 'unknown'), 710); input.update(control(right), 1211);
  assert.equal(game.hp, 75); assert.equal(game.target, null);
  input.update(control(right, 'open'), 1220); input.update(control(right), 1230);
  assert.equal(game.target, right);
});
test('a short wrist gap stops damage and reacquires a fresh hold without opening again', () => {
  const game = new GameSession({ rng: () => .2 }); game.start(0);
  const input = new BodyInput(game), gesture = new GestureController();
  const target = game.choices.indexOf(game.problem.answer);
  const step = (time, p) => input.update(control(target, gesture.update(p, time)), time);
  step(0, pose(0, false));
  for (const t of [80, 160, 240, 320, 400]) step(t, pose(t));
  assert.equal(game.target, target);
  step(480, { capturedAt: 480, body: {} }); const hp = game.hp;
  assert.equal(game.target, null); assert.equal(input.armed, true);
  step(560, { capturedAt: 560, body: {} });
  assert.equal(game.hp, hp); assert.equal(game.held, false);
  for (const t of [640, 720, 800, 880]) {
    step(t, pose(t)); assert.equal(game.target, null); assert.equal(game.hp, hp);
  }
  step(960, pose(960)); assert.equal(game.target, target); assert.equal(game.hp, hp);
  step(1040, pose(1040)); assert.equal(game.hp, hp - 10);
});
test('wrist recovery is allowed at 500 ms but expires at 501 ms without intermediate callbacks', () => {
  for (const duration of [500, 501]) {
    const game = new GameSession({ rng: () => .2 }); game.start(0); const input = new BodyInput(game);
    const target = game.choices.indexOf(game.problem.answer);
    input.update(control(target, 'open'), 0); input.update(control(target), 10);
    input.update(control(target, 'unknown'), 100); const hp = game.hp;
    input.update(control(target, 'charging'), 100 + duration);
    assert.equal(game.target, null); assert.equal(game.hp, hp);
    input.update(control(target), 350 + duration);
    assert.equal(game.target, duration === 500 ? target : null);
  }
});
test('wrist recovery never arms a new question, including destruction inside the loss update', () => {
  for (const lossAt of [790, 810]) {
    const game = new GameSession({ rng: () => .2 }); game.start(0); const input = new BodyInput(game);
    const target = game.choices.indexOf(game.problem.answer);
    input.update(control(target, 'open'), 0); input.update(control(target), 10);
    if (lossAt === 790) {
      input.update(control(target, 'unknown'), 790);
      input.update(control(target), 800);
    }
    input.update(control(target, 'unknown'), 820);
    assert.equal(game.phase, 'breaking'); assert.equal(game.score, 1); assert.equal(input.armed, false);
    input.update(control(target), 1200);
    assert.equal(game.questionId, 2); assert.equal(game.target, null); assert.equal(game.hp, 100);
    input.update(control(game.choices.indexOf(game.problem.answer)), 1600);
    assert.equal(game.score, 1); assert.equal(game.hp, 100);
  }
});
test('invalid shoulders, pause, cancel and reset discard short-gap arming', () => {
  for (const invalidate of [
    (input, game, target) => input.update({ ...control(target, 'unknown'), target: null }, 120),
    (input, game, target) => input.update({ ...control(target, 'unknown'), calibrated: false }, 120),
    (input, game, target) => { game.pause(120); input.update(control(target), 120); game.resume(130); },
    input => input.cancel(120),
    input => input.reset(),
  ]) {
    const game = new GameSession({ rng: () => .2 }); game.start(0); const input = new BodyInput(game);
    const target = game.choices.indexOf(game.problem.answer);
    input.update(control(target, 'open'), 0); input.update(control(target), 10);
    input.update(control(target, 'unknown'), 100); const hp = game.hp;
    invalidate(input, game, target);
    input.update(control(target, 'charging'), 200); input.update(control(target), 450);
    assert.equal(input.armed, false); assert.equal(game.target, null); assert.equal(game.hp, hp);
  }
});
test('cancel and end of round prevent further firing or scoring', () => {
  const game = new GameSession({ rng: () => .2 }); game.start(0); const input = new BodyInput(game);
  const target = game.choices.indexOf(game.problem.answer);
  input.update(control(target, 'open'), 0); input.update(control(target), 10);
  input.cancel(100); assert.equal(game.held, false);
  input.update(control(target), 200); assert.equal(game.target, null);
  game.tick(60000); input.update(control(target, 'open'), 60001); input.update(control(target), 60002);
  assert.equal(game.phase, 'result'); assert.equal(game.score, 0);
});
