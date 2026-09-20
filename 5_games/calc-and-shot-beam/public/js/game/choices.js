/** 近い数から誤答を選び、正解位置をランダム化する。再抽選ループは使わない。 */
export function generateChoices(answer, rng = Math.random) {
  if (!Number.isInteger(answer) || answer < 0 || answer > 18) throw new RangeError('答えは0〜18の整数です。');
  const randomIndex = (size) => {
    const n = rng();
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n >= 1) throw new RangeError('乱数は0以上1未満です。');
    return Math.floor(n * size);
  };
  const pool = Array.from({ length: 19 }, (_, i) => i)
    .filter(n => n !== answer)
    .sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer) || a - b)
    .slice(0, 5);
  const choices = [];
  for (let i = 0; i < 3; i += 1) choices.push(pool.splice(randomIndex(pool.length), 1)[0]);
  choices.splice(randomIndex(4), 0, answer);
  return choices;
}
