'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const timeline = require('../timeline-utils.js');

test('opening is a fixed five-second 1080p timeline', () => {
  assert.equal(timeline.FPS, 60);
  assert.equal(timeline.TOTAL_FRAMES, 300);
  assert.equal(timeline.CANVAS_WIDTH, 1920);
  assert.equal(timeline.CANVAS_HEIGHT, 1080);
  assert.equal(timeline.normalizeFrame(-20), 0);
  assert.equal(timeline.normalizeFrame(500), 299);
});

test('all ten source illustrations are registered exactly once', () => {
  assert.equal(timeline.CHARACTERS.length, 10);
  assert.equal(new Set(timeline.CHARACTERS.map((character) => character.file)).size, 10);
  timeline.CHARACTERS.forEach((character) => {
    assert.equal(fs.existsSync(path.resolve(__dirname, '..', character.file)), true);
  });
  assert.equal(
    fs.existsSync(
      path.resolve(__dirname, '../../../rec/assets/fonts/Roboto/static/Roboto-Black.ttf'),
    ),
    true,
  );
});

test('animation phase boundaries are stable', () => {
  assert.equal(timeline.getOpeningState(0).introProgress, 0);
  assert.equal(timeline.getOpeningState(24).introProgress, 1);
  assert.equal(timeline.getOpeningState(144).logoProgress, 0);
  assert.equal(timeline.getOpeningState(198).logoProgress, 1);
  assert.equal(timeline.getOpeningState(276).fadeProgress, 0);
  assert.equal(timeline.getOpeningState(299).fadeProgress, 1);
});

test('character states stay finite and visible inside the final safe area', () => {
  const safeX = timeline.CANVAS_WIDTH * 0.05;
  const safeY = timeline.CANVAS_HEIGHT * 0.05;

  timeline.CHARACTERS.forEach((_character, index) => {
    [0, 24, 84, 150, 210, 285, 299].forEach((frame) => {
      const state = timeline.getCharacterState(index, frame);
      assert.ok(Number.isFinite(state.x));
      assert.ok(Number.isFinite(state.y));
      assert.ok(Number.isFinite(state.scale));
      assert.ok(state.opacity >= 0 && state.opacity <= 1);
    });

    const finalState = timeline.getCharacterState(index, 220);
    assert.ok(finalState.x - finalState.width / 2 >= safeX);
    assert.ok(finalState.x + finalState.width / 2 <= timeline.CANVAS_WIDTH - safeX);
    assert.ok(finalState.y >= safeY);
    assert.ok(finalState.y <= timeline.CANVAS_HEIGHT - safeY);
  });
});

test('seeded particles are deterministic', () => {
  const first = timeline.createParticles(12, 42);
  const second = timeline.createParticles(12, 42);
  assert.deepEqual(first, second);
  assert.deepEqual(
    timeline.getParticleState(first[0], 150),
    timeline.getParticleState(second[0], 150),
  );
});
