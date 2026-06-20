const drops = [];
const bubbles = [];
const themes = [
  {
    id: 'crystal',
    name: 'Crystal Bubble',
    description: 'Crystal Bubble: transparent glass, pale drops, and bright reflections.',
    background: 'white',
    palette: [
      { core: [104, 221, 255], edge: [16, 132, 190], lift: -0.028 },
      { core: [255, 199, 105], edge: [210, 123, 36], lift: 0.032 },
      { core: [255, 137, 221], edge: [145, 86, 214], lift: -0.022 },
      { core: [137, 232, 184], edge: [26, 145, 118], lift: 0.025 },
    ],
    dropAlpha: 1,
    bubbleScale: 1,
    bridgeAlpha: 34,
    vessel: 'glass',
    viscosity: 0.988,
    speedLimit: 3.1,
  },
  {
    id: 'lava',
    name: 'Lava Lamp',
    description: 'Lava Lamp: warm heavy blobs stretch like a retro lamp.',
    background: 'lava',
    palette: [
      { core: [255, 86, 40], edge: [124, 19, 22], lift: -0.018 },
      { core: [255, 190, 53], edge: [193, 73, 16], lift: 0.02 },
      { core: [255, 69, 119], edge: [105, 30, 92], lift: -0.015 },
    ],
    dropAlpha: 1.7,
    bubbleScale: 0.35,
    bridgeAlpha: 72,
    vessel: 'lamp',
    viscosity: 0.994,
    speedLimit: 2.2,
  },
  {
    id: 'deep',
    name: 'Deep Sea',
    description: 'Deep Sea: luminous droplets drift through dark blue water.',
    background: 'deep',
    palette: [
      { core: [41, 244, 255], edge: [10, 95, 180], lift: -0.022 },
      { core: [75, 132, 255], edge: [15, 41, 120], lift: 0.024 },
      { core: [151, 255, 220], edge: [29, 126, 131], lift: -0.018 },
    ],
    dropAlpha: 1.45,
    bubbleScale: 0.85,
    bridgeAlpha: 58,
    vessel: 'submarine',
    viscosity: 0.99,
    speedLimit: 2.7,
  },
  {
    id: 'candy',
    name: 'Candy Syrup',
    description: 'Candy Syrup: glossy pastel syrup moves slowly and heavily.',
    background: 'candy',
    palette: [
      { core: [255, 109, 190], edge: [211, 57, 132], lift: -0.018 },
      { core: [255, 229, 92], edge: [224, 149, 42], lift: 0.02 },
      { core: [85, 218, 255], edge: [40, 139, 216], lift: -0.014 },
      { core: [177, 125, 255], edge: [113, 67, 199], lift: 0.017 },
    ],
    dropAlpha: 1.35,
    bubbleScale: 0.45,
    bridgeAlpha: 62,
    vessel: 'rounded',
    viscosity: 0.993,
    speedLimit: 2.1,
  },
  {
    id: 'mono',
    name: 'Monochrome Glass',
    description: 'Monochrome Glass: grayscale oil defined by refraction and edges.',
    background: 'mono',
    palette: [
      { core: [238, 242, 244], edge: [58, 68, 75], lift: -0.022 },
      { core: [196, 205, 211], edge: [82, 89, 96], lift: 0.024 },
      { core: [255, 255, 255], edge: [120, 128, 135], lift: -0.017 },
    ],
    dropAlpha: 1.05,
    bubbleScale: 0.7,
    bridgeAlpha: 28,
    vessel: 'minimal',
    viscosity: 0.989,
    speedLimit: 2.5,
  },
  {
    id: 'aurora',
    name: 'Aurora Oil',
    description: 'Aurora Oil: thin luminous films drift like northern lights.',
    background: 'aurora',
    palette: [
      { core: [87, 255, 198], edge: [20, 157, 142], lift: -0.024 },
      { core: [111, 168, 255], edge: [65, 75, 201], lift: 0.025 },
      { core: [226, 106, 255], edge: [111, 62, 188], lift: -0.02 },
    ],
    dropAlpha: 1.2,
    bubbleScale: 0.5,
    bridgeAlpha: 54,
    vessel: 'tall',
    viscosity: 0.991,
    speedLimit: 2.8,
  },
  {
    id: 'lab',
    name: 'Laboratory',
    description: 'Laboratory: measured bubbles inside a marked test tube.',
    background: 'lab',
    palette: [
      { core: [68, 203, 255], edge: [15, 108, 168], lift: -0.026 },
      { core: [160, 236, 255], edge: [50, 134, 178], lift: 0.028 },
      { core: [226, 252, 255], edge: [85, 155, 186], lift: -0.02 },
    ],
    dropAlpha: 0.85,
    bubbleScale: 1.35,
    bridgeAlpha: 20,
    vessel: 'lab',
    viscosity: 0.987,
    speedLimit: 2.7,
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    description: 'Golden Hour: amber oil catches warm sunset reflections.',
    background: 'gold',
    palette: [
      { core: [255, 190, 69], edge: [166, 87, 21], lift: -0.025 },
      { core: [255, 232, 147], edge: [202, 131, 40], lift: 0.026 },
      { core: [238, 117, 62], edge: [145, 55, 28], lift: -0.018 },
    ],
    dropAlpha: 1.3,
    bubbleScale: 0.65,
    bridgeAlpha: 48,
    vessel: 'warmGlass',
    viscosity: 0.99,
    speedLimit: 2.6,
  },
  {
    id: 'neon',
    name: 'Neon Sign',
    description: 'Neon Sign: bright outlines glow on a black stage.',
    background: 'neon',
    palette: [
      { core: [0, 255, 240], edge: [0, 122, 255], lift: -0.025 },
      { core: [255, 0, 190], edge: [122, 36, 255], lift: 0.026 },
      { core: [255, 236, 54], edge: [255, 110, 20], lift: -0.02 },
    ],
    dropAlpha: 1.55,
    bubbleScale: 0.55,
    bridgeAlpha: 74,
    vessel: 'neon',
    viscosity: 0.989,
    speedLimit: 3,
  },
  {
    id: 'ink',
    name: 'Ink Wash',
    description: 'Ink Wash: smoky black ink spreads through quiet water.',
    background: 'ink',
    palette: [
      { core: [40, 48, 56], edge: [5, 9, 12], lift: -0.016 },
      { core: [93, 102, 116], edge: [25, 30, 38], lift: 0.018 },
      { core: [133, 145, 158], edge: [54, 59, 69], lift: -0.012 },
    ],
    dropAlpha: 0.95,
    bubbleScale: 0.25,
    bridgeAlpha: 44,
    vessel: 'paper',
    viscosity: 0.996,
    speedLimit: 1.8,
  },
  {
    id: 'neumo',
    name: 'Neumorphic Glass',
    description: 'Neumorphic Glass: only white and transparent material, with a realistic raised glass tube.',
    background: 'neumo',
    palette: [
      { core: [255, 255, 255], edge: [224, 230, 235], lift: -0.017 },
      { core: [248, 250, 252], edge: [210, 216, 222], lift: 0.019 },
      { core: [255, 255, 255], edge: [236, 240, 244], lift: -0.014 },
    ],
    dropAlpha: 0.82,
    bubbleScale: 1.05,
    bridgeAlpha: 16,
    vessel: 'neumo',
    viscosity: 0.994,
    speedLimit: 1.65,
  },
  {
    id: 'liquid',
    name: 'Liquid Glass',
    description: 'Liquid Glass: floating translucent OS-style glass with soft refraction and spectral edges.',
    background: 'liquid',
    palette: [
      { core: [250, 255, 255], edge: [158, 223, 255], lift: -0.021 },
      { core: [255, 255, 255], edge: [205, 178, 255], lift: 0.022 },
      { core: [244, 255, 253], edge: [170, 242, 224], lift: -0.018 },
      { core: [255, 253, 248], edge: [255, 215, 165], lift: 0.019 },
    ],
    dropAlpha: 0.96,
    bubbleScale: 0.72,
    bridgeAlpha: 24,
    vessel: 'liquid',
    viscosity: 0.991,
    speedLimit: 2.15,
  },
  {
    id: 'stair',
    name: 'Stair Drop',
    description: 'Stair Drop: droplets roll across transparent steps and fall one level at a time.',
    background: 'stair',
    palette: [
      { core: [110, 212, 255], edge: [34, 126, 190], lift: 0.02 },
      { core: [255, 255, 255], edge: [150, 205, 232], lift: 0.018 },
      { core: [190, 240, 255], edge: [85, 158, 210], lift: 0.021 },
    ],
    dropAlpha: 1,
    bubbleScale: 0.45,
    bridgeAlpha: 10,
    vessel: 'stair',
    viscosity: 0.988,
    speedLimit: 3,
  },
];

