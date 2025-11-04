
let a = new Matrix(2, 3);


function setup() {
    createCanvas(windowWidth, windowHeight);

    let data = [[1, 2, 3], [4, 5, 6]];
    a.set(data);
    console.log("a is ", a);

    let t_a = a.transpose();
    console.log("transposed a is ", t_a);

}

function draw() {
    background(176, 224, 230);

}
