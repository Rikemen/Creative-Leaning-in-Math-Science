/**
 * 複素微分の可視化：コーシー・リーマンの条件
 * 教科書 5.4: 微分係数の存在条件
 * * マウスで点 z を動かし、その周囲から近づく点 h について
 * 微分係数の候補 (f(z+h) - f(z)) / h を計算してプロットします。
 */

let mode = 0; // 0: f(z) = z^2 (正則), 1: f(z) = conj(z) (非正則)
let scaleFactor = 150;

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
}

function draw() {
    background(30);

    // 原点設定
    let centerZ = { x: width / 4, y: height / 2 };     // z平面 (入力)
    let centerD = { x: width * 3 / 4, y: height / 2 }; // 微分係数平面 (出力候補)

    // 画面分割線
    stroke(100);
    line(width / 2, 0, width / 2, height);

    // ラベルと数式表示
    displayInfo(centerZ, centerD);

    // マウス位置を複素数 z とする
    let mx = (mouseX - centerZ.x) / scaleFactor;
    let my = (mouseY - centerZ.y) / scaleFactor;
    let z = new Complex(mx, my);

    // z点を描画
    if (mouseX < width / 2) {
        drawPoint(centerZ, z, color(255), "z");

        // --- 微分の実験 ---
        // zに向かって、周囲360度いろいろな方向(h)から近づいてみる
        // 定義式: limit (f(z+h) - f(z)) / h

        let r = 0.1; // 近づく幅 h の大きさ (可視化のため少し大きめに設定)

        beginShape();
        noFill();

        for (let angle = 0; angle < TWO_PI; angle += 0.1) {
            // 1. 微小な変位 h
            let h = Complex.fromPolar(r, angle);
            // 実際には極限(r->0)ですが、見やすくするため有限の大きさで計算します

            // 2. z + h の地点
            let z_plus_h = z.add(h);

            // 3. 関数の値を計算
            let f_z = calculateFunction(z);
            let f_zh = calculateFunction(z_plus_h);

            // 4. 微分係数の近似値 (差分商) を計算
            // diff = (f(z+h) - f(z)) / h
            let numerator = f_zh.sub(f_z);
            let diffQuotient = numerator.div(h);

            // --- 描画 ---

            // 左画面: zに近づく点 z+h の様子
            let screenZH = toScreen(centerZ, z_plus_h);
            stroke(100, 255, 255, 100);
            point(screenZH.x, screenZH.y);

            // 右画面: その時の「変化の割合」の値
            let screenDiff = toScreen(centerD, diffQuotient);

            // 色相を変えて、どの角度からの接近化わかるようにする
            colorMode(HSB, 360, 100, 100);
            stroke(degrees(angle), 80, 100);
            strokeWeight(4);
            point(screenDiff.x, screenDiff.y);
            colorMode(RGB);
        }
        endShape();

        // 結果の解説
        fill(255);
        noStroke();
        textAlign(CENTER);
        if (mode === 0) {
            text("一点に集中する = 微分可能 (Differentiable)", centerD.x, height - 100);
            text("コーシー・リーマンの方程式を満たす", centerD.x, height - 80);
        } else {
            text("円を描いてバラバラ = 微分不可能", centerD.x, height - 100);
            text("近づく方向によって値が変わる", centerD.x, height - 80);
        }
    }
}

// 関数切り替え
function calculateFunction(c) {
    if (mode === 0) {
        return c.mult(c); // z^2
    } else {
        return c.conj();  // conj(z)
    }
}

function mousePressed() {
    // クリックでモード切替
    mode = (mode + 1) % 2;
}

// 描画ヘルパー
function toScreen(center, c) {
    return {
        x: center.x + c.re * scaleFactor,
        y: center.y + c.im * scaleFactor
    };
}

function drawPoint(center, c, col, label) {
    let p = toScreen(center, c);
    fill(col);
    noStroke();
    circle(p.x, p.y, 8);
    text(label, p.x + 10, p.y - 10);
}

function displayInfo(centerZ, centerD) {
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    text("Click to toggle function", 20, 50);

    // 左側
    text("Input z-plane", 20, 20);
    stroke(100);
    line(centerZ.x - 20, centerZ.y, centerZ.x + 20, centerZ.y);
    line(centerZ.x, centerZ.y - 20, centerZ.x, centerZ.y + 20);

    // 右側
    text("Derivative Quotient Plane", width / 2 + 20, 20);
    text("Val = (f(z+h) - f(z)) / h", width / 2 + 20, 50);

    stroke(100);
    line(centerD.x - 100, centerD.y, centerD.x + 100, centerD.y);
    line(centerD.x, centerD.y - 100, centerD.x, centerD.y + 100);

    fill(255, 255, 100);
    textSize(20);
    if (mode === 0) {
        text("Current: f(z) = z^2 (Regular)", width / 2 + 20, 80);
    } else {
        text("Current: f(z) = conj(z) (Not Regular)", width / 2 + 20, 80);
    }
    textSize(16);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}