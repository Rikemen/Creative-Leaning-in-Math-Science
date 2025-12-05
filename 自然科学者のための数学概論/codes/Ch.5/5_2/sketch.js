// Unit 2: 正則関数と等角写像の可視化
// Mapping w = e^z (指数関数)

let PI = Math.PI;
let xMin = -2, xMax = 2;
let yMin = -PI, yMax = PI; // yの範囲を -π ~ π に設定

function setup() {
    createCanvas(800, 400);
    noFill();
}

function draw() {
    background(245);

    // --- 1. 左側：z平面 (直交グリッド) ---
    push();
    translate(200, 200);
    drawAxes("z-plane");

    // グリッドを描画
    stroke(100, 100, 255); // 薄い青
    drawZGrid();

    // マウスカーソルの点を描画
    let z = getMouseZ(0, 200);
    drawPoint(z.x, z.y, 'blue');
    pop();

    // --- 2. 右側：w平面 (写像されたグリッド) ---
    push();
    translate(600, 200);
    drawAxes("w-plane: w = exp(z)");

    // 写像されたグリッドを描画
    stroke(255, 100, 100); // 薄い赤
    drawWGrid();

    // マウスカーソルの写像点を描画
    let w = complexExp(z);
    drawPoint(w.x, w.y, 'red');
    pop();

    // 解説テキスト
    fill(50);
    noStroke();
    textSize(12);
    text("Vertical lines (x=c) map to Circles", 420, 360);
    text("Horizontal lines (y=c) map to Rays", 420, 380);
}

// --- 数学関数 ---

// 複素指数関数 w = e^z
function complexExp(z) {
    let r = exp(z.x);   // 大きさは e^x
    let theta = z.y;    // 角度は y
    return {
        x: r * cos(theta),
        y: r * sin(theta)
    };
}

// --- 描画関数 ---

// z平面のグリッド（ただの直線）
function drawZGrid() {
    strokeWeight(1);
    let step = 0.5;

    // 縦線 (x = constant) -> w平面では円になるはず
    for (let x = xMin; x <= xMax; x += step) {
        beginShape();
        for (let y = yMin; y <= yMax; y += 0.1) {
            let px = map(x, xMin, xMax, -150, 150);
            let py = map(y, yMin, yMax, 150, -150);
            vertex(px, py);
        }
        // 最後の点を確実に描画
        let px = map(x, xMin, xMax, -150, 150);
        let py = map(yMax, yMin, yMax, 150, -150);
        vertex(px, py);
        endShape();
    }

    // 横線 (y = constant) -> w平面では放射線になるはず
    for (let y = yMin; y <= yMax; y += step) {
        beginShape();
        for (let x = xMin; x <= xMax; x += 0.1) {
            let px = map(x, xMin, xMax, -150, 150);
            let py = map(y, yMin, yMax, 150, -150);
            vertex(px, py);
        }
        // 最後の点を確実に描画
        let px = map(xMax, xMin, xMax, -150, 150);
        let py = map(y, yMin, yMax, 150, -150);
        vertex(px, py);
        endShape();
    }
}

// w平面のグリッド（変形後）
function drawWGrid() {
    strokeWeight(1);
    let step = 0.5;
    let scaleF = 50; // 表示用スケール

    // 縦線の写像
    for (let x = xMin; x <= xMax; x += step) {
        beginShape();
        for (let y = yMin; y <= yMax; y += 0.1) {
            let z = { x: x, y: y };
            let w = complexExp(z);
            vertex(w.x * scaleF, -w.y * scaleF);
        }
        // 最後の点を確実に描画 (円を閉じる)
        let z = { x: x, y: yMax };
        let w = complexExp(z);
        vertex(w.x * scaleF, -w.y * scaleF);
        endShape();
    }

    // 横線の写像
    for (let y = yMin; y <= yMax; y += step) {
        beginShape();
        for (let x = xMin; x <= xMax; x += 0.1) {
            let z = { x: x, y: y };
            let w = complexExp(z);
            vertex(w.x * scaleF, -w.y * scaleF);
        }
        // 最後の点を確実に描画
        let z = { x: xMax, y: y };
        let w = complexExp(z);
        vertex(w.x * scaleF, -w.y * scaleF);
        endShape();
    }
}

// 軸描画
function drawAxes(label) {
    stroke(0);
    strokeWeight(2);
    line(-180, 0, 180, 0);
    line(0, -180, 0, 180);
    fill(0);
    noStroke();
    text(label, -170, -170);
}

// 点描画
function drawPoint(x, y, col) {
    // 左画面のスケールに合わせるか、右画面のスケールに合わせるか
    // ここでは簡易的に座標変換をハードコードしています
    // 実際はもっと綺麗な変換クラスを作ると良いです
    let px, py;
    if (col === 'blue') {
        px = map(x, xMin, xMax, -150, 150);
        py = map(y, yMin, yMax, 150, -150);
    } else {
        let scaleF = 50;
        px = x * scaleF;
        py = -y * scaleF;
    }

    stroke(col);
    strokeWeight(8);
    point(px, py);
}

// マウス位置からzを取得
function getMouseZ(offsetX, offsetY) {
    let mx = mouseX - offsetX - 200;
    let my = mouseY - offsetY;

    // 画面外制限
    let x = map(mx, -150, 150, xMin, xMax);
    let y = map(my, 150, -150, yMin, yMax);
    return { x: x, y: y };
}
