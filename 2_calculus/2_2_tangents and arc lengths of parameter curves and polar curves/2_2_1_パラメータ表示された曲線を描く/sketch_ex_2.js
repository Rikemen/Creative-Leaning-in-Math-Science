//例2 紙飛行機
let pos;
let r;
let currentTheta;

function setup() {
    createCanvas(800, 800);
    background(240);
    pos = createVector(0, 0);
    r = 50;
    currentTheta = 0;
}

function draw() {
    fill(175);
    translate(width / 2, height / 2);

    pos.x = r * currentTheta - 3 * r * sin(currentTheta);
    pos.y = -3 * r * cos(currentTheta);
    fill(255);
    stroke(0);
    ellipse(pos.x, pos.y, 10, 10);
    currentTheta += 0.2

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