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
  text('O', -15, 15);
  text('x', width / 2 - 20, -10);
  text('y', 10, -height / 2 + 25);
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
export function drawPointOnGraph(mx, func, label = 'P', color) {
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
 * 誤差（剰余項） Rn(x) = f(x) - Pn(x) を垂直な線として描画し、数値を表示する。
 */
export function drawRemainderLine(mx, f, Pn) {
  const yf = f(mx);
  const yp = Pn(mx);
  const posF = toScreen(mx, yf);
  const posP = toScreen(mx, yp);

  stroke(CONFIG.style.colors.remainder);
  strokeWeight(2);
  drawingContext.setLineDash([2, 5]);
  line(posF.x, posF.y, posP.x, posP.y);
  drawingContext.setLineDash([]);

  // 誤差の数値を表示
  const rn = yf - yp;
  fill(CONFIG.style.colors.remainder);
  noStroke();
  textSize(14);
  textAlign(LEFT, CENTER);
  text(` Rn(x) = ${rn.toFixed(4)}`, posF.x + 5, (posF.y + posP.y) / 2);
}

/**
 * 近似の基準点 a, 評価点 x, そしてラグランジュの中間点 c を結ぶ補助線を描画する。
 */
export function drawTaylorAuxLines(mathA, mathX, mathC) {
  const posA = toScreen(mathA, 0);
  const posX = toScreen(mathX, 0);
  const posC = toScreen(mathC, 0);

  // x軸上の補助線
  stroke(CONFIG.style.colors.axis);
  strokeWeight(1);
  line(posA.x, 10, posA.x, -10);
  line(posX.x, 10, posX.x, -10);

  // aからxまでの範囲を示す線
  strokeWeight(1);
  line(posA.x, 0, posX.x, 0);

  // 中間点 c の強調
  stroke(CONFIG.style.colors.pointC);
  strokeWeight(8);
  point(posC.x, 0);

  noStroke();
  fill(CONFIG.style.colors.pointC);
  textSize(12);
  textAlign(CENTER, TOP);
  text('c', posC.x, 5);
}
