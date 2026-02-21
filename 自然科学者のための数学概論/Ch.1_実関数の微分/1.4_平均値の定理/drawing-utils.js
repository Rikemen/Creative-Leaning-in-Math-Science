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
 * グラフ上の特定の点にマーカーとラベルを描画する。
 * @param {number} mx - 数学的なx軸上の座標
 * @param {Function} func - 対象となる関数
 * @param {string} label - 表示するラベル (例: "A", "B", "c")
 * @param {Array} [color] - 点の色
 */
export function drawPointOnGraph(mx, func, label = "P", color) {
    const my = func(mx);
    const pos = toScreen(mx, my);

    stroke(color || CONFIG.style.colors.pointer);
    strokeWeight(10);
    point(pos.x, pos.y);

    noStroke();
    fill(CONFIG.style.colors.text);
    textSize(14);
    textAlign(LEFT, BOTTOM);
    text(`${label}(${mx.toFixed(2)}, ${my.toFixed(2)})`, pos.x + 10, pos.y - 10);
}

/**
 * 2点を結ぶ割線（セカント線）を描画し、その傾きを表示する。
 */
export function drawSecantLine(x1, x2, func) {
    const y1 = func(x1);
    const y2 = func(x2);
    const slope = (y2 - y1) / (x2 - x1);

    const pos1 = toScreen(x1, y1);
    const pos2 = toScreen(x2, y2);

    stroke(CONFIG.style.colors.secant);
    strokeWeight(1.5);
    // 割線自体は2点間を結ぶ
    line(pos1.x, pos1.y, pos2.x, pos2.y);

    // 延長線を描画（オプション：視認性のため）
    const ext = 10;
    const pos1Ext = toScreen(x1 - ext, y1 - ext * slope);
    const pos2Ext = toScreen(x2 + ext, y2 + ext * slope);
    drawingContext.setLineDash([5, 5]); // 点線にする
    line(pos1Ext.x, pos1Ext.y, pos1.x, pos1.y);
    line(pos2Ext.x, pos2Ext.y, pos2.x, pos2.y);
    drawingContext.setLineDash([]); // 元に戻す

    // 傾きの表示
    noStroke();
    fill(CONFIG.style.colors.secant);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Slope = (f(b)-f(a))/(b-a) = ${slope.toFixed(3)}`, -width / 2 + 20, -height / 2 + 20);
}

/**
 * 特定の点における接線を描画し、その傾き（微分係数）の数値を表示する。
 * @param {number} mx - 数学的なx軸上の座標
 * @param {Function} func - 描画対象の数学的関数
 */
export function drawTangentLine(mx, func) {
    const my = func(mx);
    const slope = calculateDerivative(mx, func);

    // 接線の表示範囲（十分に長く描く）
    const tangentExtension = 5;
    const mathX1 = mx - tangentExtension;
    const mathY1 = slope * (mathX1 - mx) + my;
    const mathX2 = mx + tangentExtension;
    const mathY2 = slope * (mathX2 - mx) + my;

    const screenPos1 = toScreen(mathX1, mathY1);
    const screenPos2 = toScreen(mathX2, mathY2);

    stroke(CONFIG.style.colors.tangent);
    strokeWeight(2);
    line(screenPos1.x, screenPos1.y, screenPos2.x, screenPos2.y);

    // 画面右上に微分係数の近似値を表示
    noStroke();
    fill(CONFIG.style.colors.tangent);
    textAlign(RIGHT, TOP);
    textSize(16);
    text(`f'(c) ≈ ${slope.toFixed(3)}`, width / 2 - 20, -height / 2 + 20);
}
