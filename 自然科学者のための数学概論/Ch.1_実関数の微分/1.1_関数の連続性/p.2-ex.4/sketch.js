/**
 * グラフ描画の設定
 */
const CONFIG = {
    scaleX: 100,    // 数学的な「1」がx軸で何ピクセルに相当するか
    scaleY: 200,    // 数学的な「1」がy軸で何ピクセルに相当するか
    canvasSize: 800,
    k: 5,           // 関数の定数
    colors: {
        background: [176, 224, 230],
        axis: 255,
        text: 0,
        graph: 0,
        asymptote: 100
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
 * 漸近線の描画
 */
function drawAsymptotes() {
    stroke(CONFIG.colors.asymptote);
    strokeWeight(1);
    const { length, gap } = CONFIG.dashStyle;

    // y = 1 (yVal = 1 -> sy = -200)
    drawDashedLine(-width / 2, -CONFIG.scaleY, width / 2, -CONFIG.scaleY, length, gap);
    // y = 0.5 (yVal = 0.5 -> sy = -100)
    drawDashedLine(-width / 2, -CONFIG.scaleY * 0.5, width / 2, -CONFIG.scaleY * 0.5, length, gap);

    noStroke();
    fill(CONFIG.colors.text);
    textSize(12);
    text("y = 1", width / 2 - 40, -CONFIG.scaleY - 5);
    text("y = 0.5", width / 2 - 50, -CONFIG.scaleY * 0.5 - 5);
}

/**
 * 数学的関数 f(x) = 1 / (1 + k^(1/x)) の描画
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(3);
    noFill();

    // x=0 での不連続性を考慮し、左側と右側に分けて描画
    // 左側 (x < 0)
    drawGraphSegment(-width / 2, -0.1);
    // 右側 (x > 0)
    drawGraphSegment(0.1, width / 2);

    // x=0 での不連続点（ジャンプ）を強調
    drawJumpPoint(0);
}

/**
 * 特定のピクセル範囲内で関数をプロットする
 */
function drawGraphSegment(startX, endX) {
    beginShape();
    for (let x = startX; x <= endX; x += 1) {
        const mx = x / CONFIG.scaleX;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scaleY;
        vertex(x, sy);
    }
    endShape();
}

/**
 * ジャンプ不連続点（x=0）の可視化
 */
function drawJumpPoint(mx) {
    const sx = mx * CONFIG.scaleX;
    const my0 = targetMathFunction(0); // 0.5
    const sy = -my0 * CONFIG.scaleY;

    // x -> -0 の極限 (y -> 1)
    noFill();
    stroke(0);
    strokeWeight(1);
    ellipse(sx, -CONFIG.scaleY, 6, 6);

    // x -> +0 の極限 (y -> 0)
    ellipse(sx, 0, 6, 6);

    // x=0 での値
    fill(0);
    ellipse(sx, sy, 6, 6);
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
        line(lerp(x1, x2, t), lerp(y1, y2, t), lerp(x1, x2, nt), lerp(y1, y2, nt));
    }
}

/**
 * 描画対象の純粋な数学的関数
 * f(x) = 1 / (1 + k^(1/x))
 */
function targetMathFunction(x) {
    if (x === 0) return 0.5; // 定義上の値
    // x -> -0 のとき 1/x -> -inf, k^(1/x) -> 0, f(x) -> 1
    // x -> +0 のとき 1/x -> +inf, k^(1/x) -> +inf, f(x) -> 0
    return 1 / (1 + Math.pow(CONFIG.k, 1 / x));
}