let currentThemeIndex = 0;
let currentTheme = themes[currentThemeIndex];
let palette = currentTheme.palette;

let vessel;
let glowLayer;
let shaderLayer;
let nebulaShader;
let gravityDirection = -1;
let lastPointer;
let pointerStart;
let pointerMoved = false;
let pointerEnergy = 0;
let shaderReady = false;

const vertexShader = `
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_pointer;
  varying vec2 vTexCoord;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amp * noise(p);
      p = mat2(1.62, -1.18, 1.18, 1.62) * p;
      amp *= 0.52;
    }
    return value;
  }

  void main() {
    vec2 uv = vTexCoord;
    vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    float t = u_time * 0.05;
    float field = fbm(p * 2.6 + vec2(t, -t * 0.7));
    float silk = sin((p.x * 4.0 + field * 2.4 - t * 5.0)) * 0.5 + 0.5;
    float center = 1.0 - smoothstep(0.12, 1.05, length(p));
    float pointerGlow = 1.0 - smoothstep(0.0, 0.55, distance(uv, u_pointer));

    vec3 paper = vec3(0.985, 0.995, 1.0);
    vec3 ice = vec3(0.86, 0.965, 1.0);
    vec3 pearl = vec3(0.99, 0.94, 0.88);
    vec3 lavender = vec3(0.94, 0.91, 1.0);
    vec3 color = mix(paper, ice, field * 0.28);
    color = mix(color, lavender, silk * 0.12);
    color += pearl * pow(center, 3.0) * 0.06;
    color += vec3(0.58, 0.9, 1.0) * pointerGlow * 0.055;
    color -= vec3(0.03, 0.06, 0.07) * smoothstep(0.9, 1.0, fbm(p * 10.0 + t)) * 0.08;
    gl_FragColor = vec4(color, 1.0);
  }
`;

class OilDrop {
  constructor(index) {
    const tone = palette[index % palette.length];
    this.pos = createVector(0, 0);
    this.vel = p5.Vector.random2D().mult(random(0.2, 1.4));
    this.radius = 18;
    this.baseRadius = 18;
    this.phase = random(TWO_PI);
    this.tone = tone;
    this.lift = tone.lift * random(0.82, 1.25);
    this.mass = random(0.8, 1.7);
    this.stepIndex = 0;
    this.stepState = 'roll';
    this.stepDirection = 1;
    this.reset(index);
  }

  reset(index) {
    const scale = min(width, height) / 900;
    const sizeBoost = currentTheme.id === 'lava' ? 1.5 : currentTheme.id === 'ink' ? 1.28 : currentTheme.id === 'lab' ? 0.72 : currentTheme.id === 'stair' ? 0.58 : currentTheme.id === 'neumo' ? 0.9 : currentTheme.id === 'liquid' ? 0.82 : 1;
    this.baseRadius = random(18, 48) * constrain(scale, 0.62, 1.16) * sizeBoost;
    this.radius = this.baseRadius;
    if (currentTheme.id === 'stair') {
      const steps = getStairSteps();
      this.stepIndex = index % max(1, steps.length);
      this.stepState = 'roll';
      this.stepDirection = 1;
      const step = steps[this.stepIndex];
      this.pos.set(step.x + random(8, step.w * 0.36), step.y - this.radius);
      this.vel.set(random(0.25, 1.2), 0);
      return;
    }
    const localX = random(-vessel.innerW * 0.36, vessel.innerW * 0.36);
    const localY = map(index, 0, max(1, drops.length - 1), -vessel.innerH * 0.42, vessel.innerH * 0.42);
    this.pos.set(vessel.cx + localX, vessel.cy + localY + random(-36, 36));
    this.vel.set(random(-0.4, 0.4), random(-0.4, 0.4));
  }

  update() {
    if (currentTheme.id === 'stair') {
      this.updateStair();
      return;
    }
    const time = frameCount * 0.012 + this.phase;
    const wave = currentTheme.id === 'aurora' ? 2.8 : currentTheme.id === 'liquid' ? 1.65 : currentTheme.id === 'ink' || currentTheme.id === 'neumo' ? 0.55 : 1;
    const sideDrift = (sin(time * 1.4) * 0.018 + noise(this.phase, frameCount * 0.006) * 0.025 - 0.012) * wave;
    this.vel.x += sideDrift;
    this.vel.y += this.lift * gravityDirection;

    if (lastPointer && pointerEnergy > 0.01) {
      const pointer = createVector(mouseX, mouseY);
      const away = p5.Vector.sub(this.pos, pointer);
      const d = max(26, away.mag());
      if (d < vessel.innerW * 0.9) {
        const swirl = createVector(-away.y, away.x).normalize();
        const strength = (1 - d / (vessel.innerW * 0.9)) * pointerEnergy * 0.42;
        this.vel.add(swirl.mult(strength / this.mass));
        this.vel.add(away.normalize().mult(strength * 0.18));
      }
    }

    this.vel.mult(currentTheme.viscosity);
    this.vel.limit(currentTheme.speedLimit);
    this.pos.add(this.vel);
    this.radius = this.baseRadius * (1 + sin(time * 2.3) * 0.035);
    this.keepInside();
  }

