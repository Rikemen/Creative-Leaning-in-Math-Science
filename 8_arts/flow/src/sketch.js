let simulation;

function setup() {
    pixelDensity(CONFIG.canvas.pixelDensity);
    createCanvas(windowWidth, windowHeight);
    frameRate(CONFIG.canvas.targetFps);

    simulation = new WaterSimulation(CONFIG);
    simulation.initialize();
}

function draw() {
    simulation.updateAndRender();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    simulation.resize();
}
