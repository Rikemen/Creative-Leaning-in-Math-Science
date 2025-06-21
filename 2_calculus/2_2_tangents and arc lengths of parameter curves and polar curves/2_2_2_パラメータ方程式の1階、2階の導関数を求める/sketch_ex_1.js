//例1 単位園
let x, y, dxdt, dydt;
let r;
let t;
let dt = 0.01; // 微小変化量
let tangentL = 100; // 接線の長さ

function setup() {
    createCanvas(600, 400);
    background(240);
    r = 100;
    t = 0;
}

function draw() {
    background(255);
    translate(width / 2, height / 2);

    //接線を求める単位円は書いておく
    stroke(0);
    fill(255);
    ellipse(0, 0, r * 2, r * 2);


    //単位円のx, y座標を媒介変数で定義する (単位円だと小さすぎるので、半径100にする)
    x = (t) => r * cos(t);
    y = (t) => r * sin(t);

    // 数値微分による1階導関数の計算
    dxdt = (x(t + dt) - x(t)) / dt; // x'(t)
    dydt = (y(t + dt) - y(t)) / dt; // y'(t)


    // 接線ベクトルを単位ベクトルに正規化
    let magnitude = sqrt(dxdt * dxdt + dydt * dydt); // ベクトルの長さ
    let unitDx = dxdt / magnitude; // x方向の単位ベクトル
    let unitDy = dydt / magnitude; // y方向の単位ベクトル

    // 接線の両端の座標を計算
    let tangentX1 = x(t) + unitDx * tangentL;
    let tangentY1 = y(t) + unitDy * tangentL;
    let tangentX2 = x(t) - unitDx * tangentL;
    let tangentY2 = y(t) - unitDy * tangentL;

    // 接線を描画
    stroke(255, 0, 0); // 赤色
    line(tangentX1, tangentY1, tangentX2, tangentY2);

    //接点の位置
    stroke(0);
    ellipse(x(t), y(t), 5, 5);

    t += dt;

    if (t > Math.PI * 2) {
        t = 0;
    }
}



/**
 * Converts polar coordinates (r, theta) to Cartesian coordinates (x, y).
 *
 * @param {number} r - The radial distance from the origin.
 * @param {number} theta - The angle in radians from the positive x-axis.
 * @returns {Object} An object with x and y properties representing the Cartesian coordinates.
 * @returns {number} return.x - The x-coordinate in Cartesian coordinates.
 * @returns {number} return.y - The y-coordinate in Cartesian coordinates.
 *
 * @example
 * // Convert polar coordinates (r = 5, theta = Math.PI / 4) to Cartesian coordinates.
 * const cartesian = polarToCartesian(5, Math.PI / 4);
 * console.log(cartesian); // { x: 3.535..., y: 3.535... }
 */
function polarToCartesian(r, theta) {
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return { x: x, y: y };
}

/**
 * Converts Cartesian coordinates (x, y) to polar coordinates (r, theta).
 *
 * @param {number} x - The x-coordinate in Cartesian coordinates.
 * @param {number} y - The y-coordinate in Cartesian coordinates.
 * @returns {Object} An object with r and theta properties representing the polar coordinates.
 * @returns {number} return.r - The radial distance from the origin.
 * @returns {number} return.theta - The angle in radians from the positive x-axis.
 *
 * @example
 * // Convert Cartesian coordinates (x = 3, y = 4) to polar coordinates.
 * const polar = cartesianToPolar(3, 4);
 * console.log(polar); // { r: 5, theta: 0.927... }
 */
function cartesianToPolar(x, y) {
    let r = Math.sqrt(x * x + y * y);
    let radians = Math.atan2(y, x);
    let theta = radians * (180 / Math.PI)
    return { r: r, theta: theta };

}