  updateStair() {
    const steps = getStairSteps();
    if (!steps.length) return;
    const step = steps[this.stepIndex];
    const nextStep = steps[this.stepIndex + 1];
    const floorY = step.y - this.radius;
    const targetX = step.x + step.w - this.radius * 1.1;

    if (this.stepState === 'roll') {
      this.vel.x += 0.018 + noise(this.phase, frameCount * 0.01) * 0.012;
      this.vel.y += (floorY - this.pos.y) * 0.09;
      this.vel.y *= 0.72;
      this.vel.x = constrain(this.vel.x, 0.18, 1.7);
      this.pos.add(this.vel);
      if (this.pos.x >= targetX) {
        this.stepState = 'fall';
        this.vel.x = random(0.18, 0.55);
        this.vel.y = 0.25;
      }
    } else {
      this.vel.y += 0.13;
      this.vel.x *= 0.992;
      this.pos.add(this.vel);
      if (nextStep && this.pos.y >= nextStep.y - this.radius) {
        this.stepIndex += 1;
        this.stepState = 'roll';
        this.pos.y = nextStep.y - this.radius;
        this.pos.x = nextStep.x + random(4, 22);
        this.vel.set(random(0.15, 0.85), -0.08);
      } else if (!nextStep && this.pos.y > height + this.radius * 3) {
        this.reset(floor(random(1000)));
        this.stepIndex = 0;
      }
    }

    this.radius = this.baseRadius * (1 + sin(frameCount * 0.024 + this.phase) * 0.025);
  }

  keepInside() {
    const bounds = capsuleHalfWidth(this.pos.y, this.radius);
    const minX = vessel.cx - bounds;
    const maxX = vessel.cx + bounds;
    const minY = vessel.top + this.radius;
    const maxY = vessel.bottom - this.radius;

    if (this.pos.x < minX) {
      this.pos.x = minX;
      this.vel.x = abs(this.vel.x) * 0.62;
      this.vel.y *= 0.95;
    }
    if (this.pos.x > maxX) {
      this.pos.x = maxX;
      this.vel.x = -abs(this.vel.x) * 0.62;
      this.vel.y *= 0.95;
    }
    if (this.pos.y < minY) {
      this.pos.y = minY;
      this.vel.y = abs(this.vel.y) * 0.5;
      this.vel.x += random(-0.18, 0.18);
    }
    if (this.pos.y > maxY) {
      this.pos.y = maxY;
      this.vel.y = -abs(this.vel.y) * 0.5;
      this.vel.x += random(-0.18, 0.18);
    }
  }

  drawTo(pg, glow) {
    const wobble = currentTheme.id === 'ink' ? 20 : currentTheme.id === 'lava' ? 14 : currentTheme.id === 'aurora' ? 24 : currentTheme.id === 'liquid' ? 12 : currentTheme.id === 'neumo' ? 5 : 9;
    pg.noStroke();
    for (let i = glow ? 5 : 3; i >= 0; i--) {
      const k = i / (glow ? 5 : 3);
      const alpha = (glow ? 9 * (1 - k) + 2 : 34 * (1 - k) + 16) * currentTheme.dropAlpha;
      const elongate = currentTheme.id === 'aurora' ? 1.45 : currentTheme.id === 'lava' ? 1.18 : 1;
      const r = this.radius * (glow ? 2.2 - k * 0.9 : 1.13 - k * 0.2) * elongate;
      const c = lerpColor(color(...this.tone.edge), color(...this.tone.core), 1 - k);
      pg.fill(red(c), green(c), blue(c), alpha);
      drawWobblyBlob(pg, this.pos.x, this.pos.y, r, this.phase + i * 0.7, wobble);
    }

    if (!glow) {
      pg.noFill();
      pg.stroke(...this.tone.edge, currentTheme.id === 'neumo' ? 92 : currentTheme.id === 'liquid' ? 110 : 58 * currentTheme.dropAlpha);
      pg.strokeWeight(max(1, this.radius * 0.035));
      drawWobblyBlob(pg, this.pos.x, this.pos.y, this.radius * 1.04, this.phase + 0.4, wobble);
      const shine = currentTheme.id === 'neon' ? this.tone.core : [255, 255, 255];
      pg.stroke(...shine, currentTheme.id === 'ink' ? 60 : currentTheme.id === 'neumo' || currentTheme.id === 'liquid' ? 210 : 145);
      pg.strokeWeight(max(1, this.radius * 0.025));
      pg.arc(this.pos.x - this.radius * 0.05, this.pos.y - this.radius * 0.08, this.radius * 1.58, this.radius * 1.3, PI * 1.08, PI * 1.55);
      pg.noStroke();
      pg.fill(255, 255, 255, currentTheme.id === 'ink' ? 36 : currentTheme.id === 'neumo' || currentTheme.id === 'liquid' ? 172 : 126);
      pg.ellipse(this.pos.x - this.radius * 0.28, this.pos.y - this.radius * 0.32, this.radius * 0.45, this.radius * 0.22);
      pg.fill(255, 255, 255, currentTheme.id === 'ink' ? 28 : currentTheme.id === 'neumo' || currentTheme.id === 'liquid' ? 118 : 72);
      pg.ellipse(this.pos.x + this.radius * 0.2, this.pos.y + this.radius * 0.2, this.radius * 0.42, this.radius * 0.16);
      pg.fill(...this.tone.core, 24);
      pg.ellipse(this.pos.x, this.pos.y + this.radius * 0.2, this.radius * 1.25, this.radius * 0.38);
    }
  }
}

class Bubble {
  constructor() {
    this.pos = createVector(0, 0);
    this.vel = createVector(0, 0);
    this.r = random(2.2, 8.5) * currentTheme.bubbleScale;
    this.alpha = random(56, 140) * (currentTheme.id === 'neon' ? 1.2 : 1);
    this.phase = random(TWO_PI);
    this.reset();
  }

