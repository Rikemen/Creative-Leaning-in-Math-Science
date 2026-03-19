/** 角度表示エリアの高さ */
const ANGLE_DISPLAY_HEIGHT = 60;

/** コントロールボタン群の高さ（ボタン + パディング） */
const CONTROLS_HEIGHT = 50;

/** パネル周囲のマージン（ニューモーフィズム枠の影が収まる余白） */
const PANEL_MARGIN = 24;

/** パネルの総数（固定2枚） */
const PANEL_COUNT = 2;

/** モバイル判定のブレイクポイント（px） */
const MOBILE_BREAKPOINT = 768;

let players = [];

/**
 * 現在のウィンドウ幅に応じて列数（1 or 2）を決定する。
 * モバイル幅ではパネルを縦に積み、PC幅では横に並べる。
 */
function getColumns() {
  return windowWidth < MOBILE_BREAKPOINT ? 1 : 2;
}

/**
 * ウィンドウサイズと列数からパネルの幅・高さ・各パネルの座標を算出する。
 * 1列（モバイル）: 縦2段、スクロール可能なキャンバス高さ
 * 2列（PC）    : 横2列、画面高さにフィット
 */
function calculateLayout() {
  const columns = getColumns();

  if (columns === 2) {
    // ── PC: 横2列レイアウト ──
    const slotWidth = Math.floor(windowWidth / PANEL_COUNT);
    const panelWidth = slotWidth - PANEL_MARGIN * 2;
    const panelHeight =
      windowHeight - ANGLE_DISPLAY_HEIGHT - PANEL_MARGIN * 2;
    const canvasHeight = windowHeight;

    const positions = Array.from({ length: PANEL_COUNT }, (_, i) => ({
      x: slotWidth * i + PANEL_MARGIN,
      y: PANEL_MARGIN,
    }));

    return { panelWidth, panelHeight, canvasHeight, positions };
  }

  // ── モバイル: 縦2段レイアウト ──
  const panelWidth = windowWidth - PANEL_MARGIN * 2;
  // 各パネルの高さ: 画面高さの40%程度（ボタン・角度表示・マージン分を確保）
  const panelHeight = Math.floor(windowWidth * 0.65);
  // 1スロットの高さ: パネル + コントロール + 角度表示 + マージン
  const slotHeight =
    panelHeight + CONTROLS_HEIGHT + ANGLE_DISPLAY_HEIGHT + PANEL_MARGIN;
  const canvasHeight = slotHeight * PANEL_COUNT + PANEL_MARGIN;

  const positions = Array.from({ length: PANEL_COUNT }, (_, i) => ({
    x: PANEL_MARGIN,
    y: PANEL_MARGIN + slotHeight * i,
  }));

  return { panelWidth, panelHeight, canvasHeight, positions };
}

async function setup() {
  const { panelWidth, panelHeight, canvasHeight, positions } =
    calculateLayout();
  createCanvas(windowWidth, canvasHeight);

  // スクロール制御: モバイルではキャンバスが画面高さを超えるのでスクロール許可
  updateOverflow();

  // bodyPose モデルは1回だけロードし、全パネルで共有する
  const bodyPose = await ml5.bodyPose("MoveNet");

  // 空のパネルを2枚生成（動画はユーザーのファイル選択後に読み込まれる）
  players = Array.from({ length: PANEL_COUNT }, (_, index) => {
    const player = new VideoPlayer(
      positions[index].x,
      positions[index].y,
      panelWidth,
      panelHeight,
    );
    player.init(bodyPose);
    return player;
  });

  // 初期化完了 → ローディング表示を除去
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.remove();
}

function draw() {
  background(224, 229, 236);
  players.forEach((player) => player.draw());
}

/** ウィンドウリサイズ時にキャンバスと全 VideoPlayer を再計算する */
function windowResized() {
  const { panelWidth, panelHeight, canvasHeight, positions } =
    calculateLayout();
  resizeCanvas(windowWidth, canvasHeight);

  updateOverflow();

  players.forEach((player, index) => {
    player.resize(
      positions[index].x,
      positions[index].y,
      panelWidth,
      panelHeight,
    );
  });
}

/**
 * キャンバスが画面高さを超える場合（モバイル縦2段）は body をスクロール可能にし、
 * 画面内に収まる場合（PC横2列）はスクロールを無効にする。
 */
function updateOverflow() {
  document.body.style.overflow =
    getColumns() === 1 ? "auto" : "hidden";
}
