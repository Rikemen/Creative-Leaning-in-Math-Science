function setup() {
    createCanvas(windowWidth, windowHeight);

    console.log("=== 連立方程式を解く例 ===\n");

    // 例1: 一意な解を持つ連立方程式
    // 2x + 3y = 10
    // 2x - 8y = -12
    console.log("例1: 一意な解を持つ連立方程式");
    console.log("2x + 3y = 10");
    console.log("2x - 8y = -12");
    const system1 = new Matrix(2, 3);
    system1.set([
        [2, 3, 10],
        [2, -8, -12]
    ]);
    const result1 = system1.solveLinearSystem();
    console.log("結果:", result1.message);
    if (result1.solution) {
        console.log("解:");
        console.log("x =", result1.solution.data[0][0]);
        console.log("y =", result1.solution.data[1][0]);
    }
    console.log("係数行列のrank:", system1.rank());
    console.log("\n");

    // 例2: 解なしの連立方程式
    // x + y = 1
    // x + y = 2
    console.log("例2: 解なしの連立方程式");
    console.log("x + y = 1");
    console.log("x + y = 2");
    const system2 = new Matrix(2, 3);
    system2.set([
        [1, 1, 1],
        [1, 1, 2]
    ]);
    const result2 = system2.solveLinearSystem();
    console.log("結果:", result2.message);
    console.log("\n");

    // 例3: 一意でない解を持つ連立方程式
    // x + y = 1
    // 2x + 2y = 2
    console.log("例3: 一意でない解を持つ連立方程式");
    console.log("x + y = 1");
    console.log("2x + 2y = 2");
    const system3 = new Matrix(2, 3);
    system3.set([
        [1, 1, 1],
        [2, 2, 2]
    ]);
    const result3 = system3.solveLinearSystem();
    console.log("結果:", result3.message);
    console.log("\n");

    // 例4: 3変数の連立方程式（一意な解）
    // 2x + y - z = 8
    // -3x - y + 2z = -11
    // -2x + y + 2z = -3
    console.log("例4: 3変数の連立方程式（一意な解）");
    console.log("2x + y - z = 8");
    console.log("-3x - y + 2z = -11");
    console.log("-2x + y + 2z = -3");
    const system4 = new Matrix(3, 4);
    system4.set([
        [2, 1, -1, 8],
        [-3, -1, 2, -11],
        [-2, 1, 2, -3]
    ]);
    const result4 = system4.solveLinearSystem();
    console.log("結果:", result4.message);
    if (result4.solution) {
        console.log("解:");
        console.log("x =", result4.solution.data[0][0]);
        console.log("y =", result4.solution.data[1][0]);
        console.log("z =", result4.solution.data[2][0]);
    }
    console.log("\n");

}

function draw() {
    background(176, 224, 230);
}
