// カメラ映像の標準的な解像度（4:3）に合わせ、後で映像をそのまま重ねられるようにする
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
}

function draw() {
  background(40, 120, 160);
}
