import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

test('教材を読み込んで全7項目の期待結果を出力する', () => {
    const logs = new Map();
    const canvasCalls = [];
    const backgrounds = [];
    const context = createContext({
        console: { log: (label, value) => logs.set(label, value) },
        windowWidth: 800,
        windowHeight: 600,
        createCanvas: (...args) => canvasCalls.push(args),
        background: (...args) => backgrounds.push(args),
    });
    for (const filename of ['Permutation.js', 'sketch.js']) {
        runInContext(readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8'), context, { filename });
    }
    runInContext('setup(); draw();', context);
    assert.deepEqual(canvasCalls, [[800, 600]]);
    assert.deepEqual(backgrounds, [[176, 224, 230]]);
    for (const [label, expected] of [
        ['σ(1)', 2], ['σ(2)', 3], ['σ(3)', 1],
        ['sgn σ', 1], ['sgn (1 3)', -1],
        ['σ は偶置換', true], ['σ は奇置換', false],
        ['(1 3) は偶置換', false], ['(1 3) は奇置換', true],
    ]) {
        assert.equal(logs.get(label), expected, label);
    }
    for (const [label, expected] of [
        ['恒等置換', [1, 2, 3]],
        ['α ∘ β（β → α）', [2, 3, 1]],
        ['β ∘ α（α → β）', [3, 1, 2]],
        ['σ の逆置換', [3, 1, 2]],
        ['σ ∘ σ⁻¹', [1, 2, 3]],
        ['巡回置換 (1 3 2)', [3, 1, 2, 4]],
        ['互換 (1 3)', [3, 2, 1, 4]],
    ]) {
        assert.ok(Array.isArray(logs.get(label)), label);
        assert.deepEqual(Array.from(logs.get(label)), expected, label);
    }
});
