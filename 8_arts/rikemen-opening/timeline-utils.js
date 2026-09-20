(function attachTimeline(globalScope) {
  'use strict';

  const FPS = 60;
  const TOTAL_FRAMES = 300;
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const TAU = Math.PI * 2;
  const CENTER = Object.freeze({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });

  const CHARACTERS = Object.freeze([
    { id: 'feru', file: '../../assets/01_Feru.png', width: 220, angle: -Math.PI / 2 },
    { id: 'aru', file: '../../assets/02_Aru.png', width: 190, angle: -Math.PI / 2 + TAU / 10 },
    { id: 'freed', file: '../../assets/03_Freed.png', width: 220, angle: -Math.PI / 2 + (TAU * 2) / 10 },
    { id: 'lily', file: '../../assets/04_Lily.PNG', width: 195, angle: -Math.PI / 2 + (TAU * 3) / 10 },
    { id: 'bell', file: '../../assets/05_Bell.PNG', width: 160, angle: -Math.PI / 2 + (TAU * 4) / 10 },
    { id: 'fara', file: '../../assets/06_Fara.PNG', width: 190, angle: -Math.PI / 2 + (TAU * 5) / 10 },
    { id: 'jean', file: '../../assets/07_Jean.PNG', width: 215, angle: -Math.PI / 2 + (TAU * 6) / 10 },
    { id: 'win', file: '../../assets/08_Win.png', width: 170, angle: -Math.PI / 2 + (TAU * 7) / 10 },
    { id: 'richard', file: '../../assets/09_Richard.png', width: 210, angle: -Math.PI / 2 + (TAU * 8) / 10 },
    { id: 'newt', file: '../../assets/10_Newt.png', width: 215, angle: -Math.PI / 2 + (TAU * 9) / 10 },
  ]);

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function progressBetween(frame, startFrame, endFrame) {
    if (endFrame === startFrame) {
      return frame >= endFrame ? 1 : 0;
    }
    return clamp((frame - startFrame) / (endFrame - startFrame));
  }

  function easeOutCubic(value) {
    const inverse = 1 - clamp(value);
    return 1 - inverse * inverse * inverse;
  }

  function easeInOutCubic(value) {
    const t = clamp(value);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutBack(value) {
    const t = clamp(value);
    if (t === 0 || t === 1) {
      return t;
    }
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function normalizeFrame(frame) {
    if (!Number.isFinite(frame)) {
      return 0;
    }
    return clamp(Math.floor(frame), 0, TOTAL_FRAMES - 1);
  }

  function getOpeningState(inputFrame) {
    const frame = normalizeFrame(inputFrame);
    return {
      frame,
      seconds: frame / FPS,
      introProgress: easeOutCubic(progressBetween(frame, 0, 24)),
      orbitProgress: easeInOutCubic(progressBetween(frame, 24, 108)),
      convergenceProgress: easeInOutCubic(progressBetween(frame, 108, 168)),
      logoProgress: easeOutBack(progressBetween(frame, 144, 198)),
      holdProgress: progressBetween(frame, 198, 276),
      fadeProgress: easeInOutCubic(progressBetween(frame, 276, TOTAL_FRAMES - 1)),
    };
  }

  function getCharacterState(characterIndex, inputFrame) {
    const character = CHARACTERS[characterIndex];
    if (!character) {
      throw new RangeError(`Unknown character index: ${characterIndex}`);
    }

    const frame = normalizeFrame(inputFrame);
    const enterStart = 22 + characterIndex * 5;
    const enterEnd = enterStart + 62;
    const enterProgress = easeOutCubic(progressBetween(frame, enterStart, enterEnd));
    const settleProgress = easeInOutCubic(progressBetween(frame, 92, 198));
    const finalAngle = character.angle;

    const entranceAngle = lerp(finalAngle - 1.18, finalAngle + 0.42, enterProgress);
    const angle = lerp(entranceAngle, finalAngle, settleProgress);
    const entranceRadius = lerp(1.68, 1.08, enterProgress);
    const settlingPulse = Math.sin(settleProgress * Math.PI * 3) * 0.055 * (1 - settleProgress);
    const radiusScale = lerp(entranceRadius, 1, settleProgress) + settlingPulse;
    const idleStrength = progressBetween(frame, 198, 220);
    const idleOffset = Math.sin(frame * 0.035 + characterIndex * 0.8) * 3 * idleStrength;
    const radiusX = 650 * radiusScale;
    const radiusY = 300 * radiusScale;

    return {
      id: character.id,
      x: CENTER.x + Math.cos(angle) * radiusX,
      y: CENTER.y + Math.sin(angle) * radiusY + idleOffset,
      width: character.width,
      opacity: progressBetween(frame, enterStart, enterStart + 20),
      scale: lerp(0.54, 1, easeOutBack(enterProgress)),
      rotation: lerp(-0.18, 0, settleProgress) + Math.sin(frame * 0.025 + characterIndex) * 0.008 * idleStrength,
      glow: 0.25 + 0.75 * progressBetween(frame, 132, 198),
      finalAngle,
    };
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createParticles(count = 72, seed = 20260828) {
    const random = mulberry32(seed);
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      x: random(),
      y: random(),
      size: lerp(2, 8, random()),
      speed: lerp(0.00025, 0.0012, random()),
      drift: lerp(10, 42, random()),
      phase: random() * TAU,
      colorIndex: Math.floor(random() * 3),
    }));
  }

  function getParticleState(particle, inputFrame) {
    const frame = normalizeFrame(inputFrame);
    const time = frame / FPS;
    const travel = (particle.y - time * particle.speed * FPS + 1) % 1;
    return {
      x: particle.x * CANVAS_WIDTH + Math.sin(time * 0.7 + particle.phase) * particle.drift,
      y: travel * CANVAS_HEIGHT,
      size: particle.size * (0.7 + Math.sin(time * 1.4 + particle.phase) * 0.3),
      opacity: 0.25 + 0.35 * (0.5 + Math.sin(time * 1.8 + particle.phase) * 0.5),
      colorIndex: particle.colorIndex,
    };
  }

  const api = Object.freeze({
    FPS,
    TOTAL_FRAMES,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CENTER,
    CHARACTERS,
    clamp,
    lerp,
    progressBetween,
    easeOutCubic,
    easeInOutCubic,
    easeOutBack,
    normalizeFrame,
    getOpeningState,
    getCharacterState,
    createParticles,
    getParticleState,
  });

  globalScope.RikemenTimeline = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
