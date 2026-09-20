'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const timeline = require('../timeline-utils.js');

test('ending is a fixed fifteen-second 1080p timeline', () => {
  assert.equal(timeline.FPS, 60);
  assert.equal(timeline.TOTAL_FRAMES, 900);
  assert.equal(timeline.RECORDING_DURATION_MS, 15000);
  assert.equal(timeline.CANVAS_WIDTH, 1920);
  assert.equal(timeline.CANVAS_HEIGHT, 1080);
  assert.equal(timeline.normalizeFrame(-1), 0);
  assert.equal(timeline.normalizeFrame(1200), 899);
});

test('cozy animation phase boundaries are stable', () => {
  assert.equal(timeline.getEndingState(0).paperProgress, 0);
  assert.equal(timeline.getEndingState(89).paperProgress, 1);
  assert.equal(timeline.getEndingState(144).titleProgress, 0);
  assert.equal(timeline.getEndingState(225).titleProgress, 1);
  assert.equal(timeline.getEndingState(174).subtitleProgress, 0);
  assert.equal(timeline.getEndingState(251).subtitleProgress, 1);
  assert.equal(timeline.getEndingState(216).cardsProgress, 0);
  assert.equal(timeline.getEndingState(329).cardsProgress, 1);
  assert.equal(timeline.getEndingState(810).calmProgress, 0);
  assert.equal(timeline.getEndingState(863).calmProgress, 1);
});

test('paper grain and floating decorations are deterministic', () => {
  assert.deepEqual(timeline.createPaperGrain(20, 42), timeline.createPaperGrain(20, 42));
  const first = timeline.createDecorations(20, 73);
  const second = timeline.createDecorations(20, 73);
  assert.deepEqual(first, second);
  assert.deepEqual(
    timeline.getDecorationState(first[0], 540),
    timeline.getDecorationState(second[0], 540),
  );
});

test('palette is warm and does not reuse the opening navy', () => {
  assert.equal(timeline.PALETTE.paper, '#fff8e8');
  assert.equal(timeline.PALETTE.sky, '#bfe3ec');
  assert.equal(Object.values(timeline.PALETTE).includes('#06121f'), false);
});
