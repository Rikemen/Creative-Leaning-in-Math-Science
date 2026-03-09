// ──────────────────────────────────────────────
// HUD — ライフバー・スコア・被弾フラッシュの描画
// ゲーム中に常時表示する情報系UIをまとめたモジュール。
// ──────────────────────────────────────────────

import {
  INITIAL_LIVES,
  LIFE_BAR_WIDTH,
  LIFE_BAR_HEIGHT,
  LIFE_BAR_GAP,
  LIFE_BAR_MARGIN_X,
  LIFE_BAR_MARGIN_BOTTOM,
  HIT_FLASH_DURATION,
  SCORE_MARGIN_X,
  SCORE_MARGIN_BOTTOM
} from './constants.js';

/**
 * ライフバーとスコアをまとめて描画する。
 * @param {p5} p - p5 インスタンス
 * @param {Player} player - 残ライフ数を参照する
 * @param {number} score - 現在のスコア
 */
export function drawHUD(p, player, score) {
  p.push();
  p.drawingContext.shadowBlur = 0;
  p.drawingContext.shadowColor = 'transparent';

  // ── ラベル ──
  p.fill(255);
  p.noStroke();
  p.textAlign(p.LEFT, p.BOTTOM);
  p.textSize(9);
  p.textStyle(p.BOLD);
  p.drawingContext.letterSpacing = '2px';
  const labelX = LIFE_BAR_MARGIN_X;
  const baseY = p.height - LIFE_BAR_MARGIN_BOTTOM;
  p.text('LIFE:', labelX, baseY);
  p.drawingContext.letterSpacing = '0px';

  // ── バー描画 ──
  const barStartX = labelX + p.textWidth('LIFE:') + 10;
  for (let i = 0; i < INITIAL_LIVES; i++) {
    const barX = barStartX + i * (LIFE_BAR_WIDTH + LIFE_BAR_GAP);
    if (i < player.lives) {
      // 残ライフ: 白バー + グロー
      p.drawingContext.shadowBlur = 6;
      p.drawingContext.shadowColor = 'rgba(255,255,255,0.6)';
      p.fill(255);
    } else {
      // 失ったライフ: 暗いバー（グロー無し）
      p.drawingContext.shadowBlur = 0;
      p.drawingContext.shadowColor = 'transparent';
      p.fill(60);
    }
    p.rect(barX, baseY - LIFE_BAR_HEIGHT, LIFE_BAR_WIDTH, LIFE_BAR_HEIGHT);
  }

  p.drawingContext.shadowBlur = 0;

  // ── スコア表示（画面右下） ──
  drawScoreHUD(p, score);

  p.pop();
}

/**
 * 画面右下にスコア（移動距離）をゼロ埋め 6 桁で表示する。
 * drawHUD から呼ばれるため非公開関数として定義。
 */
function drawScoreHUD(p, score) {
  const label = 'SCORE:';
  const value = String(Math.floor(score)).padStart(6, '0');

  p.fill(255);
  p.noStroke();
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.textSize(9);
  p.textStyle(p.BOLD);
  p.drawingContext.letterSpacing = '2px';

  const baseX = p.width - SCORE_MARGIN_X;
  const baseY = p.height - SCORE_MARGIN_BOTTOM;
  p.text(`${label} ${value}`, baseX, baseY);

  p.drawingContext.letterSpacing = '0px';
}

/**
 * 画面全体を赤く一瞬フラッシュさせる被弾演出。
 * @param {p5} p - p5 インスタンス
 * @param {number} flashTimer - 残りフラッシュフレーム数
 */
export function drawHitFlash(p, flashTimer) {
  p.push();
  p.noStroke();
  // 壁の glow 描画で設定されたシャドウをリセット
  p.drawingContext.shadowBlur = 0;
  p.drawingContext.shadowColor = 'transparent';
  // タイマーに連動してフェードアウト
  const alpha = p.map(flashTimer, 0, HIT_FLASH_DURATION, 0, 1);
  p.fill(255, 50, 50, alpha * 150);
  p.rect(0, 0, p.width, p.height);
  p.pop();
}
