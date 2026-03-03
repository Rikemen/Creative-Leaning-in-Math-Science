// ──────────────────────────────────────────────
// Player — プレイヤーの状態管理と描画
// p5 インスタンスを受け取り、ひし形＋ネオン発光で描画する。
// Y 座標は外部（マウスや ml5.js）から更新される想定。
// 被弾時は無敵状態に入り、点滅して無敵時間を視覚表現する。
// ──────────────────────────────────────────────

import { PLAYER_SIZE, PLAYER_X_RATIO, PLAYER_GLOW_BLUR, INVINCIBLE_DURATION } from './constants.js';

export class Player {
  /**
   * @param {p5} p - p5 インスタンス
   */
  constructor(p) {
    this.p = p;
    this.x = p.width * PLAYER_X_RATIO;
    this.y = p.height / 2;
    this.size = PLAYER_SIZE;

    // 無敵状態の管理
    this.invincible = false;
    this.invincibleTimer = 0;
  }

  /** 画面リサイズ時に X 座標を再計算する */
  onResize() {
    this.x = this.p.width * PLAYER_X_RATIO;
  }

  /** ゲーム開始・リトライ時に状態をリセットする */
  reset() {
    this.y = this.p.height / 2;
    this.invincible = false;
    this.invincibleTimer = 0;
  }

  /**
   * プレイヤーの Y 座標を更新する。
   * マウス操作や ml5.js 姿勢推定から呼ばれる。
   * @param {number} targetY - 追従先の Y 座標
   */
  updatePosition(targetY) {
    this.y = targetY;
  }

  /** 無敵タイマーを毎フレーム更新する */
  update() {
    if (!this.invincible) return;
    this.invincibleTimer--;
    if (this.invincibleTimer <= 0) {
      this.invincible = false;
      this.invincibleTimer = 0;
    }
  }

  /**
   * 被弾処理: 無敵状態に入る。
   * 既に無敵中なら何もしない。
   * @returns {boolean} 被弾が成立したら true（無敵中なら false）
   */
  hit() {
    if (this.invincible) return false;
    this.invincible = true;
    this.invincibleTimer = INVINCIBLE_DURATION;
    return true;
  }

  /** ひし形（45° 回転の正方形）をネオン発光付きで描画する */
  draw() {
    const p = this.p;

    // 無敵中は点滅（4フレーム周期で表示/非表示を切り替え）
    if (this.invincible && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      return; // 非表示フレーム
    }

    p.push();
    p.translate(this.x, this.y);
    p.rotate(p.PI / 4);

    // 被弾直後は赤みがかった発光にする
    const isRecentlyHit = this.invincible && this.invincibleTimer > INVINCIBLE_DURATION - 10;
    const glowColor = isRecentlyHit ? 'rgba(255, 80, 80, 0.9)' : 'rgba(255, 255, 255, 0.8)';

    // ネオン発光エフェクト（外側の光）
    p.drawingContext.shadowBlur = PLAYER_GLOW_BLUR;
    p.drawingContext.shadowColor = glowColor;

    const fillColor = isRecentlyHit ? p.color(255, 100, 100) : p.color(255);
    p.fill(fillColor);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.rect(0, 0, this.size, this.size);

    // 内側の暗い領域（モック準拠の奥行き感）
    p.fill(0, 0, 0, 50);
    p.rect(0, 0, this.size - 6, this.size - 6);

    // 発光リセット
    p.drawingContext.shadowBlur = 0;
    p.pop();
  }
}
