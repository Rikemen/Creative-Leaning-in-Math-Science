let font;

function preload() {
    font = loadFont('assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf');
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
    drawParametricCurve();
    // fill(255);
    // text('Hello, p5.js WEBGL!', 100, 100);
}


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


function drawParametricCurve() {
    let u;
    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (u = 0; u <= 800; u += 1) {
        let x = 100 * cos(u * 0.05);
        let y = 2 * u;
        let z = 100 * sin(u * 0.05);
        vertex(x, y, z);
    }
    endShape();
}