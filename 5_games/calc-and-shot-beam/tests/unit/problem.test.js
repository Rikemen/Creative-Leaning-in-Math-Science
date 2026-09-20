import test from 'node:test';
import assert from 'node:assert/strict';
import { generateProblem } from '../../public/js/game/problem.js';
import { BEGINNER_SETTINGS, FULL_SETTINGS } from '../../public/js/game/problem-settings.js';

test('初期設定の全10通りは両方1以上、合計5以下で重複しない', () => {
  const pairs = new Set();
  for (let i = 0; i < 10; i += 1) {
    const problem = generateProblem(undefined, () => (i + 0.5) / 10);
    assert.ok(problem.left >= 1 && problem.right >= 1);
    assert.equal(problem.answer, problem.left + problem.right);
    assert.ok(problem.answer <= 5);
    pairs.add(`${problem.left},${problem.right}`);
  }
  assert.equal(pairs.size, 10);
  assert.ok(pairs.has('1,4'));
  assert.ok(pairs.has('4,1'));
});

test('全範囲の100通りに0+0と9+9を含み、加数と答えが範囲内', () => {
  const pairs = new Set();
  for (let i = 0; i < 100; i += 1) {
    const { left, right, answer } = generateProblem(FULL_SETTINGS, () => (i + 0.5) / 100);
    assert.ok(Number.isInteger(left) && left >= 0 && left <= 9);
    assert.ok(Number.isInteger(right) && right >= 0 && right <= 9);
    assert.equal(answer, left + right);
    assert.ok(answer >= 0 && answer <= 18);
    pairs.add(`${left},${right}`);
  }
  assert.equal(pairs.size, 100);
  assert.deepEqual(generateProblem(FULL_SETTINGS, () => 0), { left: 0, right: 0, answer: 0 });
  assert.deepEqual(generateProblem(FULL_SETTINGS, () => 1 - Number.EPSILON), { left: 9, right: 9, answer: 18 });
});

test('候補が1通りでも生成でき、設定や前回の結果を変更しない', () => {
  const settings = Object.freeze({ minOperand: 2, maxOperand: 2, maxSum: 4 });
  const first = generateProblem(settings, () => 0);
  first.answer = 99;
  assert.deepEqual(generateProblem(settings, () => 0.9), { left: 2, right: 2, answer: 4 });
  assert.ok(Object.isFrozen(BEGINNER_SETTINGS));
});

test('不正な設定や候補がない設定は明示的に失敗する', () => {
  for (const settings of [
    null, {}, { ...FULL_SETTINGS, minOperand: -1 },
    { ...FULL_SETTINGS, maxOperand: 10 }, { ...FULL_SETTINGS, minOperand: 0.5 },
    { ...FULL_SETTINGS, minOperand: 5, maxOperand: 4 },
    { ...FULL_SETTINGS, maxSum: 19 }, { ...FULL_SETTINGS, maxSum: NaN },
    { ...FULL_SETTINGS, maxSum: -1 }, { ...FULL_SETTINGS, maxSum: 1.5 },
    { minOperand: 3, maxOperand: 9, maxSum: 5 },
  ]) assert.throws(() => generateProblem(settings, () => 0), /設定/);
});

test('乱数の範囲外を黙って補正しない', () => {
  for (const value of [-0.1, 1, NaN, Infinity, '0.5']) {
    assert.throws(() => generateProblem(BEGINNER_SETTINGS, () => value), /乱数/);
  }
});
