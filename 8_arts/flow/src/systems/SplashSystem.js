/**
 * 飛沫粒子の生成、更新、描画、削除を一元管理する。
 */
class SplashSystem {
    /**
     * @param {Object} splashConfig 飛沫の物理・描画設定。
     * @param {Object} collisionConfig 衝突時の飛沫生成設定。
     */
    constructor(splashConfig, collisionConfig) {
        this.splashConfig = splashConfig;
        this.collisionConfig = collisionConfig;
        this.particles = [];
    }

    /**
     * 画面下端への到達位置から、設定確率に従って上向きの飛沫を生成する。
     * このメソッドは内部の飛沫配列を変更する。
     *
     * @param {Vector2} impact 画面下端への到達位置（px）。
     * @returns {void}
     */
    emitFromBottom(impact) {
        if (random() >= this.splashConfig.spawnChance) {
            return;
        }

        this._emit(
            impact.x,
            impact.y,
            0,
            -1,
            this.splashConfig.spawnCount
        );
    }

    /**
     * 障害物との衝突情報から、強さと設定確率に従って飛沫を生成する。
     * このメソッドは内部の飛沫配列を変更する。
     *
     * @param {CollisionResult} collision 衝突位置、法線、衝突速度。
     * @returns {void}
     */
    emitFromCollision(collision) {
        if (
            collision.impactSpeed
            < this.collisionConfig.minSplashImpactSpeed
        ) {
            return;
        }

        if (random() >= this.collisionConfig.splashChance) {
            return;
        }

        this._emit(
            collision.x,
            collision.y,
            collision.normalX,
            collision.normalY,
            this.collisionConfig.splashCount
        );
    }

    /**
     * すべての飛沫を更新・描画し、寿命切れの要素を配列から削除する。
     * このメソッドは内部の飛沫配列を変更する。
     *
     * @param {FlowField} flowField 現在の流れ場。
     * @param {p5.Graphics} target 飛沫の描画先。
     * @returns {void}
     */
    update(flowField, target) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const splash = this.particles[i];

            splash.follow(flowField);
            splash.update();
            splash.display(target);

            if (splash.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 保持している飛沫をすべて削除する。
     * このメソッドは内部の飛沫配列を変更する。
     *
     * @returns {void}
     */
    clear() {
        this.particles.length = 0;
    }

    _emit(x, y, normalX, normalY, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(
                new SplashParticle(
                    x,
                    y,
                    normalX,
                    normalY,
                    this.splashConfig
                )
            );
        }
    }
}
