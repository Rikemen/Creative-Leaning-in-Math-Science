/**
 * 複素初等関数のカタログ (Elementary Functions Gallery)
 * 教科書 5.5: 指数・三角・対数関数の可視化
 * * * キーボードの '1', '2', '3', '4' またはクリックで関数を切り替えます
 * 1: f(z) = z (Identity)
 * 2: f(z) = e^z (Exponential)
 * 3: f(z) = sin(z) (Trigonometric)
 * 4: f(z) = log(z) (Logarithmic - Principal Value)
 */

let currentMode = 2; // 初期値: 指数関数
let scalePx = 60;    // 1単位あたりのピクセル数
let gridRange = 3.0; // グリッドを描画する範囲 (-3 ~ 3)

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);

    // スマホなどでも操作しやすいようにクリックイベントを設定
    createSpan(" Switch Function: ").position(10, 10).style('color', 'white');
    createButton("1. z").mousePressed(() => currentMode = 1).position(120, 10);
    createButton("2. e^z").mousePressed(() => currentMode = 2).position(170, 10);
    createButton("3. sin(z)").mousePressed(() => currentMode = 3).position(230, 10);
    createButton("4. log(z)").mousePressed(() => currentMode = 4).position(300, 10);
}

function draw() {
    background(30);

    // 画面中央設定
    let centerZ = { x: width / 4, y: height / 2 };     // 入力 (z平面)
    let centerW = { x: width * 3 / 4, y: height / 2 }; // 出力 (w平面)

    // 区切り線
    stroke(100);
    line(width / 2, 0, width / 2, height);

    // 情報表示
    displayInfo();

    // グリッド写像の描画
    drawMapping(centerZ, centerW);

    // マウスインタラクション
    if (mouseX < width / 2) {
        // マウス位置から z を取得
        let z = new Complex(
            (mouseX - centerZ.x) / scalePx,
            (mouseY - centerZ.y) / scalePx
        );

        // 選択中の関数を適用
        let w = applyFunction(z);

        // 点を描画
        drawPoint(centerZ, z, color(100, 255, 100), "z");
        drawPoint(centerW, w, color(255, 100, 100), "w");

        // 値を表示
        fill(255);
        noStroke();
        textAlign(LEFT);
        text(`z = ${z.toString()}`, 20, height - 30);
        text(`w = ${w.toString()}`, width / 2 + 20, height - 30);
    }
}

// 関数適用ロジック
function applyFunction(z) {
    switch (currentMode) {
        case 1: return z; // そのまま
        case 2: return z.exp(); // 指数関数
        case 3: return z.sin(); // 正弦関数
        case 4: return z.log(); // 対数関数 (主値)
        default: return z;
    }
}

// グリッドと写像の描画
function drawMapping(centerZ, centerW) {
    noFill();
    strokeWeight(1);

    // --- 垂直線 (x = const) ---
    for (let x = -gridRange; x <= gridRange; x += 0.5) {
        // 入力側 (z)
        stroke(100, 100, 255, 50);
        line(centerZ.x + x * scalePx, centerZ.y - gridRange * scalePx,
            centerZ.x + x * scalePx, centerZ.y + gridRange * scalePx);

        // 出力側 (w)
        stroke(100, 100, 255, 150); // 青色
        beginShape();
        for (let y = -gridRange; y <= gridRange; y += 0.1) {
            let z = new Complex(x, y);
            let w = applyFunction(z);

            // logの分岐切断(Branch Cut)などで線が飛ぶ場合の対策
            // 距離が飛びすぎたら描画しない
            if (w.mag() < 10) { // 極端に大きい値はカット
                vertex(centerW.x + w.re * scalePx, centerW.y + w.im * scalePx);
            } else {
                endShape();
                beginShape();
            }
        }
        endShape();
    }

    // --- 水平線 (y = const) ---
    for (let y = -gridRange; y <= gridRange; y += 0.5) {
        // 入力側 (z)
        stroke(255, 255, 100, 50);
        line(centerZ.x - gridRange * scalePx, centerZ.y + y * scalePx,
            centerZ.x + gridRange * scalePx, centerZ.y + y * scalePx);

        // 出力側 (w)
        stroke(255, 255, 100, 150); // 黄色
        beginShape();
        for (let x = -gridRange; x <= gridRange; x += 0.1) {
            let z = new Complex(x, y);
            let w = applyFunction(z);

            if (w.mag() < 10) {
                vertex(centerW.x + w.re * scalePx, centerW.y + w.im * scalePx);
            } else {
                endShape();
                beginShape();
            }
        }
        endShape();
    }
}

