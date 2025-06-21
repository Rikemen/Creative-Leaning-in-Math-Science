let font;

let dragging = false;

function preload() {
    // フォントを読み込む
    font = loadFont('../assets/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf');
}

function setup() {
    createCanvas(1200, 800, WEBGL);
    textFont(font);
    textSize(60);

}

function draw() {
    background(240);
    orbitControl(); // マウス操作で視点変更可

    drawAxes(400);
}

function drawAxes(len) {
    strokeWeight(2);
    textAlign(CENTER, CENTER);
    let offset = 40;

    // X軸（赤）
    stroke(255, 0, 0);
    line(0, 0, 0, len, 0, 0);
    push();
    translate(len + offset, 0, 0);
    fill(255, 0, 0);
    noStroke();
    rotateY(-QUARTER_PI); // ラベルが見やすいように角度調整
    rotateX(-QUARTER_PI);
    text("x", 0, 0);
    pop();

    // Y軸（緑）
    stroke(0, 255, 0);
    line(0, 0, 0, 0, -len, 0);
    push();
    translate(0, -len - offset, 0);
    fill(0, 255, 0);
    noStroke();
    rotateY(-QUARTER_PI);
    rotateX(-QUARTER_PI);
    text("y", 0, 0);
    pop();

    // Z軸（青）
    stroke(0, 0, 255);
    line(0, 0, 0, 0, 0, len);
    push();
    translate(0, 0, len + offset);
    fill(0, 0, 255);
    noStroke();
    rotateY(-QUARTER_PI);
    rotateX(-QUARTER_PI);
    text("z", 0, 0);
    pop();
}