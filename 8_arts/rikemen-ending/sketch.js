'use strict';

const endingTimeline = window.RikemenEndingTimeline;
const endingAudioApi = window.RikemenEndingAudio;
const recorderApi = window.RikemenRecorder;

let characterImages = [];
let rampartFont;
let notoFont;
let canvasRenderer;
let paperGrain = [];
let decorations = [];
let currentFrame = 0;
let playbackStartedAt = 0;
let isPlaying = false;
let isRecording = false;
let cozyJingle;
let canvasRecorder;
let frameSlider;
let frameOutput;
let statusText;
let replayButton;
let recordButton;
let guideToggle;
let guideOverlay;

function preload() {
  characterImages = endingTimeline.CHARACTERS.map((character) => loadImage(character.file));
  rampartFont = loadFont(
    '../../2_calculus/2_1_空間曲線の接線と法平面/assets/fonts/Rampart_One/RampartOne-Regular.ttf',
  );
  notoFont = loadFont(
    '../../2_calculus/2_1_空間曲線の接線と法平面/assets/fonts/Noto_Sans_JP/static/NotoSansJP-Regular.ttf',
  );
}

function setup() {
  pixelDensity(1);
  canvasRenderer = createCanvas(endingTimeline.CANVAS_WIDTH, endingTimeline.CANVAS_HEIGHT);
  canvasRenderer.parent('canvasHost');
  frameRate(endingTimeline.FPS);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  paperGrain = endingTimeline.createPaperGrain(320, 15082026);
  decorations = endingTimeline.createDecorations(42, 20260828);
  canvasRecorder = new recorderApi.CanvasRecorder();
  bindControls();

  window.RikemenEnding = Object.freeze({
    replay: replayEnding,
    seek: seekEnding,
    record: recordEnding,
    getFrame: () => currentFrame,
    getZones: () => endingTimeline.END_SCREEN_ZONES,
  });

  startPlayback(false, '無音プレビューを再生中');
}

function draw() {
  updatePlaybackFrame();
  drawEndingFrame(currentFrame);
  updateFrameDisplay();
}

function bindControls() {
  frameSlider = document.getElementById('frameSlider');
  frameOutput = document.getElementById('frameOutput');
  statusText = document.getElementById('statusText');
  replayButton = document.getElementById('replayButton');
  recordButton = document.getElementById('recordButton');
  guideToggle = document.getElementById('guideToggle');
  guideOverlay = document.getElementById('guideOverlay');

  replayButton.addEventListener('click', () => replayEnding({ sound: true }));
  recordButton.addEventListener('click', async () => {
    try {
      const blob = await recordEnding();
      downloadBlob(blob, 'rikemen-ending.webm');
      setStatus('録画完了：WebMを保存しました');
    } catch (error) {
      setStatus(`録画できませんでした：${error.message}`);
    }
  });
  frameSlider.addEventListener('input', (event) => seekEnding(Number(event.target.value)));
  guideToggle.addEventListener('change', () => {
    guideOverlay.hidden = !guideToggle.checked;
  });
}

function updatePlaybackFrame() {
  if (!isPlaying) {
    return;
  }
  const elapsedMs = performance.now() - playbackStartedAt;
  const nextFrame = Math.floor((elapsedMs * endingTimeline.FPS) / 1000);
  currentFrame = endingTimeline.normalizeFrame(nextFrame);

  if (elapsedMs >= endingTimeline.RECORDING_DURATION_MS) {
    currentFrame = endingTimeline.TOTAL_FRAMES - 1;
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
    getCozyJingle().play().catch((error) => setStatus(`音声エラー：${error.message}`));
  }
  setStatus(message || (withSound ? '音付きで再生中' : '無音で再生中'));
}

async function replayEnding(options = {}) {
  if (isRecording) {
    return;
  }
  const withSound = options.sound !== false;
  if (withSound) {
    await getCozyJingle().ensureReady();
  }
  startPlayback(withSound, withSound ? '音付きで再生中' : '無音で再生中');
}

function seekEnding(frame) {
  if (isRecording) {
    return currentFrame;
  }
  if (cozyJingle) {
    cozyJingle.stop();
  }
  isPlaying = false;
  currentFrame = endingTimeline.normalizeFrame(frame);
  setStatus(`フレーム ${String(currentFrame).padStart(3, '0')} を確認中`);
  return currentFrame;
}

