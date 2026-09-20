export const CARD_HP = 100;
export const DAMAGE_PER_MS = 0.125;

export function applyDamage(hp, elapsedMs, isCorrectHit) {
  if (!Number.isFinite(hp) || hp < 0 || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError('HPと経過時間は0以上の有限数です。');
  }
  return isCorrectHit ? Math.max(0, hp - DAMAGE_PER_MS * elapsedMs) : hp;
}