  reset() {
    this.pos.set(random(vessel.cx - vessel.innerW * 0.38, vessel.cx + vessel.innerW * 0.38), random(vessel.top + 24, vessel.bottom - 24));
    this.vel.set(random(-0.18, 0.18), random(-0.34, -0.08) * gravityDirection);
  }

  update() {
    this.vel.y += -0.0025 * gravityDirection;
    this.vel.x += sin(frameCount * 0.025 + this.phase) * 0.006;
    this.vel.mult(0.995);
    this.pos.add(this.vel);
    const bounds = capsuleHalfWidth(this.pos.y, this.r);
    if (this.pos.x < vessel.cx - bounds || this.pos.x > vessel.cx + bounds || this.pos.y < vessel.top + this.r || this.pos.y > vessel.bottom - this.r) {
      this.reset();
      this.pos.y = gravityDirection > 0 ? vessel.bottom - random(10, 36) : vessel.top + random(10, 36);
    }
  }

  draw() {
    fill(255, 255, 255, this.alpha * 0.2);
    const bubbleColor = currentTheme.id === 'neon' ? [0, 255, 240] : currentTheme.id === 'ink' ? [40, 48, 56] : currentTheme.id === 'neumo' ? [232, 236, 240] : currentTheme.id === 'liquid' ? [180, 225, 255] : [95, 178, 218];
    stroke(...bubbleColor, this.alpha * 0.58);
    strokeWeight(max(1, this.r * 0.08));
    circle(this.pos.x, this.pos.y, this.r * 2);
    stroke(255, 255, 255, this.alpha);
    strokeWeight(max(1, this.r * 0.12));
    point(this.pos.x - this.r * 0.28, this.pos.y - this.r * 0.25);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(min(2, window.devicePixelRatio || 1));
  glowLayer = createGraphics(width, height);
  setupShaderLayer();
  configureVessel();
  seedSimulation();
  noCursor();
  setTimeout(() => document.body.classList.add('is-calm'), 4500);
  setupThemeButtons();
}

function setupShaderLayer() {
  shaderReady = false;
  try {
    shaderLayer = createGraphics(width, height, WEBGL);
    shaderLayer.noStroke();
    nebulaShader = shaderLayer.createShader(vertexShader, fragmentShader);
    shaderReady = true;
  } catch (error) {
    shaderLayer = null;
    nebulaShader = null;
  }
}

function configureVessel() {
  const shortSide = min(width, height);
  const vesselH = min(height * 0.82, shortSide * 1.35);
  const vesselW = min(width * 0.46, shortSide * 0.42, 390);
  vessel = {
    cx: width * 0.5,
    cy: height * 0.49,
    innerW: max(170, vesselW),
    innerH: max(330, vesselH),
  };
  vessel.top = vessel.cy - vessel.innerH * 0.5;
  vessel.bottom = vessel.cy + vessel.innerH * 0.5;
  vessel.radius = vessel.innerW * 0.5;
}

function seedSimulation() {
  drops.length = 0;
  bubbles.length = 0;
  const baseDrops = currentTheme.id === 'lab' ? 14 : currentTheme.id === 'lava' ? 12 : currentTheme.id === 'aurora' ? 28 : currentTheme.id === 'stair' ? 18 : currentTheme.id === 'liquid' ? 22 : currentTheme.id === 'neumo' ? 18 : 24;
  const baseBubbles = currentTheme.id === 'lab' ? 140 : currentTheme.id === 'ink' ? 22 : currentTheme.id === 'lava' ? 24 : currentTheme.id === 'stair' ? 34 : currentTheme.id === 'liquid' ? 82 : currentTheme.id === 'neumo' ? 74 : 90;
  const dropCount = width < 560 ? max(10, floor(baseDrops * 0.72)) : baseDrops;
  const bubbleCount = width < 560 ? floor(baseBubbles * 0.62) : baseBubbles;
  for (let i = 0; i < dropCount; i++) {
    drops.push(new OilDrop(i));
  }
  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }
}

function draw() {
  pointerEnergy *= 0.93;
  drawBackground();
  updateSimulation();
  drawGlow();
  drawVesselBack();
  drawBridges();
  for (const bubble of bubbles) bubble.draw();
  for (const drop of drops) drop.drawTo(window, false);
  drawVesselFront();
  drawCursor();
}

function drawBackground() {
  if (currentTheme.background === 'white' && shaderReady && shaderLayer && nebulaShader) {
    shaderLayer.shader(nebulaShader);
    nebulaShader.setUniform('u_resolution', [width, height]);
    nebulaShader.setUniform('u_time', millis() / 1000);
    nebulaShader.setUniform('u_pointer', [mouseX / max(1, width), 1 - mouseY / max(1, height)]);
    shaderLayer.rect(0, 0, width, height);
    image(shaderLayer, 0, 0, width, height);
    drawWhiteAtmosphere();
    return;
  }

  if (currentTheme.background === 'deep') drawGradientBackground([3, 15, 31], [8, 58, 91]);
  else if (currentTheme.background === 'neon') drawGradientBackground([1, 1, 7], [12, 8, 35]);
  else if (currentTheme.background === 'lava') drawGradientBackground([41, 9, 8], [110, 38, 18]);
  else if (currentTheme.background === 'candy') drawGradientBackground([255, 241, 249], [230, 248, 255]);
  else if (currentTheme.background === 'mono') drawGradientBackground([248, 250, 252], [214, 221, 228]);
  else if (currentTheme.background === 'aurora') drawGradientBackground([7, 16, 31], [28, 57, 72]);
  else if (currentTheme.background === 'lab') drawGradientBackground([248, 253, 255], [226, 244, 250]);
  else if (currentTheme.background === 'gold') drawGradientBackground([255, 246, 226], [246, 206, 145]);
  else if (currentTheme.background === 'ink') drawGradientBackground([251, 250, 245], [226, 225, 218]);
  else if (currentTheme.background === 'neumo') drawGradientBackground([247, 249, 252], [235, 239, 244]);
  else if (currentTheme.background === 'liquid') drawGradientBackground([252, 254, 255], [228, 244, 255]);
  else if (currentTheme.background === 'stair') drawGradientBackground([248, 253, 255], [226, 239, 247]);
  else drawGradientBackground([250, 253, 255], [236, 249, 255]);

  drawThemeAtmosphere();
}

function drawWhiteAtmosphere() {
  noStroke();
  const halo = drawingContext.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, min(width, height) * 0.72);
  halo.addColorStop(0, 'rgba(122, 218, 255, 0.16)');
  halo.addColorStop(0.44, 'rgba(255, 231, 196, 0.12)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  drawingContext.fillStyle = halo;
  rect(0, 0, width, height);

  strokeWeight(1);
  for (let x = width * 0.18; x < width * 0.86; x += 42) {
    const sway = sin(frameCount * 0.008 + x * 0.04) * 10;
    stroke(108, 180, 215, 10);
    line(x + sway, 0, x - sway * 0.6, height);
  }
}

