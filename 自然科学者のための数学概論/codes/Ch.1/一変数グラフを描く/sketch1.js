let scale = 100; //グラフをどれくらいzoom in/zoom outして表示するか？(100の時は100倍原点に近いところだけ見る)

function setup() {
    createCanvas(800, 600);
    background(176, 224, 230);
    // 原点をキャンバスの中心に設定
    translate(width / 2, height / 2);

    // グラフを描画
    stroke(0);
    strokeWeight(2);
    noFill();

    //y = 2x スケール調整なし
    stroke(0, 0, 255);
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let y = 2 * x;
        vertex(x, y);
    }
    endShape();

    //y = x^2 スケール調整なし
    stroke(255);
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let y = pow(x, 2);
        vertex(x, y);
    }
    endShape();

    //y = x^2 x方向に1/10
    stroke(255);
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let scaledX = x / 10;
        let y = pow(scaledX, 2);
        vertex(x, y);
    }
    endShape();

    //y = sin(x) スケール調整なし
    stroke(0, 255, 0);
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let y = sin(x);
        vertex(x, y);
    }
    endShape();

    //y = sin(x) y方向だけ100倍
    stroke(255, 0, 0);
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let y = scale * sin(x);
        vertex(x, y);
    }
    endShape();

    //y = sin(x) y方向は100倍、x方向は1/100倍
    stroke(255, 255, 0);
    beginShape();
    for (let x = -width / 2; x < width / 2; x += 1) {
        let scaledX = x / scale;
        let y = sin(scaledX);
        let scaledY = y * scale;
        vertex(x, scaledY);
    }
    endShape();




}

function draw() {

}
