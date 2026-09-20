import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDamage } from '../../public/js/game/damage.js';

test('正解のみ毎秒125ダメージ、誤答・停止中はHP維持', () => {
  assert.equal(applyDamage(100, 400, true), 50);
  assert.equal(applyDamage(50, 400, false), 50);
  assert.equal(applyDamage(50, 0, true), 50);
  assert.equal(applyDamage(50, 1000, true), 0);
});
test('同じ経過時間ならFPSによらず同じHP、0以下にならない', () => {
  let hp = 100;
  for (let i = 0; i < 8; i += 1) hp = applyDamage(hp, 100, true);
  assert.equal(hp, applyDamage(100, 800, true));
  assert.equal(applyDamage(0, 500, true), 0);
});
