import { CONFIG } from './config.js';
import { toMathX, findMeanValuePoint } from './math-utils.js';
import { drawGrid, drawAxis, drawGraph, drawTangentLine, drawPointOnGraph, drawSecantLine } from './drawing-utils.js';

/**
 * 自然科学者のための数学概論 - 1.4 平均値の定理
 * 
 * y = x^2 のグラフにおける平均値の定理の視覚化
 */

// 関数を変更しても自動で平均値の定理を満たすcを探せます
// 例: y = x^2, y = sin(x), y = x^3 - 3x など
const f = (x) => 0.1 * (x * x * x - 12 * x); // 3次関数の例

let mathXA = -2; // 始点Aのx座標
let mathXB = 3;  // 終点Bのx座標

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

    // グラフの描画
    drawGraph(f);

    // 割線と傾きの描画
    drawSecantLine(mathXA, mathXB, f);

    // 点A, Bの描画
    drawPointOnGraph(mathXA, f, "A", CONFIG.style.colors.pointer);
    drawPointOnGraph(mathXB, f, "B", CONFIG.style.colors.pointer);

    // 平均値の定理を満たす点cの計算と描画（数値探索による汎用的な解法）
    const mathXC = findMeanValuePoint(f, mathXA, mathXB);
    drawTangentLine(mathXC, f);
    drawPointOnGraph(mathXC, f, "c", CONFIG.style.colors.tangent);

    pop();
}

/**
 * マウス座標から最も近い点（A または B）を更新する。
 */
function updateSelection() {
    const mx = toMathX(mouseX);

    // 近い方の点を更新
    if (Math.abs(mx - mathXA) < Math.abs(mx - mathXB)) {
        mathXA = mx;
    } else {
        mathXB = mx;
    }

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
