import { CONFIG } from "./config.js";
import { toMathX, getTaylorPolynomial, findLagrangeRemainderPoint } from "./math-utils.js";
import {
  drawGrid,
  drawAxis,
  drawGraph,
  drawPointOnGraph,
  drawRemainderLine,
  drawTaylorAuxLines,
} from "./drawing-utils.js";

/**
 * 1.5 Taylorの定理 - 視覚化
 */

// 自然科学で馴染み深い関数
const f = (x) => Math.sin(x);

let mathA = 0; // 展開の中心 (緑の点)
let mathX = 1.5; // 近似を評価する点 (紫の点)
let orderN = 3; // 近似次数 (スライダーで制御)

let nSlider;

function setup() {
  createCanvas(CONFIG.style.canvasWidth, CONFIG.style.canvasHeight);

  // 近似次数のスライダー (0次から9次まで)
  nSlider = createSlider(0, 9, orderN, 1);
  nSlider.position(CONFIG.style.canvasWidth - 220, CONFIG.style.canvasHeight - 50);
  nSlider.style("width", "200px");
  nSlider.input(() => {
    orderN = nSlider.value();
    render();
  });

  render();
}

/**
 * キャンバス全体の描画
 */
function render() {
  background(CONFIG.style.colors.background);

  push();
  translate(width / 2, height / 2);

  drawGrid();
  drawAxis();

  // 1. 元の関数 f(x)
  drawGraph(f, CONFIG.style.colors.graph);

  // 2. テイラー多項式 Pn(x)
  const Pn = getTaylorPolynomial(f, mathA, orderN);
  drawGraph(Pn, CONFIG.style.colors.approx);

  // 3. 評価点における誤差（剰余項）
  drawRemainderLine(mathX, f, Pn);

  // 4. ラグランジュの剰余項を満たす中間点 c
  // (n+1) 次微分の数値精度の都合上、n+1 <= 10 程度が限界
  const mathC = findLagrangeRemainderPoint(f, mathA, mathX, orderN);
  drawTaylorAuxLines(mathA, mathX, mathC);

  // 5. 各点のプロット
  drawPointOnGraph(mathA, f, "a", CONFIG.style.colors.pointA);
  drawPointOnGraph(mathX, f, "x", CONFIG.style.colors.pointX);
  drawPointOnGraph(mathC, f, "c", CONFIG.style.colors.pointC);

  pop();

  // UI説明テキスト
  noStroke();
  fill(CONFIG.style.colors.text);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Approximation Order n = ${orderN}`, 230, 25);
  textSize(12);
  text("Drag to move 'a' (base) or 'x' (target)", 20, 50);
}

/**
 * マウス操作による点 a, x の移動
 */
function updateUI() {
  const mx = toMathX(mouseX);

  // 近い方の点をドラッグ対象にする
  if (Math.abs(mx - mathA) < Math.abs(mx - mathX)) {
    mathA = mx;
  } else {
    mathX = mx;
  }
  render();
}

/**
 * マウスがスライダーUIの上にあるかどうかを判定する
 */
function isMouseOverSlider() {
  // スライダーの位置: (width - 220, height - 50), 幅: 200
  // 少し余裕を持って判定範囲を設定
  return mouseX > CONFIG.style.canvasWidth - 230 && mouseY > CONFIG.style.canvasHeight - 70;
}

function mousePressed() {
  if (isMouseOverSlider()) return;
  updateUI();
}

function mouseDragged() {
  if (isMouseOverSlider()) return;
  updateUI();
}

// p5.js グローバル登録
window.setup = setup;
window.render = render;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
