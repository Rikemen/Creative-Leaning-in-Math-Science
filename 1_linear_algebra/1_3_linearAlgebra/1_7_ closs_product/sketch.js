function setup() {
    createCanvas(800, 400, WEBGL);
}

function draw() {
    background(176, 224, 230);

    // ベクトルAとBの定義
    // let angle = millis() / 1000;
    rotateX(millis() / 1000);
    rotateY(millis() / 2000);
    let angle = PI / 4;
    let A = createVector(1, 0, 0);
    let B = createVector(0, 1, 0);


    // 外積の計算
    // let crossProduct = A.cross(B);⇩どちらでも同じ
    let crossProduct = p5.Vector.cross(A, B);

    // ベクトルの描画
    strokeWeight(4);

    // ベクトルAを描画（赤色）
    stroke(200, 0, 0);
    drawArrow(createVector(0, 0, 0), A);

    // ベクトルBを描画（青色）
    stroke(0, 0, 200);
    drawArrow(createVector(0, 0, 0), B);

    // 外積ベクトルを描画（緑色）
    stroke(0, 50, 0);
    drawArrow(createVector(0, 0, 0), crossProduct);

}

// ベクトルを矢印として描画する関数
function drawArrow(base, vec) {
    push();
    translate(base.x, base.y, base.z);
    line(0, 0, 0, vec.x * 100, vec.y * 100, vec.z * 100);  // 矢印の軸
    pop();
}
