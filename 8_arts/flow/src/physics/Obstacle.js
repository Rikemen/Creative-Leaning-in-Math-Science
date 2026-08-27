/**
 * 画面比率で配置される1個の矩形障害物を表す。
 */
class Obstacle {
    /**
     * @param {Object} config 矩形1個の位置・寸法設定。
     * @param {Object} style 障害物共通の描画設定。
     * @param {Object} collisionConfig 粒子の位置・速度補正設定。
     */
    constructor(config, style, collisionConfig) {
        this.config = config;
        this.style = style;
        this.collisionConfig = collisionConfig;
        this.resize();
    }

    /**
     * 現在のCanvas寸法から矩形の座標と幅を再計算する。
     *
     * @returns {void}
     */
    resize() {
        this.x = width * this.config.xRatio;
        this.y = height * this.config.yRatio;
        this.w = width * this.config.widthRatio;
        this.h = this.config.height;
    }

    /**
     * 矩形をメインキャンバスへ描画する。
     *
     * @returns {void}
     */
    display() {
        push();
        fill(...this.style.fillColor);
        stroke(...this.style.strokeColor);
        strokeWeight(this.style.strokeWeight);
        rect(this.x, this.y, this.w, this.h);
        pop();
    }

    /**
     * 粒子と矩形の衝突を解決し、粒子の位置と速度を変更する。
     *
     * @param {Particle} particle 衝突判定する粒子。
     * @returns {CollisionResult|null} 衝突情報。衝突しない場合は`null`。
     */
    resolveCollision(particle) {
        const radius = particle.getCollisionRadius();
        const left = this.x - radius;
        const right = this.x + this.w + radius;
        const top = this.y - radius;
        const bottom = this.y + this.h + radius;
        const pos = particle.pos;

        if (
            pos.x < left
            || pos.x > right
            || pos.y < top
            || pos.y > bottom
        ) {
            return null;
        }

        const previous = particle.prevPos;
        let side;
        let normalX = 0;
        let normalY = 0;

        if (previous.y <= top) {
            side = 'top';
            normalY = -1;
        } else if (previous.y >= bottom) {
            side = 'bottom';
            normalY = 1;
        } else if (previous.x <= left) {
            side = 'left';
            normalX = -1;
        } else if (previous.x >= right) {
            side = 'right';
            normalX = 1;
        } else {
            const nearestSide = findNearestRectangleSide(
                pos,
                { left, right, top, bottom }
            );

            side = nearestSide.side;
            normalX = nearestSide.normalX;
            normalY = nearestSide.normalY;
        }

        let correctedX = pos.x;
        let correctedY = pos.y;
        let contactX = constrain(pos.x, this.x, this.x + this.w);
        let contactY = constrain(pos.y, this.y, this.y + this.h);

        if (side === 'top') {
            correctedY = top - this.collisionConfig.padding;
            contactY = this.y;
        } else if (side === 'bottom') {
            correctedY = bottom + this.collisionConfig.padding;
            contactY = this.y + this.h;
        } else if (side === 'left') {
            correctedX = left - this.collisionConfig.padding;
            contactX = this.x;
        } else {
            correctedX = right + this.collisionConfig.padding;
            contactX = this.x + this.w;
        }

        const normal = { x: normalX, y: normalY };
        const impactSpeed = calculateImpactSpeed(
            particle.vel,
            normal
        );
        const tangentSpeedIsZero =
            particle.vel.x * -normalY
            + particle.vel.y * normalX
            === 0;
        const fallbackDirection =
            tangentSpeedIsZero && random() < 0.5
                ? -1
                : 1;
        const tangentVelocity = calculateTangentVelocity(
            particle.vel,
            normal,
            {
                tangentRetention:
                    this.collisionConfig.tangentRetention,
                minTangentSpeed:
                    this.collisionConfig.minTangentSpeed,
                fallbackDirection
            }
        );

        particle.pos.set(correctedX, correctedY);
        particle.vel.set(tangentVelocity.x, tangentVelocity.y);

        return {
            x: contactX,
            y: contactY,
            normalX,
            normalY,
            impactSpeed
        };
    }
}
