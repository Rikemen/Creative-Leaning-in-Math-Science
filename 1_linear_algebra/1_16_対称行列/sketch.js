
let a = new Matrix(3, 3);
let b = new Matrix(3, 3);

function setup() {
    createCanvas(windowWidth, windowHeight);

    let dataA = [[1, 2, 3], [2, 5, 0], [3, 0, 0]];
    let dataB = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    a.set(dataA);
    b.set(dataB);

    console.log("a is symmetric ? ", a.isSymmetricMatrix());
    console.log("b is symmetric ? ", b.isSymmetricMatrix());

}

function draw() {
    background(176, 224, 230);

}
