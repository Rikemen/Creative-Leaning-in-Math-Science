/**
 * FPSと流れ場のデバッグ表示を作品の合成後に描画する。
 */
class DebugOverlay {
    /**
     * @param {Object} config デバッグ表示設定。
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * 設定が有効な場合、現在のFPSを画面左上へ描画する。
     * p5.jsの描画状態はメソッド終了時に復元される。
     *
     * @returns {void}
     */
    displayFps() {
        if (!this.config.showFps) {
            return;
        }

        push();
        noStroke();
        fill(0, 0, 0, 160);
        rect(8, 8, 100, 28, 4);
        fill(255);
        textSize(14);
        textAlign(LEFT, CENTER);
        text(`FPS: ${frameRate().toFixed(1)}`, 16, 22);
        pop();
    }

    /**
     * 設定が有効な場合、現在の流れベクトルを描画する。
     *
     * @param {FlowField} flowField 描画対象の流れ場。
     * @returns {void}
     */
    displayFlowField(flowField) {
        if (this.config.showFlowField) {
            flowField.display();
        }
    }
}
