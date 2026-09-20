'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const audio = require('../audio-engine.js');

test('cozy jingle cues stay quiet and finish before the final hold', () => {
  assert.equal(audio.validateCues(), true);
  assert.ok(Math.max(...audio.CUES.map(audio.getCueEnd)) <= 14.4);
  audio.CUES.forEach((cue) => assert.ok(cue.gain <= 0.08));
});

test('the final bell resolves on C5', () => {
  const finalCue = audio.CUES[audio.CUES.length - 1];
  assert.equal(finalCue.frequency, 523.25);
  assert.equal(finalCue.timbre, 'bell');
});
