
let a = new Matrix(2, 3);
let b = new Matrix(3, 2);
let c = new Matrix(1, 4);

function setup() {
    createCanvas(windowWidth, windowHeight);

    let dataA = [[1, 2, 3], [4, 5, 6]];
    let dataB = [[-1, -2], [-3, -4], [5, 0]];
    let dataC = [[1, 2, 3, 4]];
    a.set(dataA);
    b.set(dataB);
    c.set(dataC);

    let result = Matrix.multiplyMatrices(a, b);
    // let result = Matrix.multiplyMatrices(b, a);

    console.log("result: ", result.data);

    //m✖︎n, n✖︎pの関係になっていない行列同士の積は定義できずエラーとなる。
    // let result2 = Matrix.multiplyMatrices(c, a);



    



}

function draw() {
    background(176, 224, 230);

}
