let cellSize = 50; //scaleと一致させると1メモリ = x,yでの1の変化と一致するが、cellSizeをscaleの1/10にするとx,yでいう0.1のメモリになる
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
        let scaledX = x / scale;
        let y = scale * sin(scaledX);
        stroke(0);
        vertex(x, y);
    }
    endShape();
}

function draw() {

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
            // text(`${x/scale}`, x, -10);
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


//補足
//cellSize: グリッドの各セルのサイズ、何ピクセルごとに線を引くか
//cellSize/scale: グリッドが実際のスケールだといくら分を表すか、scale = 1, cellSize = 20だと1つの方眼メモリは20の距離を表す