function drawGradientBackground(topColor, bottomColor) {
  noStroke();
  for (let y = 0; y < height; y += 3) {
    const amt = y / max(1, height);
    const r = lerp(topColor[0], bottomColor[0], amt);
    const g = lerp(topColor[1], bottomColor[1], amt);
    const b = lerp(topColor[2], bottomColor[2], amt);
    fill(r, g, b);
    rect(0, y, width, 3);
  }
}

function drawThemeAtmosphere() {
  noStroke();
  const t = frameCount * 0.01;
  if (currentTheme.id === 'neon' || currentTheme.id === 'deep') {
    blendMode(ADD);
    for (let i = 0; i < 36; i++) {
      const x = noise(i * 2.1, t) * width;
      const y = noise(i * 4.7, 100 + t) * height;
      fill(60, 230, 255, currentTheme.id === 'neon' ? 34 : 16);
      circle(x, y, currentTheme.id === 'neon' ? 3 : 2);
    }
    blendMode(BLEND);
  }
  if (currentTheme.id === 'aurora') {
    blendMode(ADD);
    for (let i = 0; i < 7; i++) {
      stroke(i % 2 ? 120 : 215, i % 2 ? 255 : 120, 230, 32);
      strokeWeight(18);
      noFill();
      beginShape();
      for (let x = -40; x <= width + 40; x += 34) {
        const y = height * (0.22 + i * 0.06) + sin(x * 0.012 + t * 1.8 + i) * 30;
        curveVertex(x, y);
      }
      endShape();
    }
    blendMode(BLEND);
  }
  if (currentTheme.id === 'lab') {
    stroke(80, 140, 170, 26);
    strokeWeight(1);
    for (let y = 80; y < height; y += 34) line(0, y, width, y);
    for (let x = 80; x < width; x += 34) line(x, 0, x, height);
  }
  if (currentTheme.id === 'ink') {
    for (let i = 0; i < 14; i++) {
      fill(30, 35, 40, 5);
      const x = noise(i, t * 0.1) * width;
      const y = noise(i + 20, t * 0.1) * height;
      circle(x, y, 80 + noise(i + 40, t) * 180);
    }
  }
  if (currentTheme.id === 'neumo') {
    drawNeumorphicPanel(width * 0.5, height * 0.5, min(width * 0.72, 680), min(height * 0.84, 760), 52);
    for (let i = 0; i < 5; i++) {
      fill(255, 255, 255, 24);
      circle(width * (0.16 + i * 0.17), height * (0.18 + sin(t + i) * 0.03), 70 + i * 18);
    }
  }
  if (currentTheme.id === 'liquid') {
    drawLiquidGlassPlate(width * 0.5, height * 0.5, min(width * 0.76, 760), min(height * 0.82, 720), 46);
    blendMode(ADD);
    noFill();
    for (let i = 0; i < 5; i++) {
      stroke(i % 2 ? 160 : 255, i % 3 ? 225 : 190, 255, 26);
      strokeWeight(10);
      beginShape();
      for (let x = -80; x <= width + 80; x += 52) {
        const y = height * (0.25 + i * 0.1) + sin(x * 0.011 + t * 1.4 + i) * 26;
        curveVertex(x, y);
      }
      endShape();
    }
    blendMode(BLEND);
  }
  if (currentTheme.id === 'stair') {
    noFill();
    strokeWeight(1);
    for (let i = 0; i < 9; i++) {
      stroke(112, 175, 214, 14);
      const y = height * 0.18 + i * height * 0.075 + sin(t + i) * 5;
      line(width * 0.14, y, width * 0.86, y + 18);
    }
  }
}

function drawNeumorphicPanel(x, y, w, h, r) {
  push();
  rectMode(CENTER);
  drawingContext.shadowColor = 'rgba(176, 185, 196, 0.42)';
  drawingContext.shadowBlur = 32;
  drawingContext.shadowOffsetX = 18;
  drawingContext.shadowOffsetY = 18;
  noStroke();
  fill(238, 242, 247, 170);
  rect(x, y, w, h, r);
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.95)';
  drawingContext.shadowBlur = 26;
  drawingContext.shadowOffsetX = -14;
  drawingContext.shadowOffsetY = -14;
  fill(250, 252, 255, 140);
  rect(x, y, w - 10, h - 10, max(18, r - 8));
  drawingContext.shadowBlur = 0;
  pop();
}

function drawLiquidGlassPlate(x, y, w, h, r) {
  push();
  rectMode(CENTER);
  drawingContext.shadowColor = 'rgba(84, 135, 172, 0.2)';
  drawingContext.shadowBlur = 36;
  drawingContext.shadowOffsetY = 22;
  noStroke();
  const plate = drawingContext.createLinearGradient(x - w * 0.5, y - h * 0.5, x + w * 0.5, y + h * 0.5);
  plate.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
  plate.addColorStop(0.32, 'rgba(241, 250, 255, 0.22)');
  plate.addColorStop(0.66, 'rgba(255, 255, 255, 0.44)');
  plate.addColorStop(1, 'rgba(221, 244, 255, 0.24)');
  drawingContext.fillStyle = plate;
  rect(x, y, w, h, r);
  drawingContext.shadowBlur = 0;
  noFill();
  strokeWeight(1);
  stroke(255, 255, 255, 190);
  rect(x, y, w - 3, h - 3, r);
  stroke(142, 212, 255, 45);
  rect(x + 3, y + 5, w - 18, h - 18, max(16, r - 10));
  pop();
}

function updateSimulation() {
  for (const drop of drops) drop.update();
  for (const bubble of bubbles) bubble.update();
}

function drawGlow() {
  glowLayer.clear();
  glowLayer.blendMode(currentTheme.id === 'neon' || currentTheme.id === 'deep' || currentTheme.id === 'lava' ? ADD : BLEND);
  for (const drop of drops) drop.drawTo(glowLayer, true);
  glowLayer.blendMode(BLEND);
  glowLayer.filter(BLUR, currentTheme.id === 'neumo' ? 6 : currentTheme.id === 'neon' ? 18 : width < 560 ? 8 : 12);
  blendMode(currentTheme.id === 'neon' || currentTheme.id === 'deep' || currentTheme.id === 'lava' ? ADD : BLEND);
  image(glowLayer, 0, 0);
  blendMode(BLEND);
}

