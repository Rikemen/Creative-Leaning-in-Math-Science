/**
 * 水流作品の状態を所有し、1フレームの更新順と描画順を調整する。
 */
class WaterSimulation {
    /**
     * p5.js依存オブジェクトは生成せず、設定と空の粒子配列だけを保持する。
     *
     * @param {Object} config 作品全体の設定。
     */
    constructor(config) {
        this.config = config;
        this.mainParticles = [];
        this.surfaceParticles = [];
        this.foamParticles = [];
        this.flowField = null;
        this.waterLayers = null;
        this.collisionSystem = null;
        this.splashSystem = null;
        this.debugOverlay = null;
    }

    /**
     * Canvas作成後に描画資源、各System、粒子を生成する。
     * このメソッドはシミュレーションが所有する状態を初期化する。
     *
     * @returns {void}
     */
    initialize() {
        background(...this.config.canvas.backgroundColor);
        strokeCap(ROUND);

        this.flowField = new FlowField(
            this.config.flowField,
            this.config.debug
        );
        this.waterLayers = new WaterLayers(this.config.render);
        this.splashSystem = new SplashSystem(
            this.config.splash,
            this.config.collision
        );
        this.debugOverlay = new DebugOverlay(this.config.debug);

        this.createParticleGroups();

        this.collisionSystem = new CollisionSystem(
            this.config.obstacles,
            this.config.collision
        );
    }

    /**
     * 現在の状態を1フレーム進め、全レイヤーとデバッグ表示を描画する。
     * このメソッドは粒子、流れ場、飛沫、描画レイヤーを変更する。
     *
     * @returns {void}
     */
    updateAndRender() {
        this.renderBackground();
        this.updateFlowField();
        this.prepareLayers();
        this.updateMainParticles();
        this.updateSurfaceParticles();
        this.updateFoamParticles();
        this.updateSplashParticles();
        this.renderLayers();
        this.renderObstacles();
        this.renderDebugOverlay();
    }

    /**
     * 現在のCanvas寸法に合わせて流れ場、レイヤー、障害物を再生成する。
     * 粒子状態は維持し、メインキャンバスを背景色で塗り直す。
     *
     * @returns {void}
     */
    resize() {
        this.flowField.resize();
        this.waterLayers.resize();
        this.collisionSystem.resize();
        background(...this.config.canvas.backgroundColor);
    }

    createParticleGroups() {
        this.mainParticles.length = 0;
        this.surfaceParticles.length = 0;
        this.foamParticles.length = 0;

        const particleConfig = this.config.particle;
        const mainStyle = particleConfig.layers.main;
        const surfaceStyle = particleConfig.layers.surface;

        for (let i = 0; i < mainStyle.count; i++) {
            this.mainParticles.push(
                new Particle(particleConfig, mainStyle)
            );
        }

        for (let i = 0; i < surfaceStyle.count; i++) {
            this.surfaceParticles.push(
                new Particle(particleConfig, surfaceStyle)
            );
        }

        for (let i = 0; i < this.config.foam.count; i++) {
            this.foamParticles.push(
                new FoamParticle(
                    particleConfig,
                    this.config.foam
                )
            );
        }
    }

    renderBackground() {
        background(
            ...this.config.canvas.backgroundColor,
            this.config.canvas.trailFadeAlpha
        );
    }

    updateFlowField() {
        this.flowField.update();
    }

    prepareLayers() {
        this.waterLayers.beginFrame();
    }

    updateMainParticles() {
        this.updateParticleGroup(
            this.mainParticles,
            this.waterLayers.main,
            {
                style: this.config.particle.layers.main,
                canSpawnSplash: true
            }
        );
    }

    updateSurfaceParticles() {
        this.updateParticleGroup(
            this.surfaceParticles,
            this.waterLayers.surface,
            {
                style: this.config.particle.layers.surface,
                canSpawnSplash: false
            }
        );
    }

    /**
     * 1種類の線状粒子を更新し、衝突・リセット・描画・下端飛沫を処理する。
     * 粒子配列、描画先、必要に応じて飛沫配列を変更する。
     *
     * @param {Particle[]} particles 更新する粒子配列。
     * @param {p5.Graphics} target 粒子の描画先。
     * @param {{style: ParticleStyle, canSpawnSplash: boolean}} options 描画スタイルと飛沫生成可否。
     * @returns {void}
     */
    updateParticleGroup(particles, target, options) {
        target.strokeWeight(options.style.weight);
        target.noFill();

        for (const particle of particles) {
            particle.applyGravity();
            particle.follow(this.flowField);
            particle.update();
            this.resolveParticleCollisions(
                particle,
                options.canSpawnSplash
            );

            const impact = particle.resetIfNeeded();

            particle.display(target);

            if (options.canSpawnSplash && impact) {
                this.splashSystem.emitFromBottom(impact);
            }
        }
    }

    updateFoamParticles() {
        for (const foam of this.foamParticles) {
            foam.applyGravity();
            foam.follow(this.flowField);
            foam.update();
            this.resolveParticleCollisions(foam, false);
            foam.resetIfNeeded();
            foam.display(this.waterLayers.foam);
        }
    }

    resolveParticleCollisions(particle, canSpawnSplash) {
        const collisions = this.collisionSystem.resolve(particle);

        for (const collision of collisions) {
            if (
                canSpawnSplash
                && particle.collisionCooldown <= 0
            ) {
                this.splashSystem.emitFromCollision(collision);
                particle.startCollisionCooldown(
                    this.config.collision.splashCooldownFrames
                );
            }
        }
    }

    updateSplashParticles() {
        this.splashSystem.update(
            this.flowField,
            this.waterLayers.splash
        );
    }

    renderLayers() {
        this.waterLayers.updateGlow();
        this.waterLayers.composite();
    }

    renderObstacles() {
        this.collisionSystem.display();
    }

    renderDebugOverlay() {
        this.debugOverlay.displayFlowField(this.flowField);
        this.debugOverlay.displayFps();
    }
}
