import { CONFIG } from './config.js';
import { toMathX, createCombinedDerivatives, createInverseDerivative } from './math-utils.js';
import { drawGrid, drawAxis, drawGraph, drawTangentLine, drawPointOnGraph } from './drawing-utils.js';

/**
 * 自然科学者のための数学概論 - 1.3 合成関数・逆関数の微分
 * 
 * メインの制御ロジック
 */

/**
 * 1. 合成関数の例
 */
const f = (x) => 0.25 * x * x;     // 外側の関数: f(u) = u^2 / 4
const g = (x) => 2 * Math.sin(x);   // 内側の関数: g(x) = 2sin(x)
const h = (x) => f(g(x));           // 合成関数: (f ∘ g)(x) = sin^2(x)

/**
 * 2. 逆関数の例（必要に応じて切り替えて使用）
 * f_inv: 元の関数, g_inv: その逆関数
 */
const f_inv = (x) => Math.exp(0.5 * x);
const g_inv = (x) => 2 * Math.log(x);

// math-utils.js の新しい関数を利用して導関数を作成（検証用）
const combined = createCombinedDerivatives(f, g);
const compositeDeriv = combined.composite; // (f ∘ g)'(x)
const inverseDeriv = createInverseDerivative(f_inv); // (f_inv⁻¹)'(y) を 1/f'(x) で計算

let currentMathX = null;

/**
 * p5.js の setup 関数。
 */
function setup() {
    createCanvas(CONFIG.style.canvasWidth, CONFIG.style.canvasHeight);
    noLoop();
    render();
}

/**
 * キャンバス全体の再描画処理
 */
function render() {
    background(CONFIG.style.colors.background);

    push();
    translate(width / 2, height / 2);

    drawGrid();
    drawAxis();

    // --- 合成関数の視覚化 ---
    drawGraph(f, [200, 200, 200]); // f(x) を薄く表示
    drawGraph(g, [150, 150, 255]); // g(x) を薄く表示
    drawGraph(h, CONFIG.style.colors.graph); // 合成関数 h(x) を強調表示

    // --- 逆関数の視覚化（表示したい場合は以下を有効化） ---
    // drawGraph(f_inv, [100, 200, 100]); // 元の関数
    // drawGraph(g_inv, [200, 100, 100]); // 逆関数

    if (currentMathX !== null) {
        // 現在選択されている点に対して合成関数の接線を表示
        drawTangentLine(currentMathX, h);
        drawPointOnGraph(currentMathX, h);

        // 逆関数の接線を表示
        // drawTangentLine(currentMathX, f_inv);
        // drawPointOnGraph(currentMathX, f_inv);

        // メモ: 逆関数の微分を検証する場合
        console.log(`x=${currentMathX.toFixed(2)}, inverse slope=${inverseDeriv(currentMathX).toFixed(3)}`);
    }
    pop();
}

/**
 * マウス座標から選択中の数学的座標を計算・更新し、キャンバスを再描画する。
 */
function updateSelection() {
    currentMathX = toMathX(mouseX);
    render();
}

function mousePressed() {
    updateSelection();
}

function mouseDragged() {
    updateSelection();
}

// p5.js がグローバルからこれらの関数を見つけられるように window オブジェクトに登録する。
window.setup = setup;
window.render = render;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