function drawVesselBack() {
  if (currentTheme.vessel === 'stair') {
    drawStairBack();
    return;
  }
  if (currentTheme.vessel === 'liquid') {
    drawLiquidGlassBack();
    return;
  }
  if (currentTheme.vessel === 'neumo') {
    drawNeumoGlassBack();
    return;
  }
  push();
  translate(vessel.cx, vessel.cy);
  noStroke();
  const dark = currentTheme.id === 'deep' || currentTheme.id === 'neon' || currentTheme.id === 'lava' || currentTheme.id === 'aurora';
  drawingContext.shadowColor = dark ? 'rgba(0, 230, 255, 0.18)' : 'rgba(76, 139, 172, 0.16)';
  drawingContext.shadowBlur = currentTheme.id === 'neon' ? 42 : 30;
  drawingContext.shadowOffsetY = dark ? 0 : 12;
  const glass = drawingContext.createLinearGradient(-vessel.innerW * 0.5, 0, vessel.innerW * 0.5, 0);
  if (currentTheme.id === 'gold') {
    glass.addColorStop(0, 'rgba(255, 179, 63, 0.16)');
    glass.addColorStop(0.24, 'rgba(255, 255, 255, 0.5)');
    glass.addColorStop(0.62, 'rgba(255, 203, 115, 0.12)');
    glass.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
  } else if (dark) {
    glass.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    glass.addColorStop(0.25, 'rgba(255, 255, 255, 0.18)');
    glass.addColorStop(0.62, 'rgba(50, 230, 255, 0.06)');
    glass.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
  } else {
    glass.addColorStop(0, 'rgba(120, 197, 235, 0.12)');
    glass.addColorStop(0.22, 'rgba(255, 255, 255, 0.48)');
    glass.addColorStop(0.54, 'rgba(255, 255, 255, 0.08)');
    glass.addColorStop(0.78, 'rgba(150, 220, 245, 0.11)');
    glass.addColorStop(1, 'rgba(255, 255, 255, 0.58)');
  }
  drawingContext.fillStyle = glass;
  capsule(0, 0, vessel.innerW + 22, vessel.innerH + 18);
  drawingContext.shadowBlur = 0;
  pop();
}

function drawVesselFront() {
  if (currentTheme.vessel === 'stair') {
    drawStairFront();
    return;
  }
  if (currentTheme.vessel === 'liquid') {
    drawLiquidGlassFront();
    return;
  }
  if (currentTheme.vessel === 'neumo') {
    drawNeumoGlassFront();
    return;
  }
  push();
  translate(vessel.cx, vessel.cy);
  noFill();
  const dark = currentTheme.id === 'deep' || currentTheme.id === 'neon' || currentTheme.id === 'lava' || currentTheme.id === 'aurora';
  strokeWeight(currentTheme.id === 'neon' ? 3 : 2.2);
  if (currentTheme.id === 'neon') stroke(0, 255, 240, 190);
  else if (currentTheme.id === 'lava') stroke(255, 168, 57, 120);
  else if (currentTheme.id === 'gold') stroke(184, 117, 34, 104);
  else if (currentTheme.id === 'mono' || currentTheme.id === 'ink') stroke(54, 65, 76, 76);
  else stroke(78, 153, 194, dark ? 130 : 92);
  capsule(0, 0, vessel.innerW + 18, vessel.innerH + 18);

  strokeWeight(1);
  stroke(255, 255, 255, 180);
  capsule(0, 0, vessel.innerW - 4, vessel.innerH - 6);

  noStroke();
  fill(255, 255, 255, 150);
  rect(-vessel.innerW * 0.36, -vessel.innerH * 0.38, 6, vessel.innerH * 0.74, 5);
  fill(122, 194, 230, 34);
  rect(-vessel.innerW * 0.27, -vessel.innerH * 0.42, 3, vessel.innerH * 0.82, 4);
  fill(255, 255, 255, 106);
  rect(vessel.innerW * 0.31, -vessel.innerH * 0.34, 4, vessel.innerH * 0.62, 4);

  fill(255, 255, 255, 126);
  ellipse(0, -vessel.innerH * 0.5, vessel.innerW * 0.74, 14);
  ellipse(0, vessel.innerH * 0.5, vessel.innerW * 0.74, 14);
  stroke(77, 151, 190, 34);
  strokeWeight(1);
  for (let i = -2; i <= 2; i++) {
    const y = i * vessel.innerH * 0.16 + sin(frameCount * 0.015 + i) * 4;
    arc(0, y, vessel.innerW * 0.76, 18, 0, PI);
  }
  if (currentTheme.vessel === 'lab') drawLabMarks();
  if (currentTheme.vessel === 'lamp') drawLampCaps();
  if (currentTheme.vessel === 'neon') drawNeonRim();
  pop();
}

function getStairSteps() {
  const count = width < 620 ? 6 : 7;
  const usableW = min(width * 0.74, 720);
  const stepW = usableW * 0.48;
  const stepH = min(height * 0.095, 72);
  const startX = width * 0.5 - usableW * 0.42;
  const startY = height * 0.2;
  const steps = [];
  for (let i = 0; i < count; i++) {
    steps.push({
      x: startX + (i % 2) * usableW * 0.34,
      y: startY + i * stepH,
      w: stepW,
      h: max(18, stepH * 0.28),
    });
  }
  return steps;
}

function drawStairBack() {
  const steps = getStairSteps();
  push();
  noStroke();
  drawingContext.shadowColor = 'rgba(84, 128, 158, 0.16)';
  drawingContext.shadowBlur = 26;
  drawingContext.shadowOffsetY = 16;
  fill(255, 255, 255, 90);
  rectMode(CORNER);
  for (const step of steps) {
    rect(step.x, step.y, step.w, step.h, 12);
    const sideX = step.x + step.w - 18;
    fill(218, 235, 246, 42);
    rect(sideX, step.y, 18, step.h + 54, 8);
    fill(255, 255, 255, 90);
  }
  drawingContext.shadowBlur = 0;
  pop();
}

function drawStairFront() {
  const steps = getStairSteps();
  push();
  rectMode(CORNER);
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const grad = drawingContext.createLinearGradient(step.x, step.y, step.x + step.w, step.y + step.h);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.45, 'rgba(230, 247, 255, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.48)');
    drawingContext.fillStyle = grad;
    noStroke();
    rect(step.x, step.y, step.w, step.h, 12);
    strokeWeight(1.4);
    stroke(255, 255, 255, 210);
    line(step.x + 10, step.y + 4, step.x + step.w - 10, step.y + 4);
    stroke(89, 153, 194, 62);
    line(step.x + 8, step.y + step.h, step.x + step.w - 8, step.y + step.h);
    if (i < steps.length - 1) {
      stroke(145, 199, 229, 42);
      line(step.x + step.w - 8, step.y + step.h, steps[i + 1].x + 10, steps[i + 1].y);
    }
  }
  pop();
}

