/**
 * 複素数級数の収束可視化 (Using Custom Complex Class)
 * 教科書の式 (5.1) S_n = a_1 + ... + a_n の挙動をシミュレートします。
 * * * 
 */

let scaleFactor = 200; // 画面上の表示倍率 (1単位 = 200px)

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
}

function draw() {
    background(30);

    // 座標系の中心
    const center = new Complex(width / 2, height / 2);

    drawGrid(center);

    // 1. マウス位置から複素数 z (公比) を決定
    // 画面中心を原点とし、正規化する
    let z = new Complex(
        (mouseX - center.re) / scaleFactor,
        (mouseY - center.im) / scaleFactor
    );

    // 情報表示
    drawInfo(z);

    // 2. 級数の計算と描画
    // S = 1 + z + z^2 + z^3 ... 

    let currentTerm = new Complex(1, 0); // 初項 1
    let sum = new Complex(1, 0);         // 部分和 S_n

    // 描画の開始点 (原点)
    let prevPos = center;

    // 最初の項 (1) への線を描画
    let firstTermPos = complexToScreen(sum, center);

    stroke(255);
    strokeWeight(2);
    line(prevPos.re, prevPos.im, firstTermPos.re, firstTermPos.im);

    prevPos = firstTermPos;

    // 繰り返し計算 (n=1 から 100項程度)
    for (let i = 0; i < 100; i++) {
        currentTerm = currentTerm.mult(z); // 次の項: term * z
        sum = sum.add(currentTerm);        // 和に加算: sum + term

        // 画面座標に変換
        let pixelPos = complexToScreen(sum, center);

        // ベクトルを描画 (色をグラデーションに)
        stroke(200, 200, 255, map(i, 0, 50, 255, 50));
        line(prevPos.re, prevPos.im, pixelPos.re, pixelPos.im);

        prevPos = pixelPos;

        // 画面外に出たら描画省略
        if (dist(center.re, center.im, pixelPos.re, pixelPos.im) > width) break;
    }

    // 3. 理論上の極限値の描画
    // S = 1 / (1 - z)

    if (z.mag() < 0.99) {
        // --- 極限の計算も数式通り記述できます ---
        // limit = 1 / (1 - z)
        let denominator = Complex.sub(1, z);
        let limit = Complex.div(1, denominator);
        // -------------------------------------

        let limitPos = complexToScreen(limit, center);

        // 極限値を赤い丸で描画
        noStroke();
        fill(255, 50, 50);
        circle(limitPos.re, limitPos.im, 10);

        fill(255);
        text(`Limit S = ${limit.toString()}`, limitPos.re + 15, limitPos.im);
    } else {
        fill(255, 100, 100);
        textAlign(CENTER);
        text("Diverges (|z| >= 1)", width / 2, 30);
    }
}

// 複素数座標を画面ピクセル座標に変換するヘルパー関数
function complexToScreen(c, center) {
    return new Complex(
        center.re + c.re * scaleFactor,
        center.im + c.im * scaleFactor
    );
}

function drawGrid(center) {
    stroke(60);
    strokeWeight(1);
    line(0, center.im, width, center.im); // 実軸
    line(center.re, 0, center.re, height); // 虚軸

    noFill();
    circle(center.re, center.im, scaleFactor * 2); // 単位円 (|z|=1)
}

function drawInfo(z) {
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    // toString() メソッドも活用
    text(`z = ${z.toString()}`, 20, 20);
    text(`|z| = ${nf(z.mag(), 1, 3)}`, 20, 45);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

