

function setup() {
    createCanvas(800, 800);
}

function draw() {
    // background(255);
    translate(width / 2, height / 2); // 原点を少し右に、中央に移動
    scale(1, -1); // Y軸を上向きに

    // 関数 f(x) のグラフを描画
    stroke(0);
    noFill();
    beginShape();
    for (let x = -200; x < 200; x += 1) {
        let y = f(x);
        vertex(x, y);
    }
    endShape();

    // 接線の描画
    let x0 = 100;
    drawTangent(x0, f(x0), derivative(f, x0));

}

/**
 * 微分係数を求める対象となる関数 f(x) = 0.01x^2 を定義する
 * @param {number} x - 入力値
 * @returns {number} 関数の出力値
 */
function f(x) {
    return 0.01 * x * x;
}

/**
 * 対象となる関数を引数として受け取り、数値微分を用いて関数の微分係数を計算する関数
 * @param {Function} f - 微分対象の関数
 * @param {number} x - 微分を計算する点
 * @param {number} [h=1e-3] - 微小な変化量（デフォルト値: 0.001）
 * @returns {number} 点xにおける微分係数
 */
function derivative(f, x, h = 1e-3) {
    return (f(x + h) - f(x)) / h;
}

function mouseClicked() {
    console.log(mouseX, mouseY);
    let x0 = mouseX - width / 2;
    drawTangent(x0, f(x0), derivative(f, x0));
}

function drawTangent(x0, y0, slope, length = 50) {
    // 接線の描画
    stroke(255, 0, 0);
    let x1 = x0 - length;
    let y1 = slope * (x1 - x0) + y0;
    let x2 = x0 + length;
    let y2 = slope * (x2 - x0) + y0;
    line(x1, y1, x2, y2);

    // 接点の描画
    stroke(0);
    fill(0);
    ellipse(x0, y0, 6, 6);
}


