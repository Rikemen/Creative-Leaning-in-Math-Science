
let a = new Matrix(1, 3); //3次の行ベクトル
let b = new Matrix(3, 1); //3次の列ベクトル

function setup() {
    createCanvas(windowWidth, windowHeight);

    let dataA = [[1, 2, 3]];
    let dataB = [[1], [2], [3]];
    a.set(dataA);
    b.set(dataB);

    console.log("a is ", a.data);
    console.log("b is ", b.data);

}

function draw() {
    background(176, 224, 230);

}
