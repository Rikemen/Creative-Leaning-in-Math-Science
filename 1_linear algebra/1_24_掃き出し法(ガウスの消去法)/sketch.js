function setup() {
    createCanvas(windowWidth, windowHeight);

    // 2✖︎2の例
    const matrix22 = new Matrix(2, 3);

    matrix22.set([
        [2, 3, 10],
        [2, -8, -12]
    ]);

    const result = matrix22.gaussianElimination();
    console.log("階段行列2*2:", result.data);

    // 出力
    //   [
    //     [1, 0, 2],
    //     [0, 1, 2]
    //   ]


    // 3✖︎3の例
    const matrix33 = new Matrix(3, 4);
    matrix33.set([
        [2, 1, -1, 8],
        [-3, -1, 2, -11],
        [-2, 1, 2, -3]
    ]);


    const result2 = matrix33.gaussianElimination();
    console.log("階段行列2*2:", result2.data);
    // 出力
    //   [
    //     [1, 0, 0, 2],
    //     [0, 1, 0, 3],
    //     [0, 0, 1, -1]
    //   ]



}

function draw() {
    background(176, 224, 230);
}
