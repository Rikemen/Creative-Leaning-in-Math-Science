const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

let myVideo;
let displayW, displayH;

async function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Promise でラップして動画のロード完了を待つ
  myVideo = await loadVideo("/assets/movies/tomo/swing.MOV");

  calculateDisplaySize(myVideo);
  myVideo.volume(0);
  myVideo.hide();
  myVideo.loop();
}

/** createVideo を Promise 化し、ロード完了まで待機可能にする */
function loadVideo(path) {
  return new Promise((resolve) => {
    const video = createVideo([path], () => resolve(video));
  });
}

function draw() {
  background(0);

  const x = (width - displayW) / 2;
  const y = (height - displayH) / 2;
  image(myVideo, x, y, displayW, displayH);
}

/** 動画をキャンバス内にアスペクト比を維持して収める表示サイズを計算 */
function calculateDisplaySize(video) {
  const videoAspect = video.width / video.height;
  const canvasAspect = width / height;

  if (videoAspect > canvasAspect) {
    displayW = width;
    displayH = width / videoAspect;
  } else {
    displayW = height * videoAspect;
    displayH = height;
  }
}
