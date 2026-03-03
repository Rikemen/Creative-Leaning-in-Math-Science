// ──────────────────────────────────────────────
// Collision — 衝突判定ロジック
// プレイヤー（ひし形）と壁・障害物の衝突を検出する。
// ひし形は回転した正方形なので、外接矩形を使用する。
// ──────────────────────────────────────────────

import { PLAYER_SIZE } from './constants.js';

/**
 * プレイヤーの軸平行バウンディングボックス（AABB）を取得する。
 * ひし形は 45° 回転した正方形なので対角線が size。
 * 当たり判定を少し甘くするため 0.5 倍に縮小して使う。
 * @param {{x: number, y: number, size: number}} player
 * @returns {{left: number, right: number, top: number, bottom: number}}
 */
function getPlayerBounds(player) {
  const halfExtent = player.size * 0.5;
  return {
    left: player.x - halfExtent,
    right: player.x + halfExtent,
    top: player.y - halfExtent,
    bottom: player.y + halfExtent
  };
}

/**
 * プレイヤーと上壁の衝突を判定する。
 * プレイヤーの X 範囲に重なる壁セグメントの最大 Y（最も下に突き出た値）を求め、
 * プレイヤーの上端がそれより上なら衝突。
 * @param {number} leftX - プレイヤー左端
 * @param {number} rightX - プレイヤー右端
 * @param {Array<{x: number, y: number}>} vertices - 上壁の頂点列
 * @returns {number|null} 上壁の最も下に突き出た Y。該当なしなら null
 */
function getTopWallMaxY(leftX, rightX, vertices) {
  let maxY = null;

  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];

    // このセグメントがプレイヤーの X 範囲と重なるか
    if (v2.x < leftX || v1.x > rightX) continue;

    // セグメント両端と中点をサンプリング
    const samples = [0, 0.25, 0.5, 0.75, 1.0];
    for (const t of samples) {
      const sampleX = v1.x + (v2.x - v1.x) * t;
      if (sampleX < leftX || sampleX > rightX) continue;

      const sampleY = v1.y + (v2.y - v1.y) * t;
      // 上壁は maxY が大きいほど通路に突き出ている = 危険
      if (maxY === null || sampleY > maxY) {
        maxY = sampleY;
      }
    }
  }

  return maxY;
}

/**
 * プレイヤーと下壁の衝突を判定する。
 * プレイヤーの X 範囲に重なる壁セグメントの最小 Y（最も上に突き出た値）を求め、
 * プレイヤーの下端がそれより下なら衝突。
 * @param {number} leftX - プレイヤー左端
 * @param {number} rightX - プレイヤー右端
 * @param {Array<{x: number, y: number}>} vertices - 下壁の頂点列
 * @returns {number|null} 下壁の最も上に突き出た Y。該当なしなら null
 */
function getBottomWallMinY(leftX, rightX, vertices) {
  let minY = null;

  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];

    if (v2.x < leftX || v1.x > rightX) continue;

    const samples = [0, 0.25, 0.5, 0.75, 1.0];
    for (const t of samples) {
      const sampleX = v1.x + (v2.x - v1.x) * t;
      if (sampleX < leftX || sampleX > rightX) continue;

      const sampleY = v1.y + (v2.y - v1.y) * t;
      // 下壁は minY が小さいほど通路に突き出ている = 危険
      if (minY === null || sampleY < minY) {
        minY = sampleY;
      }
    }
  }

  return minY;
}

/**
 * プレイヤーと壁の頂点列の衝突を判定する。
 * @param {{x: number, y: number, size: number}} player
 * @param {Array<{x: number, y: number}>} topVertices - 上壁の頂点列
 * @param {Array<{x: number, y: number}>} bottomVertices - 下壁の頂点列
 * @returns {boolean}
 */
export function checkWallCollision(player, topVertices, bottomVertices) {
  const bounds = getPlayerBounds(player);

  // 上壁: プレイヤーの上端が壁の最下端より上にいたら衝突
  const topY = getTopWallMaxY(bounds.left, bounds.right, topVertices);
  if (topY !== null && bounds.top < topY) return true;

  // 下壁: プレイヤーの下端が壁の最上端より下にいたら衝突
  const bottomY = getBottomWallMinY(bounds.left, bounds.right, bottomVertices);
  if (bottomY !== null && bounds.bottom > bottomY) return true;

  return false;
}

/**
 * プレイヤーと障害物ブロック群の衝突を判定する。
 * 矩形同士の AABB 衝突判定。
 * @param {{x: number, y: number, size: number}} player
 * @param {Array<{x: number, y: number, w: number, h: number}>} blocks
 * @returns {boolean}
 */
export function checkObstacleCollision(player, blocks) {
  const bounds = getPlayerBounds(player);

  for (const block of blocks) {
    // 障害物は CENTER モードで描画されるため、中心から半幅を引く
    const halfW = block.w / 2;
    const halfH = block.h / 2;

    const overlaps =
      bounds.left < block.x + halfW &&
      bounds.right > block.x - halfW &&
      bounds.top < block.y + halfH &&
      bounds.bottom > block.y - halfH;

    if (overlaps) return true;
  }

  return false;
}
