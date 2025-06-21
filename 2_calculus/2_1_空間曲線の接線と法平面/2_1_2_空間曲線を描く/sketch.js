let font;

function preload() {
    // フォントを読み込む
    font = loadFont('../assets/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf');
}

function setup() {
    createCanvas(1600, 1000, WEBGL);
    textFont(font);
    textSize(60);

}

function draw() {
    background(0);

    orbitControl(); // マウス操作で視点変更可

    drawAxes(300);
    drawParametricCurve();
}

/**
 * パラメトリック曲線を描く
 * @param {number} t パラメータ
 */
function drawParametricCurve() {
    stroke(255);
    strokeWeight(2);
    noFill();

    let a = 100;
    let b = 50;
    let c = 100;

    beginShape();
    for (let t = 0; t < 8 * PI; t += 0.1) {
        let x = a * cos(t);
        let y = - (a * t);
        let z = c * sin(t / 8) + 100;
        vertex(x, y, z);
    }
    endShape();
}


/**
 * 座標軸を描く
 * @param {number} len 座標軸の長さ
 */
function drawAxes(len) {
    strokeWeight(2);
    textAlign(CENTER, CENTER);
    let offset = 40;

    // X軸（白）
    stroke(255);
    line(0, 0, 0, len, 0, 0);
    push();
    translate(len + offset, 0, 0);
    fill(255);
    noStroke();
    rotateY(-QUARTER_PI); // ラベルが見やすいように角度調整
    rotateX(-QUARTER_PI);
    text("x", 0, 0);
    pop();

    // Y軸（白）
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

    // Z軸（白）
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