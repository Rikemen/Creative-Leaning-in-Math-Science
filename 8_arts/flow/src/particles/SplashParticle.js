/**
 * 衝突点または画面下端から放出される1個の飛沫を表す。
 */
class SplashParticle {
    /**
     * @param {number} x 発生位置のX座標（px）。
     * @param {number} y 発生位置のY座標（px）。
     * @param {number} normalX 放出面の法線X成分。
     * @param {number} normalY 放出面の法線Y成分。
     * @param {Object} config 飛沫の物理・描画・寿命設定。
     */
    constructor(x, y, normalX, normalY, config) {
        this.config = config;

        this.pos = createVector(x, y);

        const tangentX = -normalY;
        const tangentY = normalX;

        const normalSpeed = random(
            config.normalSpeedMin,
            config.normalSpeedMax
        );

        const tangentSpeed = random(
            config.tangentSpeedMin,
            config.tangentSpeedMax
        );

        this.vel = createVector(
            normalX * normalSpeed + tangentX * tangentSpeed,
            normalY * normalSpeed + tangentY * tangentSpeed
        );

        this.acc = createVector(0, config.gravity);

        this.life = random(
            config.lifeMin,
            config.lifeMax
        );

        this.maxLife = this.life;

        this.size = random(
            config.sizeMin,
            config.sizeMax
        );
    }

    /**
     * 現在位置の流れベクトルを加速度へ加える。
     *
     * @param {FlowField} flowField 現在の流れ場。
     * @returns {void}
     */
    follow(flowField) {
        const flow = flowField.lookup(this.pos);
        this.acc.add(flow);
    }

    /**
     * 飛沫の速度、位置、重力加速度、寿命を1フレーム進める。
     *
     * @returns {void}
     */
    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);

        this.acc.set(0, this.config.gravity);
        this.life -= 1;
    }

    /**
     * @returns {boolean} 寿命が尽きていれば`true`。
     */
    isDead() {
        return this.life <= 0;
    }

    /**
     * 現在の寿命に応じた透明度で飛沫を描画する。
     *
     * @param {p5.Graphics} target 描画先レイヤー。
     * @returns {void}
     */
    display(target) {
        const alpha =
            255 * constrain(
                this.life / this.maxLife,
                0,
                1
            );

        target.noStroke();

        target.fill(
            this.config.color[0],
            this.config.color[1],
            this.config.color[2],
            alpha
        );

        target.circle(
            this.pos.x,
            this.pos.y,
            this.size
        );
    }
}
