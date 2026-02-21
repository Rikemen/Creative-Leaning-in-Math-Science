/**
 * グラフ描画の設定
 */
const CONFIG = {
    scale: 200,    // 数学的な「1」が何ピクセルに相当するか
    canvasSize: 800,
    colors: {
        background: [176, 224, 230],
        axis: 255,
        grid: 230,
        text: 0,
        graph: 0,
        asymptote: 100, // 漸近線の色
        singularity: [255, 0, 0] // 特異点（x=0）の色
    },
    dashStyle: {
        length: 10,
        gap: 10
    }
};

/**
 * p5.jsの初期設定
 */
function setup() {
    createCanvas(CONFIG.canvasSize, CONFIG.canvasSize);
    noLoop();
}

/**
 * 描画ループ
 */
function draw() {
    background(CONFIG.colors.background);

    push();
    // 原点をキャンバスの中心に設定
    translate(width / 2, height / 2);

    drawAxis();
    drawAsymptotes();
    drawGraph();
    pop();
}

/**
 * 座標平面の主軸（x軸・y軸）を描画する
 */
function drawAxis() {
    stroke(CONFIG.colors.axis);
    strokeWeight(1);
    line(-width / 2, 0, width / 2, 0); // x軸
    line(0, -height / 2, 0, height / 2); // y軸

    fill(CONFIG.colors.text);
    noStroke();
    textSize(12);
    text("0", -12, 12);
}

/**
 * 漸近線（y = 1, y = -1）の描画
 */
function drawAsymptotes() {
    stroke(CONFIG.colors.asymptote);
    strokeWeight(1);
    const { length, gap } = CONFIG.dashStyle;

    // y = 1
    drawDashedLine(-width / 2, -CONFIG.scale, width / 2, -CONFIG.scale, length, gap);
    // y = -1
    drawDashedLine(-width / 2, CONFIG.scale, width / 2, CONFIG.scale, length, gap);

    noStroke();
    fill(CONFIG.colors.text);
    textSize(12);
    text("y = 1", width / 2 - 40, -CONFIG.scale - 5);
    text("y = -1", width / 2 - 40, CONFIG.scale + 15);
}

/**
 * 数学的関数 f(x) = sin(1/x) の描画
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(2);
    noFill();

    // グラフを描画（左右の枝に分けて描画し、x=0での不自然な接続を回避）
    drawGraphSegment(-width / 2, -0.5); // 左側
    drawGraphSegment(0.5, width / 2);  // 右側

    // 原点（特異点）の可視化
    drawSingularity(0);
}

/**
 * 特定のピクセル範囲内で関数をプロットする
 * @param {number} startX - 開始xピクセル
 * @param {number} endX - 終了xピクセル
 */
function drawGraphSegment(startX, endX) {
    beginShape();
    // 0付近で激しく振動するため、0.2ピクセル刻みで詳細に描画
    for (let x = startX; x <= endX; x += 0.2) {
        const mx = x / CONFIG.scale;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scale;
        vertex(x, sy);
    }
    endShape();
}

/**
 * 特異点を強調表示する
 * @param {number} mx - 数学的なx座標
 */
function drawSingularity(mx) {
    const sx = mx * CONFIG.scale;
    push();
    stroke(CONFIG.colors.singularity);
    strokeWeight(1);
    noFill();
    ellipse(sx, 0, 10, 10);

    fill(CONFIG.colors.singularity);
    noStroke();
    textSize(12);
    textAlign(CENTER);
    text("Singularity (x=0)", sx, 25);
    pop();
}

/**
 * 指定された区間に点線を描画する補助関数
 */
function drawDashedLine(x1, y1, x2, y2, l, g) {
    const pc = dist(x1, y1, x2, y2) / (l + g);
    for (let i = 0; i < pc; i++) {
        const t = i / pc;
        const nt = (i + l / (l + g)) / pc;
        if (nt > 1) break;
        line(
            lerp(x1, x2, t),
            lerp(y1, y2, t),
            lerp(x1, x2, nt),
            lerp(y1, y2, nt)
        );
    }
}

/**
 * 描画対象の純粋な数学的関数
 * f(x) = sin(1/x)
 */
function targetMathFunction(x) {
    if (x === 0) return NaN;
    return Math.sin(1 / x);
}