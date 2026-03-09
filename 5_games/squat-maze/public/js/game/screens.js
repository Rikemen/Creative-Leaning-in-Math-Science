// ──────────────────────────────────────────────
// Screens — Ready / GameOver 画面の描画
// ゲーム本体（playing）以外の画面表示をまとめたモジュール。
// 画面追加時（チュートリアル等）もここに集約する。
// ──────────────────────────────────────────────

/**
 * Ready 画面: パルスするスタートメッセージを表示する。
 * @param {p5} p - p5 インスタンス
 */
export function drawReadyScreen(p) {
  p.push();
  p.fill(255, 255, 255, 100 + 80 * p.sin(p.frameCount * 0.05));
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(10);
  p.textStyle(p.BOLD);

  // パルスするスタートメッセージ
  p.text('[ PRESS SPACE TO START ]', p.width / 2, p.height / 2);

  // タイトル
  p.fill(255);
  p.textSize(14);
  p.text('NAVIGATION ENGAGED', p.width / 2, p.height / 2 - 40);
  p.pop();
}

/**
 * GameOver 画面: 半透明オーバーレイの上にリザルトを表示する。
 * @param {p5} p - p5 インスタンス
 */
export function drawGameOverScreen(p) {
  p.push();
  // 半透明オーバーレイ
  p.fill(0, 0, 0, 180);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);

  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(20);
  p.textStyle(p.BOLD);
  p.text('MISSION FAILED', p.width / 2, p.height / 2 - 20);

  p.textSize(10);
  p.fill(255, 255, 255, 100 + 80 * p.sin(p.frameCount * 0.05));
  p.text('[ PRESS SPACE TO RETRY ]', p.width / 2, p.height / 2 + 30);
  p.pop();
}
