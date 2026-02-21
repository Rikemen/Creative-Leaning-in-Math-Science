import { CONFIG } from './config.js';
import { calculateDerivative, toScreen, toMathX } from './math-utils.js';

/**
 * 座標平面上にグリッド線と目盛りを描画する。
 */
export function drawGrid() {
    const { colors } = CONFIG.style;
    const { cellSize, scale } = CONFIG.grid;

    stroke(colors.grid);
    strokeWeight(1);
    textSize(10);
    fill(colors.text);

    const halfW = width / 2;
    const halfH = height / 2;

    // 縦線とx軸の目盛り
    for (let x = 0; x < halfW; x += cellSize) {
        drawVerticalGridLine(x, halfH, scale);
        if (x !== 0) drawVerticalGridLine(-x, halfH, scale);
    }

    // 横線とy軸の目盛り
    for (let y = 0; y < halfH; y += cellSize) {
        drawHorizontalGridLine(y, halfW, scale);
        if (y !== 0) drawHorizontalGridLine(-y, halfW, scale);
    }
}

function drawVerticalGridLine(xPos, halfH, scale) {
    line(xPos, -halfH, xPos, halfH);
    if (xPos !== 0) {
        noStroke();
        text((xPos / scale).toFixed(1), xPos + 2, 12);
        stroke(CONFIG.style.colors.grid);
    }
}

function drawHorizontalGridLine(yPos, halfW, scale) {
    line(-halfW, yPos, halfW, yPos);
    if (yPos !== 0) {
        noStroke();
        text((-yPos / scale).toFixed(1), 5, yPos - 2);
        stroke(CONFIG.style.colors.grid);
    }
}

/**
 * 座標平面の主軸（x軸・y軸）および軸ラベルを描画する。
 */
export function drawAxis() {
    const { colors } = CONFIG.style;
    stroke(colors.axis);
    strokeWeight(2);

    // x軸・y軸の線
    line(-width / 2, 0, width / 2, 0);
    line(0, -height / 2, 0, height / 2);

    // ラベル（数学的な慣習に基づく位置）
    fill(colors.text);
    noStroke();
    textSize(16);
    text("O", -15, 15);
    text("x", width / 2 - 20, -10);
    text("y", 10, -height / 2 + 25);
}

/**
 * 関数 f(x) の曲線を一続きの線として描画する。
 * @param {Function} func - 描画対象の数学的関数
 * @param {Array|string} [color] - グラフの色。未指定の場合は CONFIG のデフォルト色を使用。
 */
export function drawGraph(func, color) {
    stroke(color || CONFIG.style.colors.graph);
    strokeWeight(2);
    noFill();

    beginShape();
    const pixelStep = 1;
    for (let sx = 0; sx <= width; sx += pixelStep) {
        const mx = toMathX(sx);
        try {
            const my = func(mx);
            const pos = toScreen(mx, my);

            if (abs(pos.y) < height) {
                vertex(pos.x, pos.y);
            } else {
                endShape();
                beginShape();
            }
        } catch (calculateError) {
            endShape();
            beginShape();
        }
    }
    endShape();
}

/**
 * グラフ上の選択された点にマーカーと座標値を描画する。
 * @param {number} mx - 数学的なx軸上の座標
 * @param {Function} func - 描画対象の数学的関数
 */
export function drawPointOnGraph(mx, func) {
    const my = func(mx);
    const pos = toScreen(mx, my);

    stroke(CONFIG.style.colors.pointer);
    strokeWeight(10);
    point(pos.x, pos.y);

    noStroke();
    fill(CONFIG.style.colors.text);
    textSize(14);
    textAlign(LEFT, BOTTOM);
    text(`P(${mx.toFixed(2)}, ${my.toFixed(2)})`, pos.x + 10, pos.y - 10);
}

/**
 * 特定の点における接線を描画し、その傾き（微分係数）の数値を表示する。
 * @param {number} mx - 数学的なx軸上の座標
 * @param {Function} func - 描画対象の数学的関数
 */
export function drawTangentLine(mx, func) {
    const my = func(mx);
    const slope = calculateDerivative(mx, func);

    // 接線の表示範囲（数学的なx軸の範囲で決定し、十分に長く描く）
    const tangentExtension = 1;
    const mathX1 = mx - tangentExtension;
    const mathY1 = slope * (mathX1 - mx) + my;
    const mathX2 = mx + tangentExtension;
    const mathY2 = slope * (mathX2 - mx) + my;

    const screenPos1 = toScreen(mathX1, mathY1);
    const screenPos2 = toScreen(mathX2, mathY2);

    stroke(CONFIG.style.colors.tangent);
    strokeWeight(1.5);
    line(screenPos1.x, screenPos1.y, screenPos2.x, screenPos2.y);

    // 画面右上に微分係数の近似値を表示し、学習効果を高める。
    noStroke();
    fill(CONFIG.style.colors.tangent);
    textAlign(RIGHT, TOP);
    textSize(16);
    text(`f'(${mx.toFixed(2)}) ≈ ${slope.toFixed(3)}`, width / 2 - 20, -height / 2 + 20);
}
