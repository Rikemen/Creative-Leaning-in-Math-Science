/**
 * グラフ描画の設定
 */
const CONFIG = {
    scaleX: 100,    // 数学的な「1」がx軸で何ピクセルに相当するか
    scaleY: 200,    // 数学的な「1」がy軸で何ピクセルに相当するか
    canvasSize: 800,
    n: 100,         // 関数の次数、大きいほど矩形関数に近づく
    colors: {
        background: [176, 224, 230],
        axis: 255,
        text: 0,
        graph: 0,
        asymptote: 150
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
    text("x", width / 2 - 20, -10);
    text("y", 10, -height / 2 + 20);
}

/**
 * 漸近線・基準線の描画
 */
function drawAsymptotes() {
    stroke(CONFIG.colors.asymptote);
    strokeWeight(1);

    // y = 1 (最大値)
    line(-width / 2, -CONFIG.scaleY, width / 2, -CONFIG.scaleY);
    // x = 1, x = -1 (境界)
    line(CONFIG.scaleX, -height / 2, CONFIG.scaleX, height / 2);
    line(-CONFIG.scaleX, -height / 2, -CONFIG.scaleX, height / 2);

    noStroke();
    fill(CONFIG.colors.text);
    textSize(12);
    text("y = 1", width / 2 - 40, -CONFIG.scaleY - 5);
    text("x = 1", CONFIG.scaleX + 5, height / 2 - 20);
    text("x = -1", -CONFIG.scaleX - 40, height / 2 - 20);
}

/**
 * 数学的関数 f(x) = 1 / (1 + x^(2n)) の描画
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(3);
    noFill();

    beginShape();
    // 境界付近（x = ±1）での急な変化を捉えるため、解像度を調整
    for (let x = -width / 2; x <= width / 2; x += 0.5) {
        const mx = x / CONFIG.scaleX;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scaleY;
        vertex(x, sy);
    }
    endShape();

    // x = ±1 での値 (1/2) をプロット
    fill(0);
    ellipse(CONFIG.scaleX, -0.5 * CONFIG.scaleY, 6, 6);
    ellipse(-CONFIG.scaleX, -0.5 * CONFIG.scaleY, 6, 6);
}

/**
 * 描画対象の純粋な数学的関数
 * f(x) = 1 / (1 + x^(2n))
 */
function targetMathFunction(x) {
    // xが非常に大きい場合や小さい場合の数値安定性を考慮
    if (Math.abs(x) > 2) return 0;
    return 1 / (1 + Math.pow(x, 2 * CONFIG.n));
}
