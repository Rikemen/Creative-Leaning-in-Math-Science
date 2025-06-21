let font;

function preload() {
    font = loadFont('./assets/Brooklyn Chill Out.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
    background(176, 224, 230);
    stroke(0);
    fill(255);
    box();
    orbitControl();

    // 軸を描画
    push();
    resetMatrix();
    drawAxis(500);
    pop();

    fill('deeppink');
    textFont(font);
    textSize(36);
    text('p5*js', 10, 50);
}

function drawAxis(size) {
    console.log("drawAxis");
    // x軸とy軸を描画
    stroke(255);
    strokeWeight(2);
    line(-size / 2, 0, 0, size / 2, 0, 0); // x軸
    line(0, -size / 2, 0, 0, size / 2, 0); // y軸
    line(0, 0, -size / 2, 0, 0, size / 2); // z軸

    // X軸に「x」を表示
    push();
    translate(size / 2, 0, 0); // ラベルの位置に移動
    text("x", 0, 0);
    pop();

    // Y軸に「y」を表示
    push();
    translate(0, size / 2, 0); // ラベルの位置に移動
    text("y", 0, 0);
    pop();

    // Z軸に「z」を表示
    push();
    translate(0, 0, size / 2); // ラベルの位置に移動
    text("z", 0, 0);
    pop();

}