
function setup() {
    createCanvas(800, 800);
    background(176, 224, 230);
    // 原点をキャンバスの中心に設定
    translate(width / 2, height / 2);


    // x軸とy軸を描画
    stroke(255);
    strokeWeight(1);
    line(-width / 2, 0, width / 2, 0); // x軸
    line(0, -height / 2, 0, height / 2); // y軸

    //　-----Start 漸近線を描画-----

    stroke(0);
    let dashLength = 10; // 点線の長さ
    let gapLength = 10;  // 点線の間隔
    // (y = 1 (yVal = -200))
    let x1 = -width / 2, y1 = -200; // 線の始点
    let x2 = width / 2, y2 = -200; // 線の終点
    drawDashedLine(x1, y1, x2, y2, dashLength, gapLength);

    // (y = x )
    x1 = -width / 2, y1 = 400; // 線の始点
    x2 = width / 2, y2 = -400; // 線の終点
    drawDashedLine(x1, y1, x2, y2, dashLength, gapLength);
    textSize(12);
    text("y = x", 200, -240);

    // (y = - x )
    x1 = -width / 2, y1 = -400; // 線の始点
    x2 = width / 2, y2 = 400; // 線の終点
    drawDashedLine(x1, y1, x2, y2, dashLength, gapLength);
    textSize(12);
    text("y = -x", 200, 180);

    //　-----End 漸近線を描画-----

    // グラフを描画
    stroke(0);
    strokeWeight(2);
    noFill();

    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let xVal = x / 200; // スケーリング
        let y;
        let yVal;
        yVal = sin(xVal) - xVal;
        y = -yVal * 200; // スケーリング
        if (xVal === 0) { //x = 0ではyの値は0になる
            y = 0;
        } else {
            stroke(0);
            vertex(x, y);
        }
    }
    endShape();
}

function draw() {

}


function drawDashedLine(x1, y1, x2, y2, dashLength, gapLength) {
    let distance = dist(x1, y1, x2, y2); // 線の全体の長さを計算
    let dashCount = distance / (dashLength + gapLength); // 点線の数

    let xStep = (x2 - x1) / dashCount; // x方向のステップサイズ
    let yStep = (y2 - y1) / dashCount; // y方向のステップサイズ

    for (let i = 0; i < dashCount; i++) {
        let xStart = x1 + i * (xStep + gapLength / distance * (x2 - x1));
        let yStart = y1 + i * (yStep + gapLength / distance * (y2 - y1));
        let xEnd = xStart + xStep;
        let yEnd = yStart + yStep;
        line(xStart, yStart, xEnd, yEnd);
    }
}