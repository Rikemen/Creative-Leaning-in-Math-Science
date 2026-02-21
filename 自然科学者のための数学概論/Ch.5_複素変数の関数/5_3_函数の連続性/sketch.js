/**
 * 複素関数の写像と連続性 (Mapping & Continuity)
 * 教科書 5.3: w = f(z) の可視化
 * 左画面: z平面 (入力 x+iy)
 * 右画面: w平面 (出力 u+iv)
 * 関数: f(z) = z^2 を採用
 */

let range = 2.5; // 表示範囲 (-2.5 ~ 2.5)
let gridStep = 0.5; // グリッドの間隔

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
}

function draw() {
    background(30);

    // 画面分割の境界線
    stroke(100);
    line(width / 2, 0, width / 2, height);

    // ラベル表示
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    text("z-plane (Input: x + iy)", 20, 20);
    text("w-plane (Output: f(z) = z^2)", width / 2 + 20, 20);

    // 原点の設定
    let centerZ = { x: width / 4, y: height / 2 };     // 左画面の中心
    let centerW = { x: width * 3 / 4, y: height / 2 }; // 右画面の中心
    let scalePx = (width / 4) / range; // スケール計算

    // --- グリッドと写像の描画 ---
    drawMappingGrid(centerZ, centerW, scalePx);

    // --- マウスインタラクション (連続性の確認) ---
    // マウス位置を複素数 z に変換
    let mx = (mouseX - centerZ.x) / scalePx;
    let my = (mouseY - centerZ.y) / scalePx;

    // マウスが左画面内にあるときだけ計算
    if (mouseX < width / 2) {
        let z = new Complex(mx, my);

        // 関数 f(z) = z^2 を適用
        // Complexクラスの mult を利用: z * z
        let w = z.mult(z);

        // 左画面 (z) に点を描画
        drawPoint(centerZ.x + z.re * scalePx, centerZ.y + z.im * scalePx, color(100, 255, 100), "z");

        // 右画面 (w) に点を描画
        drawPoint(centerW.x + w.re * scalePx, centerW.y + w.im * scalePx, color(255, 100, 100), "w");

        // 教科書の「近所」の概念: zの周りの小さな円が、wでどうなるか
        noFill();
        stroke(100, 255, 100, 100);
        circle(centerZ.x + z.re * scalePx, centerZ.y + z.im * scalePx, 40); // zの近傍

        // wの近傍（形が歪むことを確認したいため、簡易的に4点を飛ばして描画）
        stroke(255, 100, 100, 100);
        beginShape();
        for (let angle = 0; angle < TWO_PI; angle += 0.1) {
            // zの周囲 半径0.2 の円上の点
            let neighborhoodZ = new Complex(z.re + 0.2 * cos(angle), z.im + 0.2 * sin(angle));
            // w平面へ写像
            let neighborhoodW = neighborhoodZ.mult(neighborhoodZ);
            vertex(centerW.x + neighborhoodW.re * scalePx, centerW.y + neighborhoodW.im * scalePx);
        }
        endShape(CLOSE);

        // 値の表示
        fill(255);
        noStroke();
        text(`z = ${z.toString()}`, 20, height - 60);
        text(`w = ${w.toString()}`, width / 2 + 20, height - 60);
    }
}

// グリッドを描画する関数
// 縦線と横線をそれぞれ z平面(直線) と w平面(曲線) に描画します
function drawMappingGrid(centerZ, centerW, s) {
    noFill();
    strokeWeight(1);

    // 垂直な線 (x = constant) を走査
    for (let x = -range; x <= range; x += gridStep) {
        // z平面 (ただの直線)
        stroke(100, 100, 255, 100); // 青っぽい色
        line(centerZ.x + x * s, 0, centerZ.x + x * s, height);

        // w平面 (写像された曲線)
        beginShape();
        for (let y = -range; y <= range; y += 0.1) {
            let z = new Complex(x, y);
            let w = z.mult(z); // f(z) = z^2

            // 画面外に飛びすぎないようにクリッピング的な処理
            // (描画乱れ防止のため簡易的に)
            if (w.mag() < range * 2) {
                vertex(centerW.x + w.re * s, centerW.y + w.im * s);
            }
        }
        endShape();
    }

    // 水平な線 (y = constant) を走査
    for (let y = -range; y <= range; y += gridStep) {
        // z平面
        stroke(255, 255, 100, 100); // 黄色っぽい色
        line(0, centerZ.y + y * s, width / 2, centerZ.y + y * s);

        // w平面
        beginShape();
        for (let x = -range; x <= range; x += 0.1) {
            let z = new Complex(x, y);
            let w = z.mult(z); // f(z) = z^2

            if (w.mag() < range * 2) {
                vertex(centerW.x + w.re * s, centerW.y + w.im * s);
            }
        }
        endShape();
    }
}

function drawPoint(px, py, col, label) {
    fill(col);
    noStroke();
    circle(px, py, 10);
    fill(255);
    text(label, px + 10, py - 10);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
