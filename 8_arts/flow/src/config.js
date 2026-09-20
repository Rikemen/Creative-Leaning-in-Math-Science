const CONFIG = {
    canvas: {
        pixelDensity: 1,
        targetFps: 60,
        backgroundColor: [0, 0, 0],
        // 軌跡の残りぐらい（値が小さいほど長く残る）
        trailFadeAlpha: 30
    },
    particle: {
        gravity: 0.03,
        resetMargin: 20,
        maxSpeed: 8,
        initialSpeedMin: 0.5,
        initialSpeedMax: 2,
        layers: {
            main: {
                count: 8000,
                color: [15, 90, 140],
                weight: 3,
                minLength: 4,
                maxLength: 22,
                minAlpha: 20,
                maxAlpha: 100,
                lifeMin: 360,
                lifeMax: 720
            },

            surface: {
                count: 4000,
                color: [100, 210, 255],
                weight: 1,
                minLength: 3,
                maxLength: 18,
                minAlpha: 60,
                maxAlpha: 220,
                lifeMin: 180,
                lifeMax: 420
            }
        }
    },

    foam: {
        count: 300,
        color: [235, 250, 255],
        sizeMin: 1,
        sizeMax: 4,
        maxAlpha: 220,
        lifeMin: 120,
        lifeMax: 300
    },

    splash: {
        color: [220, 245, 255],
        gravity: 0.08,

        normalSpeedMin: 1.5,
        normalSpeedMax: 4.5,
        tangentSpeedMin: -2,
        tangentSpeedMax: 2,

        lifeMin: 30,
        lifeMax: 80,
        sizeMin: 1,
        sizeMax: 3,

        // 下端へ到達した粒子から飛沫を出す確率
        spawnChance: 0.02,
        spawnCount: 3
    },

    render: {
        glowBlurRadius: 8,
        glowAlpha: 120,

        // 2なら2フレームごとにブラーを更新
        glowUpdateInterval: 2
    },
    flowField: {
        cellSize: 40,
        // 小さいほど大きく滑らかな渦になる
        noiseScale: 0.08,
        // 周辺差分を測定する距離
        sampleDistance: 0.01,
        // ノイズの時間変化
        timeSpeed: 0.003,
        // 粒子へ加える力
        strength: 0.04
    },
    obstacles: {
        fillColor: [8, 18, 28, 255],
        strokeColor: [70, 150, 190, 220],
        strokeWeight: 1,

        items: [
            {
                xRatio: 0.12,
                yRatio: 0.45,
                widthRatio: 0.32,
                height: 28
            },
            {
                xRatio: 0.58,
                yRatio: 0.68,
                widthRatio: 0.28,
                height: 32
            }
        ]
    },
    collision: {
        // 粒子を矩形面から少し離す距離
        padding: 0.5,

        // 接線速度を何割残すか
        tangentRetention: 0.94,

        // 上面で停止しないための最低接線速度
        minTangentSpeed: 0.8,

        // この速度以上の衝突だけ飛沫対象にする
        minSplashImpactSpeed: 1.2,

        splashChance: 0.18,
        splashCount: 4,
        splashCooldownFrames: 8
    },


    debug: {
        showFps: false,
        showFlowField: false,
        flowColor: [0, 255, 100, 120],
        flowLineLengthRatio: 0.4,
        flowLineWeight: 1
    }
};
