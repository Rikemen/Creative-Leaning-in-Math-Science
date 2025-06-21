let cellSize = 100; //scaleと一致させると1メモリ = x,yでの1の変化と一致するが、cellSizeをscaleの1/10にするとx,yでいう0.1のメモリになる
let scale = 100; //グラフをどれくらいzoom in/zoom outして表示するか？(100の時は100倍原点に近いところだけ見る)

function setup() {
    createCanvas(800, 600);
    background(176, 224, 230);
    // 原点をキャンバスの中心に設定
    translate(width / 2, height / 2);
    drawGrid(cellSize); //スケール (1にすると1pixelが y=f(x)でx, yの1分の変化になる、10にすると10pixelで1になる)
    drawAxis();


    // グラフを描画
    stroke(0);
    strokeWeight(2);
    noFill();

    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let y = targetFunction(x);
        stroke(0);
        vertex(x, y);
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

function drawAxis() {
    console.log("drawAxis");
    // x軸とy軸を描画
    stroke(255);
    strokeWeight(2);
    line(-width / 2, 0, width / 2, 0); // x軸
    line(0, -height / 2, 0, height / 2); // y軸

    //原点の0
    textSize(15);
    fill(0);
    noStroke();
    text("0", - 15, 15);

    //軸ラベルの描画
    text(`x`, width / 2 - 15, -10);
    text(`y`, 10, -height / 2 + 15);

}

function drawGrid(cellSize) {
    console.log("drawGrid");

    // 縦線を描画
    for (let x = -width / 2; x < width / 2; x += cellSize) {
        stroke(230); // グリッドの色
        strokeWeight(1); // グリッドの線の太さ
        line(x, -height / 2, x, height / 2);

        if (x != 0) {//原点はメモリ不要なので除外
            textSize(10);
            fill(0);
            noStroke();
            text(`${x / cellSize * (cellSize / scale)}`, x, - 10);
        }


    }

    // 横線を描画
    for (let y = - height / 2; y < height / 2; y += cellSize) {
        stroke(230); // グリッドの色
        strokeWeight(1); // グリッドの線の太さ
        line(-width / 2, y, width / 2, y);

        if (y != 0) {//原点はメモリ不要なので除外
            textSize(10);
            fill(0);
            noStroke();
            text(`${y / cellSize * (cellSize / scale)}`, 10, y);
        }

    }

}

function mousePressed() {
    translate(width / 2, height / 2);
    drawPointer(mouseX - width / 2);
}

function drawPointer(x) {
    let y = targetFunction(x);
    stroke(0);
    strokeWeight(1);
    noFill();
    ellipse(x, y, 10, 10);
    textSize(10);
    //表示される数字がメモリと一致するように、scaleで割り算し、小数点1桁まで表示するように四捨五入
    text(`(${Math.round(x / scale * 10) / 10}, ${Math.round(y / scale * 10) / 10})`, x + 10, y + 10);
}

//グラフとして描画したい関数、x座標を入れると(x, y)座標を戻す
function targetFunction(x) {
    // console.log("targetFunction");
    let y;
    let scaledX = x / scale; // スケーリング
    y = sin(scaledX);
    let scaledY = y * scale;
    return scaledY;
}