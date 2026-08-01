const particles = [];

const PIXEL_DENSITY = 1;
const TARGET_FPS = 60;
const SHOW_FPS = true;

const BACKGROUND_COLOR = [0, 0, 0];
const WATER_COLOR = [255, 255, 255, 175];
const PARTICLE_COUNT = 10000;


const GRAVITY = 0.03;
const PARTICLE_SIZE = 3;
const RESET_MARGIN = 20;

class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, random(0.5, 2));
        this.acc = createVector(0, 0);

    }
    applyGravity() {
        this.acc.y += GRAVITY;
    }
    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    resetIfNeeded() {
        if (this.pos.y > height + RESET_MARGIN) {
            this.pos.set(
                random(width),
                random(-RESET_MARGIN, 0)
            );
            this.vel.set(0, random(0.5, 2));
            this.acc.set(0, 0);
        }
    }
    display() {
        noStroke();
        fill(...WATER_COLOR);
        ellipse(this.pos.x, this.pos.y, PARTICLE_SIZE, PARTICLE_SIZE);
    }
}

function setup() {
    pixelDensity(PIXEL_DENSITY);
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

function draw() {
    background(...BACKGROUND_COLOR);
    for (const particle of particles) {
        particle.applyGravity();
        particle.update();
        particle.resetIfNeeded();
        particle.display();
    }
    if (SHOW_FPS) {
        drawFps();
    }

}

function drawFps() {
    push();
    noStroke();
    fill(0, 0, 0, 160);
    rect(8, 8, 100, 28, 4);
    fill(255);
    textSize(14);
    textAlign(LEFT, CENTER);
    text(`FPS: ${frameRate().toFixed(1)}`, 16, 22);
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}