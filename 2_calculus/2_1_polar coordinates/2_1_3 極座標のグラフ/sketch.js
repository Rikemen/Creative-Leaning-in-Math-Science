let pos;
let currentTheta;
let r;
let speed = 0.1;

function setup() {
    createCanvas(600, 400);
    background(240);
    pos = createVector(50, height / 2);
    currentTheta = 0;
}

function draw() {
    fill(175);

    translate(width / 2, height / 2);

    //======Start パターン.1==============
    pos.x = 5 * currentTheta + 100 * cos(currentTheta);
    pos.y = 100 * sin(currentTheta * 2);
    ellipse(pos.x, pos.y, 5, 5);

    currentTheta += speed;

    //======End パターン.1==============

    //======Start パターン.2==============
    // r = 300 * cos(currentTheta);
    // pos = polarToCartesian(r, currentTheta);

    // ellipse(pos.x, pos.y, 5, 5);

    // currentTheta += speed;
    // if (currentTheta > Math.PI) {
    //     currentTheta = 0;
    //     console.log("currentTheta is reset", currentTheta);
    //     background(240);
    // }

    //======End パターン.2==============
}



/**
 * Converts polar coordinates (r, theta) to Cartesian coordinates (x, y).
 *
 * @param {number} r - The radial distance from the origin.
 * @param {number} theta - The angle in radians from the positive x-axis.
 * @returns {Object} An object with x and y properties representing the Cartesian coordinates.
 * @returns {number} return.x - The x-coordinate in Cartesian coordinates.
 * @returns {number} return.y - The y-coordinate in Cartesian coordinates.
 *
 * @example
 * // Convert polar coordinates (r = 5, theta = Math.PI / 4) to Cartesian coordinates.
 * const cartesian = polarToCartesian(5, Math.PI / 4);
 * console.log(cartesian); // { x: 3.535..., y: 3.535... }
 */
function polarToCartesian(r, theta) {
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return { x: x, y: y };
}

/**
 * Converts Cartesian coordinates (x, y) to polar coordinates (r, theta).
 *
 * @param {number} x - The x-coordinate in Cartesian coordinates.
 * @param {number} y - The y-coordinate in Cartesian coordinates.
 * @returns {Object} An object with r and theta properties representing the polar coordinates.
 * @returns {number} return.r - The radial distance from the origin.
 * @returns {number} return.theta - The angle in radians from the positive x-axis.
 *
 * @example
 * // Convert Cartesian coordinates (x = 3, y = 4) to polar coordinates.
 * const polar = cartesianToPolar(3, 4);
 * console.log(polar); // { r: 5, theta: 0.927... }
 */
function cartesianToPolar(x, y) {
    let r = Math.sqrt(x * x + y * y);
    let radians = Math.atan2(y, x);
    let theta = radians * (180 / Math.PI)
    return { r: r, theta: theta };

}