function drawLiquidGlassBack() {
  push();
  translate(vessel.cx, vessel.cy);
  noStroke();
  drawingContext.shadowColor = 'rgba(74, 145, 198, 0.2)';
  drawingContext.shadowBlur = 38;
  drawingContext.shadowOffsetY = 18;
  const body = drawingContext.createLinearGradient(-vessel.innerW * 0.56, -vessel.innerH * 0.5, vessel.innerW * 0.56, vessel.innerH * 0.5);
  body.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
  body.addColorStop(0.18, 'rgba(235, 250, 255, 0.17)');
  body.addColorStop(0.4, 'rgba(255, 255, 255, 0.55)');
  body.addColorStop(0.72, 'rgba(215, 242, 255, 0.18)');
  body.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
  drawingContext.fillStyle = body;
  capsule(0, 0, vessel.innerW + 36, vessel.innerH + 34);
  drawingContext.shadowBlur = 0;

  blendMode(ADD);
  fill(110, 210, 255, 24);
  capsule(-vessel.innerW * 0.08, -vessel.innerH * 0.02, vessel.innerW * 0.72, vessel.innerH * 0.92);
  fill(255, 185, 240, 18);
  capsule(vessel.innerW * 0.08, vessel.innerH * 0.03, vessel.innerW * 0.52, vessel.innerH * 0.78);
  blendMode(BLEND);
  pop();
}

function drawLiquidGlassFront() {
  push();
  translate(vessel.cx, vessel.cy);
  noFill();
  strokeWeight(3);
  stroke(255, 255, 255, 210);
  capsule(0, 0, vessel.innerW + 34, vessel.innerH + 34);
  strokeWeight(1.5);
  stroke(142, 219, 255, 110);
  capsule(-2, 0, vessel.innerW + 22, vessel.innerH + 22);
  stroke(255, 180, 235, 76);
  capsule(3, 2, vessel.innerW + 13, vessel.innerH + 13);

  noStroke();
  fill(255, 255, 255, 190);
  rect(-vessel.innerW * 0.35, -vessel.innerH * 0.4, 7, vessel.innerH * 0.76, 7);
  fill(255, 255, 255, 92);
  rect(-vessel.innerW * 0.18, -vessel.innerH * 0.34, 3, vessel.innerH * 0.62, 5);
  fill(180, 226, 255, 58);
  rect(vessel.innerW * 0.28, -vessel.innerH * 0.36, 5, vessel.innerH * 0.7, 6);

  blendMode(ADD);
  noFill();
  strokeWeight(1);
  for (let i = -3; i <= 3; i++) {
    const y = i * vessel.innerH * 0.12 + sin(frameCount * 0.018 + i) * 5;
    stroke(120, 220, 255, 42);
    arc(0, y, vessel.innerW * 0.76, 15, 0, PI);
    stroke(255, 210, 248, 28);
    arc(5, y + 2, vessel.innerW * 0.68, 11, PI, TWO_PI);
  }
  blendMode(BLEND);
  pop();
}

function drawNeumoGlassBack() {
  push();
  translate(vessel.cx, vessel.cy);
  noStroke();
  drawingContext.shadowColor = 'rgba(170, 180, 191, 0.5)';
  drawingContext.shadowBlur = 34;
  drawingContext.shadowOffsetX = 20;
  drawingContext.shadowOffsetY = 24;
  fill(236, 240, 245, 120);
  capsule(0, 0, vessel.innerW + 42, vessel.innerH + 42);

  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.95)';
  drawingContext.shadowBlur = 30;
  drawingContext.shadowOffsetX = -18;
  drawingContext.shadowOffsetY = -20;
  fill(255, 255, 255, 96);
  capsule(0, 0, vessel.innerW + 22, vessel.innerH + 20);

  drawingContext.shadowBlur = 0;
  const inner = drawingContext.createLinearGradient(-vessel.innerW * 0.5, 0, vessel.innerW * 0.5, 0);
  inner.addColorStop(0, 'rgba(218, 224, 231, 0.22)');
  inner.addColorStop(0.18, 'rgba(255, 255, 255, 0.62)');
  inner.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  inner.addColorStop(0.82, 'rgba(255, 255, 255, 0.68)');
  inner.addColorStop(1, 'rgba(213, 220, 228, 0.2)');
  drawingContext.fillStyle = inner;
  capsule(0, 0, vessel.innerW + 8, vessel.innerH + 6);
  pop();
}

function drawNeumoGlassFront() {
  push();
  translate(vessel.cx, vessel.cy);
  noFill();
  strokeWeight(2);
  stroke(255, 255, 255, 230);
  capsule(0, 0, vessel.innerW + 26, vessel.innerH + 28);
  stroke(205, 213, 222, 150);
  strokeWeight(1.2);
  capsule(0, 0, vessel.innerW + 16, vessel.innerH + 18);
  stroke(255, 255, 255, 210);
  capsule(0, 0, vessel.innerW - 8, vessel.innerH - 8);

  noStroke();
  fill(255, 255, 255, 220);
  rect(-vessel.innerW * 0.34, -vessel.innerH * 0.42, 7, vessel.innerH * 0.82, 6);
  fill(255, 255, 255, 150);
  rect(-vessel.innerW * 0.25, -vessel.innerH * 0.36, 3, vessel.innerH * 0.7, 5);
  fill(225, 231, 238, 80);
  rect(vessel.innerW * 0.3, -vessel.innerH * 0.38, 5, vessel.innerH * 0.75, 6);

  fill(255, 255, 255, 190);
  ellipse(0, -vessel.innerH * 0.5, vessel.innerW * 0.8, 16);
  fill(220, 227, 235, 80);
  ellipse(0, vessel.innerH * 0.5, vessel.innerW * 0.82, 18);

  stroke(255, 255, 255, 120);
  strokeWeight(1);
  for (let i = -3; i <= 3; i++) {
    const y = i * vessel.innerH * 0.12 + sin(frameCount * 0.012 + i) * 2;
    arc(0, y, vessel.innerW * 0.7, 13, 0, PI);
  }
  pop();
}

function drawLabMarks() {
  stroke(24, 93, 126, 110);
  strokeWeight(1);
  for (let i = 0; i <= 18; i++) {
    const y = -vessel.innerH * 0.42 + i * vessel.innerH * 0.046;
    const len = i % 3 === 0 ? 22 : 12;
    line(vessel.innerW * 0.33, y, vessel.innerW * 0.33 + len, y);
  }
}

