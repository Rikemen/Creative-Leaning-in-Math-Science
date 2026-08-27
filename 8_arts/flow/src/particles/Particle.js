/**
 * 流れ場に沿って移動し、線として描画される1粒子を表す。
 */
class Particle {
    /**
     * @param {Object} config 粒子共通の物理・リセット設定。
     * @param {ParticleStyle} style 粒子グループ固有の描画・寿命設定。
     */
    constructor(config, style) {
        this.config = config;
        this.style = style;
        this.pos = createVector(0, 0);
        this.prevPos = createVector(0, 0);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.collisionCooldown = 0;
        this.reset(true);
    }

    /**
     * 粒子を画面内または画面上端へ再配置し、速度と寿命を初期化する。
     * このメソッドは粒子の位置、速度、加速度、寿命を変更する。
     *
     * @param {boolean} [initial=false] 初期配置なら画面内へ配置する。
     * @returns {void}
     */
    reset(initial = false) {
        this.pos.set(
            random(width),
            initial
                ? random(height)
                : random(-this.config.resetMargin, 0)
        );
        this.prevPos.set(this.pos);
        this.collisionCooldown = 0;

        this.vel.set(
            0,
            random(
                this.config.initialSpeedMin,
                this.config.initialSpeedMax
            )
        );

        this.acc.set(0, 0);

        this.life = random(
            this.style.lifeMin,
            this.style.lifeMax
        );

        this.maxLife = this.life;
    }

    /**
     * 1フレーム分の重力を加速度へ加える。
     *
     * @returns {void}
     */
    applyGravity() {
        this.acc.y += this.config.gravity;
    }

    /**
     * 速度と位置を1フレーム進め、寿命と衝突クールダウンを減らす。
     * このメソッドは粒子の位置、速度、加速度、寿命を変更する。
     *
     * @returns {void}
     */
    update() {
        this.prevPos.set(this.pos);
        this.vel.add(this.acc);
        this.vel.limit(this.config.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.life -= 1;
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
    }

    /**
     * 画面左右を循環させ、下端到達または寿命切れなら粒子をリセットする。
     * このメソッドは条件成立時に粒子状態を変更する。
     *
     * @returns {{x: number, y: number}|null} 下端への到達位置。未到達なら`null`。
     */
    resetIfNeeded() {
        if (this.pos.x < 0) {
            this.pos.x = width;
        } else if (this.pos.x > width) {
            this.pos.x = 0;
        }

        const hitBottom =
            this.pos.y > height + this.config.resetMargin;

        let impact = null;

        if (hitBottom) {
            impact = {
                x: this.pos.x,
                y: height
            };
        }

        if (hitBottom || this.life <= 0) {
            this.reset(false);
        }

        return impact;
    }

    /**
     * 現在の速度と寿命に応じた長さ・透明度の線を描画する。
     *
     * @param {p5.Graphics} target 描画先レイヤー。
     * @returns {void}
     */
    display(target) {
        const speed = this.vel.mag();

        if (speed < 0.0001) {
            return;
        }

        const speedRatio = constrain(
            speed / this.config.maxSpeed,
            0,
            1
        );

        const lifeRatio = constrain(
            this.life / this.maxLife,
            0,
            1
        );

        const lineLength = lerp(
            this.style.minLength,
            this.style.maxLength,
            speedRatio
        );

        const alpha =
            lerp(
                this.style.minAlpha,
                this.style.maxAlpha,
                speedRatio
            ) * lifeRatio;

        const tailX =
            (this.vel.x / speed) * lineLength;

        const tailY =
            (this.vel.y / speed) * lineLength;

        target.stroke(
            this.style.color[0],
            this.style.color[1],
            this.style.color[2],
            alpha
        );

        target.line(
            this.pos.x,
            this.pos.y,
            this.pos.x - tailX,
            this.pos.y - tailY
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
     * 描画スタイルまたは粒子サイズから衝突半径を求める。
     *
     * @returns {number} 衝突判定に使う半径（px）。
     */
    getCollisionRadius() {
        if (this.style.weight !== undefined) {
            return max(1, this.style.weight * 0.5);
        }

        if (this.size !== undefined) {
            return max(1, this.size * 0.5);
        }

        return 1;
    }

    /**
     * 障害物衝突による飛沫生成を抑止する時間を設定する。
     *
     * @param {number} frames クールダウン時間（frame）。
     * @returns {void}
     */
    startCollisionCooldown(frames) {
        this.collisionCooldown = frames;
    }
}
