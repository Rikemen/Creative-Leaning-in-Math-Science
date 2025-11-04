
let a1 = new Matrix(3, 3);
let a2 = new Matrix(3, 3);
let a3 = new Matrix(3, 3);
let a4 = new Matrix(3, 3);

let b = new Matrix(2, 3); //正方行列でない


function setup() {
    createCanvas(windowWidth, windowHeight);
    let data1 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; //単位行列 
    let data2 = [[1, 1, 1], [0, 2, 0], [0, 0, 3]]; //上三角
    let data3 = [[3, 0, 0], [0, 3, 0], [1, 0, 3]]; //下三角
    let data4 = [[1, 1, 1], [3, 1, 0], [0, 0, 1]]; //上でも下三角でもない

    a1.set(data1);
    a2.set(data2);
    a3.set(data3);
    a4.set(data4);

    console.log("a1 is upper matrix or not ", a1.isUpperTriangularMatrix());
    console.log("a2 is upper matrix or not ", a2.isUpperTriangularMatrix());
    console.log("a3 is upper matrix or not ", a3.isUpperTriangularMatrix());
    console.log("a4 is upper matrix or not ", a4.isUpperTriangularMatrix());
    console.log("b is upper matrix or not ", b.isUpperTriangularMatrix());


    console.log("a1 is lower matrix or not ", a1.isLowerTriangularMatrix());
    console.log("a2 is lower matrix or not ", a2.isLowerTriangularMatrix());
    console.log("a3 is lower matrix or not ", a3.isLowerTriangularMatrix());
    console.log("a4 is lower matrix or not ", a4.isLowerTriangularMatrix());
    console.log("b is lower matrix or not ", b.isLowerTriangularMatrix());


}

function draw() {
    background(176, 224, 230);

}
