// カメラ映像の標準的な解像度（4:3）に合わせ、後で映像をそのまま重ねられるようにする
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

let capture;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // カメラ映像の取得を開始
  capture = createCapture(VIDEO);
  capture.size(CANVAS_WIDTH, CANVAS_HEIGHT);
  // HTML上のvideo要素は非表示にし、p5.jsのキャンバス上だけに描画する
  capture.hide();
}

function draw() {
  background(40, 120, 160);
  
  // カメラ映像が準備できていればキャンバスに描画
  if (capture.loadedmetadata) {
    image(capture, 0, 0, width, height);
  }
}

