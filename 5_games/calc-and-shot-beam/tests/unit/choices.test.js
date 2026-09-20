import test from 'node:test';
import assert from 'node:assert/strict';
import { generateChoices } from '../../public/js/game/choices.js';

test('0〜18すべてで4択・重複なし・正解1枚・範囲内', () => {
  for (let answer = 0; answer <= 18; answer += 1) {
    for (const value of [0, 0.2, 0.6, 1 - Number.EPSILON]) {
      const choices = generateChoices(answer, () => value);
      assert.equal(choices.length, 4);
      assert.equal(new Set(choices).size, 4);
      assert.equal(choices.filter(n => n === answer).length, 1);
      assert.ok(choices.every(n => Number.isInteger(n) && n >= 0 && n <= 18));
    }
  }
});
test('正解は4位置すべてに配置でき、乱数が一定でも終了する', () => {
  const positions = new Set([0, 0.3, 0.6, 0.9].map(n => generateChoices(5, () => n).indexOf(5)));
  assert.equal(positions.size, 4);
});
test('不正な答えと乱数を拒否', () => {
  for (const n of [-1, 19, NaN, 2.5]) assert.throws(() => generateChoices(n));
  for (const n of [-1, 1, NaN]) assert.throws(() => generateChoices(5, () => n));
});
