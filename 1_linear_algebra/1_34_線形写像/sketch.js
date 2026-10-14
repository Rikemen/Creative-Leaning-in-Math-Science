let fixedVector;
let oldBasis;
let newBasis;
let targetBasisMatrix;
let currentT = 0;
let isAnimating = true;

function setup() {
    let canvas = createCanvas(600, 600);
    canvas.parent('tab-practice');

    // 任意のベクトル x を [3, 3]^T とする
    fixedVector = new Matrix(2, 1);
    fixedVector.set([[3], [3]]);

    // 標準基底 (old)
    let e1 = new Matrix(2, 1); e1.set([[1], [0]]);
    let e2 = new Matrix(2, 1); e2.set([[0], [1]]);
    oldBasis = [e1, e2];

    // 新しい基底 (new) : 例として [2, 1]^T と [-1, 1]^T
    let e1_prime = new Matrix(2, 1); e1_prime.set([[2], [1]]);
    let e2_prime = new Matrix(2, 1); e2_prime.set([[-1], [1]]);
    newBasis = [e1_prime, e2_prime];

    // 基底変換行列 P を生成 (今回は old が標準基底なので P = E_new)
    targetBasisMatrix = VectorSpaceElement.getChangeOfBasisMatrix(newBasis, oldBasis);
    
    console.log("=== 基底変換の実装確認 ===");
    console.log("新しい基底による変換行列 P:");
    console.table(targetBasisMatrix.data);
    
    console.log("Pの逆行列 P^{-1}:");
    let pInv = targetBasisMatrix.inverse();
    console.table(pInv.data);
    
    let newCoords = Matrix.multiplyMatrices(pInv, fixedVector);
    console.log("新しい基底での成分 (P^{-1} * x_old):");
    console.table(newCoords.data);
}

function draw() {
    background(250);

    // アニメーションの進行度 (0.0 〜 1.0) を正弦波で往復させる
    if (isAnimating) {
        currentT = (sin(frameCount * 0.02) + 1) / 2;
    }

    // 数学座標系への変換（中心を(0,0)とし、Y軸を上向きにする）
    push();
    translate(width / 2, height / 2);
    scale(1, -1);

    // 現在の基底ベクトルを計算 (lerp)
    let v1x = lerp(1, targetBasisMatrix.data[0][0], currentT);
    let v1y = lerp(0, targetBasisMatrix.data[1][0], currentT);
    let v2x = lerp(0, targetBasisMatrix.data[0][1], currentT);
    let v2y = lerp(1, targetBasisMatrix.data[1][1], currentT);

    // グリッドの描画
    drawGrid(v1x, v1y, v2x, v2y);

    // 固定ベクトル x の描画
    let scaleFactor = 40; // 1メモリのピクセル数
    stroke(231, 76, 60); // 赤色
    strokeWeight(4);
    drawArrow(0, 0, fixedVector.data[0][0] * scaleFactor, fixedVector.data[1][0] * scaleFactor);

    // 現在の基底ベクトルを描画
    stroke(41, 128, 185); // 青色 (v1)
    strokeWeight(3);
    drawArrow(0, 0, v1x * scaleFactor, v1y * scaleFactor);
    stroke(39, 174, 96); // 緑色 (v2)
    drawArrow(0, 0, v2x * scaleFactor, v2y * scaleFactor);

    pop(); // 座標変換を元に戻す

    // UI情報の描画 (通常のキャンバス座標系)
    drawInfo(v1x, v1y, v2x, v2y);
}

function drawGrid(v1x, v1y, v2x, v2y) {
    let scaleFactor = 40;
    stroke(220);
    strokeWeight(1);

    // 斜交グリッドを描画
    for (let i = -10; i <= 10; i++) {
        // v1方向の線（v2に沿って平行移動）
        line(
            (i * v2x - 10 * v1x) * scaleFactor, (i * v2y - 10 * v1y) * scaleFactor,
            (i * v2x + 10 * v1x) * scaleFactor, (i * v2y + 10 * v1y) * scaleFactor
        );
        // v2方向の線（v1に沿って平行移動）
        line(
            (i * v1x - 10 * v2x) * scaleFactor, (i * v1y - 10 * v2y) * scaleFactor,
            (i * v1x + 10 * v2x) * scaleFactor, (i * v1y + 10 * v2y) * scaleFactor
        );
    }
}

function drawArrow(x1, y1, x2, y2) {
    line(x1, y1, x2, y2);
    let angle = atan2(y2 - y1, x2 - x1);
    let arrowSize = 8;
    push();
    translate(x2, y2);
    rotate(angle);
    triangle(0, 0, -arrowSize, arrowSize/2, -arrowSize, -arrowSize/2);
    pop();
}

function drawInfo(v1x, v1y, v2x, v2y) {
    // 現在の変換行列 P_current
    let pCurrent = new Matrix(2, 2);
    pCurrent.set([[v1x, v2x], [v1y, v2y]]);

    // P_current の逆行列で成分を計算
    let pInv;
    try {
        pInv = pCurrent.inverse();
    } catch (e) {
        pInv = null; // 遷移途中で特異行列になるケースのフォールバック
    }

    fill(255, 240);
    noStroke();
    rect(10, 10, 220, 110, 8);

    fill(50);
    textSize(14);
    textStyle(BOLD);
    text("ベクトル x の成分表示", 20, 30);
    
    textStyle(NORMAL);
    if (pInv) {
        let coords = Matrix.multiplyMatrices(pInv, fixedVector);
        let cx = coords.data[0][0].toFixed(2);
        let cy = coords.data[1][0].toFixed(2);
        text(`成分: ( ${cx} ,  ${cy} )`, 20, 60);
    } else {
        text(`成分: 計算不可`, 20, 60);
    }

    text(`基底 v1: ( ${v1x.toFixed(2)}, ${v1y.toFixed(2)} )`, 20, 85);
    text(`基底 v2: ( ${v2x.toFixed(2)}, ${v2y.toFixed(2)} )`, 20, 105);
}

function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        isAnimating = !isAnimating;
    }
}
