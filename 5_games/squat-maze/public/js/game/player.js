// ──────────────────────────────────────────────
// Player — プレイヤーの状態管理と描画
// p5 インスタンスを受け取り、ひし形＋ネオン発光で描画する。
// Y 座標は外部（マウスや ml5.js）から更新される想定。
// ──────────────────────────────────────────────

import { PLAYER_SIZE, PLAYER_X_RATIO, PLAYER_GLOW_BLUR } from './constants.js';

export class Player {
  /**
   * @param {p5} p - p5 インスタンス
   */
  constructor(p) {
    this.p = p;
    this.x = p.width * PLAYER_X_RATIO;
    this.y = p.height / 2;
    this.size = PLAYER_SIZE;
  }

  /** 画面リサイズ時に X 座標を再計算する */
  onResize() {
    this.x = this.p.width * PLAYER_X_RATIO;
  }

  /** ゲーム開始・リトライ時に位置を中央へ戻す */
  reset() {
    this.y = this.p.height / 2;
  }

  /**
   * プレイヤーの Y 座標を更新する。
   * マウス操作や ml5.js 姿勢推定から呼ばれる。
   * @param {number} targetY - 追従先の Y 座標
   */
  updatePosition(targetY) {
    this.y = targetY;
  }

  /** ひし形（45° 回転の正方形）をネオン発光付きで描画する */
  draw() {
    const p = this.p;
    p.push();
    p.translate(this.x, this.y);
    p.rotate(p.PI / 4);

    // ネオン発光エフェクト（外側の光）
    p.drawingContext.shadowBlur = PLAYER_GLOW_BLUR;
    p.drawingContext.shadowColor = 'rgba(255, 255, 255, 0.8)';

    p.fill(255);
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
