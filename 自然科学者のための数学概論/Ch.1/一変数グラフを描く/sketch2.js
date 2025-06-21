let scale = 100; //グラフをどれくらいzoom in/zoom outして表示するか？(100の時は100倍原点に近いところだけ見る)

function setup() {
    createCanvas(800, 600);
    background(176, 224, 230);
    // 原点をキャンバスの中心に設定
    translate(width / 2, height / 2);
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
    // x軸とy軸
    stroke(255);
    strokeWeight(2);
    line(-width / 2, 0, width / 2, 0);
    line(0, -height / 2, 0, height / 2);

    //原点 0
    textSize(15);
    fill(0);
    stroke(0);
    text("0", -15, 15);

    //ラベルをつける
    text("x", width / 2 - 15, -15);
    text("y", 15, -height / 2 + 15);
}


// function drawAxis() {
//     console.log("drawAxis");
//     // x軸とy軸を描画
//     stroke(255);
//     strokeWeight(2);
//     line(-width / 2, 0, width / 2, 0); // x軸
//     line(0, -height / 2, 0, height / 2); // y軸

//     //原点の0
//     textSize(15);
//     fill(0);
//     noStroke();
//     text("0", - 15, 15);

//     //軸ラベルの描画
//     text(`x`, width / 2 - 15, -10);
//     text(`y`, 10, -height / 2 + 15);

// }
