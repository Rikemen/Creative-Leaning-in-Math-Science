import { CONFIG } from './config.js';
import { toMathX } from './math-utils.js';
import { drawGrid, drawAxis, drawGraph, drawTangentLine, drawPointOnGraph } from './drawing-utils.js';

/**
 * 自然科学者のための数学概論 - 1.3 関数の和・差・積・商の微分
 * 
 * メインの制御ロジック
 */

/**
 * 視覚化対象の関数群
 */
const f = (x) => 0.5 * x * x;     // 関数1
const g = (x) => Math.sin(x);      // 関数2
const h = (x) => f(x) + g(x);      // 和の関数 (f + g)(x)

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

    // 複数のグラフを重ねて描画（色を変えることで視認性を確保）
    drawGraph(f, [200, 200, 200]); // 薄いグレー
    drawGraph(g, [150, 150, 255]); // 薄い青
    drawGraph(h, CONFIG.style.colors.graph); // メインの強調色（和の関数）

    if (currentMathX !== null) {
        // 和の関数 h に対して接線とポインターを表示
        drawTangentLine(currentMathX, h);
        drawPointOnGraph(currentMathX, h);
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
