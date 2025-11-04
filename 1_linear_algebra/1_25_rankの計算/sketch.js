function setup() {
    createCanvas(windowWidth, windowHeight);

    // 2✖︎3の例
    const matrix23 = new Matrix(2, 3);

    matrix23.set([
        [2, 3, 10],
        [2, -8, -12]
    ]);

    //ランクを求める
    console.log("matrix23's rank is ", matrix23.rank());


    // 3✖︎3の例
    const matrix33 = new Matrix(3, 3);
    matrix33.set([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]);
    console.log("matrix33's rank is ", matrix33.rank());



    // 3✖︎3の例
    const matrix44 = new Matrix(4, 4);
    matrix44.set([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]
    ]);
    console.log("matrix44 is ", matrix44);
    console.log("matrix44's rank is ", matrix44.rank());

    // 3✖︎1の例
    const matrix31 = new Matrix(3, 1);
    matrix31.set([
        [1],
        [0],
        [1]
    ]);
    console.log("matrix31 is ", matrix31);
    console.log("matrix31's rank is ", matrix31.rank());


}

function draw() {
    background(176, 224, 230);
}
