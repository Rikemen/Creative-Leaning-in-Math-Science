'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const audio = require('../audio-engine.js');

test('all sonic-logo cues finish before the visual fade', () => {
  assert.equal(audio.validateCues(), true);
  assert.ok(Math.max(...audio.CUES.map(audio.getCueEnd)) <= 4.55);
});

test('every audio cue has a safe positive gain and supported oscillator shape', () => {
  const supportedTypes = new Set(['sine', 'triangle', 'square', 'sawtooth']);
  audio.CUES.forEach((cue) => {
    assert.ok(cue.gain > 0 && cue.gain <= 0.12);
    assert.ok(supportedTypes.has(cue.type));
  });
});
