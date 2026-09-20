(function attachEndingAudio(globalScope) {
  'use strict';

  const CUES = Object.freeze([
    { time: 0.4, duration: 0.28, frequency: 261.63, gain: 0.07, timbre: 'mallet' },
    { time: 0.82, duration: 0.28, frequency: 329.63, gain: 0.068, timbre: 'mallet' },
    { time: 1.24, duration: 0.3, frequency: 392, gain: 0.068, timbre: 'mallet' },
    { time: 1.68, duration: 0.32, frequency: 440, gain: 0.065, timbre: 'mallet' },
    { time: 2.12, duration: 0.34, frequency: 392, gain: 0.06, timbre: 'mallet' },
    { time: 2.58, duration: 0.36, frequency: 329.63, gain: 0.06, timbre: 'mallet' },
    { time: 3.06, duration: 0.58, frequency: 261.63, gain: 0.065, timbre: 'mallet' },
    { time: 4.45, duration: 0.9, frequency: 261.63, gain: 0.035, timbre: 'soft' },
    { time: 4.45, duration: 0.9, frequency: 329.63, gain: 0.028, timbre: 'soft' },
    { time: 4.45, duration: 0.9, frequency: 392, gain: 0.026, timbre: 'soft' },
    { time: 8.5, duration: 0.48, frequency: 1046.5, gain: 0.03, timbre: 'bell' },
    { time: 12, duration: 0.56, frequency: 783.99, gain: 0.028, timbre: 'bell' },
    { time: 13.55, duration: 0.75, frequency: 523.25, gain: 0.034, timbre: 'bell' },
  ]);

  function getCueEnd(cue) {
    return cue.time + cue.duration;
  }

  function validateCues(cues = CUES, maximumTime = 14.4) {
    return cues.every(
      (cue) =>
        Number.isFinite(cue.time) &&
        Number.isFinite(cue.duration) &&
        Number.isFinite(cue.frequency) &&
        cue.time >= 0 &&
        cue.duration > 0 &&
        cue.frequency > 0 &&
        cue.gain > 0 &&
        cue.gain <= 0.08 &&
        getCueEnd(cue) <= maximumTime,
    );
  }

  class CozyJingle {
    constructor(AudioContextClass) {
      const ContextClass =
        AudioContextClass || globalScope.AudioContext || globalScope.webkitAudioContext;
      if (!ContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      this.context = new ContextClass({ sampleRate: 48000 });
      this.master = this.context.createGain();
      this.master.gain.value = 0.56;
      this.captureDestination = this.context.createMediaStreamDestination();
      this.master.connect(this.context.destination);
      this.master.connect(this.captureDestination);
      this.activeNodes = new Set();
    }

    async ensureReady() {
      if (this.context.state !== 'running') {
        await this.context.resume();
      }
      return this.context;
    }

    async play() {
      await this.ensureReady();
      this.stop();
      const startTime = this.context.currentTime + 0.035;
      CUES.forEach((cue) => this.scheduleCue(cue, startTime));
      return startTime;
    }

    scheduleCue(cue, startTime) {
      const cueStart = startTime + cue.time;
      const cueEnd = cueStart + cue.duration;
      const oscillator = this.context.createOscillator();
      const overtone = this.context.createOscillator();
      const envelope = this.context.createGain();
      const overtoneGain = this.context.createGain();
      const attackDuration = cue.timbre === 'soft' ? 0.12 : 0.025;

      oscillator.type = cue.timbre === 'mallet' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(cue.frequency, cueStart);
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(cue.frequency * 2, cueStart);
      overtoneGain.gain.value = cue.timbre === 'bell' ? 0.18 : 0.1;

      envelope.gain.setValueAtTime(0.0001, cueStart);
      envelope.gain.exponentialRampToValueAtTime(cue.gain, cueStart + attackDuration);
      envelope.gain.exponentialRampToValueAtTime(0.0001, cueEnd);
      oscillator.connect(envelope);
      overtone.connect(overtoneGain);
      overtoneGain.connect(envelope);
      envelope.connect(this.master);
      oscillator.start(cueStart);
      overtone.start(cueStart);
      oscillator.stop(cueEnd + 0.02);
      overtone.stop(cueEnd + 0.02);

      [oscillator, overtone].forEach((node) => {
        this.activeNodes.add(node);
        node.addEventListener('ended', () => this.activeNodes.delete(node), { once: true });
      });
    }

    stop() {
      this.activeNodes.forEach((node) => {
        try {
          node.stop();
        } catch (_error) {
          // Stopping an already-ended oscillator is harmless.
        }
      });
      this.activeNodes.clear();
    }

    getCaptureStream() {
      return this.captureDestination.stream;
    }
  }

  const api = Object.freeze({ CUES, CozyJingle, getCueEnd, validateCues });
  globalScope.RikemenEndingAudio = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
