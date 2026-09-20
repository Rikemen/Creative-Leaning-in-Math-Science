import { POSE_SETTINGS } from './pose-normalizer.js';

export const RECOVERY_SETTINGS = Object.freeze({ lostMs: 1000, countdownMs: 3000 });

// Owns body-input recovery only. Manual pause, camera shutdown and touch mode
// cancel it via reset(); no timers can resume a game behind another mode.
export class RecoveryController {
  constructor(game, input) { this.game = game; this.input = input; this.reset(); }
  reset() {
    this.state = 'inactive'; this.lostSince = null; this.lastValidAt = null;
    this.countdownAt = null; this.resumeAfter = null; this.remaining = null;
    this.input.reset();
  }
  start() { this.reset(); this.state = 'tracking'; }
  prepareResume(now) {
    this.input.cancel(now); this.reset(); this.state = 'waiting';
  }
  valid(control, now) {
    // AimController only supplies a target for fresh, calibrated shoulders.
    // Wrists govern firing through BodyInput, not whether the game can run.
    return control.calibrated && Number.isInteger(control.target) && control.target >= 0 && control.target < 4
      && Number.isFinite(control.capturedAt) && control.capturedAt >= 0 && control.capturedAt <= now
      && now - control.capturedAt < POSE_SETTINGS.maxAgeMs;
  }
  update(control, now) {
    if (this.state === 'inactive') return;
    const valid = this.valid(control, now);
    if (['waiting', 'countdown'].includes(this.state)) {
      // Preparing the clock requires visible shoulders, regardless of hand pose.
      // Input stays disarmed until a fresh open-wrist sample after the countdown.
      if (!valid
        || (this.lastValidAt !== null && control.capturedAt - this.lastValidAt >= POSE_SETTINGS.maxAgeMs)) {
        this.state = 'waiting'; this.countdownAt = null; this.remaining = null;
        this.lastValidAt = valid ? control.capturedAt : null;
        return;
      }
      this.lastValidAt = control.capturedAt;
      this.countdownAt ??= now;
      this.state = 'countdown';
      this.remaining = Math.ceil((RECOVERY_SETTINGS.countdownMs - (now - this.countdownAt)) / 1000);
      if (this.remaining <= 0) {
        this.game.resume(now); this.input.reset();
        this.resumeAfter = control.capturedAt;
        this.state = 'tracking'; this.remaining = null; this.lostSince = null;
      }
      return;
    }
    if (valid) {
      if (this.lastValidAt !== null && control.capturedAt - this.lastValidAt >= POSE_SETTINGS.maxAgeMs) {
        this.markLost(now);
        if (this.state === 'waiting') return;
      }
      if (this.resumeAfter !== null && control.capturedAt <= this.resumeAfter) return;
      this.resumeAfter = null; this.lastValidAt = control.capturedAt;
      this.lostSince = null; this.state = 'tracking';
      this.input.update(control, now);
      return;
    }
    this.markLost(now);
  }
  markLost(now) {
    if (this.lostSince === null) {
      // A delayed RAF must not award damage for time after its pose expired.
      const cutoff = this.lastValidAt === null ? now : Math.min(now, this.lastValidAt + POSE_SETTINGS.maxAgeMs);
      this.lostSince = cutoff;
      this.input.cancel(Math.max(this.game.lastNow, cutoff));
    }
    this.state = 'lost';
    if (now - this.lostSince >= RECOVERY_SETTINGS.lostMs) {
      this.game.pause(Math.max(this.game.lastNow, this.lostSince + RECOVERY_SETTINGS.lostMs), 'tracking');
      this.state = 'waiting'; this.lastValidAt = null; this.countdownAt = null;
    }
  }
}
