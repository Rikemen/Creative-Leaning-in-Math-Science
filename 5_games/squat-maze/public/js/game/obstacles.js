// ──────────────────────────────────────────────
// Obstacles — 通路内に出現する障害物ブロック
// 右端でランダムに生成され、壁と同速で左にスクロールする。
// 画面外に出たブロックは配列から除去してメモリを節約する。
//
// 障害物の高さはスコアに応じて動的に変化する:
// 序盤は小さなブロック、後半は通路の80%を占める縦長バリアが登場する。
// ──────────────────────────────────────────────

import {
  OBSTACLE_WIDTH,
  OBSTACLE_MIN_HEIGHT,
  OBSTACLE_COLOR,
  OBSTACLE_GLOW_BLUR,
  WALL_BASE_HEIGHT_RATIO,
  WALL_AMPLITUDE_RATIO
} from './constants.js';
import { getMinPassageRatio, getObstacleMaxHeightRatio, getSpawnInterval } from './difficulty.js';

export class Obstacles {
  /**
   * @param {p5} p - p5 インスタンス
   */
  constructor(p) {
    this.p = p;
    /** @type {Array<{x: number, y: number, w: number, h: number}>} */
    this.blocks = [];
    this.framesSinceLastSpawn = 0;
    this._score = 0;
  }

  // ────────────────────────────────
  // 更新
  // ────────────────────────────────

  /**
   * 毎フレームの更新: スクロール＋新規生成＋画面外除去
   * @param {number} scrollSpeed - 現在のスクロール速度（px/frame）
   */
  update(scrollSpeed) {
    this._moveBlocks(scrollSpeed);
    this._removeOffscreen();
    this._trySpawn();
  }

  /**
   * スコアを外部から受け取り、障害物の高さ算出に利用する。
   * game.js の updatePlaying() から毎フレーム呼ばれる想定。
   *
   * @param {number} score - 現在のスコア
   */
  updateDifficulty(score) {
    this._score = score;
  }

  /**
   * 全ブロックを壁と同速で左にスクロールする
   * @param {number} scrollSpeed - 現在のスクロール速度（px/frame）
   */
  _moveBlocks(scrollSpeed) {
    for (const block of this.blocks) {
      block.x -= scrollSpeed;
    }
  }

  /** 画面左端を完全に超えたブロックを除去する */
  _removeOffscreen() {
    this.blocks = this.blocks.filter((block) => block.x + block.w > -OBSTACLE_WIDTH);
  }

  /**
   * 一定間隔で右端に新しいブロックを生成する。
   * 障害物の高さはスコアに応じてランダムに決定され、
   * 通路幅の最大80%まで成長する。
   */
  _trySpawn() {
    this.framesSinceLastSpawn++;
    // スコアに応じた動的スポーン間隔を取得（90→30フレームに短縮）
    if (this.framesSinceLastSpawn < getSpawnInterval(this._score)) return;

    this.framesSinceLastSpawn = 0;
    const p = this.p;

    // 現在の通路幅から障害物の最大高さを算出
    const passageHeight = p.height * getMinPassageRatio(this._score);
    const maxHeightRatio = getObstacleMaxHeightRatio(this._score);
    const maxHeight = passageHeight * maxHeightRatio;

    // 最小高さ〜最大高さの範囲でランダムに決定
    const actualHeight = p.random(OBSTACLE_MIN_HEIGHT, Math.max(OBSTACLE_MIN_HEIGHT, maxHeight));

    // 壁の内側（通路内）にのみ配置する
    // 壁の最大到達位置を考慮し、障害物の半分の高さ分のマージンを取る
    const wallMaxHeight = p.height * (WALL_BASE_HEIGHT_RATIO + WALL_AMPLITUDE_RATIO);
    const halfH = actualHeight / 2;
    const safeTop = wallMaxHeight + halfH;
    const safeBottom = p.height - wallMaxHeight - halfH;

    // 安全領域が確保できない場合は通路中央に配置する
    const y = safeTop < safeBottom
      ? p.random(safeTop, safeBottom)
      : (safeTop + safeBottom) / 2;

    this.blocks.push({
      x: p.width + OBSTACLE_WIDTH, // 画面右端の少し外から出現
      y,
      w: OBSTACLE_WIDTH,
      h: actualHeight
    });
  }

  // ────────────────────────────────
  // ライフサイクル
  // ────────────────────────────────

  /** ゲームリセット時にブロックを全消去し難易度もリセットする */
  reset() {
    this.blocks = [];
    this.framesSinceLastSpawn = 0;
    this._score = 0;
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
