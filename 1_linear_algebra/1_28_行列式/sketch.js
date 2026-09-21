function setup() {
    createCanvas(windowWidth, windowHeight);

    console.log("=== #49：行列式 (Determinant) の計算例 ===");

    // 例1: 2x2 行列（ad - bc が基本）
    // det = 3*4 - 2*1 = 10
    const m2x2 = new Matrix(2, 2);
    m2x2.set([
        [3, 2],
        [1, 4]
    ]);
    console.log("--- 例1: 2x2 行列 ---");
    console.log("| 3  2 |");
    console.log("| 1  4 |");
    console.log("det =", m2x2.determinant(), " (期待値: 10)");

    // 例2: 3x3 行列（余因子展開が動く最小のケース）
    const m3x3 = new Matrix(3, 3);
    m3x3.set([
        [1, 2, 3],
        [0, 1, 4],
        [5, 6, 0]
    ]);
    console.log("--- 例2: 3x3 行列 ---");
    console.log("| 1  2  3 |");
    console.log("| 0  1  4 |");
    console.log("| 5  6  0 |");
    console.log("det =", m3x3.determinant(), " (期待値: 1)");

    // 例3: 線形従属な3x3行列（面積がつぶれるので det = 0）
    // 3行目 = 2×2行目 - 1行目 なので線形従属
    const m3x3dependent = new Matrix(3, 3);
    m3x3dependent.set([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]);
    console.log("--- 例3: 線形従属な3x3行列 ---");
    console.log("| 1  2  3 |");
    console.log("| 4  5  6 |  ← 行が線形従属");
    console.log("| 7  8  9 |");
    console.log("det =", m3x3dependent.determinant(), " (期待値: 0)");

    // 例4: 4x4 単位行列（空間を変形しないので det = 1）
    const m4x4identity = new Matrix(4, 4);
    m4x4identity.set([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]);
    console.log("--- 例4: 4x4 単位行列 ---");
    console.log("det =", m4x4identity.determinant(), " (期待値: 1)");

    // 例5: 4x4 複雑な行列（再帰が正しく動くかの確認）
    const m4x4 = new Matrix(4, 4);
    m4x4.set([
        [1, 0, 2, -1],
        [3, 0, 0, 5],
        [2, 1, 4, -3],
        [1, 0, 5, 0]
    ]);
    console.log("--- 例5: 4x4 複雑な行列 ---");
    console.log("det =", m4x4.determinant(), " (期待値: 30)");
}

function draw() {
    background(176, 224, 230);
}
