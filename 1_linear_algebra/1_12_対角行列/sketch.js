
let a1 = new Matrix(3, 3);
let a2 = new Matrix(3, 3);
let a3 = new Matrix(3, 3);
let a4 = new Matrix(3, 3);

let b = new Matrix(2, 3);


function setup() {
    createCanvas(windowWidth, windowHeight);
    let data1 = [[1, 0, 0], [0, 2, 0], [0, 0, 3]];
    let data2 = [[1, 1, 1], [0, 2, 0], [0, 0, 3]];
    let data3 = [[3, 0, 0], [0, 3, 0], [0, 0, 3]];
    let data4 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

    a1.set(data1);
    a2.set(data2);
    a3.set(data3);
    a4.set(data4);

    console.log("a1 is diagonal or not ", a1.isDiagonalMatrix());
    console.log("a2 is diagonal or not ", a2.isDiagonalMatrix());
    console.log("a3 is diagonal or not ", a3.isDiagonalMatrix());
    console.log("a4 is diagonal or not ", a4.isDiagonalMatrix());
    console.log("b is diagonal or not ", b.isDiagonalMatrix());


    console.log("a1 is scaler or not ", a1.isScalarlMatrix());
    console.log("a2 is scaler or not ", a2.isScalarlMatrix());
    console.log("a3 is scaler or not ", a3.isScalarlMatrix());
    console.log("a4 is scaler or not ", a4.isScalarlMatrix());
    console.log("b  is scaler or not ", b.isScalarlMatrix());

    console.log("a1 is identity or not ", a1.isIdentityMatrix());
    console.log("a2 is identity or not ", a2.isIdentityMatrix());
    console.log("a3 is identity or not ", a3.isIdentityMatrix());
    console.log("a4 is identity or not ", a4.isIdentityMatrix());
    console.log("b  is identity or not ", b.isIdentityMatrix());

}

function draw() {
    background(176, 224, 230);

}
