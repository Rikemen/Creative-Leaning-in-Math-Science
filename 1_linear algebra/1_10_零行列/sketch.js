
let a1 = new Matrix(2, 2);
let b1 = new Matrix(2, 2);


function setup() {
    createCanvas(windowWidth, windowHeight);
    //a1は零行列なのでtrue
    console.log("a1 is zeroMatrix or not ", a1.isZeroMatrix());

    //b1は零行列でないのでfalse
    let data = [[1, 2], [3, 4]];
    b1.set(data);
    console.log("b1 is zeroMatrix or not ", b1.isZeroMatrix());

}

function draw() {
    background(176, 224, 230);

}
