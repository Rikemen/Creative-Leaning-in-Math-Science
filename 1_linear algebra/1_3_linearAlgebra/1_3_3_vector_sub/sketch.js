let r;
function preload() {
}

function setup() {
    createCanvas(800, 400);
    background(176, 224, 230);
    r = 100;
}

function draw() {
    // background(176, 224, 230);
    translate(width / 2, height / 2);

    stroke(255);
    strokeWeight(4);
    for (let i = 0; i < TWO_PI; i += 0.02) {
        point(r * cos(i), r * sin(i));
        r -= 0.05;
    }
    frameRate(4);
    // r -= 5;
    if (r < 0) {
        noLoop();
    }
}
