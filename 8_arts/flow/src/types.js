/**
 * @typedef {Object} CollisionResult
 * @property {number} x 衝突点のX座標（px）。
 * @property {number} y 衝突点のY座標（px）。
 * @property {number} normalX 外向き法線のX成分。
 * @property {number} normalY 外向き法線のY成分。
 * @property {number} impactSpeed 法線方向の衝突速度（px/frame）。
 */

/**
 * @typedef {Object} Vector2
 * @property {number} x X成分。
 * @property {number} y Y成分。
 */

/**
 * @typedef {Object} ParticleStyle
 * @property {number[]} color RGBカラー。
 * @property {number} [weight] 線幅（px）。
 * @property {number} [minLength] 最小線長（px）。
 * @property {number} [maxLength] 最大線長（px）。
 * @property {number} [minAlpha] 最小不透明度。
 * @property {number} [maxAlpha] 最大不透明度。
 * @property {number} lifeMin 最小寿命（frame）。
 * @property {number} lifeMax 最大寿命（frame）。
 */
