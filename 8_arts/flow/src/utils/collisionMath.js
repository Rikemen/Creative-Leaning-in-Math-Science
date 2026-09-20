/**
 * 点から最も近い矩形の辺と、その外向き法線を返す。
 * 同距離の場合は上、下、左、右の順に優先する。
 *
 * @param {Vector2} position 判定する点の座標。
 * @param {{left: number, right: number, top: number, bottom: number}} bounds 矩形の境界。
 * @returns {{side: string, normalX: number, normalY: number}} 最近接辺と外向き法線。
 */
function findNearestRectangleSide(position, bounds) {
    const distanceLeft = Math.abs(position.x - bounds.left);
    const distanceRight = Math.abs(bounds.right - position.x);
    const distanceTop = Math.abs(position.y - bounds.top);
    const distanceBottom = Math.abs(bounds.bottom - position.y);
    const nearest = Math.min(
        distanceLeft,
        distanceRight,
        distanceTop,
        distanceBottom
    );

    if (nearest === distanceTop) {
        return { side: 'top', normalX: 0, normalY: -1 };
    }

    if (nearest === distanceBottom) {
        return { side: 'bottom', normalX: 0, normalY: 1 };
    }

    if (nearest === distanceLeft) {
        return { side: 'left', normalX: -1, normalY: 0 };
    }

    return { side: 'right', normalX: 1, normalY: 0 };
}

/**
 * 法線方向へ進入した速度の大きさを求める。
 *
 * @param {Vector2} velocity 衝突前の速度（px/frame）。
 * @param {Vector2} normal 矩形面の外向き単位法線。
 * @returns {number} 法線方向の衝突速度（px/frame）。
 */
function calculateImpactSpeed(velocity, normal) {
    const normalSpeed =
        velocity.x * normal.x
        + velocity.y * normal.y;

    return Math.max(0, -normalSpeed);
}

/**
 * 法線速度を除去し、保持率と最低速度を反映した接線速度を返す。
 *
 * @param {Vector2} velocity 衝突前の速度（px/frame）。
 * @param {Vector2} normal 矩形面の外向き単位法線。
 * @param {{tangentRetention: number, minTangentSpeed: number, fallbackDirection: number}} options 接線速度設定。
 * @returns {Vector2} 衝突後の接線方向速度（px/frame）。
 */
function calculateTangentVelocity(velocity, normal, options) {
    const tangentX = -normal.y;
    const tangentY = normal.x;
    let tangentSpeed =
        (
            velocity.x * tangentX
            + velocity.y * tangentY
        ) * options.tangentRetention;

    if (Math.abs(tangentSpeed) < options.minTangentSpeed) {
        const direction =
            tangentSpeed === 0
                ? options.fallbackDirection
                : Math.sign(tangentSpeed);

        tangentSpeed = direction * options.minTangentSpeed;
    }

    return {
        x: tangentX * tangentSpeed,
        y: tangentY * tangentSpeed
    };
}
