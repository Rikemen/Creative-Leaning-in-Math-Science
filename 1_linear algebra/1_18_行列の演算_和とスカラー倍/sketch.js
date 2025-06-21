
let a = new Matrix(2, 2); //3次の行ベクトル
let b = new Matrix(2, 2); //3次の列ベクトル
let c = new Matrix(1, 3);

function setup() {
    createCanvas(windowWidth, windowHeight);

    let dataA = [[1, 0], [0, 1]];
    let dataB = [[1, 2], [2, -1]];
    a.set(dataA);
    b.set(dataB);

    console.log("a + b is ", a.add(b).data); //元のaに変更が加わる
    console.log("a + b is ", Matrix.add(a, b).data); //元のaは変化しない
    console.log("a is ", a.data);
    // console.log("a + c is ", a.add(c));

    let d = 10;
    console.log("a scaled by 10 is ", a.scale(d).data); //元のaに変更が加わる
    console.log("a scaled by 10 is ", Matrix.scale(a, d).data); //元のaは変化しない
    console.log("a is ", a.data);





}

function draw() {
    background(176, 224, 230);

}
