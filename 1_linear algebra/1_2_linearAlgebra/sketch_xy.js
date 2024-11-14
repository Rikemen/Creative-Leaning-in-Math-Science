// //========Start ベクトル版=====
// let posX, posY;
// let velX, velY;
// let radius;

// function setup() {
//     createCanvas(800, 400);
//     posX = 400;
//     posY = 200;
//     velX = 3;
//     velY = 1;
//     radius = 30;
// }

// function draw() {
//     background(176, 224, 230);
//     fill(255, 255, 224);
//     stroke(0);
//     ellipse(posX, posY, radius, radius);
//     update();
// }

// function update() {
//     posX += velX;
//     posY += velY;
// }
// //========End ベクトル版===== 

let x;
let y;
function setup() {
    createCanvas(800, 400);
    x = 400;
    y = 200;
}

function draw() {
    background(176, 224, 230);
    fill(255, 255, 224);
    stroke(0);
    ellipse(x, y, 30, 30);
    x = x + 1;
    y = y + 1;
}