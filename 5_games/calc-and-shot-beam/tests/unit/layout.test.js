import test from 'node:test';
import assert from 'node:assert/strict';
import { createLayout, beamPath } from '../../public/js/render/layout.js';
const overlap = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
test('landscape uses 1600x900; narrow screens keep four readable touch cards', () => {
  for (const width of [320, 364, 699, 700, 786, 966, 1222, 1600]) {
    const l = createLayout(width);
    if (width >= 700) assert.deepEqual([l.width, l.height], [1600, 900]);
    assert.equal(l.cards.length, 4);
    for (const c of l.cards) {
      assert.ok(c.width * l.scale >= 44 && c.height * l.scale >= 44);
      assert.ok(c.x >= 0 && c.x + c.width <= l.width && c.y + c.height <= l.height);
    }
  }
});
test('cards, HUD, equation, feedback, hero and arms have separate safe regions', () => {
  for (const width of [364, 786, 1222]) {
    const l = createLayout(width), boxes = [l.hud, l.problem, l.hint, l.feedback, ...l.cards];
    boxes.forEach((a, i) => boxes.slice(i + 1).forEach(b => assert.equal(overlap(a, b), false)));
    for (const n of l.numbers) {
      assert.equal(overlap(n, l.hero), false); assert.equal(overlap(n, l.arms), false);
    }
  }
});
test('beam including its glow avoids every numeric region at both card arrangements', () => {
  for (const width of [364, 1222]) {
    const l = createLayout(width);
    for (let card = 0; card < 4; card++) {
      const path = beamPath(l, card);
      assert.deepEqual(path[0], l.emitter);
      for (let segment = 1; segment < path.length; segment++) {
        const a = path[segment - 1], b = path[segment];
        for (let step = 0; step <= 100; step++) {
          const t = step / 100, dot = { x: a.x + (b.x - a.x) * t - 8, y: a.y + (b.y - a.y) * t - 8, width: 16, height: 16 };
          for (const n of l.numbers) assert.equal(overlap(dot, n), false);
          assert.equal(overlap(dot, l.feedback), false);
        }
      }
    }
  }
});
test('invalid dimensions and targets cannot generate invalid geometry', () => {
  for (const width of [0, -1, NaN, Infinity]) assert.throws(() => createLayout(width), RangeError);
  assert.deepEqual(beamPath(createLayout(1000), -1), []);
});
test('required device sizes retain separate HUD, hints, two digit safety and touch targets',()=>{
  for(const [width,height] of [[1280,720],[1024,768],[844,390],[390,844],[320,740]]){
    const l=createLayout(width-(width<=700?26:58));
    for(const c of l.cards)assert.ok(c.width*l.scale>=44 && c.height*l.scale>=44);
    for(const box of [l.label,l.problem,l.hint,l.feedback,...l.cards])assert.equal(overlap(l.hud,box),false);
    if(l.portrait)assert.ok(l.hud.height*l.scale>=44,`${width}x${height}`);
    assert.ok(l.cards.every(c=>c.y+c.height<l.emitter.y));
  }
});
