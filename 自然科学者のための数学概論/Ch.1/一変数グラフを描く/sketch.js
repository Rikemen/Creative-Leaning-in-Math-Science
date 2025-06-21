function setup() {
    createCanvas(800, 600);
    background(176, 224, 230);

    translate(width / 2, height / 2);

    stroke(0);
    noFill();
    // y = 2xをかく
    // beginShape();
    // for (let x = -width / 2; x < width / 2; x++) {
    //     let y = 2 * x;
    //     vertex(x, y);
    // }
    // endShape();


    // y = x ^2をかく
    // beginShape();
    // for (let x = -width / 2; x < width / 2; x++) {
    //     let scaledX = x / 10;
    //     let y = pow(scaledX, 2);
    //     vertex(x, y);
    // }
    // endShape();

    // y =sin(x)
    beginShape();
    for (let x = -width / 2; x < width / 2; x++) {
        let scaledX = x / 100;
        let y = sin(scaledX);
        let scaledY = y * 100;
        vertex(x, scaledY);
    }
    endShape();


}

function draw() {

}
