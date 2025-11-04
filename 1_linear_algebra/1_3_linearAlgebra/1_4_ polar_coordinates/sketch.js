
let r;
let theta;

function setup() {
    createCanvas(800, 400);
    background(176, 224, 230);

    r = 200;
    theta = 0;

}

function draw() {
    translate(width / 2, height / 2);
    noStroke();
    fill(255);
    ellipse(r * cos(theta), r * sin(theta), 10, 10);
    r -= 1;
    theta += 0.1;
    if (r <= 0) {
        noLoop();
    }
}

//========End ベクトル版===== 