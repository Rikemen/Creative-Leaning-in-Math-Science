// ──────────────────────────────────────────────
// Walls — 上下の壁の生成・スクロール・描画
// 頂点列を毎フレーム左にオフセットし、
// 画面外に出た頂点を右端に再生成して無限スクロールを実現する。
// ──────────────────────────────────────────────

import {
  WALL_COLOR,
  WALL_SEGMENT_WIDTH,
  WALL_BASE_HEIGHT_RATIO,
  WALL_AMPLITUDE_RATIO,
  WALL_GLOW_BLUR,
  WALL_STROKE_COLOR,
  SCROLL_SPEED
} from './constants.js';

export class Walls {
  /**
   * @param {p5} p - p5 インスタンス
   */
  constructor(p) {
    this.p = p;
    this.topVertices = [];
    this.bottomVertices = [];
    this._generateVertices();
  }

  // ────────────────────────────────
  // 頂点生成
  // ────────────────────────────────

  /** 壁の頂点列を画面幅＋余裕分で生成する */
  _generateVertices() {
    const p = this.p;
    // 画面右端より先まで余裕を持って生成（スクロール中に隙間が出ないように）
    const segmentCount = Math.ceil(p.width / WALL_SEGMENT_WIDTH) + 4;
    const baseHeight = p.height * WALL_BASE_HEIGHT_RATIO;
    const amplitude = p.height * WALL_AMPLITUDE_RATIO;

    this.topVertices = [];
    this.bottomVertices = [];

    for (let i = 0; i <= segmentCount; i++) {
      const x = i * WALL_SEGMENT_WIDTH;
      this.topVertices.push({ x, y: this._randomJag(baseHeight, amplitude) });
      this.bottomVertices.push({ x, y: this._randomJag(p.height - baseHeight, amplitude) });
    }
  }

  /** ギザギザの Y 座標をランダムに算出するヘルパー */
  _randomJag(baseY, amplitude) {
    return baseY + this.p.random(-amplitude, amplitude);
  }

  // ────────────────────────────────
  // 更新: 毎フレーム左方向にスクロール
  // ────────────────────────────────

  /** すべての頂点を左にオフセットし、画面外の頂点を右端に再生成する */
  update() {
    this._scrollVertices(this.topVertices, true);
    this._scrollVertices(this.bottomVertices, false);
  }

  /**
   * 頂点列を左にスクロールし、画面外に出た先頭を除去して右端に新頂点を追加する。
   * @param {Array<{x: number, y: number}>} vertices - 頂点配列
   * @param {boolean} isTop - 上壁なら true（Y 計算の基準が異なる）
   */
  _scrollVertices(vertices, isTop) {
    const p = this.p;
    const baseHeight = p.height * WALL_BASE_HEIGHT_RATIO;
    const amplitude = p.height * WALL_AMPLITUDE_RATIO;

    // 全頂点を左にずらす
    for (const v of vertices) {
      v.x -= SCROLL_SPEED;
    }

    // 先頭の頂点が画面左端を十分超えたら除去し、右端に新頂点を追加
    while (vertices.length > 0 && vertices[0].x < -WALL_SEGMENT_WIDTH) {
      vertices.shift();

      // 最後尾の右側に新しい頂点を追加
      const lastX = vertices[vertices.length - 1].x;
      const newX = lastX + WALL_SEGMENT_WIDTH;
      const baseY = isTop ? baseHeight : p.height - baseHeight;
      vertices.push({ x: newX, y: this._randomJag(baseY, amplitude) });
    }
  }

  // ────────────────────────────────
  // ライフサイクル
  // ────────────────────────────────

  /** 画面リサイズ時に頂点を再生成する */
  onResize() {
    this._generateVertices();
  }

  /** ゲームリセット時に壁を再生成する */
  reset() {
    this._generateVertices();
  }

  // ────────────────────────────────
  // 描画
  // ────────────────────────────────

  /** 上下の壁を描画する */
  draw() {
    this._drawTopWall();
    this._drawBottomWall();
  }

  /** 上壁: 画面上端からギザギザ境界線まで塗りつぶし */
  _drawTopWall() {
    const p = this.p;
    p.push();

    // 塗りつぶし部分
    p.fill(WALL_COLOR);
    p.noStroke();
    p.beginShape();
    p.vertex(-WALL_SEGMENT_WIDTH, 0); // 左端の余白
    for (const v of this.topVertices) {
      p.vertex(v.x, v.y);
    }
    p.vertex(p.width + WALL_SEGMENT_WIDTH * 2, 0); // 右端の余白
    p.endShape(p.CLOSE);

    // 境界線にネオン発光エフェクト
    p.drawingContext.shadowBlur = WALL_GLOW_BLUR;
    p.drawingContext.shadowColor = WALL_STROKE_COLOR;
    p.noFill();
    p.stroke(255);
    p.strokeWeight(2);
    p.beginShape();
    for (const v of this.topVertices) {
      p.vertex(v.x, v.y);
    }
    p.endShape();
    p.drawingContext.shadowBlur = 0;

    p.pop();
  }

  /** 下壁: ギザギザ境界線から画面下端まで塗りつぶし */
  _drawBottomWall() {
    const p = this.p;
    p.push();

    // 塗りつぶし部分
    p.fill(WALL_COLOR);
    p.noStroke();
    p.beginShape();
    p.vertex(-WALL_SEGMENT_WIDTH, p.height); // 左端の余白
    for (const v of this.bottomVertices) {
      p.vertex(v.x, v.y);
    }
    p.vertex(p.width + WALL_SEGMENT_WIDTH * 2, p.height); // 右端の余白
    p.endShape(p.CLOSE);

    // 境界線にネオン発光エフェクト
    p.drawingContext.shadowBlur = WALL_GLOW_BLUR;
    p.drawingContext.shadowColor = WALL_STROKE_COLOR;
    p.noFill();
    p.stroke(255);
    p.strokeWeight(2);
    p.beginShape();
    for (const v of this.bottomVertices) {
      p.vertex(v.x, v.y);
    }
    p.endShape();
    p.drawingContext.shadowBlur = 0;

    p.pop();
  }
}
