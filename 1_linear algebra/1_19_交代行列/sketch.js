
let a = new Matrix(3, 3); 
let b = new Matrix(3, 3); 

function setup() {
    createCanvas(windowWidth, windowHeight);

    let dataA = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let dataB = [[0, 2, -3], [-2, 0, 4], [3, -4, 0]];
    a.set(dataA);
    b.set(dataB);

    console.log("a is alternating Matrix or not ", a.isAlternatingMatrix());
    console.log("b is alternating Matrix or not ", b.isAlternatingMatrix());



}

function draw() {
    background(176, 224, 230);

}
