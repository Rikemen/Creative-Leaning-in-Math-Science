// ──────────────────────────────────────────────
// Screens — Ready / GameOver / Nickname 画面の描画
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
 * @param {number} score - 最終スコア
 */
export function drawGameOverScreen(p, score) {
  p.push();
  // 半透明オーバーレイ
  p.fill(0, 0, 0, 180);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);

  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(20);
  p.textStyle(p.BOLD);
  p.text('MISSION FAILED', p.width / 2, p.height / 2 - 30);

  // スコア表示
  p.textSize(14);
  p.fill(200);
  p.text(`SCORE: ${Math.floor(score).toLocaleString()}`, p.width / 2, p.height / 2 + 5);

  p.textSize(10);
  p.fill(255, 255, 255, 100 + 80 * p.sin(p.frameCount * 0.05));
  p.text('[ PRESS SPACE TO RETRY ]', p.width / 2, p.height / 2 + 40);
  p.pop();
}

/**
 * ニックネーム入力画面: ランクイン時のオーバーレイ描画。
 * テキスト入力フィールド自体は HTML DOM で別途生成される。
 * @param {p5} p - p5 インスタンス
 * @param {number} score - 最終スコア
 */
export function drawNicknameScreen(p, score) {
  p.push();
  // 半透明オーバーレイ
  p.fill(0, 0, 0, 200);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);

  p.textAlign(p.CENTER, p.CENTER);
  p.textStyle(p.BOLD);

  // 祝福メッセージ
  p.fill(255, 215, 0); // ゴールド
  p.textSize(16);
  p.text('🏆 NEW HIGH SCORE! 🏆', p.width / 2, p.height / 2 - 80);

  // スコア表示
  p.fill(255);
  p.textSize(24);
  p.text(Math.floor(score).toLocaleString(), p.width / 2, p.height / 2 - 45);

  // 入力案内テキスト（入力フィールドの上に表示）
  p.fill(180);
  p.textSize(10);
  p.textStyle(p.NORMAL);
  p.text('ENTER YOUR NAME', p.width / 2, p.height / 2 - 10);

  // 入力フィールドの位置はここ（y: p.height/2 + 10 付近、HTMLで配置）

  // 操作案内
  p.fill(255, 255, 255, 100 + 80 * p.sin(p.frameCount * 0.05));
  p.textSize(9);
  p.text('[ PRESS ENTER TO CONFIRM ]', p.width / 2, p.height / 2 + 60);

  p.pop();
}
