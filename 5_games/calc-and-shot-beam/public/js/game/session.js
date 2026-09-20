import { generateProblem } from './problem.js';
import { generateChoices } from './choices.js';
import { GameClock, ROUND_MS } from './clock.js';
import { CARD_HP, DAMAGE_PER_MS, applyDamage } from './damage.js';

const BREAK_MS = 350;

export class GameSession {
  constructor({ rng = Math.random, settings } = {}) {
    this.settings=settings;
    this.rng = rng;
    this.clock = new GameClock();
    this.phase = 'ready';
    this.score = 0;
    this.elapsed = 0;
    this.hp = CARD_HP;
    this.questionId = 0;
    this.choices = [];
    this.problem = null;
    this.target = null;
    this.held = false;
    this.lastNow = -Infinity;
    this.pauseReason = null;
  }
  start(now) {
    this.checkTime(now);
    this.clock.start(now);
    this.phase = 'playing';
    this.pauseReason = null;
    this.score = 0;
    this.elapsed = 0;
    this.questionId = 0;
    this.held = false;
    this.nextQuestion();
  }
  checkTime(now) {
    if (!Number.isFinite(now) || now < this.lastNow) throw new RangeError('時刻は単調増加する有限数です。');
    this.lastNow = now;
  }
  nextQuestion() {
    this.problem = generateProblem(this.settings, this.rng);
    this.choices = generateChoices(this.problem.answer, this.rng);
    this.hp = CARD_HP;
    this.target = null;
    this.questionId += 1;
    this.phase = 'playing';
    // heldは保持する。次の問題ではrelease→pressが必要。
    this.blockedUntilRelease = this.held;
  }
  tick(now) {
    this.checkTime(now);
    if (['ready', 'result', 'paused'].includes(this.phase)) return;
    const elapsed = this.clock.elapsed(now);
    if (this.phase === 'playing' && this.target !== null) {
      const correct = this.choices[this.target] === this.problem.answer;
      const destroyedAt = this.elapsed + this.hp / DAMAGE_PER_MS;
      this.hp = applyDamage(this.hp, elapsed - this.elapsed, correct);
      if (correct && this.hp === 0) {
        if (destroyedAt < ROUND_MS) this.score += 1;
        this.phase = 'breaking';
        this.breakEnd = destroyedAt + BREAK_MS;
        this.target = null;
        this.blockedUntilRelease = true;
      }
    }
    this.elapsed = elapsed;
    if (elapsed >= ROUND_MS) {
      this.phase = 'result';
      this.target = null;
      this.held = false;
    } else if (this.phase === 'breaking' && elapsed >= this.breakEnd) this.nextQuestion();
  }
  press(index, now) {
    this.tick(now);
    if (this.phase !== 'playing' || this.held || !this.validTarget(index)) return;
    this.held = true;
    this.blockedUntilRelease = false;
    this.target = index;
  }
  move(index, now) {
    this.tick(now);
    if (this.phase === 'playing' && this.held && !this.blockedUntilRelease) {
      this.target = this.validTarget(index) ? index : null;
    }
  }
  release(now) {
    this.tick(now);
    this.target = null;
    this.held = false;
    this.blockedUntilRelease = false;
  }
  validTarget(index) { return Number.isInteger(index) && index >= 0 && index < this.choices.length; }
  pause(now, reason = 'manual') {
    this.tick(now);
    if (!['playing', 'breaking'].includes(this.phase)) return;
    this.previousPhase = this.phase;
    this.clock.pause(now);
    this.phase = 'paused';
    this.pauseReason = reason;
    this.target = null;
    this.held = false;
  }
  resume(now) {
    this.checkTime(now);
    if (this.phase !== 'paused') return;
    this.clock.resume(now);
    this.phase = this.previousPhase;
    this.pauseReason = null;
    this.blockedUntilRelease = false;
  }
  snapshot() {
    return {
      phase: this.phase, pauseReason: this.pauseReason, score: this.score, hp: this.hp, elapsed: this.elapsed,
      remaining: Math.ceil((ROUND_MS - this.elapsed) / 1000),
      questionId: this.questionId, problem: this.problem && { ...this.problem },
      choices: [...this.choices], target: this.target, held: this.held,
      feedback: this.phase === 'breaking' ? 'destroyed' : this.target === null ? 'idle'
        : this.choices[this.target] === this.problem.answer ? 'hit' : 'barrier',
    };
  }
}
