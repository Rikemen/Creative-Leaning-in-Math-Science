// ──────────────────────────────────────────────
// Walls — 上下の壁の生成・スクロール・描画
// 頂点列を毎フレーム左にオフセットし、
// 画面外に出た頂点を右端に再生成して無限スクロールを実現する。
//
// 通路幅の最低保証:
// 新しい頂点を右端に追加する際、対向する壁との間隔が
// minPassageHeight を下回るなら Y 座標を補正して安全な通路幅を確保する。
// ──────────────────────────────────────────────

import {
  WALL_COLOR,
  WALL_SEGMENT_WIDTH,
  WALL_BASE_HEIGHT_RATIO,
  WALL_AMPLITUDE_RATIO,
  WALL_GLOW_BLUR,
  WALL_STROKE_COLOR
} from './constants.js';
import { getScrollSpeed, getMinPassageRatio } from './difficulty.js';

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
      const topY = this._randomJag(baseHeight, amplitude);
      const bottomY = this._randomJag(p.height - baseHeight, amplitude);

      // 初期生成時も通路幅の最低保証を確認して補正する
      const pair = this._enforceMinPassage(topY, bottomY, p.height);
      this.topVertices.push({ x, y: pair.topY });
      this.bottomVertices.push({ x, y: pair.bottomY });
    }
  }

  /** ギザギザの Y 座標をランダムに算出するヘルパー */
  _randomJag(baseY, amplitude) {
    return baseY + this.p.random(-amplitude, amplitude);
  }

  /**
   * 上壁と下壁の間隔が最低通路幅を下回る場合に補正する。
   * 上壁を上方向、下壁を下方向に均等に押し戻す。
   *
   * @param {number} topY  - 上壁の Y 座標候補
   * @param {number} bottomY - 下壁の Y 座標候補
   * @param {number} canvasHeight - キャンバスの高さ
   * @returns {{ topY: number, bottomY: number }} 補正後の座標ペア
   */
  _enforceMinPassage(topY, bottomY, canvasHeight) {
    const minPassage = canvasHeight * this._currentMinPassageRatio;
    const currentGap = bottomY - topY;

    if (currentGap >= minPassage) {
      return { topY, bottomY };
    }

    // 不足分を上下に均等配分して押し戻す
    const deficit = (minPassage - currentGap) / 2;
    return {
      topY: topY - deficit,
      bottomY: bottomY + deficit
    };
  }

  /** 現在の通路幅最低保証比率（スコア未連携時は初期値を使用） */
  get _currentMinPassageRatio() {
    return this._minPassageRatio ?? 0.55;
  }

  /**
   * スコアに応じた通路幅の最低保証比率を外部から設定する。
   * game.js の updatePlaying() から毎フレーム呼ばれる想定。
   *
   * @param {number} score - 現在のスコア
   */
  updateDifficulty(score) {
    this._minPassageRatio = getMinPassageRatio(score);
  }

  // ────────────────────────────────
  // 更新: 毎フレーム左方向にスクロール
  // ────────────────────────────────

  /**
   * すべての頂点を左にオフセットし、画面外の頂点を右端に再生成する。
   * @param {number} scrollSpeed - 現在のスクロール速度（px/frame）
   */
  update(scrollSpeed) {
    this._scrollVertices(this.topVertices, this.bottomVertices, true, scrollSpeed);
    this._scrollVertices(this.bottomVertices, this.topVertices, false, scrollSpeed);
  }

  /**
   * 頂点列を左にスクロールし、画面外に出た先頭を除去して右端に新頂点を追加する。
   * 新頂点の追加時に、対向する壁との通路幅が最低保証を下回らないよう補正する。
   *
   * @param {Array<{x: number, y: number}>} vertices - 操作対象の頂点配列
   * @param {Array<{x: number, y: number}>} oppositeVertices - 対向する壁の頂点配列
   * @param {boolean} isTop - 上壁なら true（Y 計算の基準が異なる）
   * @param {number} scrollSpeed - 現在のスクロール速度（px/frame）
   */
  _scrollVertices(vertices, oppositeVertices, isTop, scrollSpeed) {
    const p = this.p;
    const baseHeight = p.height * WALL_BASE_HEIGHT_RATIO;
    const amplitude = p.height * WALL_AMPLITUDE_RATIO;

    // 全頂点を左にずらす
    for (const v of vertices) {
      v.x -= scrollSpeed;
    }

    // 先頭の頂点が画面左端を十分超えたら除去し、右端に新頂点を追加
    while (vertices.length > 0 && vertices[0].x < -WALL_SEGMENT_WIDTH) {
      vertices.shift();

      // 最後尾の右側に新しい頂点を追加
      const lastX = vertices[vertices.length - 1].x;
      const newX = lastX + WALL_SEGMENT_WIDTH;
      const baseY = isTop ? baseHeight : p.height - baseHeight;
      let newY = this._randomJag(baseY, amplitude);

      // 対向する壁の末尾頂点を参照して通路幅を保証する
      const oppositeLast = oppositeVertices[oppositeVertices.length - 1];
      if (oppositeLast) {
        const minPassage = p.height * this._currentMinPassageRatio;
        if (isTop) {
          // 上壁: newY（上壁下端）が下壁上端に近すぎる場合は上に押し戻す
          const maxAllowed = oppositeLast.y - minPassage;
          if (newY > maxAllowed) newY = maxAllowed;
        } else {
          // 下壁: newY（下壁上端）が上壁下端に近すぎる場合は下に押し戻す
          const minAllowed = oppositeLast.y + minPassage;
          if (newY < minAllowed) newY = minAllowed;
        }
      }

      vertices.push({ x: newX, y: newY });
    }
  }

  // ────────────────────────────────
  // ライフサイクル
  // ────────────────────────────────

  /** 画面リサイズ時に頂点を再生成する */
  onResize() {
    this._generateVertices();
  }

  /** ゲームリセット時に壁を再生成し難易度もリセットする */
  reset() {
    this._minPassageRatio = undefined;
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
