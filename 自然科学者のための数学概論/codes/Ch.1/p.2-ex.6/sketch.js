
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

    // グラフを描画
    stroke(0);
    strokeWeight(2);
    noFill();

    //ex.6のグラフの描画
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let xVal = x / 50; // スケーリング
        let y;
        let yVal;
        yVal = 1 / xVal * sin(1 / xVal);
        y = -yVal * 200; // スケーリング
        if (isNaN(yVal)) { //不連続点のx座標を可視化
            stroke(255, 0, 0);
            noFill();
            ellipse(x, 0, 10, 10);

        } else {
            stroke(0);
            console.log(yVal);
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