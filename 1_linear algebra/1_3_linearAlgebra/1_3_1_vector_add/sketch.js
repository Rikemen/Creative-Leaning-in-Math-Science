//========Start ベクトル版=====
//３つの円の位置ベクトル
let pos1, pos2, pos3;
//３つの円の速度ベクトル
let vel1, vel2, vel3;
let radius;

function setup() {
    createCanvas(800, 400);
    pos1 = createVector(200, 300);
    pos2 = createVector(200, 300);
    pos3 = createVector(200, 300);

    vel1 = createVector(1, -1.5);
    vel2 = createVector(2, 0.5);
    //2つのベクトルを受け取って和のベクトルを返す関数
    vel3 = p5.Vector.sub(vel1, vel2);
    radius = 30;
}

function draw() {
    // background(176, 224, 230);
    fill(255, 255, 224);
    stroke(0);
    ellipse(pos1.x, pos1.y, radius, radius);

    fill(255, 255, 224);
    stroke(0);
    ellipse(pos2.x, pos2.y, radius, radius);

    fill(255, 0, 0);
    stroke(0);
    ellipse(pos3.x, pos3.y, radius, radius);
    update();
}

function update() {
    pos1.add(vel1);
    pos2.add(vel2);
    pos3.add(vel3);
}


//========End ベクトル版===== 