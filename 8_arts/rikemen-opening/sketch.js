'use strict';

const timeline = window.RikemenTimeline;
const audioApi = window.RikemenAudio;
const recorderApi = window.RikemenRecorder;
const particlePalette = [
  [103, 217, 236],
  [243, 221, 99],
  [232, 116, 182],
];
const formulaGlyphs = ['Σ', 'π', '∫', 'Δ', 'E=mc²', 'F=ma', 'λ', '√x', '∞', 'sin θ'];

let characterImages = [];
let logoFont;
let canvasRenderer;
let particles = [];
let currentFrame = 0;
let playbackStartedAt = 0;
let isPlaying = false;
let isRecording = false;
let sonicLogo;
let canvasRecorder;
let frameSlider;
let frameOutput;
let statusText;
let replayButton;
let recordButton;

function preload() {
  characterImages = timeline.CHARACTERS.map((character) => loadImage(character.file));
  logoFont = loadFont('../../rec/assets/fonts/Roboto/static/Roboto-Black.ttf');
}

function setup() {
  pixelDensity(1);
  canvasRenderer = createCanvas(timeline.CANVAS_WIDTH, timeline.CANVAS_HEIGHT);
  canvasRenderer.parent('canvasHost');
  frameRate(timeline.FPS);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont(logoFont);
  particles = timeline.createParticles(78, 20260828);
  canvasRecorder = new recorderApi.CanvasRecorder();
  bindControls();

  window.RikemenOpening = Object.freeze({
    replay: replayOpening,
    seek: seekOpening,
    record: recordOpening,
    getFrame: () => currentFrame,
  });

  startPlayback(false, '無音プレビューを再生中');
}

function draw() {
  updatePlaybackFrame();
  drawOpeningFrame(currentFrame);
  updateFrameDisplay();
}

function bindControls() {
  frameSlider = document.getElementById('frameSlider');
  frameOutput = document.getElementById('frameOutput');
  statusText = document.getElementById('statusText');
  replayButton = document.getElementById('replayButton');
  recordButton = document.getElementById('recordButton');

  replayButton.addEventListener('click', () => replayOpening({ sound: true }));
  recordButton.addEventListener('click', async () => {
    try {
      const blob = await recordOpening();
      downloadBlob(blob, 'rikemen-opening.webm');
      setStatus('録画完了：WebMを保存しました');
    } catch (error) {
      setStatus(`録画できませんでした：${error.message}`);
    }
  });
  frameSlider.addEventListener('input', (event) => seekOpening(Number(event.target.value)));
}

function updatePlaybackFrame() {
  if (!isPlaying) {
    return;
  }

  const elapsedMs = performance.now() - playbackStartedAt;
  const nextFrame = Math.floor((elapsedMs * timeline.FPS) / 1000);
  currentFrame = timeline.normalizeFrame(nextFrame);

  if (elapsedMs >= 5000) {
    currentFrame = timeline.TOTAL_FRAMES - 1;
    isPlaying = false;
    if (!isRecording) {
      setStatus('再生完了');
    }
  }
}

function startPlayback(withSound, message) {
  currentFrame = 0;
  isPlaying = true;
  playbackStartedAt = performance.now();
  if (withSound) {
    getSonicLogo().play().catch((error) => setStatus(`音声エラー：${error.message}`));
  }
  setStatus(message || (withSound ? '音付きで再生中' : '無音で再生中'));
}

async function replayOpening(options = {}) {
  if (isRecording) {
    return;
  }
  const withSound = options.sound !== false;
  if (withSound) {
    await getSonicLogo().ensureReady();
  }
  startPlayback(withSound, withSound ? '音付きで再生中' : '無音で再生中');
}

function seekOpening(frame) {
  if (isRecording) {
    return currentFrame;
  }
  if (sonicLogo) {
    sonicLogo.stop();
  }
  isPlaying = false;
  currentFrame = timeline.normalizeFrame(frame);
  setStatus(`フレーム ${String(currentFrame).padStart(3, '0')} を確認中`);
  return currentFrame;
}

