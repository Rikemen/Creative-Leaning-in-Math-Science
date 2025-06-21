let rInput, thetaInput, drawButton;
let r = 100; // 動径の長さ（デフォルト値）
let targetTheta = 120; // 目標角度（デフォルト値）
let currentTheta = 0; // 現在の角度
let speed = 2; // 角度の増加速度
let drawing = false; // 描画を開始するかのフラグ
let reachedTarget = false; // 目標角度に到達したかのフラグ

function setup() {
    createCanvas(600, 400);
    angleMode(DEGREES); // 角度を度に設定


    // ラベル表示
    createP('動径の長さ (r):').position(70, height + 10);
    // 動径の長さの入力フィールド
    rInput = createInput('100');
    rInput.position(10, height + 50);
    rInput.size(120);


    // ラベル表示
    createP('目標角度 (θ):').position(70, height + 90);
    // 目標角度の入力フィールド
    thetaInput = createInput('120');
    thetaInput.position(10, height + 130);
    thetaInput.size(120);

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

    // 極座標からデカルト座標への変換
    let x = r * cos(currentTheta);
    let y = -r * sin(currentTheta); // yを-にすることで左回り

    // 動径の線
    stroke(0);
    line(0, 0, x, y);

    // 終点の円
    fill(0);
    ellipse(x, y, 10, 10);

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
    text(`(${nf(r, 1, 0)}, ${nf(currentTheta, 1, 0)}°)`, x, y - 10);
}


/**
 * Starts the drawing process by setting the radius (r) and target angle (targetTheta)
 * based on user input. Resets the current angle to 0 and enables drawing.
 */
function startDrawing() {
    // 入力フィールドの値を取得して変数を更新
    r = parseFloat(rInput.value());
    targetTheta = parseFloat(thetaInput.value());
    currentTheta = 0; // 角度をリセット
    reachedTarget = false; //目標角度に達したフラグもリセット
    drawing = true; // 描画フラグを立てる
}