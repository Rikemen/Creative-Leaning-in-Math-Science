/**
 * グラフ描画の設定
 */
const CONFIG = {
    scaleX: 50,    // 数学的な「1」がx軸で何ピクセルに相当するか
    scaleY: 200,   // 数学的な「1」がy軸で何ピクセルに相当するか
    canvasSize: 800,
    colors: {
        background: [176, 224, 230],
        axis: 255,
        grid: 230,
        text: 0,
        graph: 0,
        singularity: [255, 0, 0] // 不連続点（特異点）の色
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

    // 原点ラベル
    fill(CONFIG.colors.text);
    noStroke();
    textSize(12);
    text("0", -12, 12);
}

/**
 * 数学的関数 f(x) = (1/x) * sin(1/x) の描画
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(2);
    noFill();

    // グラフを描画（左右の枝に分けて描画し、原点付近の飛びを防止）
    drawGraphSegment(-width / 2, -1); // 左側
    drawGraphSegment(1, width / 2);  // 右側

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
    // 激しく振動するため、0.2ピクセル刻みで詳細に描画
    for (let x = startX; x <= endX; x += 0.2) {
        const mx = x / CONFIG.scaleX;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scaleY;

        // y座標が画面外に大きく飛び出す場合は、一旦形状を閉じて飛びを抑える
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
 * 特異点を強調表示する
 * @param {number} mx - 数学的なx座標
 */
function drawSingularity(mx) {
    const sx = mx * CONFIG.scaleX;
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
 * 描画対象の純粋な数学的関数
 * f(x) = (1/x) * sin(1/x)
 * @param {number} x - 数学的な入力値
 * @returns {number} 数学的な出力値
 */
function targetMathFunction(x) {
    if (abs(x) < 0.0001) return NaN; // 0付近では定義不可能なためNaNを返す
    return (1 / x) * Math.sin(1 / x);
}