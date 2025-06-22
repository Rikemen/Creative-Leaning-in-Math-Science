
//空間曲線の関数を別で定義します(done!)
//ベクトルで計算するように書き換える

let font;

//接線の始点のパラメータ
let r0 = 2;

//螺旋の半径
let r = 200;
//螺旋のピッチ
let c = 50;

function preload() {
    font = loadFont('../assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf');
}

function setup() {
    createCanvas(1200, 800, WEBGL);
    textFont(font);
    textSize(30);
}

function draw() {
    background(0);
    orbitControl();
    drawAxes(200);
    drawParametricCurve(0, 8 * PI, 0.01);
    drawTangent(r0);
    drawTangentPlane(r0);
    // noLoop();
}


/**
 * 3D座標軸を描画する
 * @param {number} length - 各軸の長さ
 * @description 原点に球体を描画し、x軸、y軸、z軸を白い線で描画する。
 * 各軸の端には軸の名前（x、y、z）を表示する。
 */
function drawAxes(length) {
    // origin
    stroke(255);
    fill(255);
    sphere(5);

    // axes
    let offset = 30;
    stroke(255);
    strokeWeight(2);
    // x-axis
    push();
    stroke(255);
    line(0, 0, 0, length, 0, 0);
    fill(255);
    translate(length + offset, 0, 0);
    text('x', 0, 0);
    pop();
    // y-axis
    push();
    stroke(255);
    line(0, 0, 0, 0, length, 0);
    fill(255);
    translate(0, length + offset, 0);
    text('y', 0, 0);
    pop();
    // z-axis
    push();
    stroke(255);
    line(0, 0, 0, 0, 0, length);
    fill(255);
    translate(0, 0, length + offset);
    text('z', 0, 0);
    pop();
}


/**
 * 螺旋曲線を描画する
 * @param {number} u_start - 開始パラメータ（角度）
 * @param {number} u_end - 終了パラメータ（角度）
 * @param {number} du - パラメータの増分（描画精度）
 */
function drawParametricCurve(u_start, u_end, du) {
    let u;
    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (u = u_start; u <= u_end; u += du) {
        let pos = herix(r, c, u);
        vertex(pos.x, pos.y, pos.z);
    }
    endShape();
}


/**
 * 螺旋曲線上の指定された点における接線ベクトルを描画する
 * @param {number} u - パラメータ（角度）
 */
function drawTangent(u) {
    let du = 0.01;
    let r0 = herix(r, c, u);
    let r1 = herix(r, c, u + du);
    let dr = r1.sub(r0);
    dr.normalize();
    let r_end = p5.Vector.add(r0, dr.mult(300));
    stroke(255, 0, 0);
    strokeWeight(2);
    // console.log("r0 ", r0);
    line(r0.x, r0.y, r0.z, r_end.x, r_end.y, r_end.z);
}


/**
 * 螺旋曲線上の指定された点における接触平面を描画する
 * @param {number} u - パラメータ（角度）
 */
function drawTangentPlane(u) {
    let du = 0.01; //数値微分の刻み幅
    let du2 = 50 * du; // P, P1, P2 と近傍の3点を取る際のP1とP2の間隔(近すぎると接線と接平面が図示した際に重なってしまう)
    let r0 = herix(r, c, u);
    let r1 = herix(r, c, u + du);
    let r2 = herix(r, c, u + du2);
    let dr = r1.sub(r0);
    let dr2 = r2.sub(r0);
    dr.normalize();
    dr2.normalize();
    dr.mult(300);
    dr2.mult(300);
    let r_end = p5.Vector.add(r0, dr);
    let r_end2 = p5.Vector.add(r0, dr2);
    let r_end3 = p5.Vector.sub(r0, dr);
    let r_end4 = p5.Vector.sub(r0, dr2);
    stroke(255, 0, 0);
    fill(0, 0, 255, 80);
    noStroke();
    beginShape();
    vertex(r_end.x, r_end.y, r_end.z);
    vertex(r_end2.x, r_end2.y, r_end2.z);
    vertex(r_end3.x, r_end3.y, r_end3.z);
    vertex(r_end4.x, r_end4.y, r_end4.z);
    endShape(CLOSE);
}


/**
 * 螺旋曲線のパラメータ方程式を計算する
 * @param {number} r - 螺旋の半径
 * @param {number} c - 螺旋のピッチ（z軸方向の進み量）
 * @param {number} u - パラメータ（角度）
 * @returns {p5.Vector} 螺旋曲線上の点の位置ベクトル
 */
function herix(r, c, u) {
    let x = r * cos(u);
    let y = r * sin(u);
    let z = c * u;
    return createVector(x, y, z);
}