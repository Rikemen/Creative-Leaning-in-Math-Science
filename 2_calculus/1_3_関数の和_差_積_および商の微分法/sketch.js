// 定数定義
const CANVAS_SIZE = 800;
const GRAPH_RANGE = {
    start: -200,
    end: 200,
    step: 1
};
const DEFAULT_COLORS = {
    graph: 0,
    tangent: [255, 0, 0],
    point: 0
};

// 描画設定
function setup() {
    createCanvas(CANVAS_SIZE, CANVAS_SIZE);
}

function draw() {
    setupCanvas();
}

// キャンバス設定
function setupCanvas() {
    translate(width / 2, height / 2);
    scale(1, -1);
}

// グラフ描画
function drawGraphs() {
    drawFunctionGraph(f, GRAPH_RANGE.start, GRAPH_RANGE.end, GRAPH_RANGE.step, DEFAULT_COLORS.graph);
}

// 接線描画
function drawTangent() {
    const x0 = 100;
    drawTangent(x0, f(x0), derivative(f, x0));
}

// 関数定義
/**
 * 二次関数 f(x) = 0.01x^2
 * @param {number} x - 入力値
 * @returns {number} 関数の出力値
 */
function f(x) {
    return 0.01 * x * x;
}

/**
 * 定数関数 g(x) = 10
 * @param {number} x - 入力値
 * @returns {number} 関数の出力値
 */
function g(x) {
    return x;
}

// 関数演算
/**
 * 2つの関数の和を返す
 * @param {Function} f - 1つ目の関数
 * @param {Function} g - 2つ目の関数
 * @returns {Function} f(x) + g(x) を計算する関数
 */
function addFunctions(f, g) {
    return function(x) {
        return f(x) + g(x);
    };
}

/**
 * 2つの関数の差を返す
 * @param {Function} f - 1つ目の関数
 * @param {Function} g - 2つ目の関数
 * @returns {Function} f(x) - g(x) を計算する関数
 */
function subtractFunctions(f, g) {
    return function(x) {
        return f(x) - g(x);
    };
}

/**
 * 2つの関数の積を返す
 * @param {Function} f - 1つ目の関数
 * @param {Function} g - 2つ目の関数
 * @returns {Function} f(x) * g(x) を計算する関数
 */
function multiplyFunctions(f, g) {
    return function(x) {
        return f(x) * g(x);
    };
}

/**
 * 2つの関数の商を返す
 * @param {Function} f - 分子の関数
 * @param {Function} g - 分母の関数
 * @returns {Function} f(x) / g(x) を計算する関数
 * @throws {Error} 分母が0になる場合にエラーを投げる
 */
function divideFunctions(f, g) {
    return function(x) {
        const denominator = g(x);
        if (Math.abs(denominator) < 1e-10) {
            throw new Error('Division by zero');
        }
        return f(x) / denominator;
    };
}

// 描画ユーティリティ
/**
 * 関数のグラフを描画する
 * @param {Function} func - 描画する関数
 * @param {number} startX - 描画開始のx座標
 * @param {number} endX - 描画終了のx座標
 * @param {number} step - x座標の増分
 * @param {number} [strokeColor=0] - 線の色（グレースケール）
 */
function drawFunctionGraph(func, startX, endX, step, strokeColor = DEFAULT_COLORS.graph) {
    stroke(strokeColor);
    noFill();
    beginShape();
    for (let x = startX; x < endX; x += step) {
        let y = func(x);
        vertex(x, y);
    }
    endShape();
}

/**
 * 接線を描画する
 * @param {number} x0 - 接点のx座標
 * @param {number} y0 - 接点のy座標
 * @param {number} slope - 接線の傾き
 * @param {number} [length=50] - 接線の長さ
 */
function drawTangent(x0, y0, slope, length = 50) {
    // 接線の描画
    stroke(...DEFAULT_COLORS.tangent);
    let x1 = x0 - length;
    let y1 = slope * (x1 - x0) + y0;
    let x2 = x0 + length;
    let y2 = slope * (x2 - x0) + y0;
    line(x1, y1, x2, y2);

    // 接点の描画
    stroke(DEFAULT_COLORS.point);
    fill(DEFAULT_COLORS.point);
    ellipse(x0, y0, 6, 6);
}

// 微分計算
/**
 * 数値微分を用いて関数の微分係数を計算する
 * @param {Function} f - 微分対象の関数
 * @param {number} x - 微分を計算する点
 * @param {number} [h=1e-3] - 微小な変化量
 * @returns {number} 点xにおける微分係数
 */
function derivative(f, x, h = 1e-3) {
    return (f(x + h) - f(x)) / h;
}

// イベントハンドラ
function mouseClicked() {
    const x0 = mouseX - width / 2;
    drawTangent(x0, f(x0), derivative(f, x0));
}