function displayInfo() {
    noStroke();
    fill(255);
    textSize(20);
    textAlign(CENTER);

    let title = "";
    let desc = "";

    if (currentMode === 2) {
        title = "f(z) = e^z";
        desc = "Maps horizontal lines to Rays, vertical lines to Circles.";
    } else if (currentMode === 3) {
        title = "f(z) = sin(z)";
        desc = "Maps grid to confocal ellipses and hyperbolas.";
    } else if (currentMode === 4) {
        title = "f(z) = log(z)";
        desc = "Inverse of e^z. Maps plane to a strip.";
    } else {
        title = "f(z) = z";
        desc = "Identity mapping.";
    }

    text(title, width * 0.75, 60);
    textSize(14);
    text(desc, width * 0.75, 90);

    textAlign(LEFT);
    text("z-plane (Input)", 20, 60);
}

function drawPoint(center, c, col, label) {
    let px = center.x + c.re * scalePx;
    let py = center.y + c.im * scalePx;
    fill(col);
    noStroke();
    circle(px, py, 8);
    text(label, px + 10, py - 10);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// --- 拡張版 Complex クラス (初等関数を追加) ---

class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    add(c) {
        let other = c instanceof Complex ? c : new Complex(c, 0);
        return new Complex(this.re + other.re, this.im + other.im);
    }

    sub(c) {
        let other = c instanceof Complex ? c : new Complex(c, 0);
        return new Complex(this.re - other.re, this.im - other.im);
    }

    mult(c) {
        let other = c instanceof Complex ? c : new Complex(c, 0);
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }

    div(c) {
        let other = c instanceof Complex ? c : new Complex(c, 0);
        const denom = other.re * other.re + other.im * other.im;
        if (denom === 0) return new Complex(0, 0); // Avoid crash
        return new Complex(
            (this.re * other.re + this.im * other.im) / denom,
            (this.im * other.re - this.re * other.im) / denom
        );
    }

    mag() { return Math.sqrt(this.re * this.re + this.im * this.im); }
    arg() { return Math.atan2(this.im, this.re); }

    toString() { return `${nf(this.re, 1, 2)} + ${nf(this.im, 1, 2)}i`; }

    // --- 今回追加した初等関数 ---

    // 指数関数: e^z = e^x * (cos y + i sin y)
    exp() {
        let r = Math.exp(this.re);
        return new Complex(r * Math.cos(this.im), r * Math.sin(this.im));
    }

    // 自然対数: log z = ln|z| + i arg(z)
    log() {
        return new Complex(Math.log(this.mag()), this.arg());
    }

    // 正弦: sin z = (e^iz - e^-iz) / 2i
    // 計算式: sin(x+iy) = sin(x)cosh(y) + i cos(x)sinh(y)
    sin() {
        return new Complex(
            Math.sin(this.re) * Math.cosh(this.im),
            Math.cos(this.re) * Math.sinh(this.im)
        );
    }

    // 余弦: cos z = (e^iz + e^-iz) / 2
    // 計算式: cos(x+iy) = cos(x)cosh(y) - i sin(x)sinh(y)
    cos() {
        return new Complex(
            Math.cos(this.re) * Math.cosh(this.im),
            -Math.sin(this.re) * Math.sinh(this.im)
        );
    }
}