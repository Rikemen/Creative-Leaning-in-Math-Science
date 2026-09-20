import { POSE_SETTINGS } from './pose-normalizer.js';

export const AIM_SETTINGS = Object.freeze({ halfRangeShoulders: .5, smoothingMs: 100, hysteresis: .04 });
const clamp = x => Math.max(0, Math.min(1, x));
const inUnit = x => Number.isFinite(x) && x >= 0 && x <= 1;

// No card values, answers, drawing or game damage are involved in aiming.
export class AimController {
  constructor(settings = {}) {
    this.settings = { ...AIM_SETTINGS, ...settings };
    const { smoothingMs, hysteresis } = this.settings;
    if (!Number.isFinite(smoothingMs) || smoothingMs < 0 || !Number.isFinite(hysteresis)
      || hysteresis < 0 || hysteresis >= .125) throw new RangeError('Invalid aim settings');
    this.setRange(this.settings.halfRangeShoulders);
  }
  setRange(value) {
    if (!Number.isFinite(value) || value <= 0 || value > 2) throw new RangeError('Invalid movement range');
    this.settings.halfRangeShoulders = value;
    this.reset();
  }
  reset() { this.baseline = null; this.clear(); }
  clear() { this.target = null; this.filtered = null; this.lastTimestamp = null; }
  get calibrated() { return this.baseline !== null; }
  valid(pose, now) {
    return pose && Number.isFinite(now) && Number.isFinite(pose.capturedAt) && pose.capturedAt >= 0
      && now >= pose.capturedAt && now - pose.capturedAt < POSE_SETTINGS.maxAgeMs
      && inUnit(pose.shoulderCenter?.x) && inUnit(pose.shoulderCenter?.y)
      && Number.isFinite(pose.shoulderWidth) && pose.shoulderWidth >= POSE_SETTINGS.minShoulderWidth;
  }
  calibrate(pose, now) {
    this.reset();
    if (!this.valid(pose, now)) return false;
    this.baseline = { x: pose.shoulderCenter.x, width: pose.shoulderWidth };
    return true;
  }
  update(pose, now) {
    if (!this.calibrated || !this.valid(pose, now)) { this.clear(); return null; }
    if (this.lastTimestamp !== null && pose.capturedAt <= this.lastTimestamp) return this.target;
    const position = clamp(.5 + (pose.shoulderCenter.x - this.baseline.x)
      / (2 * this.baseline.width * this.settings.halfRangeShoulders));
    const dt = pose.capturedAt - (this.lastTimestamp ?? pose.capturedAt);
    const alpha = this.settings.smoothingMs === 0 ? 1 : 1 - Math.exp(-dt / this.settings.smoothingMs);
    this.filtered = this.filtered === null ? position : this.filtered + alpha * (position - this.filtered);
    this.lastTimestamp = pose.capturedAt;
    if (this.target === null) this.target = Math.min(3, Math.floor(this.filtered * 4));
    else {
      const margin = this.settings.hysteresis;
      while (this.target < 3 && this.filtered > (this.target + 1) / 4 + margin) this.target++;
      while (this.target > 0 && this.filtered < this.target / 4 - margin) this.target--;
    }
    return this.target;
  }
}
