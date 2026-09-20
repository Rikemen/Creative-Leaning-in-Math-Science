'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const timeline = require('../timeline-utils.js');
const recorder = require('../../rikemen-opening/recorder.js');

test('ending uses a fifteen-second recording duration', () => {
  assert.equal(timeline.RECORDING_DURATION_MS, 15000);
});

test('shared recorder prefers VP9 and falls back to VP8', () => {
  const vp9 = { isTypeSupported: (type) => type.includes('vp9') };
  const vp8 = { isTypeSupported: (type) => type.includes('vp8') };
  assert.equal(recorder.selectMimeType(vp9), 'video/webm;codecs=vp9,opus');
  assert.equal(recorder.selectMimeType(vp8), 'video/webm;codecs=vp8,opus');
});
