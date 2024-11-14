
let a1 = new Matrix(2, 2);
// let a2 = new Matrix(2, 3);
let a3 = new Matrix(2, 2);
// let a4 = new Matrix(1, 3);
// let a5 = new Matrix(3, 3);
let b1 = new Matrix(2, 2);


function setup() {
    createCanvas(windowWidth, windowHeight);
    let data = [[1, 2], [3, 4]];
    a1.set(data);
    a3.set(data);

    // console.log(a1.equals(a));
    console.log(a1.equals(a3));//true
    console.log(a1.equals(b1));




    // console.log("a1 first row is ", a1.getRow(0));
    // console.log("a1 first row is ", a1.getColumn(1));
    // console.log("a1 (2,1)element is ", a1.getElement(1,0));

    // console.log("a2 is ", a2.data);
    // console.log("a3 is ", a3.data);
    // console.log("a4 is ", a4.data);
    // console.log("a5 is ", a5.data);

    // a1.set(data);
    // console.log(a1.data);

    // console.log(a1.getElement(1, 1));

    // console.log(a1.getRow(0));

    // console.log(a1.getColumn(1));

    // b1.set(data);

    // console.log(a1.equals(b1));

}

function draw() {
    background(176, 224, 230);



}