function drawLampCaps() {
  noStroke();
  fill(78, 30, 24, 190);
  rect(-vessel.innerW * 0.42, -vessel.innerH * 0.58, vessel.innerW * 0.84, 38, 8);
  rect(-vessel.innerW * 0.42, vessel.innerH * 0.5, vessel.innerW * 0.84, 38, 8);
  fill(255, 174, 74, 80);
  rect(-vessel.innerW * 0.32, -vessel.innerH * 0.57, vessel.innerW * 0.64, 4, 4);
}

function drawNeonRim() {
  blendMode(ADD);
  noFill();
  stroke(255, 0, 190, 110);
  strokeWeight(6);
  capsule(0, 0, vessel.innerW + 32, vessel.innerH + 30);
  stroke(0, 255, 240, 95);
  strokeWeight(3);
  capsule(0, 0, vessel.innerW + 42, vessel.innerH + 42);
  blendMode(BLEND);
}

function drawBridges() {
  blendMode(BLEND);
  noStroke();
  for (let i = 0; i < drops.length; i++) {
    for (let j = i + 1; j < drops.length; j++) {
      const a = drops[i];
      const b = drops[j];
      const d = p5.Vector.dist(a.pos, b.pos);
      const threshold = (a.radius + b.radius) * 1.18;
      if (d < threshold) {
        const mid = p5.Vector.add(a.pos, b.pos).mult(0.5);
        const alpha = map(d, 0, threshold, currentTheme.id === 'neumo' ? 14 : 34, 0);
        const ang = atan2(b.pos.y - a.pos.y, b.pos.x - a.pos.x);
        push();
        translate(mid.x, mid.y);
        rotate(ang);
        fill(...a.tone.core, alpha);
        ellipse(0, 0, d + min(a.radius, b.radius) * 0.8, min(a.radius, b.radius) * 0.78);
        pop();
      }
    }
  }
  blendMode(BLEND);
}

function drawCursor() {
  if (!lastPointer || pointerEnergy < 0.02) return;
  noFill();
  stroke(42, 139, 186, 105 * pointerEnergy);
  strokeWeight(1);
  circle(mouseX, mouseY, 28 + pointerEnergy * 38);
}

function setupThemeButtons() {
  document.querySelectorAll('.theme-button').forEach((button) => {
    button.addEventListener('click', () => {
      const nextIndex = Number(button.dataset.theme);
      setTheme(nextIndex);
    });
  });
}

function setTheme(nextIndex) {
  if (!themes[nextIndex]) return;
  currentThemeIndex = nextIndex;
  currentTheme = themes[currentThemeIndex];
  palette = currentTheme.palette;
  gravityDirection = -1;
  pointerEnergy = 1;
  configureVessel();
  seedSimulation();
  updateThemeUi();
}

function updateThemeUi() {
  document.querySelectorAll('.theme-button').forEach((button) => {
    button.classList.toggle('is-active', Number(button.dataset.theme) === currentThemeIndex);
  });
  const description = document.getElementById('themeDescription');
  if (description) description.textContent = currentTheme.description;
  const title = document.querySelector('.hud__title');
  if (title) title.textContent = `Oil Timer - ${currentTheme.name}`;
}

function pointerIsOnUi() {
  const target = document.elementFromPoint(mouseX, mouseY);
  return Boolean(target && target.closest && target.closest('.theme-bar'));
}

function drawWobblyBlob(pg, x, y, radius, phase, wobble) {
  pg.beginShape();
  const steps = 30;
  for (let i = 0; i < steps; i++) {
    const a = (TWO_PI * i) / steps;
    const n = noise(cos(a) * 0.8 + phase, sin(a) * 0.8 + phase, frameCount * 0.018);
    const r = radius * (1 + (n - 0.5) * 0.12) + sin(a * 3 + phase) * wobble * 0.12;
    pg.vertex(x + cos(a) * r, y + sin(a) * r);
  }
  pg.endShape(CLOSE);
}

function capsule(x, y, w, h) {
  const r = w * 0.5;
  beginShape();
  for (let a = PI; a <= TWO_PI; a += PI / 28) {
    vertex(x + cos(a) * r, y - h * 0.5 + r + sin(a) * r);
  }
  for (let a = 0; a <= PI; a += PI / 28) {
    vertex(x + cos(a) * r, y + h * 0.5 - r + sin(a) * r);
  }
  endShape(CLOSE);
}

function capsuleHalfWidth(y, margin) {
  const r = vessel.radius - margin;
  const topCenter = vessel.top + vessel.radius;
  const bottomCenter = vessel.bottom - vessel.radius;
  if (y < topCenter) {
    const dy = y - topCenter;
    return max(0, sqrt(max(0, r * r - dy * dy)));
  }
  if (y > bottomCenter) {
    const dy = y - bottomCenter;
    return max(0, sqrt(max(0, r * r - dy * dy)));
  }
  return r;
}

function flipGravity() {
  gravityDirection *= -1;
  pointerEnergy = 1;
  document.body.classList.remove('is-calm');
  setTimeout(() => document.body.classList.add('is-calm'), 2600);
}

function mousePressed() {
  if (pointerIsOnUi()) return;
  pointerStart = createVector(mouseX, mouseY);
  lastPointer = createVector(mouseX, mouseY);
  pointerMoved = false;
  pointerEnergy = 1;
}

function mouseDragged() {
  if (pointerIsOnUi()) return false;
  lastPointer = createVector(mouseX, mouseY);
  if (pointerStart && dist(mouseX, mouseY, pointerStart.x, pointerStart.y) > 8) {
    pointerMoved = true;
  }
  pointerEnergy = min(1, pointerEnergy + 0.18);
  return false;
}

function mouseReleased() {
  if (pointerIsOnUi()) return;
  if (!pointerMoved) flipGravity();
}

function touchStarted() {
  if (pointerIsOnUi()) return;
  pointerStart = createVector(mouseX, mouseY);
  lastPointer = createVector(mouseX, mouseY);
  pointerMoved = false;
  pointerEnergy = 1;
  return false;
}

function touchMoved() {
  if (pointerIsOnUi()) return false;
  lastPointer = createVector(mouseX, mouseY);
  if (pointerStart && dist(mouseX, mouseY, pointerStart.x, pointerStart.y) > 8) {
    pointerMoved = true;
  }
  pointerEnergy = min(1, pointerEnergy + 0.2);
  return false;
}

function touchEnded() {
  if (pointerIsOnUi()) return;
  if (!pointerMoved) flipGravity();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  glowLayer = createGraphics(width, height);
  setupShaderLayer();
  configureVessel();
  seedSimulation();
}