async function recordEnding() {
  if (isRecording) {
    throw new Error('すでに録画中です。');
  }

  const audioEngine = getCozyJingle();
  await audioEngine.ensureReady();
  isRecording = true;
  setControlsDisabled(true);
  setStatus('録画中：15秒お待ちください');

  try {
    return await canvasRecorder.record({
      canvas: canvasRenderer.elt,
      audioStream: audioEngine.getCaptureStream(),
      fps: endingTimeline.FPS,
      durationMs: endingTimeline.RECORDING_DURATION_MS,
      onStart: () => startPlayback(true, '録画中：15秒お待ちください'),
      onStop: () => {
        isPlaying = false;
        currentFrame = endingTimeline.TOTAL_FRAMES - 1;
      },
    });
  } finally {
    isRecording = false;
    setControlsDisabled(false);
  }
}

function getCozyJingle() {
  if (!cozyJingle) {
    cozyJingle = new endingAudioApi.CozyJingle();
  }
  return cozyJingle;
}

function setControlsDisabled(disabled) {
  replayButton.disabled = disabled;
  recordButton.disabled = disabled;
  frameSlider.disabled = disabled;
  guideToggle.disabled = disabled;
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
  frameOutput.textContent = `${String(currentFrame).padStart(3, '0')} / 899`;
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

function drawEndingFrame(frame) {
  const state = endingTimeline.getEndingState(frame);
  drawPaperBackground(state);
  drawPastelShapes(state);
  drawPaperTexture(state);
  drawFixedDoodles(state);
  drawFloatingDecorations(state);
  drawPostcards(state);
  drawSubscribeSticker(state);
  drawCharacters(state);
  drawMessages(state);
}

function drawPaperBackground(state) {
  background('#e1c8a4');
  const paperY = endingTimeline.lerp(height, 0, state.paperProgress);
  push();
  translate(0, paperY);
  noStroke();
  drawingContext.shadowColor = 'rgba(107, 81, 69, 0.2)';
  drawingContext.shadowBlur = 38;
  drawingContext.shadowOffsetY = -14;
  fill(endingTimeline.PALETTE.paper);
  rect(0, 0, width, height);
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetY = 0;
  pop();
}

function drawPastelShapes(state) {
  const paperY = endingTimeline.lerp(height, 0, state.paperProgress);
  push();
  translate(0, paperY * 0.55);
  noStroke();
  fill(191, 227, 236, 126 * state.paperProgress);
  ellipse(110, 90, 520, 330);
  fill(246, 201, 168, 112 * state.paperProgress);
  ellipse(1840, 1020, 620, 360);
  fill(191, 216, 184, 95 * state.paperProgress);
  ellipse(1050, 1120, 850, 260);
  fill(244, 221, 160, 78 * state.paperProgress);
  ellipse(960, -40, 720, 220);
  pop();
}

function drawPaperTexture(state) {
  if (state.paperProgress <= 0) {
    return;
  }
  const paperY = endingTimeline.lerp(height, 0, state.paperProgress);
  push();
  noStroke();
  paperGrain.forEach((grain) => {
    const y = grain.y + paperY;
    if (y < 0 || y > height) {
      return;
    }
    fill(107, 81, 69, grain.alpha * state.paperProgress);
    circle(grain.x, y, grain.size);
  });
  pop();
}

function drawFixedDoodles(state) {
  const alpha = 72 * state.paperProgress;
  drawBookDoodle(220, 270, 0.82, alpha);
  drawFlaskDoodle(1690, 265, 0.76, alpha);
  drawPencilDoodle(870, 278, 0.86, alpha);
  drawMusicNoteDoodle(1080, 1000, 0.72, alpha);
  drawStarDoodle(1650, 105, 0.72, alpha);
}

function drawBookDoodle(x, y, size, alpha) {
  push();
  translate(x, y);
  scale(size);
  noFill();
  stroke(107, 81, 69, alpha);
  strokeWeight(4);
  beginShape();
  vertex(-62, -34);
  bezierVertex(-32, -46, -10, -34, 0, -18);
  bezierVertex(12, -34, 36, -46, 62, -34);
  vertex(62, 38);
  bezierVertex(30, 27, 12, 34, 0, 49);
  bezierVertex(-12, 34, -32, 27, -62, 38);
  endShape(CLOSE);
  line(0, -18, 0, 49);
  pop();
}

function drawFlaskDoodle(x, y, size, alpha) {
  push();
  translate(x, y);
  scale(size);
  noFill();
  stroke(107, 81, 69, alpha);
  strokeWeight(4);
  line(-18, -56, 18, -56);
  line(-12, -56, -12, -12);
  line(12, -56, 12, -12);
  beginShape();
  vertex(-12, -12);
  vertex(-55, 56);
  vertex(55, 56);
  vertex(12, -12);
  endShape(CLOSE);
  arc(0, 30, 78, 28, 0, PI);
  circle(-18, 20, 8);
  circle(18, 7, 6);
  pop();
}

function drawPencilDoodle(x, y, size, alpha) {
  push();
  translate(x, y);
  rotate(-0.18);
  scale(size);
  stroke(107, 81, 69, alpha);
  strokeWeight(4);
  fill(244, 221, 160, alpha * 0.5);
  rectMode(CENTER);
  rect(0, 0, 150, 28, 8);
  fill(246, 201, 168, alpha * 0.55);
  triangle(75, -14, 75, 14, 104, 0);
  line(-55, -14, -55, 14);
  pop();
}

function drawMusicNoteDoodle(x, y, size, alpha) {
  push();
  translate(x, y);
  scale(size);
  noFill();
  stroke(107, 81, 69, alpha);
  strokeWeight(5);
  line(0, -55, 0, 32);
  line(0, -55, 60, -42);
  line(60, -42, 60, 44);
  fill(107, 81, 69, alpha);
  noStroke();
  ellipse(-15, 37, 34, 24);
  ellipse(45, 49, 34, 24);
  pop();
}

function drawStarDoodle(x, y, size, alpha) {
  push();
  translate(x, y);
  scale(size);
  noFill();
  stroke(107, 81, 69, alpha);
  strokeWeight(4);
  beginShape();
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? 48 : 20;
    const angle = -HALF_PI + (index * TWO_PI) / 10;
    vertex(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  endShape(CLOSE);
  pop();
}

function drawFloatingDecorations(state) {
  const colors = [
    [191, 227, 236],
    [246, 201, 168],
    [191, 216, 184],
    [244, 221, 160],
  ];
  decorations.forEach((decoration) => {
    const item = endingTimeline.getDecorationState(decoration, state.frame);
    if (!item.visible) {
      return;
    }
    const colorValue = colors[item.colorIndex];
    push();
    translate(item.x, item.y);
    rotate(item.rotation);
    noStroke();
    fill(...colorValue, item.opacity * 180 * state.paperProgress);
    if (item.kind === 'leaf') {
      ellipse(0, 0, item.size * 1.6, item.size * 0.72);
      stroke(107, 81, 69, item.opacity * 70 * state.paperProgress);
      strokeWeight(1.5);
      line(-item.size * 0.52, 0, item.size * 0.52, 0);
    } else if (item.kind === 'paper') {
      rectMode(CENTER);
      rect(0, 0, item.size * 1.15, item.size * 0.8, 3);
    } else {
      drawTinySpark(item.size, item.opacity * 160 * state.paperProgress);
    }
    pop();
  });
}

function drawTinySpark(size, alpha) {
  stroke(107, 81, 69, alpha);
  strokeWeight(2);
  line(-size / 2, 0, size / 2, 0);
  line(0, -size / 2, 0, size / 2);
  noStroke();
}

function drawPostcards(state) {
  drawPostcard(endingTimeline.END_SCREEN_ZONES.leftVideo, 'おすすめ', state.cardsProgress, -1);
  drawPostcard(endingTimeline.END_SCREEN_ZONES.rightVideo, 'つぎに見る', state.cardsProgress, 1);
}

function drawPostcard(zone, label, rawProgress, direction) {
  if (rawProgress <= 0) {
    return;
  }
  const alphaProgress = endingTimeline.clamp(rawProgress);
  const centerX = zone.x + zone.width / 2;
  const centerY = zone.y + zone.height / 2;
  const offsetY = (1 - rawProgress) * -190;
  const rotationAmount = direction * (1 - rawProgress) * 0.055;

  push();
  translate(centerX, centerY + offsetY);
  rotate(rotationAmount);
  rectMode(CENTER);
  textFont(notoFont);
  drawingContext.shadowColor = `rgba(107, 81, 69, ${0.18 * alphaProgress})`;
  drawingContext.shadowBlur = 28;
  drawingContext.shadowOffsetY = 13;
  stroke(198, 164, 139, 145 * alphaProgress);
  strokeWeight(2);
  fill(255, 253, 247, 255 * alphaProgress);
  rect(0, 0, zone.width + 38, zone.height + 64, 24);
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetY = 0;

  noStroke();
  fill(direction < 0 ? 191 : 246, direction < 0 ? 227 : 201, direction < 0 ? 236 : 168, 95 * alphaProgress);
  rect(0, 8, zone.width, zone.height, 16);
  stroke(107, 81, 69, 70 * alphaProgress);
  strokeWeight(2);
  drawingContext.setLineDash([8, 10]);
  noFill();
  rect(0, 8, zone.width - 26, zone.height - 26, 13);
  drawingContext.setLineDash([]);

  noStroke();
  fill(107, 81, 69, 170 * alphaProgress);
  textSize(27);
  text(label, 0, -zone.height / 2 - 12);
  fill(107, 81, 69, 82 * alphaProgress);
  textSize(18);
  text('ここに動画が表示されます', 0, 8);

  push();
  translate(direction * 105, -zone.height / 2 - 33);
  rotate(direction * 0.07);
  noStroke();
  fill(244, 221, 160, 205 * alphaProgress);
  rect(0, 0, 142, 32, 5);
  pop();
  pop();
}

function drawSubscribeSticker(state) {
  if (state.subscribeProgress <= 0) {
    return;
  }
  const zone = endingTimeline.END_SCREEN_ZONES.subscribe;
  const rawProgress = state.subscribeProgress;
  const alphaProgress = endingTimeline.clamp(rawProgress);
  const scaleAmount = 0.84 + rawProgress * 0.16;

  push();
  translate(zone.cx, zone.cy);
  scale(scaleAmount);
  noStroke();
  drawingContext.shadowColor = `rgba(107, 81, 69, ${0.2 * alphaProgress})`;
  drawingContext.shadowBlur = 24;
  drawingContext.shadowOffsetY = 10;
  fill(191, 216, 184, 245 * alphaProgress);
  circle(0, 0, zone.diameter + 22);
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetY = 0;
  noFill();
  stroke(107, 81, 69, 115 * alphaProgress);
  strokeWeight(2.5);
  drawingContext.setLineDash([5, 7]);
  circle(0, 0, zone.diameter - 16);
  drawingContext.setLineDash([]);
  noStroke();
  fill(255, 253, 247, 150 * alphaProgress);
  circle(0, 0, 62);
  pop();

  push();
  textFont(notoFont);
  textAlign(CENTER, CENTER);
  fill(107, 81, 69, 220 * alphaProgress);
  noStroke();
  textSize(25);
  text('チャンネル登録', zone.cx, zone.cy + zone.diameter / 2 + 38);
  pop();
}

function drawCharacters(state) {
  endingTimeline.CHARACTERS.forEach((character, index) => {
    const characterState = endingTimeline.getCharacterState(index, state.frame);
    const source = characterImages[index];
    if (!source || characterState.opacity <= 0) {
      return;
    }
    const drawWidth = characterState.width * characterState.scale;
    const drawHeight = drawWidth * (source.height / source.width);
    const accentColor = color(endingTimeline.PALETTE[characterState.accent]);
    accentColor.setAlpha(68 * characterState.opacity);

    push();
    translate(characterState.x, characterState.y);
    rotate(characterState.rotation);
    noStroke();
    fill(accentColor);
    ellipse(0, 5, drawWidth * 1.17, drawHeight * 0.82);
    drawingContext.shadowColor = 'rgba(107, 81, 69, 0.18)';
    drawingContext.shadowBlur = 16;
    drawingContext.shadowOffsetY = 7;
    tint(255, 255 * characterState.opacity);
    image(source, 0, 0, drawWidth, drawHeight);
    noTint();
    drawingContext.shadowBlur = 0;
    drawingContext.shadowOffsetY = 0;
    pop();
  });
}

function drawMessages(state) {
  drawRevealedText(
    '見てくれてありがとう！',
    width / 2,
    137,
    79,
    rampartFont,
    endingTimeline.PALETTE.brown,
    state.titleProgress,
  );
  drawRevealedText(
    'また一緒に学ぼう',
    width / 2,
    224,
    35,
    notoFont,
    endingTimeline.PALETTE.brownSoft,
    state.subtitleProgress,
  );

  push();
  textFont(notoFont);
  noStroke();
  fill(107, 81, 69, 175 * endingTimeline.clamp(state.cardsProgress));
  textSize(26);
  text('Rikemen CH.', width / 2, 282);
  pop();
}

function drawRevealedText(textValue, x, y, size, font, fillColor, progress) {
  if (progress <= 0) {
    return;
  }
  push();
  textFont(font);
  textSize(size);
  textAlign(CENTER, CENTER);
  noStroke();
  fill(fillColor);
  const textWidthValue = textWidth(textValue);
  const context = drawingContext;
  context.save();
  context.beginPath();
  context.rect(
    x - textWidthValue / 2 - 8,
    y - size * 0.72,
    (textWidthValue + 16) * endingTimeline.clamp(progress),
    size * 1.5,
  );
  context.clip();
  text(textValue, x, y);
  context.restore();
  pop();
}
