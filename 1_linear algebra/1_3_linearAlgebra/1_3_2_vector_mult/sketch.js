//========Start ベクトル版=====

let particle;
let radius;
let initPos;

function setup() {
    createCanvas(800, 400);
    initPos = createVector(10, 10);
    let vel;
    vel = createVector(0, 0);
    radius = 30;

    //(注)createVectorは参照データを戻すため、constructorにinitPosを渡してしまうと、同じinitPosを参照してしまい、３つの円の位置ベクトル常に一致してしまう。
    //これを避けるために、.copy()でinitPosのコピーを渡している。
    particle = new Particle(initPos.copy(), vel, radius);
}

function draw() {

    background(176, 224, 230);
    //見やすいようにフレームレート調整
    frameRate(2);

    //位置ベクトルをフレームごとに1.2倍にする
    particle.pos.mult(1.2);

    //particleの表示と更新
    fill(255, 255, 224);
    particle.update();
    particle.display();


    //原点からの距離とスピードの表示
    stroke(0);
    fill(0);
    strokeWeight(1);
    textSize(14);
    line(0, 0, particle.pos.x, particle.pos.y);
    //ベクトルで指定した2点間の距離(スタート地点からの距離)
    let distance = p5.Vector.dist(particle.pos, initPos);
    text(distance, initPos.x, initPos.y + 25);
    //１つのベクトルの大きさ(円のスピード)
    let speed = particle.vel.mag();
    text(`partcle's speed is ${speed}`, initPos.x, initPos.y + 50);



}

//========End ベクトル版===== 