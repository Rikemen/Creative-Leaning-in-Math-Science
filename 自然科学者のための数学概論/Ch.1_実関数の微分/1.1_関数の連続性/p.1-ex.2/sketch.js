/**
 * グラフ描画の設定
 */
const CONFIG = {
    cellSize: 50,
    scale: 50,
    canvasWidth: 800,
    canvasHeight: 600,
    colors: {
        background: [176, 224, 230],
        grid: 230,
        axis: 255,
        text: 0,
        graph: 0,
        pointer: [255, 0, 0]
    }
};

/**
 * p5.jsの初期設定
 */
function setup() {
    createCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight);
    render();
}

/**
 * 全体の描画処理
 */
function render() {
    background(CONFIG.colors.background);

    push();
    translate(width / 2, height / 2);

    drawGrid();
    drawAxis();
    drawGraph();
    pop();
}

/**
 * 座標平面上にグリッド線と目盛り数値を描画する
 */
function drawGrid() {
    stroke(CONFIG.colors.grid);
    strokeWeight(1);
    textSize(10);
    fill(CONFIG.colors.text);

    // 縦線の描画
    for (let x = -width / 2; x < width / 2; x += CONFIG.cellSize) {
        line(x, -height / 2, x, height / 2);
        if (x !== 0) {
            const val = x / CONFIG.scale;
            noStroke();
            text(val.toFixed(1), x + 2, -5);
            stroke(CONFIG.colors.grid);
        }
    }

    // 横線の描画
    for (let y = -height / 2; y < height / 2; y += CONFIG.cellSize) {
        line(-width / 2, y, width / 2, y);
        if (y !== 0) {
            const val = -y / CONFIG.scale;
            noStroke();
            text(val.toFixed(1), 5, y - 2);
            stroke(CONFIG.colors.grid);
        }
    }
}

/**
 * 座標平面の主軸（x軸・y軸）を描画する
 */
function drawAxis() {
    stroke(CONFIG.colors.axis);
    strokeWeight(2);
    line(-width / 2, 0, width / 2, 0); // x軸
    line(0, -height / 2, 0, height / 2); // y軸

    fill(CONFIG.colors.text);
    noStroke();
    textSize(15);
    text("0", -15, 15);
    text("x", width / 2 - 20, -10);
    text("y", 10, -height / 2 + 20);
}

/**
 * 数学的関数 f(x) = e^(-1/x) の描画
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(2);
    noFill();

    // x=0 での不連続性を考慮し、左右に分けて描画
    // 左側 (x < 0): e^(-1/x) -> +inf (x -> -0)
    drawGraphSegment(-width / 2, -1);

    // 右側 (x > 0): e^(-1/x) -> 0 (x -> +0)
    drawGraphSegment(1, width / 2);
}

/**
 * 特定のピクセル範囲内で関数をプロットする
 */
function drawGraphSegment(startX, endX) {
    beginShape();
    for (let x = startX; x <= endX; x += 1) {
        const mx = x / CONFIG.scale;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scale;

        // y軸方向のクリッピングガード
        if (abs(sy) < height * 2) {
            vertex(x, sy);
        } else {
            endShape();
            beginShape();
        }
    }
    endShape();
}

/**
 * マウスがクリックされた位置に関数上のポインタを表示する
 */
function mousePressed() {
    render();
    push();
    translate(width / 2, height / 2);
    const mx = (mouseX - width / 2) / CONFIG.scale;
    drawPointer(mx);
    pop();
}

/**
 * 数学的なx値に基づき、関数上の点にポインタを描画する
 */
function drawPointer(mx) {
    const my = targetMathFunction(mx);
    if (!isFinite(my)) return;

    const sx = mx * CONFIG.scale;
    const sy = -my * CONFIG.scale;

    stroke(CONFIG.colors.pointer);
    strokeWeight(8);
    point(sx, sy);

    noStroke();
    fill(CONFIG.colors.text);
    textSize(12);
    text(`(${mx.toFixed(2)}, ${my.toFixed(2)})`, sx + 10, sy - 10);
}

/**
 * 描画対象の純粋な数学的関数
 * f(x) = e^(-1/x)
 */
function targetMathFunction(x) {
    if (x === 0) return 0; // x -> +0 の極限値は0
    return Math.exp(-1 / x);
}