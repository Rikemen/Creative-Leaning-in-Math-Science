/**
 * 円として描画される泡粒子。
 */
class FoamParticle extends Particle {
    /**
     * @param {Object} particleConfig 粒子共通の物理・リセット設定。
     * @param {ParticleStyle} foamConfig 泡の描画・寿命設定。
     */
    constructor(particleConfig, foamConfig) {
        super(particleConfig, foamConfig);

        this.foamConfig = foamConfig;
        this.size = random(
            foamConfig.sizeMin,
            foamConfig.sizeMax
        );
    }

    /**
     * 現在の寿命に応じた透明度で泡を描画する。
     *
     * @param {p5.Graphics} target 描画先レイヤー。
     * @returns {void}
     */
    display(target) {
        const lifeRatio = constrain(
            this.life / this.maxLife,
            0,
            1
        );

        const alpha =
            this.foamConfig.maxAlpha * lifeRatio;

        target.noStroke();

        target.fill(
            this.foamConfig.color[0],
            this.foamConfig.color[1],
            this.foamConfig.color[2],
            alpha
        );

        target.circle(
            this.pos.x,
            this.pos.y,
            this.size
        );
    }
}
