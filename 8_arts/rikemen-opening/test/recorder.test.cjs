'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const recorder = require('../recorder.js');

test('recorder prefers VP9 and falls back to VP8', () => {
  const vp9 = { isTypeSupported: (type) => type.includes('vp9') };
  const vp8 = { isTypeSupported: (type) => type.includes('vp8') };
  assert.equal(recorder.selectMimeType(vp9), 'video/webm;codecs=vp9,opus');
  assert.equal(recorder.selectMimeType(vp8), 'video/webm;codecs=vp8,opus');
});

test('recorder reports no explicit MIME type when none is supported', () => {
  const unsupported = { isTypeSupported: () => false };
  assert.equal(recorder.selectMimeType(unsupported), '');
});

test('video and audio tracks are combined without unrelated tracks', () => {
  class FakeStream {
    constructor(tracks) {
      this.tracks = tracks;
    }
  }
  const videoTrack = { kind: 'video' };
  const audioTrack = { kind: 'audio' };
  const video = { getVideoTracks: () => [videoTrack] };
  const audio = { getAudioTracks: () => [audioTrack] };
  const combined = recorder.combineStreams(video, audio, FakeStream);
  assert.deepEqual(combined.tracks, [videoTrack, audioTrack]);
});

test('stopping a recording preserves the reusable audio track', () => {
  let videoStopped = false;
  let audioStopped = false;
  const video = {
    getVideoTracks: () => [{ stop: () => (videoStopped = true) }],
  };
  const audioTrack = { stop: () => (audioStopped = true) };

  recorder.stopCapturedVideo(video);

  assert.equal(videoStopped, true);
  assert.equal(audioStopped, false);
  assert.equal(typeof audioTrack.stop, 'function');
});
