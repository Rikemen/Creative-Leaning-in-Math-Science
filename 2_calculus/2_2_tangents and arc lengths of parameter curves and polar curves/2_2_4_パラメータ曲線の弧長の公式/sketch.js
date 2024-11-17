let dt = 0.01; // 微小変化量
let tStart = 0; // パラメータの開始値
let tEnd = Math.PI * 2; // パラメータの終了値
let totalArcLength = 0; // 弧長を格納する変数

function setup() {
    createCanvas(800, 800);
    background(240);

    // 弧長の計算
    totalArcLength = calculateArcLength(tStart, tEnd, dt);

    // 結果を表示
    noLoop();
}

function draw() {
    background(240);
    translate(width / 2, height / 2);

    // パラメータ曲線を描画
    stroke(0);
    noFill();
    beginShape();
    for (let t = tStart; t <= tEnd; t += dt) {
        let { x, y } = parametricCurve(t);
        vertex(x, y);
    }
    endShape();

    // 結果を画面に表示
    fill(0);
    textSize(16);
    text(`Total Arc Length: ${totalArcLength.toFixed(2)}`, -width / 2 + 20, -height / 2 + 30);
}

/**
 * パラメータ曲線を定義
 * @param {number} t - パラメータ t
 * @returns {{x: number, y: number}} 曲線上の (x, y) 座標
 */
function parametricCurve(t) {
    // 例: 楕円 (x(t) = 200*cos(t), y(t) = 100*sin(t))
    // return {
    //     x: 100 * cos(t),
    //     y: 200 * sin(t),
    // };
    // 例： 曲線 (x(t) = 40 * t + 100 * cos(t), y(t) = 200 * sin(t))
    return {
        x: -200 + 40 * t + 100 * cos(t),
        y: 200 * sin(2 * t) + 100 * sin(3 * t)
    }
}

/**
 * パラメータ曲線の弧長を計算する
 * @param {number} tStart - パラメータの開始値
 * @param {number} tEnd - パラメータの終了値
 * @param {number} dt - 微小変化量
 * @returns {number} 弧長
 */
function calculateArcLength(tStart, tEnd, dt) {
    let arcLength = 0;

    for (let t = tStart; t <= tEnd - dt; t += dt) {
        // 現在の点と次の点の座標を取得
        let { x: x1, y: y1 } = parametricCurve(t);
        let { x: x2, y: y2 } = parametricCurve(t + dt);

        // 2点間の距離を計算し、弧長に加算
        let segmentLength = dist(x1, y1, x2, y2);
        arcLength += segmentLength;
    }

    return arcLength;
}
