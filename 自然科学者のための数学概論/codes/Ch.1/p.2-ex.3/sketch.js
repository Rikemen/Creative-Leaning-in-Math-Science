
// p.2 例3のグラフ
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
    strokeWeight(3);
    noFill();
    beginShape();

    let n = 100;  // 大きなnの値を設定

    for (let x = -width / 2; x < width / 2; x += 1) {
        let xVal = x / 100; // スケーリング
        let yVal = 1 / (1 + pow(xVal, 2 * n));
        let y = -yVal * 200; // スケーリング
        if (xVal === 1 || xVal === -1) {
            console.log("xVal is ", xVal, "yVal is ", yVal);
        }
        vertex(x, y);
    }

    endShape();
}

function draw() {

}
