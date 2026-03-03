// ──────────────────────────────────────────────
// Obstacles — 通路内に出現する障害物ブロック
// 右端でランダムに生成され、壁と同速で左にスクロールする。
// 画面外に出たブロックは配列から除去してメモリを節約する。
// ──────────────────────────────────────────────

import {
  SCROLL_SPEED,
  OBSTACLE_WIDTH,
  OBSTACLE_HEIGHT,
  OBSTACLE_SPAWN_INTERVAL,
  OBSTACLE_COLOR,
  OBSTACLE_GLOW_BLUR,
  WALL_BASE_HEIGHT_RATIO,
  WALL_AMPLITUDE_RATIO
} from './constants.js';

export class Obstacles {
  /**
   * @param {p5} p - p5 インスタンス
   */
  constructor(p) {
    this.p = p;
    /** @type {Array<{x: number, y: number, w: number, h: number}>} */
    this.blocks = [];
    this.framesSinceLastSpawn = 0;
  }

  // ────────────────────────────────
  // 更新
  // ────────────────────────────────

  /** 毎フレームの更新: スクロール＋新規生成＋画面外除去 */
  update() {
    this._moveBlocks();
    this._removeOffscreen();
    this._trySpawn();
  }

  /** 全ブロックを壁と同速で左にスクロールする */
  _moveBlocks() {
    for (const block of this.blocks) {
      block.x -= SCROLL_SPEED;
    }
  }

  /** 画面左端を完全に超えたブロックを除去する */
  _removeOffscreen() {
    this.blocks = this.blocks.filter((block) => block.x + block.w > -OBSTACLE_WIDTH);
  }

  /** 一定間隔で右端に新しいブロックを生成する */
  _trySpawn() {
    this.framesSinceLastSpawn++;
    if (this.framesSinceLastSpawn < OBSTACLE_SPAWN_INTERVAL) return;

    this.framesSinceLastSpawn = 0;
    const p = this.p;

    // 壁の内側（通路内）にのみ配置する
    // 壁の最大到達位置を考慮してマージンを取る
    const wallMaxHeight = p.height * (WALL_BASE_HEIGHT_RATIO + WALL_AMPLITUDE_RATIO);
    const safeTop = wallMaxHeight + OBSTACLE_HEIGHT;
    const safeBottom = p.height - wallMaxHeight - OBSTACLE_HEIGHT;

    const y = p.random(safeTop, safeBottom);

    this.blocks.push({
      x: p.width + OBSTACLE_WIDTH, // 画面右端の少し外から出現
      y,
      w: OBSTACLE_WIDTH,
      h: OBSTACLE_HEIGHT
    });
  }

  // ────────────────────────────────
  // ライフサイクル
  // ────────────────────────────────

  /** ゲームリセット時にブロックを全消去する */
  reset() {
    this.blocks = [];
    this.framesSinceLastSpawn = 0;
  }

  /** リサイズ時は特に何もしない（既存ブロックはそのまま流れる） */
  onResize() {
    // 意図的に空: リサイズ後も既存ブロックは自然にスクロールアウトする
  }

  // ────────────────────────────────
  // 描画
  // ────────────────────────────────

  /** 全ブロックをネオン発光付きで描画する */
  draw() {
    const p = this.p;
    p.push();
    p.rectMode(p.CENTER);
    p.noStroke();

    for (const block of this.blocks) {
      // ネオン発光エフェクト
      p.drawingContext.shadowBlur = OBSTACLE_GLOW_BLUR;
      p.drawingContext.shadowColor = 'rgba(255, 255, 255, 0.6)';

      // 外枠（白い矩形）
      p.fill(OBSTACLE_COLOR);
      p.rect(block.x, block.y, block.w, block.h);

      // 内側の暗い領域（プレイヤーと統一感を出すため）
      p.fill(0, 0, 0, 80);
      p.rect(block.x, block.y, block.w - 6, block.h - 6);
    }

    p.drawingContext.shadowBlur = 0;
    p.pop();
  }
}
