/**
 * 障害物の生成、全障害物との衝突解決、描画、リサイズを管理する。
 */
class CollisionSystem {
    /**
     * @param {Object} obstacleConfig 障害物の配置と描画設定。
     * @param {Object} collisionConfig 粒子の衝突応答設定。
     */
    constructor(obstacleConfig, collisionConfig) {
        this.obstacles = obstacleConfig.items.map(
            (item) => new Obstacle(
                item,
                obstacleConfig,
                collisionConfig
            )
        );
        this.collisionResults = [];
    }

    /**
     * 1粒子とすべての障害物との衝突を解決する。
     * 粒子の位置と速度を変更し、戻り値の配列は次の呼び出しで再利用する。
     *
     * @param {Particle} particle 衝突判定する粒子。
     * @returns {CollisionResult[]} 今回検出した衝突情報。
     */
    resolve(particle) {
        this.collisionResults.length = 0;

        for (const obstacle of this.obstacles) {
            const collision = obstacle.resolveCollision(particle);

            if (collision) {
                this.collisionResults.push(collision);
            }
        }

        return this.collisionResults;
    }

    /**
     * すべての障害物をメインキャンバスへ描画する。
     *
     * @returns {void}
     */
    display() {
        for (const obstacle of this.obstacles) {
            obstacle.display();
        }
    }

    /**
     * 現在のキャンバス寸法に合わせて全障害物を再配置する。
     *
     * @returns {void}
     */
    resize() {
        for (const obstacle of this.obstacles) {
            obstacle.resize();
        }
    }
}
