import { CONFIG } from './config.js';
import { toMathX } from './math-utils.js';
import { drawGrid, drawAxis, drawMainGraph, drawTangentLine, drawPointOnGraph } from './drawing-utils.js';

/**
 * 自然科学者のための数学概論 - 1.2 微分係数
 * 
 * メインの制御ロジック
 */

let currentMathX = null;

/**
 * p5.js の setup 関数。
 * モジュールスコープのため、明示的に window にアタッチする必要がある。
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
    drawMainGraph();

    if (currentMathX !== null) {
        drawTangentLine(currentMathX);
        drawPointOnGraph(currentMathX);
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
