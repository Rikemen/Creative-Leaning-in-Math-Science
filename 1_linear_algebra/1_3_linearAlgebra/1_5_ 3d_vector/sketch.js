//========Start ベクトル版=====

let angle;
let pos;
function preload() {
}

function setup() {
    createCanvas(800, 400, WEBGL);
    angle = 0;
    pos = createVector(50, 100, 150);
}

function draw() {
    background(176, 224, 230);
    drawAxis();
    // Enable orbiting with the mouse.
    orbitControl();

    push();
    translate(pos.x, pos.y, pos.z);
    fill(255, 255, 255);
    // rotate X, Y, and Z axes by 45 degrees
    // rotateX(angle);
    // rotateY(angle);
    // rotateZ(angle);
    stroke(0);



    // Style the box.
    normalMaterial();
    sphere(50);
    pop();
    angle += 0.01;
}

function drawAxis() {
    //x軸
    stroke(255, 0, 0);
    strokeWeight(1);
    line(0, 0, 0, 150, 0, 0);
    //y軸
    stroke(0, 0, 255);
    strokeWeight(1);
    line(0, 0, 0, 0, 150, 0);
    //z軸
    stroke(0, 255, 0);
    strokeWeight(1);
    line(0, 0, 0, 0, 0, 150);
}
//========End ベクトル版===== 