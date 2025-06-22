let font;

function preload() {
    font = loadFont('../assets/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf');
}

function setup() {
    createCanvas(1600, 1000, WEBGL);
    textFont(font);
    textSize(60);
}

function draw() {
    background(0);
    orbitControl();

    drawAxes(300);
    drawParametricCurve(0, 8 * PI);

    // 特定の点での接線を描画
    drawTangentAt(PI);
}

function drawParametricCurve(start, end) {
    stroke(255);
    strokeWeight(2);
    noFill();

    let a = 100;
    let c = 100;

    beginShape();
    for (let t = start; t < end; t += 0.1) {
        let x = a * cos(t);
        let y = - (a * t);
        let z = c * sin(t / 8) + 100;
        vertex(x, y, z);
    }
    endShape();
}

/**
 * 特定の点での接線を描画
 * @param {number} t0 接線を描く点のパラメータ
 */
function drawTangentAt(t0) {
    let a = 100;
    let c = 100;

    // 微小な差分で数値微分
    let dt = 0.01;

    // 位置ベクトル
    let x = a * cos(t0);
    let y = - (a * t0);
    let z = c * sin(t0 / 8) + 100;

    // 数値微分で接線ベクトルを求める
    let x1 = a * cos(t0 + dt);
    let y1 = - (a * (t0 + dt));
    let z1 = c * sin((t0 + dt) / 8) + 100;

    let dx = x1 - x;
    let dy = y1 - y;
    let dz = z1 - z;

    // 接線のスケーリング
    let scale = 50;
    let x_end = x + dx * scale;
    let y_end = y + dy * scale;
    let z_end = z + dz * scale;

    stroke(255, 0, 0);
    strokeWeight(3);
    line(x, y, z, x_end, y_end, z_end);

    // 接点に球とラベル
    push();
    translate(x, y, z);
    fill(255, 0, 0);
    noStroke();
    sphere(6);
    rotateY(-QUARTER_PI);
    rotateX(-QUARTER_PI);
    textSize(40);
    text("接線", 60, 0);
    pop();
}

function drawAxes(len) {
    strokeWeight(2);
    textAlign(CENTER, CENTER);
    let offset = 40;

    // X軸
    stroke(255);
    line(0, 0, 0, len, 0, 0);
    push();
    translate(len + offset, 0, 0);
    fill(255);
    noStroke();
    rotateY(-QUARTER_PI);
    rotateX(-QUARTER_PI);
    text("x", 0, 0);
    pop();

    // Y軸
    stroke(255);
    line(0, 0, 0, 0, -len, 0);
    push();
    translate(0, -len - offset, 0);
    fill(255);
    noStroke();
    rotateY(-QUARTER_PI);
    rotateX(-QUARTER_PI);
    text("y", 0, 0);
    pop();

    // Z軸
    stroke(255);
    line(0, 0, 0, 0, 0, len);
    push();
    translate(0, 0, len + offset);
    fill(255);
    noStroke();
    rotateY(-QUARTER_PI);
    rotateX(-QUARTER_PI);
    text("z", 0, 0);
    pop();
}
