/**
 * 水流、表面流、泡、飛沫、発光の描画レイヤーを所有し合成する。
 */
class WaterLayers {
    /**
     * @param {Object} config 発光・ブラーの描画設定。
     */
    constructor(config) {
        this.config = config;
        this.resize();
    }

    /**
     * 現在のCanvasと同じ寸法の透明描画レイヤーを生成する。
     *
     * @returns {p5.Graphics} pixelDensityと線端を設定済みの描画レイヤー。
     */
    createLayer() {
        const layer = createGraphics(width, height);

        layer.pixelDensity(1);
        layer.strokeCap(ROUND);

        return layer;
    }

    /**
     * 既存レイヤーを破棄し、現在のCanvas寸法で全レイヤーを再生成する。
     *
     * @returns {void}
     */
    resize() {
        if (this.main) {
            this.main.remove();
            this.surface.remove();
            this.foam.remove();
            this.splash.remove();
            this.glow.remove();
        }

        this.main = this.createLayer();
        this.surface = this.createLayer();
        this.foam = this.createLayer();
        this.splash = this.createLayer();
        this.glow = this.createLayer();
    }

    /**
     * 発光レイヤー以外を透明に戻し、次のフレームの描画を開始する。
     *
     * @returns {void}
     */
    beginFrame() {
        /*
         * レイヤー自体は透明に戻す。
         * 軌跡はメインキャンバス側に残す。
         */
        this.main.clear();
        this.surface.clear();
        this.foam.clear();
        this.splash.clear();
    }

    /**
     * 設定されたフレーム間隔で各レイヤーを加算し、ブラーを更新する。
     *
     * @returns {void}
     */
    updateGlow() {
        if (
            frameCount
            % this.config.glowUpdateInterval
            !== 0
        ) {
            return;
        }

        this.glow.clear();

        this.glow.push();
        this.glow.blendMode(ADD);

        this.glow.image(this.main, 0, 0);
        this.glow.image(this.surface, 0, 0);
        this.glow.image(this.foam, 0, 0);
        this.glow.image(this.splash, 0, 0);

        this.glow.pop();

        this.glow.filter(
            BLUR,
            this.config.glowBlurRadius
        );
    }

    /**
     * 発光、水流、表面流、泡、飛沫を所定のblend modeでCanvasへ合成する。
     *
     * @returns {void}
     */
    composite() {
        push();

        // ぼかした発光を先に描く
        blendMode(ADD);
        tint(255, this.config.glowAlpha);
        image(this.glow, 0, 0);
        noTint();

        // 暗く太い主流
        blendMode(BLEND);
        image(this.main, 0, 0);

        // 明るい表面流・泡・飛沫
        blendMode(ADD);
        image(this.surface, 0, 0);
        image(this.foam, 0, 0);
        image(this.splash, 0, 0);

        pop();
    }
}
