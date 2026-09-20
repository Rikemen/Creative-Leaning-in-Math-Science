(function attachEndingTimeline(globalScope) {
  'use strict';

  const FPS = 60;
  const TOTAL_FRAMES = 900;
  const RECORDING_DURATION_MS = 15000;
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;

  const PALETTE = Object.freeze({
    paper: '#fff8e8',
    paperShadow: '#ddc8aa',
    sky: '#bfe3ec',
    peach: '#f6c9a8',
    sage: '#bfd8b8',
    butter: '#f4dda0',
    brown: '#6b5145',
    brownSoft: '#9b7d6e',
    white: '#fffdf7',
  });

  const END_SCREEN_ZONES = Object.freeze({
    leftVideo: Object.freeze({ id: 'leftVideo', x: 150, y: 315, width: 640, height: 360 }),
    rightVideo: Object.freeze({ id: 'rightVideo', x: 1130, y: 315, width: 640, height: 360 }),
    subscribe: Object.freeze({ id: 'subscribe', cx: 960, cy: 825, diameter: 180 }),
    title: Object.freeze({ id: 'title', x: 300, y: 85, width: 1320, height: 160 }),
  });

  const CHARACTERS = Object.freeze([
    {
      id: 'feru',
      file: '../../assets/01_Feru.png',
      width: 150,
      aspect: 1,
      x: 190,
      y: 170,
      entrance: 'top',
      accent: 'sky',
    },
    {
      id: 'aru',
      file: '../../assets/02_Aru.png',
      width: 145,
      aspect: 1,
      x: 1730,
      y: 170,
      entrance: 'top',
      accent: 'butter',
    },
    {
      id: 'freed',
      file: '../../assets/03_Freed.png',
      width: 175,
      aspect: 1,
      x: 280,
      y: 840,
      entrance: 'bottom',
      accent: 'sky',
    },
    {
      id: 'lily',
      file: '../../assets/04_Lily.PNG',
      width: 140,
      aspect: 1,
      x: 470,
      y: 840,
      entrance: 'bottom',
      accent: 'peach',
    },
    {
      id: 'bell',
      file: '../../assets/05_Bell.PNG',
      width: 105,
      aspect: 1378 / 1080,
      x: 620,
      y: 840,
      entrance: 'bottom',
      accent: 'sky',
    },
    {
      id: 'fara',
      file: '../../assets/06_Fara.PNG',
      width: 135,
      aspect: 1,
      x: 770,
      y: 840,
      entrance: 'bottom',
      accent: 'peach',
    },
    {
      id: 'jean',
      file: '../../assets/07_Jean.PNG',
      width: 160,
      aspect: 1,
      x: 1135,
      y: 840,
      entrance: 'bottom',
      accent: 'butter',
    },
    {
      id: 'win',
      file: '../../assets/08_Win.png',
      width: 120,
      aspect: 1170 / 1080,
      x: 1300,
      y: 840,
      entrance: 'bottom',
      accent: 'sage',
    },
    {
      id: 'richard',
      file: '../../assets/09_Richard.png',
      width: 150,
      aspect: 1,
      x: 1480,
      y: 840,
      entrance: 'bottom',
      accent: 'sage',
    },
    {
      id: 'newt',
      file: '../../assets/10_Newt.png',
      width: 170,
      aspect: 1,
      x: 1700,
      y: 840,
      entrance: 'bottom',
      accent: 'peach',
    },
  ]);

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function progressBetween(frame, startFrame, endFrame) {
    if (startFrame === endFrame) {
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

  function getEndingState(inputFrame) {
    const frame = normalizeFrame(inputFrame);
    const calmProgress = easeInOutCubic(progressBetween(frame, 810, 863));
    return {
      frame,
      seconds: frame / FPS,
      paperProgress: easeOutCubic(progressBetween(frame, 0, 89)),
      titleProgress: easeOutCubic(progressBetween(frame, 144, 225)),
      subtitleProgress: easeOutCubic(progressBetween(frame, 174, 251)),
      cardsProgress: easeOutBack(progressBetween(frame, 216, 329)),
      subscribeProgress: easeOutBack(progressBetween(frame, 246, 329)),
      holdProgress: progressBetween(frame, 330, 809),
      calmProgress,
      motionScale: lerp(1, 0.35, calmProgress),
    };
  }

  function getZoneBounds(zone) {
    if ('diameter' in zone) {
      return {
        x: zone.cx - zone.diameter / 2,
        y: zone.cy - zone.diameter / 2,
        width: zone.diameter,
        height: zone.diameter,
      };
    }
    return { x: zone.x, y: zone.y, width: zone.width, height: zone.height };
  }

  function rectsIntersect(first, second) {
    return (
      first.x < second.x + second.width &&
      first.x + first.width > second.x &&
      first.y < second.y + second.height &&
      first.y + first.height > second.y
    );
  }

  function pointInRect(x, y, rect, padding = 0) {
    return (
      x >= rect.x - padding &&
      x <= rect.x + rect.width + padding &&
      y >= rect.y - padding &&
      y <= rect.y + rect.height + padding
    );
  }

  function isPointReserved(x, y, padding = 18) {
    return Object.values(END_SCREEN_ZONES).some((zone) =>
      pointInRect(x, y, getZoneBounds(zone), padding),
    );
  }

  function getCharacterState(characterIndex, inputFrame) {
    const character = CHARACTERS[characterIndex];
    if (!character) {
      throw new RangeError(`Unknown character index: ${characterIndex}`);
    }

    const frame = normalizeFrame(inputFrame);
    const enterStart = 72 + characterIndex * 7;
    const enterEnd = enterStart + 92;
    const linearProgress = progressBetween(frame, enterStart, enterEnd);
    const positionProgress = easeOutCubic(linearProgress);
    const bouncePhase = progressBetween(linearProgress, 0.62, 1);
    const bounceDirection = character.entrance === 'top' ? 1 : -1;
    const entranceBounce = Math.sin(bouncePhase * Math.PI) * 12 * bounceDirection;
    const finalHeight = character.width * character.aspect;
    const initialY =
      character.entrance === 'top' ? -finalHeight * 0.65 : CANVAS_HEIGHT + finalHeight * 0.65;
    const idleReady = progressBetween(frame, 228, 330);
    const endingState = getEndingState(frame);
    const idleOffset =
      Math.sin(frame * 0.022 + characterIndex * 0.74) * 2.5 * idleReady * endingState.motionScale;

    return {
      id: character.id,
      x: character.x + Math.sin(frame * 0.013 + characterIndex) * 0.7 * idleReady,
      y: lerp(initialY, character.y, positionProgress) + entranceBounce + idleOffset,
      width: character.width,
      height: finalHeight,
      opacity: progressBetween(frame, enterStart, enterStart + 24),
      scale: lerp(0.92, 1, easeOutBack(linearProgress)),
      rotation:
        lerp(characterIndex % 2 === 0 ? -0.075 : 0.075, 0, linearProgress) +
        Math.sin(frame * 0.018 + characterIndex) * 0.004 * idleReady * endingState.motionScale,
      accent: character.accent,
    };
  }

  function getCharacterBounds(characterIndex, inputFrame) {
    const state = getCharacterState(characterIndex, inputFrame);
    const width = state.width * state.scale;
    const height = state.height * state.scale;
    return {
      x: state.x - width / 2,
      y: state.y - height / 2,
      width,
      height,
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

  function createPaperGrain(count = 260, seed = 15082026) {
    const random = mulberry32(seed);
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      x: random() * CANVAS_WIDTH,
      y: random() * CANVAS_HEIGHT,
      alpha: lerp(8, 24, random()),
      size: lerp(0.8, 2.6, random()),
    }));
  }

  function createDecorations(count = 34, seed = 20260828) {
    const random = mulberry32(seed);
    const kinds = ['leaf', 'paper', 'spark'];
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      kind: kinds[Math.floor(random() * kinds.length)],
      baseX: random() * CANVAS_WIDTH,
      baseY: random() * CANVAS_HEIGHT,
      size: lerp(8, 22, random()),
      speed: lerp(0.12, 0.36, random()),
      drift: lerp(8, 26, random()),
      phase: random() * Math.PI * 2,
      rotation: lerp(-0.8, 0.8, random()),
      colorIndex: Math.floor(random() * 4),
    }));
  }

  function getDecorationState(decoration, inputFrame) {
    const frame = normalizeFrame(inputFrame);
    const seconds = frame / FPS;
    const endingState = getEndingState(frame);
    const x =
      decoration.baseX +
      Math.sin(seconds * decoration.speed + decoration.phase) * decoration.drift * endingState.motionScale;
    const y =
      decoration.baseY +
      Math.cos(seconds * decoration.speed * 0.72 + decoration.phase) *
        decoration.drift *
        0.55 *
        endingState.motionScale;
    return {
      ...decoration,
      x,
      y,
      rotation: decoration.rotation + Math.sin(seconds * 0.2 + decoration.phase) * 0.18,
      opacity: 0.32 + Math.sin(seconds * 0.34 + decoration.phase) * 0.08,
      visible: !isPointReserved(x, y, decoration.size + 12),
    };
  }

  const api = Object.freeze({
    FPS,
    TOTAL_FRAMES,
    RECORDING_DURATION_MS,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PALETTE,
    END_SCREEN_ZONES,
    CHARACTERS,
    clamp,
    lerp,
    progressBetween,
    easeOutCubic,
    easeInOutCubic,
    easeOutBack,
    normalizeFrame,
    getEndingState,
    getZoneBounds,
    rectsIntersect,
    isPointReserved,
    getCharacterState,
    getCharacterBounds,
    createPaperGrain,
    createDecorations,
    getDecorationState,
  });

  globalScope.RikemenEndingTimeline = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
