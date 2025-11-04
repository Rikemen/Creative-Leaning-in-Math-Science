let pos;
let vel;
let acc;
let mass = 1;
let radius = 50;

// equation of motion F = ma, a = F/m
function setup() {
    createCanvas(windowWidth, windowHeight);
    pos = createVector(0, height/2);
    vel = createVector(0, 0);
    acc = createVector(0.3, 0);
    console.log(pos);
}

function draw() {
    background(176, 224, 230);
    fill(255, 255, 224);
    stroke(0);
    ellipse(pos.x, pos.y, radius, radius);
    update();
}

function update(){
    vel.add(acc);
    pos.add(vel);
}