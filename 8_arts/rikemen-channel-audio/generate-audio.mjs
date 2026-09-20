import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../..');
const openingOutput = path.join(repositoryRoot, '8_arts/rikemen-opening/audio/rikemen-opening-5s.wav');
const endingOutput = path.join(repositoryRoot, '8_arts/rikemen-ending/audio/rikemen-ending-cozy-15s.wav');

let noiseState = 0x20260828;

function random() {
  noiseState += 0x6d2b79f5;
  let value = noiseState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function createTrack(durationSeconds) {
  const sampleCount = Math.round(durationSeconds * SAMPLE_RATE);
  return {
    durationSeconds,
    left: new Float64Array(sampleCount),
    right: new Float64Array(sampleCount),
  };
}

function constantPowerPan(pan) {
  const normalized = Math.min(1, Math.max(-1, pan));
  const angle = ((normalized + 1) * Math.PI) / 4;
  return { left: Math.cos(angle), right: Math.sin(angle) };
}

function addSignal(track, startTime, duration, pan, sampleFunction) {
  const startSample = Math.max(0, Math.floor(startTime * SAMPLE_RATE));
  const endSample = Math.min(track.left.length, Math.ceil((startTime + duration) * SAMPLE_RATE));
  const panGain = constantPowerPan(pan);
  for (let index = startSample; index < endSample; index += 1) {
    const localTime = index / SAMPLE_RATE - startTime;
    const value = sampleFunction(localTime, duration);
    track.left[index] += value * panGain.left;
    track.right[index] += value * panGain.right;
  }
}

function smoothEnvelope(time, duration, attack, release) {
  const attackGain = Math.min(1, time / Math.max(attack, 0.0001));
  const releaseGain = Math.min(1, (duration - time) / Math.max(release, 0.0001));
  return Math.max(0, Math.min(attackGain, releaseGain));
}

function addMallet(track, time, frequency, duration, gain, pan = 0) {
  const phaseOffset = random() * Math.PI * 2;
  addSignal(track, time, duration, pan, (localTime, totalDuration) => {
    const attack = Math.min(1, localTime / 0.012);
    const decay = Math.exp((-5.2 * localTime) / totalDuration);
    const release = Math.min(1, (totalDuration - localTime) / 0.09);
    const body =
      Math.sin(Math.PI * 2 * frequency * localTime + phaseOffset) +
      0.29 * Math.sin(Math.PI * 2 * frequency * 2.01 * localTime + phaseOffset * 0.4) +
      0.11 * Math.sin(Math.PI * 2 * frequency * 3.98 * localTime);
    const click = (random() * 2 - 1) * Math.exp(-localTime * 95) * 0.15;
    return (body * 0.72 + click) * gain * attack * decay * release;
  });
}

function addBell(track, time, frequency, duration, gain, pan = 0) {
  const partials = [
    [1, 1],
    [2.01, 0.33],
    [3.99, 0.14],
    [5.43, 0.07],
  ];
  addSignal(track, time, duration, pan, (localTime, totalDuration) => {
    const envelope =
      Math.min(1, localTime / 0.008) *
      Math.exp((-4.5 * localTime) / totalDuration) *
      Math.min(1, (totalDuration - localTime) / 0.12);
    const value = partials.reduce(
      (sum, [ratio, level], index) =>
        sum +
        Math.sin(Math.PI * 2 * frequency * ratio * localTime + index * 0.37) *
          level *
          Math.exp(-localTime * index * 0.32),
      0,
    );
    return value * gain * envelope * 0.74;
  });
}

function addPadVoice(track, time, frequency, duration, gain, pan, detune = 0) {
  const tunedFrequency = frequency * Math.pow(2, detune / 1200);
  addSignal(track, time, duration, pan, (localTime, totalDuration) => {
    const envelope = smoothEnvelope(localTime, totalDuration, 0.42, 0.7);
    const slowMotion = 0.94 + Math.sin(localTime * Math.PI * 0.7) * 0.06;
    const value =
      Math.sin(Math.PI * 2 * tunedFrequency * localTime) +
      0.22 * Math.sin(Math.PI * 2 * tunedFrequency * 2 * localTime + 0.3) +
      0.08 * Math.sin(Math.PI * 2 * tunedFrequency * 3 * localTime + 0.7);
    return value * gain * envelope * slowMotion * 0.72;
  });
}

function addPadChord(track, time, duration, frequencies, gain) {
  frequencies.forEach((frequency, index) => {
    const spread = frequencies.length === 1 ? 0 : index / (frequencies.length - 1);
    const pan = -0.46 + spread * 0.92;
    addPadVoice(track, time, frequency, duration, gain, pan, index % 2 === 0 ? -3 : 3);
  });
}

function addBass(track, time, frequency, duration, gain) {
  addSignal(track, time, duration, 0, (localTime, totalDuration) => {
    const envelope = smoothEnvelope(localTime, totalDuration, 0.08, 0.34);
    const value =
      Math.sin(Math.PI * 2 * frequency * localTime) +
      0.15 * Math.sin(Math.PI * 2 * frequency * 2 * localTime);
    return value * gain * envelope * 0.8;
  });
}

function addSynthStab(track, time, frequency, duration, gain, pan = 0) {
  const phaseOffset = random() * Math.PI * 2;
  addSignal(track, time, duration, pan, (localTime, totalDuration) => {
    const attack = Math.min(1, localTime / 0.006);
    const decay = Math.exp((-6.8 * localTime) / totalDuration);
    const release = Math.min(1, (totalDuration - localTime) / 0.055);
    const pitchSnap = frequency * (1 + 0.012 * Math.exp(-localTime * 38));
    const phase = Math.PI * 2 * pitchSnap * localTime + phaseOffset;
    const value =
      Math.sin(phase) +
      0.4 * Math.sin(phase * 2 + 0.18) +
      0.19 * Math.sin(phase * 3 + 0.46) +
      0.08 * Math.sin(phase * 5 + 0.91);
    return value * gain * attack * decay * release * 0.68;
  });
}

function addPulseBass(track, time, frequency, duration, gain) {
  addSignal(track, time, duration, 0, (localTime, totalDuration) => {
    const attack = Math.min(1, localTime / 0.008);
    const decay = Math.exp((-4.6 * localTime) / totalDuration);
    const release = Math.min(1, (totalDuration - localTime) / 0.09);
    const value =
      Math.sin(Math.PI * 2 * frequency * localTime) +
      0.24 * Math.sin(Math.PI * 2 * frequency * 2 * localTime + 0.16);
    return value * gain * attack * decay * release * 0.82;
  });
}

function addKick(track, time, duration, gain) {
  addSignal(track, time, duration, 0, (localTime, totalDuration) => {
    const sweepRate = 31;
    const endFrequency = 49;
    const frequencySweep = 112;
    const phase =
      Math.PI *
      2 *
      (endFrequency * localTime +
        (frequencySweep * (1 - Math.exp(-sweepRate * localTime))) / sweepRate);
    const envelope =
      Math.exp((-8.5 * localTime) / totalDuration) *
      Math.min(1, (totalDuration - localTime) / 0.045);
    const click = (random() * 2 - 1) * Math.exp(-localTime * 92) * 0.2;
    return (Math.sin(phase) + click) * gain * envelope;
  });
}

function addSnap(track, time, duration, gain, pan = 0) {
  let lowPass = 0;
  addSignal(track, time, duration, pan, (localTime, totalDuration) => {
    const white = random() * 2 - 1;
    lowPass += (white - lowPass) * 0.13;
    const brightNoise = white - lowPass;
    const firstBurst = Math.exp(-localTime * 34);
    const secondBurst = localTime > 0.027 ? 0.38 * Math.exp(-(localTime - 0.027) * 42) : 0;
    const release = Math.min(1, (totalDuration - localTime) / 0.035);
    const body = Math.sin(Math.PI * 2 * 184 * localTime) * Math.exp(-localTime * 26) * 0.22;
    return (brightNoise * (firstBurst + secondBurst) + body) * gain * release;
  });
}

function addBrush(track, time, duration, gain, pan) {
  let lowPass = 0;
  addSignal(track, time, duration, pan, (localTime, totalDuration) => {
    const white = random() * 2 - 1;
    lowPass += (white - lowPass) * 0.08;
    const highPassed = white - lowPass;
    const envelope = Math.sin((Math.PI * localTime) / totalDuration) * Math.exp(-localTime * 3.5);
    return highPassed * gain * envelope;
  });
}

function addWhoosh(track, time, duration, gain) {
  let leftLowPass = 0;
  let rightLowPass = 0;
  const startSample = Math.floor(time * SAMPLE_RATE);
  const endSample = Math.min(track.left.length, Math.ceil((time + duration) * SAMPLE_RATE));
  for (let index = startSample; index < endSample; index += 1) {
    const localTime = index / SAMPLE_RATE - time;
    const progress = localTime / duration;
    const envelope = Math.sin(Math.PI * progress) * (0.35 + progress * 0.65);
    const leftNoise = random() * 2 - 1;
    const rightNoise = random() * 2 - 1;
    const smoothing = 0.01 + progress * 0.09;
    leftLowPass += (leftNoise - leftLowPass) * smoothing;
    rightLowPass += (rightNoise - rightLowPass) * smoothing;
    track.left[index] += leftLowPass * gain * envelope;
    track.right[index] += rightLowPass * gain * envelope;
  }
}

function applyRoom(track, amount = 1) {
  const dryLeft = track.left.slice();
  const dryRight = track.right.slice();
  const taps = [
    [0.113, 0.13],
    [0.197, 0.085],
    [0.337, 0.052],
  ];
  taps.forEach(([delaySeconds, gain], tapIndex) => {
    const delay = Math.floor(delaySeconds * SAMPLE_RATE);
    for (let index = delay; index < track.left.length; index += 1) {
      const cross = tapIndex % 2 === 0;
      track.left[index] += (cross ? dryRight[index - delay] : dryLeft[index - delay]) * gain * amount;
      track.right[index] += (cross ? dryLeft[index - delay] : dryRight[index - delay]) * gain * amount;
    }
  });
}

function masterTrack(track, targetPeak, fadeInSeconds, fadeOutSeconds, drive = 1.08) {
  let peak = 0;
  for (let index = 0; index < track.left.length; index += 1) {
    const time = index / SAMPLE_RATE;
    const fadeIn = Math.min(1, time / fadeInSeconds);
    const fadeOut = Math.min(1, (track.durationSeconds - time) / fadeOutSeconds);
    const fade = Math.max(0, Math.min(fadeIn, fadeOut));
    track.left[index] = Math.tanh(track.left[index] * drive) * fade;
    track.right[index] = Math.tanh(track.right[index] * drive) * fade;
    peak = Math.max(peak, Math.abs(track.left[index]), Math.abs(track.right[index]));
  }
  const normalization = peak > 0 ? targetPeak / peak : 1;
  for (let index = 0; index < track.left.length; index += 1) {
    track.left[index] *= normalization;
    track.right[index] *= normalization;
  }
}

function composeOpening() {
  noiseState = 0x05002026;
  const track = createTrack(5);

  addWhoosh(track, 0.02, 1.62, 0.056);
  [
    [0.18, 146.83, -0.52],
    [0.52, 174.61, -0.25],
    [0.86, 220, 0.04],
    [1.2, 261.63, 0.29],
    [1.54, 293.66, 0.52],
  ].forEach(([time, frequency, pan]) => addSynthStab(track, time, frequency, 0.29, 0.13, pan));

  [0.18, 0.86, 1.54].forEach((time) => {
    addKick(track, time, 0.31, 0.16);
    addPulseBass(track, time, 73.42, 0.48, 0.105);
  });
  addSnap(track, 0.52, 0.16, 0.058, -0.18);
  addSnap(track, 1.2, 0.16, 0.058, 0.18);

  addWhoosh(track, 1.78, 1.56, 0.066);
  [
    [2.02, 293.66, -0.48],
    [2.36, 349.23, -0.16],
    [2.7, 440, 0.18],
    [3.04, 523.25, 0.48],
  ].forEach(([time, frequency, pan]) => addSynthStab(track, time, frequency, 0.3, 0.137, pan));
  [2.02, 2.7].forEach((time) => {
    addKick(track, time, 0.31, 0.17);
    addPulseBass(track, time, 73.42, 0.5, 0.11);
  });
  addSnap(track, 2.36, 0.16, 0.061, -0.16);
  addSnap(track, 3.04, 0.16, 0.064, 0.16);

  addKick(track, 3.42, 0.42, 0.225);
  addPulseBass(track, 3.42, 73.42, 1.08, 0.145);
  [
    [146.83, -0.5, 0.125],
    [174.61, -0.2, 0.105],
    [220, 0.18, 0.1],
    [329.63, 0.5, 0.082],
  ].forEach(([frequency, pan, gain]) =>
    addSynthStab(track, 3.42, frequency, 1.04, gain, pan),
  );
  addSnap(track, 3.44, 0.19, 0.07, 0);

  applyRoom(track, 0.34);
  masterTrack(track, 0.82, 0.018, 0.28, 2.5);
  return track;
}

function composeEnding() {
  noiseState = 0x15002026;
  const track = createTrack(15);
  const bars = [
    { time: 0, root: 65.41, chord: [130.81, 164.81, 196, 246.94] },
    { time: 3, root: 87.31, chord: [130.81, 174.61, 220, 261.63, 329.63] },
    { time: 6, root: 55, chord: [110, 130.81, 164.81, 196] },
    { time: 9, root: 49, chord: [98, 130.81, 146.83, 196] },
    { time: 12, root: 65.41, chord: [130.81, 164.81, 196, 220] },
  ];

  bars.forEach((bar, barIndex) => {
    addPadChord(track, bar.time, 3.12, bar.chord, barIndex === 4 ? 0.029 : 0.025);
    addBass(track, bar.time + 0.05, bar.root, 2.72, 0.043);
    const arpeggio = [bar.chord[0], bar.chord[2], bar.chord[1], bar.chord.at(-1)];
    arpeggio.forEach((frequency, beatIndex) => {
      addMallet(
        track,
        bar.time + beatIndex * 0.75 + 0.06,
        frequency * 2,
        0.48,
        0.035,
        beatIndex % 2 === 0 ? -0.34 : 0.34,
      );
    });
  });

  const melody = [
    [0.45, 329.63],
    [1.12, 392],
    [1.86, 440],
    [2.55, 392],
    [3.34, 440],
    [4.1, 392],
    [4.86, 329.63],
    [5.56, 261.63],
    [6.38, 329.63],
    [7.14, 440],
    [7.9, 523.25],
    [8.62, 440],
    [9.34, 392],
    [10.1, 329.63],
    [10.86, 293.66],
    [11.56, 392],
    [12.28, 329.63],
    [13.02, 392],
    [13.72, 329.63],
    [14.3, 261.63],
  ];
  melody.forEach(([time, frequency], index) =>
    addMallet(track, time, frequency, index === melody.length - 1 ? 0.62 : 0.54, 0.056, index % 2 ? 0.16 : -0.16),
  );

  for (let beat = 0.75, index = 0; beat < 14.5; beat += 0.75, index += 1) {
    addBrush(track, beat, 0.24, index % 4 === 1 ? 0.012 : 0.007, index % 2 ? 0.5 : -0.5);
  }
  addBell(track, 5.82, 1046.5, 0.72, 0.026, 0.44);
  addBell(track, 8.84, 1318.51, 0.72, 0.023, -0.42);
  addBell(track, 11.84, 783.99, 0.78, 0.024, 0.4);
  addBell(track, 14.18, 523.25, 0.72, 0.03, 0);
  applyRoom(track, 1.15);
  masterTrack(track, 0.7, 0.14, 0.72);
  return track;
}

function writeWaveFile(track, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const bytesPerSample = 2;
  const blockAlign = CHANNELS * bytesPerSample;
  const dataSize = track.left.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * blockAlign, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let index = 0; index < track.left.length; index += 1) {
    const left = Math.max(-1, Math.min(1, track.left[index]));
    const right = Math.max(-1, Math.min(1, track.right[index]));
    buffer.writeInt16LE(Math.round(left * 32767), offset);
    buffer.writeInt16LE(Math.round(right * 32767), offset + 2);
    offset += blockAlign;
  }
  fs.writeFileSync(outputPath, buffer);
}

const openingTrack = composeOpening();
const endingTrack = composeEnding();
writeWaveFile(openingTrack, openingOutput);
writeWaveFile(endingTrack, endingOutput);

console.log(`Generated ${openingOutput}`);
console.log(`Generated ${endingOutput}`);
