let xInput, yInput, drawButton;
let x;
let y;
let targetTheta;
let r;
let currentTheta = 0; // 現在の角度
let speed = 2; // 角度の増加速度
let drawing = false; // 描画を開始するかのフラグ
let reachedTarget = false; // 目標角度に到達したかのフラグ

function setup() {
    createCanvas(600, 400);
    angleMode(DEGREES); // 角度を度に設定


    // ラベル表示
    createP('x座標 (x):').position(70, height + 10);
    // 動径の長さの入力フィールド
    xInput = createInput('100');
    xInput.position(10, height + 50);
    xInput.size(120);


    // ラベル表示
    createP('y座標 (y):').position(70, height + 90);
    // 目標角度の入力フィールド
    yInput = createInput('120');
    yInput.position(10, height + 130);
    yInput.size(120);

    // "Draw" ボタンの作成
    drawButton = createButton('Draw');
    drawButton.position(10, height + 180);
    drawButton.mousePressed(startDrawing);

}

function draw() {
    if (!reachedTarget) {
        background(255); // 背景のクリアは目標角度に到達していないときのみ
    }
    translate(width / 2, height / 2); // 中心を画面の中心に

    // X軸の線
    stroke(0);
    line(-width / 2, 0, width / 2, 0);

    // アニメーションの描画
    if (drawing) {
        drawPolarCoordinate(r, targetTheta);
    }
}

/**
 * Draws a polar coordinate visualization with a given radius and target angle.
 * The animation stops when the current angle reaches the target angle.
 *
 * @param {number} r - The radius of the polar coordinate.
 * @param {number} targetTheta - The target angle in degrees at which to stop the animation.
 */
function drawPolarCoordinate(r, targetTheta) {
    // 目標角度に達していなければ角度を増加
    if (currentTheta < targetTheta) {
        currentTheta += speed;
    } else {
        drawing = false; // 目標角度に達したら描画を停止
        reachedTarget = true; // 目標角度に達したことを記録
    }

    let endX = r * cos(currentTheta);
    let endY = - r * sin(currentTheta);

    // 動径の線
    stroke(0);
    line(0, 0, endX, endY);

    // 終点の円
    fill(0);
    ellipse(endX, endY, 10, 10);

    // 動径の円
    noFill();
    stroke(150);
    ellipse(0, 0, r * 2, r * 2);

    // 角度の円弧と矢印
    stroke(0);
    noFill();
    let arcSize = 30; // 円弧の大きさ
    arc(0, 0, arcSize * 2, arcSize * 2, 360 - currentTheta, 0);

    // 角度の表示
    fill(0);
    noStroke();
    textSize(12);
    text(nf(currentTheta, 1, 0) + '°', arcSize * 3 * cos(currentTheta / 2), -arcSize * sin(currentTheta / 2));

    // 終点の極座標成分表示
    textAlign(CENTER);
    text(`(r, θ) = (${nf(r, 1, 0)}, ${nf(currentTheta, 1, 0)}°)`, x, - y + 10);
    text(`(x, y) = (${nf(x, 1, 0)}, ${nf(y, 1, 0)}°)`, x, - y + 30);
}


/**
 * Starts the drawing process by setting the radius (r) and target angle (targetTheta)
 * based on user input. Resets the current angle to 0 and enables drawing.
 */
function startDrawing() {
    // 入力フィールドの値を取得して変数を更新
    x = parseFloat(xInput.value());
    y = parseFloat(yInput.value());
    currentTheta = 0; // 角度をリセット
    reachedTarget = false; //目標角度に達したフラグもリセット
    drawing = true; // 描画フラグを立てる
    r = cartesianToPolar(x, y).r;
    console.log("r is ", r);
    targetTheta = cartesianToPolar(x, y).theta;
    console.log("targetTheta is ", targetTheta);

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