//例2 紙飛行機
let x, y, dxdt, dydt;
let r;
let t;
let dt = 0.01; // 微小変化量
let tangentL = 100; // 接線の長さ

function setup() {
    createCanvas(800, 800);
    r = 50;
    t = 0;
}

function draw() {
    background(240);
    translate(width / 6, height / 2);

    x = (t) => r * t - 3 * r * sin(t);
    y = (t) => -3 * r * cos(t);

    //曲線を先に書いておく
    for (let t = 0; t < Math.PI * 4; t += dt) {
        stroke(0);
        strokeWeight(2);
        point(x(t), y(t));
    }

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


    //接点を描画する
    fill(255);
    stroke(0);
    ellipse(x(t), y(t), 5, 5);
    t += dt;


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