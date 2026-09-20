import { BEGINNER_SETTINGS, validateProblemSettings } from './problem-settings.js';

/** 条件を満たす順序付きの加数ペアから等確率で選ぶ。rngは0以上1未満。 */
export function generateProblem(settings = BEGINNER_SETTINGS, rng = Math.random) {
  validateProblemSettings(settings);
  const { minOperand, maxOperand, maxSum } = settings;
  const candidates = [];
  for (let left = minOperand; left <= maxOperand; left += 1) {
    for (let right = minOperand; right <= maxOperand; right += 1) {
      if (left + right <= maxSum) candidates.push({ left, right, answer: left + right });
    }
  }
  const value = rng();
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('乱数は0以上1未満の数値を返してください。');
  }
  return candidates[Math.floor(value * candidates.length)];
}
