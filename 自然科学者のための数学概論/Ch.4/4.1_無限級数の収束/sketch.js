// パラメータ（等比級数  a + ar + ar^2 + ... の初項aと公比r）
const a = 1 / 2;
const r = 1 / 2;
const maxN = 20; // 表示する項数

function setup() {
  createCanvas(800, 450);
  textFont("sans-serif");
  noLoop();
}

function draw() {
  background(250);

  // 事前に部分和を計算して、発散時のスケール用に最大値を把握
  const sums = [];
  let partialSum = 0;
  let maxYData = 0;
  for (let n = 1; n <= maxN; n++) {
    partialSum += a * Math.pow(r, n - 1);
    sums.push({ n, s: partialSum });
    if (partialSum > maxYData) maxYData = partialSum;
  }

  // 余白と座標系設定
  const marginLeft = 70;
  const marginRight = 30;
  const marginTop = 30;
  const marginBottom = 70;

  const plotX0 = marginLeft;
  const plotY0 = height - marginBottom;
  const plotW = width - marginLeft - marginRight;
  const plotH = height - marginTop - marginBottom;

  // 座標軸
  stroke(0);
  strokeWeight(1);
  // x軸
  line(plotX0, plotY0, plotX0 + plotW, plotY0);
  // y軸
  line(plotX0, plotY0, plotX0, plotY0 - plotH);

  // S∞（収束値）とスケール設定
  const convergent = Math.abs(r) < 1;
  const S_inf = convergent ? a / (1 - r) : null;
  const yMin = 0;
  const yMax = convergent ? S_inf * 1.05 : maxYData * 1.1;

  // 軸ラベル
  noStroke();
  fill(0);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("n", plotX0 + plotW / 2, height - marginBottom / 2);
  push();
  translate(marginLeft / 2, plotY0 - plotH / 2);
  rotate(-HALF_PI);
  text("Sₙ", 0, 0);
  pop();

  // 目盛り（x: n = 0..maxN, y: 0..S_inf）
  stroke(180);
  strokeWeight(1);
  textSize(12);
  fill(60);
  textAlign(CENTER, TOP);
  for (let n = 0; n <= maxN; n++) {
    const x = map(n, 0, maxN, plotX0, plotX0 + plotW);
    line(x, plotY0, x, plotY0 + 5);
    if (n % 2 === 0) text(n, x, plotY0 + 8);
  }

  textAlign(RIGHT, CENTER);
  for (let k = 0; k <= 5; k++) {
    const val = lerp(yMin, yMax, k / 5);
    const y = map(val, yMin, yMax, plotY0, plotY0 - plotH);
    line(plotX0 - 5, y, plotX0, y);
    text(nf(val, 1, 3), plotX0 - 8, y);
  }

  // 漸近線 S = S_inf（収束する場合のみ）
  if (convergent) {
    stroke(255, 0, 0);
    strokeWeight(1);
    drawingContext.setLineDash([6, 6]);
    const yAsym = map(S_inf, yMin, yMax, plotY0, plotY0 - plotH);
    line(plotX0, yAsym, plotX0 + plotW, yAsym);
    noStroke();
    fill(255, 0, 0);
    textAlign(LEFT, BOTTOM);
    text("S∞ = " + nf(S_inf, 1, 3), plotX0 + 6, yAsym - 4);
    drawingContext.setLineDash([]);
  }

  // データ点 S_n（n=1..maxN）
  stroke(30, 144, 255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (const p of sums) {
    const x = map(p.n, 0, maxN, plotX0, plotX0 + plotW);
    const y = map(p.s, yMin, yMax, plotY0, plotY0 - plotH);
    vertex(x, y);
  }
  endShape();

  // 各点をマーカーで表示
  fill(30, 144, 255);
  noStroke();
  for (const p of sums) {
    const x = map(p.n, 0, maxN, plotX0, plotX0 + plotW);
    const y = map(p.s, yMin, yMax, plotY0, plotY0 - plotH);
    circle(x, y, 6);
  }
}