async function recordOpening() {
  if (isRecording) {
    throw new Error('すでに録画中です。');
  }

  const audioEngine = getSonicLogo();
  await audioEngine.ensureReady();
  isRecording = true;
  setControlsDisabled(true);
  setStatus('録画中：5秒お待ちください');

  try {
    return await canvasRecorder.record({
      canvas: canvasRenderer.elt,
      audioStream: audioEngine.getCaptureStream(),
      fps: timeline.FPS,
      durationMs: 5000,
      onStart: () => startPlayback(true, '録画中：5秒お待ちください'),
      onStop: () => {
        isPlaying = false;
        currentFrame = timeline.TOTAL_FRAMES - 1;
      },
    });
  } finally {
    isRecording = false;
    setControlsDisabled(false);
  }
}

function getSonicLogo() {
  if (!sonicLogo) {
    sonicLogo = new audioApi.SonicLogo();
  }
  return sonicLogo;
}

function setControlsDisabled(disabled) {
  replayButton.disabled = disabled;
  recordButton.disabled = disabled;
  frameSlider.disabled = disabled;
}

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function updateFrameDisplay() {
  if (!frameSlider || !frameOutput) {
    return;
  }
  frameSlider.value = String(currentFrame);
  frameOutput.textContent = `${String(currentFrame).padStart(3, '0')} / 299`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawOpeningFrame(frame) {
  const state = timeline.getOpeningState(frame);
  drawBackground(state);
  drawGrid(state);
  drawParticles(state);
  drawFormulaField(state);
  drawOrbitRings(state);
  drawCharacters(state);
  drawLogo(state);
  drawFinalFade(state);
}

function drawBackground(state) {
  const context = drawingContext;
  context.save();
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#06121f');
  gradient.addColorStop(0.48, '#0b2b3c');
  gradient.addColorStop(1, '#11152c');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const glowAlpha = 0.12 + state.introProgress * 0.1;
  const radial = context.createRadialGradient(960, 540, 40, 960, 540, 680);
  radial.addColorStop(0, `rgba(70, 217, 234, ${glowAlpha})`);
  radial.addColorStop(0.55, 'rgba(39, 119, 154, 0.07)');
  radial.addColorStop(1, 'rgba(5, 12, 20, 0)');
  context.fillStyle = radial;
  context.fillRect(0, 0, width, height);
  context.restore();
}

function drawGrid(state) {
  push();
  const alpha = 22 * state.introProgress;
  stroke(111, 202, 220, alpha);
  strokeWeight(1);

  for (let x = 0; x <= width; x += 80) {
    line(x, 0, x, height);
  }
  for (let y = 0; y <= height; y += 80) {
    line(0, y, width, y);
  }

  stroke(111, 202, 220, alpha * 1.8);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);
  pop();
}

function drawParticles(state) {
  push();
  blendMode(ADD);
  noStroke();
  particles.forEach((particle) => {
    const point = timeline.getParticleState(particle, state.frame);
    const colorValue = particlePalette[point.colorIndex];
    fill(...colorValue, point.opacity * 190 * state.introProgress);
    circle(point.x, point.y, Math.max(1, point.size));
  });
  blendMode(BLEND);
  pop();
}

function drawFormulaField(state) {
  push();
  textFont(logoFont);
  textStyle(NORMAL);
  noStroke();
  const convergence = state.convergenceProgress;

  formulaGlyphs.forEach((glyph, index) => {
    const column = index % 5;
    const row = Math.floor(index / 5);
    const baseX = 170 + column * 390;
    const baseY = 180 + row * 700 + Math.sin(state.seconds * 0.8 + index) * 28;
    const targetX = timeline.lerp(baseX, timeline.CENTER.x, convergence * 0.76);
    const targetY = timeline.lerp(baseY, timeline.CENTER.y, convergence * 0.76);
    const alpha = 46 * state.introProgress * (1 - convergence * 0.7);
    fill(158, 225, 234, alpha);
    textSize(30 + (index % 3) * 7);
    text(glyph, targetX, targetY);
  });
  pop();
}

