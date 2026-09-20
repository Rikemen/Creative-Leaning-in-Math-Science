export const BEGINNER_SETTINGS = Object.freeze({
  minOperand: 1,
  maxOperand: 9,
  maxSum: 5,
});

export const FULL_SETTINGS = Object.freeze({
  minOperand: 0,
  maxOperand: 9,
  maxSum: 18,
});

export function validateProblemSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    throw new TypeError('出題設定はオブジェクトで指定してください。');
  }
  const { minOperand, maxOperand, maxSum } = settings;
  if (
    ![minOperand, maxOperand, maxSum].every(Number.isInteger) ||
    minOperand < 0 || maxOperand > 9 || minOperand > maxOperand ||
    maxSum < 0 || maxSum > 18 || minOperand * 2 > maxSum
  ) {
    throw new RangeError('出題設定は加数0〜9、合計0〜18で、候補が存在する範囲にしてください。');
  }
}
