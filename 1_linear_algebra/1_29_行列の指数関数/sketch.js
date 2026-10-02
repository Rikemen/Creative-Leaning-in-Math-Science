function setup() {
    createCanvas(windowWidth, windowHeight);

    console.log("=== #52：行列の指数関数 (Matrix Exponential) の計算例 ===");

    // 例1: べき零行列 (Nilpotent Matrix) の指数関数
    // A^2 = 0 なので e^A = I + A になるはず
    const m1 = new Matrix(2, 2);
    m1.set([
        [0, 1],
        [0, 0]
    ]);
    console.log("--- 例1: べき零行列 ---");
    console.log("| 0  1 |");
    console.log("| 0  0 |");
    console.log("e^A =");
    console.log(m1.exp().data); // 期待値: [[1, 1], [0, 1]]

    // 例2: 対角行列の指数関数
    // 対角成分がそれぞれ e^x になる
    const m2 = new Matrix(2, 2);
    m2.set([
        [2, 0],
        [0, 3]
    ]);
    console.log("--- 例2: 対角行列 ---");
    console.log("| 2  0 |");
    console.log("| 0  3 |");
    console.log("e^A =");
    console.log(m2.exp().data); 
    // 期待値: [[e^2, 0], [0, e^3]] => [[7.389..., 0], [0, 20.085...]]

    // 例3: 回転行列の生成子の指数関数
    // A = [[0, -PI/2], [PI/2, 0]] の指数関数は 90度の回転行列になる
    const m3 = new Matrix(2, 2);
    m3.set([
        [0, -Math.PI / 2],
        [Math.PI / 2, 0]
    ]);
    console.log("--- 例3: 回転行列の生成子 ---");
    console.log("|   0    -PI/2 |");
    console.log("|  PI/2    0   |");
    console.log("e^A =");
    console.log(m3.exp(100).data); // テイラー展開を100項まで計算して精度を上げる
    // 期待値: 近似的に [[0, -1], [1, 0]]
}

function draw() {
    background(176, 224, 230);
}
