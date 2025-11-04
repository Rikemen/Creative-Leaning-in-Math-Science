//========Start ベクトル版=====

let vec2d_A, vec2d_B, vec2d_C, vec2d_D;
let vec3d_A, vec3d_B, vec3d_C, vec3d_D;

function setup() {
    createCanvas(800, 400, WEBGL);
    vec2d_A = createVector(2, 0);
    vec2d_B = createVector(0, 2);
    vec2d_C = createVector(0, -2);
    vec2d_D = createVector(2, 2);

    let dot2AB = p5.Vector.dot(vec2d_A, vec2d_B);
    let dot2BC = p5.Vector.dot(vec2d_B, vec2d_C);
    let dot2AD = p5.Vector.dot(vec2d_A, vec2d_D);
    // console.log(`dot2AB is ${dot2AB}, dot2BC is ${dot2BC}, dot2AD is ${dot2AD}`);

    vec3d_A = createVector(2, 0, 1);
    vec3d_B = createVector(2, 2, 1);
    vec3d_C = createVector(0, -2, 0);
    vec3d_D = createVector(2, 2, 0);

    let dot3AB = p5.Vector.cross(vec3d_A, vec3d_B);
    let dot3BC = p5.Vector.cross(vec3d_B, vec3d_A);
    let dot3AD = p5.Vector.cross(vec3d_A, vec3d_D);
    console.log(`dot3AB is ${dot3AB}, dot3BC is ${dot3BC}, dot3AD is ${dot3AD}`);



}

function draw() {
    background(176, 224, 230);

}

//========End ベクトル版===== 