/** 各動画パネルの幅と高さ */
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 400;

/** 横に並べる動画の定義（パスを変えるだけで差し替え可能） */
const VIDEO_SOURCES = [
  "/assets/movies/tomo/swing.MOV",
  "/assets/movies/otani/otani.mov",
];

const CANVAS_WIDTH = PANEL_WIDTH * VIDEO_SOURCES.length;
const CANVAS_HEIGHT = PANEL_HEIGHT;

let players = [];

async function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  const bodyPose = await ml5.bodyPose("MoveNet");

  // 動画ソースごとに VideoPlayer を生成し、横に並べて配置
  players = VIDEO_SOURCES.map(
    (src, index) =>
      new VideoPlayer(src, PANEL_WIDTH * index, 0, PANEL_WIDTH, PANEL_HEIGHT),
  );

  await Promise.all(players.map((player) => player.load(bodyPose)));
}

function draw() {
  background(0);
  players.forEach((player) => player.draw());
}
