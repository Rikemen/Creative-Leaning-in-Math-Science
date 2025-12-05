// p5.jsによる複素数演算と写像の可視化
// Unit 1: f(z) = z^2 の可視化

let canvasSize = 600;
let plotRange = 2.5; // 座標軸の表示範囲 (-2.5 ～ 2.5)

function setup() {
    createCanvas(800, 400); // 横長のアートボードを作成
    textSize(14);
}

function draw() {
    background(240);

    // --- 1. 左側：入力 z平面 (Input Plane) ---
    push();
    translate(200, 200); // 左側の中心を原点に
    drawGrid("z-plane (Input)");

    // マウス座標を複素数 z に変換
    let z = pixelToMath(mouseX, mouseY, 0, 200); // 0-400の範囲で計算

    // zベクトルを描画 (青色)
    drawVector(z.x, z.y, 'blue', "z");

    // zの情報を表示
    displayInfo(z, -180, 160, "Input z");
    pop();


    // --- 2. 右側：出力 w平面 (Output Plane) ---
    push();
    translate(600, 200); // 右側の中心を原点に
    drawGrid("w-plane (Output): w = z^2");

    // 複素関数の計算: w = z^2
    // (x + iy)^2 = (x^2 - y^2) + i(2xy)
    let wx = z.x * z.x - z.y * z.y;
    let wy = 2 * z.x * z.y;

    // wベクトルを描画 (赤色)
    drawVector(wx, wy, 'red', "w");

    // wの情報を表示
    displayInfo({ x: wx, y: wy }, -180, 160, "Output w");
    pop();
}

// --- 補助関数群 ---

// 座標軸とグリッドを描く
function drawGrid(label) {
    stroke(200);
    strokeWeight(1);

    // グリッド線
    // pixel scaling factor
    let scaleF = 200 / plotRange;

    for (let i = -plotRange; i <= plotRange; i += 0.5) {
        let p = i * scaleF;
        line(p, -200, p, 200); // 縦線
        line(-200, p, 200, p); // 横線
    }

    // 軸
    stroke(0);
    strokeWeight(2);
    line(-200, 0, 200, 0); // 実軸
    line(0, -200, 0, 200); // 虚軸

    fill(0);
    noStroke();
    text(label, -180, -170);
    text("Re", 180, 15);
    text("Im", 10, -180);
}

// ベクトルを描く
function drawVector(x, y, col, label) {
    let px = x * (200 / plotRange);
    let py = -y * (200 / plotRange); // y軸は画面上では下がプラスなので反転

    stroke(col);
    strokeWeight(3);
    line(0, 0, px, py);

    fill(col);
    noStroke();
    circle(px, py, 10);
    text(label, px + 10, py);
}

// ピクセル座標を数学座標に変換
function pixelToMath(mx, my, offsetX, offsetY) {
    // マウスがキャンバス外にある場合の制限
    let localX = mx - offsetX - 200; // translate分を考慮
    let localY = my - 200;

    let x = localX / (200 / plotRange);
    let y = -localY / (200 / plotRange); // y軸反転

    return { x: x, y: y };
}

// 数値情報を表示
function displayInfo(v, x, y, title) {
    fill(50);
    noStroke();
    let r = sqrt(v.x * v.x + v.y * v.y);
    let theta = degrees(atan2(v.y, v.x));

    text(`${title}:`, x, y);
    text(`x + iy = ${nf(v.x, 1, 2)} + i(${nf(v.y, 1, 2)})`, x, y + 15);
    text(`Polar: r = ${nf(r, 1, 2)}, θ = ${nf(theta, 1, 1)}°`, x, y + 30);
}
