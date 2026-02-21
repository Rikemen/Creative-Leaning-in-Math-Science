/**
 * グラフ描画の設定
 */
const CONFIG = {
    cellSize: 50,  // グリッド1マスのピクセル数
    scale: 50,     // 数学的な「1」が何ピクセルに相当するか
    canvasTitle: "自然科学者のための数学概論 - グラフ描画例",
    colors: {
        background: [176, 224, 230],
        grid: 230,
        axis: 255,
        text: 0,
        graph: 0,
        pointer: [255, 0, 0] // ポインタを目立たせるために赤に変更
    }
};

/**
 * p5.jsの初期設定
 */
function setup() {
    createCanvas(800, 600);
    render();
}

/**
 * キャンバス全体の再描画処理
 */
function render() {
    background(CONFIG.colors.background);

    push();
    // 原点をキャンバスの中心に移動
    translate(width / 2, height / 2);

    drawGrid();
    drawAxis();
    drawGraph();
    pop();
}

/**
 * 座標平面上にグリッド線と目盛り数値を描画する
 */
function drawGrid() {
    stroke(CONFIG.colors.grid);
    strokeWeight(1);
    textSize(10);
    fill(CONFIG.colors.text);

    // 縦線の描画
    for (let x = -width / 2; x < width / 2; x += CONFIG.cellSize) {
        line(x, -height / 2, x, height / 2);
        if (x !== 0) {
            const val = x / CONFIG.scale;
            noStroke();
            text(val.toFixed(1), x + 2, -5);
            stroke(CONFIG.colors.grid);
        }
    }

    // 横線の描画
    for (let y = -height / 2; y < height / 2; y += CONFIG.cellSize) {
        line(-width / 2, y, width / 2, y);
        if (y !== 0) {
            const val = -y / CONFIG.scale;
            noStroke();
            text(val.toFixed(1), 5, y - 2);
            stroke(CONFIG.colors.grid);
        }
    }
}

/**
 * 座標平面の主軸（x軸・y軸）および軸ラベルを描画する
 */
function drawAxis() {
    stroke(CONFIG.colors.axis);
    strokeWeight(2);

    // x軸・y軸
    line(-width / 2, 0, width / 2, 0);
    line(0, -height / 2, 0, height / 2);

    // 原点
    fill(CONFIG.colors.text);
    noStroke();
    textSize(15);
    text("0", -15, 15);

    // 軸ラベル
    text("x", width / 2 - 20, -10);
    text("y", 10, -height / 2 + 20);
}

/**
 * 数学的関数 f(x) = 1 / (x - 1) を描画する
 */
function drawGraph() {
    stroke(CONFIG.colors.graph);
    strokeWeight(2);
    noFill();

    // 漸近線 x = 1 (ピクセル座標では CONFIG.scale)
    const asymptoteX = CONFIG.scale;

    // 左側の枝
    drawCurveSegment(-width / 2, asymptoteX - 1);
    // 右側の枝
    drawCurveSegment(asymptoteX + 1, width / 2);
}

/**
 * 特定の区間内で曲線を一続きの線として描画する
 * @param {number} startX - 開始xピクセル座標
 * @param {number} endX - 終了xピクセル座標
 */
function drawCurveSegment(startX, endX) {
    beginShape();
    for (let x = startX; x <= endX; x += 1) {
        const mx = x / CONFIG.scale;
        const my = targetMathFunction(mx);
        const sy = -my * CONFIG.scale;

        // 描画範囲外に大きな値が出た場合のガード（y軸方向のクリッピング補助）
        if (abs(sy) < height) {
            vertex(x, sy);
        } else {
            // 描画範囲外に出る直前で一旦打ち切ることで、接続を綺麗にする
            endShape();
            beginShape();
        }
    }
    endShape();
}

/**
 * マウスがクリックされた位置に関数上のポインタを表示する
 */
function mousePressed() {
    // 描画を一度クリアして再描画（古いポインタを消すため）
    render();

    push();
    translate(width / 2, height / 2);

    const mx = (mouseX - width / 2) / CONFIG.scale;
    drawPointer(mx);
    pop();
}

/**
 * 数学的なx値に基づき、関数上の点にポインタを描画する
 * @param {number} mx - 数学的なx値
 */
function drawPointer(mx) {
    const my = targetMathFunction(mx);
    const sx = mx * CONFIG.scale;
    const sy = -my * CONFIG.scale;

    // ポインタの点
    stroke(CONFIG.colors.pointer);
    strokeWeight(8);
    point(sx, sy);

    // 座標ラベル
    noStroke();
    fill(CONFIG.colors.text);
    textSize(12);
    text(`(${mx.toFixed(2)}, ${my.toFixed(2)})`, sx + 10, sy - 10);
}

/**
 * 描画対象の純粋な数学的関数
 * @param {number} x - 数学的な入力値 x
 * @returns {number} 数学的な出力値 y
 */
function targetMathFunction(x) {
    // f(x) = 1 / (x - 1)
    if (x === 1) return Infinity;
    return 1 / (x - 1);
}