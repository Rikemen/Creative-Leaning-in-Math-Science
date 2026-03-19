/** 角度表示エリアの高さ */
const ANGLE_DISPLAY_HEIGHT = 60;

/** パネル周囲のマージン（ニューモーフィズム枠の影が収まる余白） */
const PANEL_MARGIN = 24;

/** 横に並べる動画の定義（パスを変えるだけで差し替え可能） */
const VIDEO_SOURCES = [
  "/assets/movies/tomo/swing.MOV",
  "/assets/movies/otani/otani.mov",
];

let players = [];

/**
 * ウィンドウサイズからパネルの幅・高さを逆算する。
 * マージンを差し引いた内側が実際の描画領域になる。
 */
function calculateLayout() {
  const slotWidth = Math.floor(windowWidth / VIDEO_SOURCES.length);
  const panelWidth = slotWidth - PANEL_MARGIN * 2;
  const panelHeight = windowHeight - ANGLE_DISPLAY_HEIGHT - PANEL_MARGIN * 2;
  return { slotWidth, panelWidth, panelHeight };
}

async function setup() {
  const { slotWidth, panelWidth, panelHeight } = calculateLayout();
  createCanvas(windowWidth, windowHeight);

  const bodyPose = await ml5.bodyPose("MoveNet");

  // 動画ソースごとに VideoPlayer を生成し、マージン付きで横に並べて配置
  players = VIDEO_SOURCES.map(
    (src, index) =>
      new VideoPlayer(
        src,
        slotWidth * index + PANEL_MARGIN,
        PANEL_MARGIN,
        panelWidth,
        panelHeight,
      ),
  );

  await Promise.all(players.map((player) => player.load(bodyPose)));
}

function draw() {
  background(224, 229, 236);
  players.forEach((player) => player.draw());
}

/** ウィンドウリサイズ時にキャンバスと全 VideoPlayer を再計算する */
function windowResized() {
  const { slotWidth, panelWidth, panelHeight } = calculateLayout();
  resizeCanvas(windowWidth, windowHeight);

  players.forEach((player, index) => {
    player.resize(
      slotWidth * index + PANEL_MARGIN,
      PANEL_MARGIN,
      panelWidth,
      panelHeight,
    );
  });
}
