(function attachAudio(globalScope) {
  'use strict';

  const CUES = Object.freeze([
    { time: 0.45, duration: 0.22, frequency: 261.63, type: 'sine', gain: 0.11 },
    { time: 0.82, duration: 0.22, frequency: 329.63, type: 'triangle', gain: 0.1 },
    { time: 1.18, duration: 0.24, frequency: 392, type: 'sine', gain: 0.1 },
    { time: 1.58, duration: 0.28, frequency: 523.25, type: 'triangle', gain: 0.1 },
    { time: 2.45, duration: 0.7, frequency: 523.25, type: 'sine', gain: 0.065 },
    { time: 2.45, duration: 0.7, frequency: 659.25, type: 'sine', gain: 0.055 },
    { time: 2.45, duration: 0.7, frequency: 783.99, type: 'sine', gain: 0.05 },
    { time: 3.12, duration: 0.32, frequency: 1046.5, type: 'triangle', gain: 0.07 },
    { time: 4.05, duration: 0.48, frequency: 392, type: 'sine', gain: 0.075 },
  ]);

  function getCueEnd(cue) {
    return cue.time + cue.duration;
  }

  function validateCues(cues = CUES, maximumTime = 4.55) {
    return cues.every(
      (cue) =>
        Number.isFinite(cue.time) &&
        Number.isFinite(cue.duration) &&
        Number.isFinite(cue.frequency) &&
        cue.time >= 0 &&
        cue.duration > 0 &&
        cue.frequency > 0 &&
        cue.gain > 0 &&
        getCueEnd(cue) <= maximumTime,
    );
  }

  class SonicLogo {
    constructor(AudioContextClass) {
      const ContextClass =
        AudioContextClass || globalScope.AudioContext || globalScope.webkitAudioContext;
      if (!ContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }

      this.context = new ContextClass({ sampleRate: 48000 });
      this.master = this.context.createGain();
      this.master.gain.value = 0.62;
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

      CUES.forEach((cue) => {
        const oscillator = this.context.createOscillator();
        const envelope = this.context.createGain();
        const cueStart = startTime + cue.time;
        const attackEnd = cueStart + Math.min(0.035, cue.duration * 0.2);
        const cueEnd = cueStart + cue.duration;

        oscillator.type = cue.type;
        oscillator.frequency.setValueAtTime(cue.frequency, cueStart);
        envelope.gain.setValueAtTime(0.0001, cueStart);
        envelope.gain.exponentialRampToValueAtTime(cue.gain, attackEnd);
        envelope.gain.exponentialRampToValueAtTime(0.0001, cueEnd);
        oscillator.connect(envelope);
        envelope.connect(this.master);
        oscillator.start(cueStart);
        oscillator.stop(cueEnd + 0.02);

        this.activeNodes.add(oscillator);
        oscillator.addEventListener('ended', () => this.activeNodes.delete(oscillator), {
          once: true,
        });
      });

      return startTime;
    }

    stop() {
      this.activeNodes.forEach((node) => {
        try {
          node.stop();
        } catch (_error) {
          // Already stopped nodes are harmless.
        }
      });
      this.activeNodes.clear();
    }

    getCaptureStream() {
      return this.captureDestination.stream;
    }
  }

  const api = Object.freeze({ CUES, SonicLogo, getCueEnd, validateCues });
  globalScope.RikemenAudio = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