function drawOrbitRings(state) {
  push();
  noFill();
  const orbitAlpha = 28 + state.orbitProgress * 64;
  strokeWeight(2);
  drawingContext.setLineDash([10, 14]);
  stroke(103, 217, 236, orbitAlpha);
  ellipse(timeline.CENTER.x, timeline.CENTER.y, 1300, 600);
  drawingContext.setLineDash([3, 20]);
  stroke(243, 221, 99, orbitAlpha * 0.62);
  ellipse(timeline.CENTER.x, timeline.CENTER.y, 1180, 500);
  drawingContext.setLineDash([]);

  const sweepAngle = state.seconds * 1.7;
  const markerX = timeline.CENTER.x + Math.cos(sweepAngle) * 650;
  const markerY = timeline.CENTER.y + Math.sin(sweepAngle) * 300;
  noStroke();
  fill(103, 217, 236, orbitAlpha * 2);
  circle(markerX, markerY, 11);
  pop();
}

function drawCharacters(state) {
  timeline.CHARACTERS.forEach((character, index) => {
    const characterState = timeline.getCharacterState(index, state.frame);
    const source = characterImages[index];
    if (!source || characterState.opacity <= 0) {
      return;
    }

    const drawWidth = characterState.width * characterState.scale;
    const drawHeight = drawWidth * (source.height / source.width);
    push();
    translate(characterState.x, characterState.y);
    rotate(characterState.rotation);
    noStroke();
    fill(79, 205, 226, 18 * characterState.glow * characterState.opacity);
    circle(0, 0, drawWidth * 1.16);
    drawingContext.shadowColor = `rgba(86, 219, 236, ${0.24 * characterState.glow})`;
    drawingContext.shadowBlur = 28 * characterState.glow;
    tint(255, 255 * characterState.opacity);
    image(source, 0, 0, drawWidth, drawHeight);
    noTint();
    drawingContext.shadowBlur = 0;
    pop();
  });
}

function drawLogo(state) {
  if (state.logoProgress <= 0) {
    return;
  }

  const rikemenProgress = timeline.clamp(state.logoProgress / 0.8);
  const channelProgress = timeline.easeOutBack(
    timeline.progressBetween(state.logoProgress, 0.52, 1),
  );
  const alpha = 255 * timeline.clamp(state.logoProgress);
  const scaleAmount = 0.88 + state.logoProgress * 0.12;

  push();
  translate(timeline.CENTER.x, timeline.CENTER.y);
  scale(scaleAmount);
  rectMode(CENTER);
  noStroke();
  fill(5, 19, 30, alpha * 0.57);
  drawingContext.shadowColor = 'rgba(51, 201, 225, 0.24)';
  drawingContext.shadowBlur = 50;
  rect(0, 0, 760, 210, 105);
  drawingContext.shadowBlur = 0;

  textFont(logoFont);
  textStyle(BOLD);
  textAlign(RIGHT, CENTER);
  textSize(150);
  drawingContext.shadowColor = 'rgba(103, 217, 236, 0.62)';
  drawingContext.shadowBlur = 30 * rikemenProgress;
  fill(239, 251, 255, alpha * rikemenProgress);
  text('Rikemen', 142, -2);

  textAlign(LEFT, CENTER);
  textSize(84);
  drawingContext.shadowColor = 'rgba(103, 217, 236, 0.8)';
  drawingContext.shadowBlur = 34 * channelProgress;
  fill(103, 217, 236, alpha * timeline.clamp(channelProgress));
  text('CH.', 168, 18);

  drawingContext.shadowBlur = 0;
  stroke(243, 221, 99, alpha * 0.8);
  strokeWeight(4);
  const underlineWidth = 490 * timeline.easeOutCubic(rikemenProgress);
  line(-underlineWidth / 2, 87, underlineWidth / 2, 87);
  noStroke();
  fill(243, 221, 99, alpha);
  circle(underlineWidth / 2, 87, 10);
  pop();
}

function drawFinalFade(state) {
  if (state.fadeProgress <= 0) {
    return;
  }
  push();
  noStroke();
  fill(0, 0, 0, 255 * state.fadeProgress);
  rect(0, 0, width, height);
  pop();
}
