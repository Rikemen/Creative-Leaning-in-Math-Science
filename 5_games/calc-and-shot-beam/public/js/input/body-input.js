export const BODY_INPUT_SETTINGS = Object.freeze({ wristRecoveryMs: 500 });

// A brief wrist occlusion stops the beam but may keep this question's arming.
// Losing body tracking, changing questions or pausing always requires opening again.
export class BodyInput {
  constructor(game) { this.game = game; this.reset(); }
  reset() {
    this.armed = false; this.held = false;
    this.armedQuestionId = null; this.missingSince = null;
  }
  cancel(now) { this.game.release(now); this.reset(); }
  update({ target, gesture, calibrated }, now) {
    // The tick itself can destroy a card or advance the question. Check its final
    // state before retaining any permission from the previous input sample.
    this.game.tick(now);
    if (this.armed && this.armedQuestionId !== this.game.questionId) this.reset();
    if (!calibrated || !Number.isInteger(target) || target < 0 || target > 3
      || this.game.phase !== 'playing' || !['open', 'charging', 'firing', 'unknown'].includes(gesture)) {
      this.cancel(now); return;
    }
    if (gesture === 'unknown') {
      this.game.release(now); this.held = false;
      this.missingSince ??= now;
      if (now - this.missingSince > BODY_INPUT_SETTINGS.wristRecoveryMs) this.reset();
      return;
    }
    if (this.missingSince !== null) {
      if (now - this.missingSince > BODY_INPUT_SETTINGS.wristRecoveryMs) this.reset();
      this.missingSince = null;
    }
    if (gesture === 'open') {
      this.game.release(now); this.held = false; this.armed = true;
      this.armedQuestionId = this.game.questionId;
    } else if (gesture === 'firing' && this.armed) {
      if (!this.held) { this.game.press(target, now); this.held = true; }
      else this.game.move(target, now);
    } else if (gesture === 'charging' && this.held) {
      this.cancel(now);
    }
  }
}
