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
        asymptote: 100 // 漸近線の色（少し薄く）
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
}

/**
 * 漸近線（参考線）の描画
 */
function drawAsymptotes() {
    stroke(CONFIG.colors.asymptote);
    strokeWeight(1);
    textSize(14);
    fill(CONFIG.colors.text);
    noStroke();

    const { length, gap } = CONFIG.dashStyle;

    // y = x
    stroke(CONFIG.colors.asymptote);
    drawDashedLine(-width / 2, width / 2, width / 2, -width / 2, length, gap);
    noStroke();
    text("y = x", 200, -210);

    // y = -x
    stroke(CONFIG.colors.asymptote);
    drawDashedLine(-width / 2, -width / 2, width / 2, width / 2, length, gap);
    noStroke();
    text("y = -x", 200, 230);
}

/**
 * 数学的関数 f(x) = x * sin(1/x) の描画
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(2);
    noFill();

    beginShape();
    // 描画精度を上げるため、0.5ピクセル刻みで計算
    for (let x = -width / 2; x <= width / 2; x += 0.5) {
        const mx = x / CONFIG.scale;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scale;

        // 数値的に不安定な極限付近（原点）を考慮
        if (abs(mx) < 0.001) {
            vertex(0, 0);
        } else {
            vertex(x, sy);
        }
    }
    endShape();
}

/**
 * 指定された区間に点線を描画する補助関数
 * @param {number} x1 - 開始x
 * @param {number} y1 - 開始y
 * @param {number} x2 - 終了x
 * @param {number} y2 - 終了y
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
 * f(x) = x * sin(1/x)
 * @param {number} x - 数学的な入力値
 * @returns {number} 数学的な出力値
 */
function targetMathFunction(x) {
    if (x === 0) return 0; // lim_{x->0} x*sin(1/x) = 0
    return x * Math.sin(1 / x);
}