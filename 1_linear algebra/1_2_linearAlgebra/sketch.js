

let pos;
let vel;

function setup() {
    createCanvas(800, 400);
    pos = createVector(400, 200);
    vel = createVector(2, 1);
}

function draw() {
    background(176, 224, 230);
    fill(255, 255, 224);
    stroke(0);
    ellipse(pos.x, pos.y, 30, 30);
    pos.add(vel);
}

