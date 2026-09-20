import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../Permutation.js', import.meta.url), 'utf8');
const Permutation = runInNewContext(`${source}\nPermutation;`);
const images = (permutation) => Array.from(permutation.toArray());
const rejects = (action, name) => assert.throws(action, { name });

test('恒等置換と次数の検証', () => {
    assert.deepEqual(images(Permutation.identity(1)), [1]);
    assert.deepEqual(images(Permutation.identity(4)), [1, 2, 3, 4]);
    for (const n of [0, -1, 1.5, NaN, Infinity]) {
        rejects(() => Permutation.identity(n), 'RangeError');
    }
    rejects(() => Permutation.identity('3'), 'TypeError');
});

test('合成は右から作用し、順序で結果が変わる', () => {
    const sigma = new Permutation([2, 1, 3]);
    const tau = new Permutation([1, 3, 2]);
    assert.deepEqual(images(sigma.compose(tau)), [2, 3, 1]);
    assert.deepEqual(images(tau.compose(sigma)), [3, 1, 2]);
    assert.deepEqual(images(sigma.compose(Permutation.identity(3))), images(sigma));
    assert.deepEqual(images(Permutation.identity(3).compose(sigma)), images(sigma));
    assert.deepEqual(images(sigma), [2, 1, 3]);
    assert.deepEqual(images(tau), [1, 3, 2]);
    assert.notEqual(sigma.compose(tau), sigma);
    rejects(() => sigma.compose(new Permutation([1])), 'RangeError');
    rejects(() => sigma.compose([1, 2, 3]), 'TypeError');
    rejects(() => sigma.compose(null), 'TypeError');
});

test('逆置換は左右から合成すると恒等置換になり、逆の逆は元に戻る', () => {
    const sigma = new Permutation([2, 3, 1]);
    const inverse = sigma.inverse();
    assert.deepEqual(images(inverse), [3, 1, 2]);
    assert.deepEqual(images(sigma.compose(inverse)), [1, 2, 3]);
    assert.deepEqual(images(inverse.compose(sigma)), [1, 2, 3]);
    assert.deepEqual(images(inverse.inverse()), [2, 3, 1]);
    assert.deepEqual(images(sigma), [2, 3, 1]);
    assert.notEqual(inverse, sigma);
    assert.deepEqual(images(new Permutation([1]).inverse()), [1]);
});

test('巡回置換の向き・固定点・入力検証', () => {
    const elements = [1, 3, 2];
    const cycle = Permutation.cycle(4, elements);
    assert.deepEqual(images(cycle), [3, 1, 2, 4]);
    assert.equal(cycle.apply(2), 1);
    assert.equal(cycle.apply(4), 4);
    assert.deepEqual(elements, [1, 3, 2]);
    elements[0] = 4;
    assert.deepEqual(images(cycle), [3, 1, 2, 4]);
    assert.deepEqual(images(Permutation.cycle(4, [3])), [1, 2, 3, 4]);
    for (const invalid of [[], [1, 1], [0], [5], [1.5], [NaN], [Infinity]]) {
        rejects(() => Permutation.cycle(4, invalid), 'RangeError');
    }
    for (const invalid of [null, '12', ['1'], new Array(2)]) {
        rejects(() => Permutation.cycle(4, invalid), 'TypeError');
    }
    rejects(() => Permutation.cycle(0, [1]), 'RangeError');
    rejects(() => Permutation.cycle('4', [1]), 'TypeError');
});

test('互換は2要素だけを交換し、2回で元に戻る', () => {
    const swap = Permutation.transposition(4, 1, 3);
    assert.deepEqual(images(swap), [3, 2, 1, 4]);
    assert.deepEqual(images(swap.compose(swap)), [1, 2, 3, 4]);
    for (const args of [[4, 1, 1], [4, 0, 2], [4, 1, 5], [0, 1, 2]]) {
        rejects(() => Permutation.transposition(...args), 'RangeError');
    }
    for (const args of [['4', 1, 2], [4, '1', 2], [4, 1, null]]) {
        rejects(() => Permutation.transposition(...args), 'TypeError');
    }
});

test('符号は転倒数の偶奇と巡回の長さに一致する', () => {
    assert.equal(Permutation.identity(4).sign(), 1);
    assert.equal(Permutation.identity(1).sign(), 1);
    assert.equal(Permutation.transposition(4, 1, 3).sign(), -1);
    assert.equal(new Permutation([2, 3, 1]).sign(), 1);
    assert.equal(new Permutation([3, 2, 1]).sign(), -1);
    for (const [cycle, sign] of [[[1, 2], -1], [[1, 2, 3], 1], [[1, 2, 3, 4], -1]]) {
        assert.equal(Permutation.cycle(4, cycle).sign(), sign);
    }
});

test('偶奇判定は符号と一致する', () => {
    for (const [sigma, even] of [
        [Permutation.identity(3), true],
        [Permutation.cycle(3, [1, 2, 3]), true],
        [Permutation.transposition(3, 1, 2), false],
        [Permutation.cycle(4, [1, 2, 3, 4]), false],
    ]) {
        assert.equal(sigma.isEven(), even);
        assert.equal(sigma.isOdd(), !even);
    }
});

test('S3の全要素で逆・符号の乗法性・結合法則が成立する', () => {
    const permutations = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
        .map((values) => new Permutation(values));
    for (const a of permutations) {
        assert.deepEqual(images(a.compose(a.inverse())), [1, 2, 3]);
        assert.deepEqual(images(a.inverse().compose(a)), [1, 2, 3]);
        assert.equal(a.inverse().sign(), a.sign());
        for (const b of permutations) {
            assert.equal(a.compose(b).sign(), a.sign() * b.sign());
            for (const c of permutations) {
                assert.deepEqual(images(a.compose(b).compose(c)), images(a.compose(b.compose(c))));
            }
        }
    }
});

test('1始まりの入力を対応先へ写す', () => {
    const sigma = new Permutation([2, 3, 1]);
    assert.equal(sigma.size, 3);
    assert.deepEqual([1, 2, 3].map((i) => sigma.apply(i)), [2, 3, 1]);
    assert.equal(new Permutation([1]).apply(1), 1);
});

test('置換にならない配列と範囲外の入力を拒否する', () => {
    for (const value of [null, {}, '123']) {
        rejects(() => new Permutation(value), 'TypeError');
    }
    for (const value of [[], [1, 1], [0], [2], [1.5], [NaN], [Infinity]]) {
        rejects(() => new Permutation(value), 'RangeError');
    }
    for (const value of [['1'], [undefined], new Array(2)]) {
        rejects(() => new Permutation(value), 'TypeError');
    }
    const sigma = new Permutation([2, 1]);
    for (const value of [0, 3, -1, 1.5, NaN, Infinity]) {
        rejects(() => sigma.apply(value), 'RangeError');
    }
    rejects(() => sigma.apply('1'), 'TypeError');
});

test('入力・返却配列から内部対応を変更できず、次数は読み取り専用', () => {
    const input = [2, 3, 1];
    const sigma = new Permutation(input);
    input[0] = 1;
    sigma.toArray()[0] = 1;
    assert.deepEqual(images(sigma), [2, 3, 1]);
    rejects(() => { sigma.size = 9; }, 'TypeError');
    assert.equal(sigma.size, 3);
});
