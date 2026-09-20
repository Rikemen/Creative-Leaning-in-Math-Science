export const ROUND_MS = 60000;

export class GameClock {
  constructor() { this.startedAt = null; this.accumulated = 0; }
  start(now) { this.startedAt = now; this.accumulated = 0; }
  elapsed(now) {
    return Math.min(ROUND_MS, this.accumulated + (this.startedAt === null ? 0 : Math.max(0, now - this.startedAt)));
  }
  remainingSeconds(now) { return Math.ceil((ROUND_MS - this.elapsed(now)) / 1000); }
  pause(now) {
    this.accumulated = this.elapsed(now);
    this.startedAt = null;
  }
  resume(now) { if (this.startedAt === null) this.startedAt = now; }
}
