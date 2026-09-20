/**
 * Curl Noiseから画面全体の流れベクトル格子を生成する。
 */
class FlowField {
    /**
     * @param {Object} config 流れ場の格子・ノイズ・強度設定。
     * @param {Object} debugConfig 流れベクトルのデバッグ描画設定。
     */
    constructor(config, debugConfig) {
        this.config = config;
        this.debugConfig = debugConfig;
        this.cellSize = config.cellSize;
        this.time = 0;
        this.resize();
    }

    /**
     * 現在のCanvas寸法に合わせてベクトル格子を再生成する。
     *
     * @returns {void}
     */
    resize() {
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.vectors = Array.from(
            { length: this.cols * this.rows },
            () => createVector(0, 0)
        );
    }

    /**
     * @param {number} col 0始まりの列番号。
     * @param {number} row 0始まりの行番号。
     * @returns {number} 1次元ベクトル配列のindex。
     */
    getIndex(col, row) {
        return col + row * this.cols;
    }

    /**
     * ノイズ勾配から全格子点の流れベクトルを更新し、時刻を1フレーム進める。
     *
     * @returns {void}
     */
    update() {
        const noiseScale = this.config.noiseScale;
        const epsilon = this.config.sampleDistance;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // ノイズ空間上の座標
                const x = (col + 1) * noiseScale;
                const y = (row + 1) * noiseScale;

                // 現在位置の左右にあるノイズ値
                const noiseLeft = noise(
                    x - epsilon,
                    y,
                    this.time
                );
                const noiseRight = noise(
                    x + epsilon,
                    y,
                    this.time
                );
                const noiseUp = noise(
                    x,
                    y - epsilon,
                    this.time
                );
                const noiseDown = noise(
                    x,
                    y + epsilon,
                    this.time
                );

                // ノイズ値の傾き
                const gradientX =
                    (noiseRight - noiseLeft) / (2 * epsilon);

                const gradientY =
                    (noiseDown - noiseUp) / (2 * epsilon);

                /*
                 * 勾配 (gradientX, gradientY) を
                 * 90度回転して流れの方向にする。
                 *
                 * (x, y) → (y, -x)
                 */
                const curlX = gradientY;
                const curlY = -gradientX;
                const index = this.getIndex(col, row);
                const vector = this.vectors[index];
                vector.set(curlX, curlY);

                // 勾配がほぼ0の場合は方向を設定しない。
                if (vector.magSq() > 0.000001) {
                    vector.setMag(this.config.strength);
                } else {
                    vector.set(0, 0);
                }
            }
        }
        this.time += this.config.timeSpeed;
    }

    /**
     * 指定位置を含むセルの流れベクトルを返す。
     * 戻り値は内部で再利用するため、呼び出し側では変更しない。
     *
     * @param {Vector2} pos 画面上の位置（px）。
     * @returns {p5.Vector} 現在位置の流れベクトル。
     */
    lookup(pos) {
        const col = constrain(
            floor(pos.x / this.cellSize),
            0,
            this.cols - 1
        );
        const row = constrain(
            floor(pos.y / this.cellSize),
            0,
            this.rows - 1
        );
        return this.vectors[this.getIndex(col, row)];
    }

    /**
     * 全セルの流れ方向をメインキャンバスへ描画する。
     *
     * @returns {void}
     */
    display() {
        push();
        stroke(...this.debugConfig.flowColor);
        strokeWeight(this.debugConfig.flowLineWeight);
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = this.getIndex(col, row);
                const direction = this.vectors[index]
                    .copy();
                if (direction.magSq() > 0) {
                    direction.setMag(
                        this.cellSize
                        * this.debugConfig.flowLineLengthRatio
                    );
                }

                const x = (col + 0.5) * this.cellSize;
                const y = (row + 0.5) * this.cellSize;

                line(
                    x,
                    y,
                    x + direction.x,
                    y + direction.y
                );
            }
        }
        pop();
    }
}
