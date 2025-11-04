//========Start ベクトル版=====

let particles = [];
let radius;

function setup() {
    createCanvas(800, 400);

    let initPos = createVector(200, 300);
    let vel1, vel2, vel3;
    vel1 = createVector(2, -3);
    vel2 = createVector(4, 1);
    //2つのベクトルを受け取って和のベクトルを返す関数
    vel3 = p5.Vector.add(vel1, vel2);
    radius = 30;

    //(注)createVectorは参照データを戻すため、constructorにinitPosを渡してしまうと、同じinitPosを参照してしまい、３つの円の位置ベクトル常に一致してしまう。
    //これを避けるために、.copy()でinitPosのコピーを渡している。
    let particle1 = new Particle(initPos.copy(), vel1, radius);
    particles.push(particle1);

    let particle2 = new Particle(initPos.copy(), vel2, radius);
    particles.push(particle2);

    let particle3 = new Particle(initPos.copy(), vel3, radius);
    particles.push(particle3);

}

function draw() {
    // background(176, 224, 230);
    fill(255, 255, 224);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].display();
    }
}

//========End ベクトル版===== 