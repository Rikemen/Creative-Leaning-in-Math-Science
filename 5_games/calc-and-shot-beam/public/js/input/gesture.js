import { POSE_SETTINGS } from './pose-normalizer.js';

// Distances are isotropic body units: one shoulder width, independent of camera distance.
export const GESTURE_PRESETS = Object.freeze({
  normal: Object.freeze({ nearDistance:.65, releaseDistance:.9 }),
  easy: Object.freeze({ nearDistance:.9, releaseDistance:1.15 }),
  strict: Object.freeze({ nearDistance:.45, releaseDistance:.65 }),
});
export const GESTURE_SETTINGS = Object.freeze({ holdMs:250, ...GESTURE_PRESETS.normal });

export function wristDistance(pose){
  const a=pose?.body?.left_wrist,b=pose?.body?.right_wrist;
  if(!a||!b||![a.x,a.y,b.x,b.y].every(Number.isFinite))return null;
  return Math.hypot(a.x-b.x,a.y-b.y);
}
export function classifyWrists(pose, settings=GESTURE_SETTINGS){
  const distance=wristDistance(pose);
  if(distance===null)return 'unknown';
  if(distance<=settings.nearDistance)return 'near';
  return distance>=settings.releaseDistance?'open':'between';
}

export class GestureController {
  constructor(settings={}) { this.setSettings(settings); }
  setSettings(settings) {
    const next = { ...GESTURE_SETTINGS, ...settings };
    if (![next.holdMs,next.nearDistance,next.releaseDistance].every(Number.isFinite)
      || next.holdMs <= 0 || next.nearDistance <= 0 || next.releaseDistance <= next.nearDistance) {
      throw new RangeError('Invalid gesture settings');
    }
    this.settings = Object.freeze(next);
    this.reset();
  }
  reset() { this.since = null; this.lastTimestamp = null; this.state = 'unknown'; }
  update(pose, now) {
    if (!pose || !Number.isFinite(pose.capturedAt) || !Number.isFinite(now)
      || pose.capturedAt < 0 || pose.capturedAt > now || now - pose.capturedAt >= POSE_SETTINGS.maxAgeMs) {
      this.reset(); return 'unknown';
    }
    if (this.lastTimestamp !== null && pose.capturedAt <= this.lastTimestamp) return this.state;
    if (this.lastTimestamp !== null && pose.capturedAt - this.lastTimestamp >= POSE_SETTINGS.maxAgeMs) this.reset();
    this.lastTimestamp = pose.capturedAt;
    const wrists=classifyWrists(pose,this.settings);
    const near=wrists==='near'||(wrists==='between'&&['charging','firing'].includes(this.state));
    if (!near) { this.since = null; if(wrists!=='between')this.state=wrists; }
    else {
      this.since ??= pose.capturedAt;
      this.state = pose.capturedAt - this.since >= this.settings.holdMs ? 'firing' : 'charging';
    }
    return this.state;
  }
}
