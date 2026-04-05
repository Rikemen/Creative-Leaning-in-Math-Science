import { CONFIG } from './config.js';

/**
 * 階乗を計算する
 */
export function factorial(n) {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * 微分係数の数値計算（前進差分近似）
 */
export function calculateDerivative(x, func, h = 0.0001) {
  if (h === 0) return 0;
  const yTarget = func(x);
  const yNeighbor = func(x + h);
  return (yNeighbor - yTarget) / h;
}

/**
 * n階微分係数を数値的に計算する。
 * 再帰的に差分をとるため、nが大きくなると精度が低下し、計算負荷が増える点に注意。
 * @param {number} x - 点
 * @param {Function} func - 関数
 * @param {number} n - 次数
 * @param {number} h - 刻み幅
 */
export function calculateNthDerivative(x, func, n, h = 0.02) {
  if (n === 0) return func(x);
  if (n === 1) return calculateDerivative(x, func, h);

  // n階微分を (f^(n-1)(x+h) - f^(n-1)(x)) / h で近似
  return (
    (calculateNthDerivative(x + h, func, n - 1, h) - calculateNthDerivative(x, func, n - 1, h)) / h
  );
}

/**
 * 点 a における n 次テイラー多項式 Pn(x) を生成する。
 * Pn(x) = f(a) + f'(a)(x-a) + ... + (f^(n)(a)/n!)(x-a)^n
 */
export function getTaylorPolynomial(func, a, n) {
  const derivatives = [];
  for (let k = 0; k <= n; k++) {
    derivatives.push(calculateNthDerivative(a, func, k));
  }

  return (x) => {
    let sum = 0;
    const dx = x - a;
    for (let k = 0; k <= n; k++) {
      sum += (derivatives[k] / factorial(k)) * Math.pow(dx, k);
    }
    return sum;
  };
}

/**
 * 明示的な剰余項 Rn(x) = f(x) - Pn(x) を計算する。
 */
export function calculateRemainder(func, Pn, x) {
  return func(x) - Pn(x);
}

/**
 * ラグランジュの剰余項を満たす点 c を数値的に探索する。
 * Rn(x) = {f^(n+1)(c) / (n+1)!} * (x-a)^(n+1) を満たす c を a と x の間から探す。
 */
export function findLagrangeRemainderPoint(func, a, x, n) {
  if (Math.abs(x - a) < 0.001) return a;

  const Pn = getTaylorPolynomial(func, a, n);
  const Rn = calculateRemainder(func, Pn, x);

  // c における必要とされる (n+1)次微分係数の値 K
  const denominator = Math.pow(x - a, n + 1) / factorial(n + 1);
  const targetDerivativeValue = Rn / denominator;

  const start = Math.min(a, x);
  const end = Math.max(a, x);

  let bestC = start;
  let minDiff = Infinity;

  const samples = 200;
  for (let i = 0; i <= samples; i++) {
    const c = start + (i / samples) * (end - start);
    const val = calculateNthDerivative(c, func, n + 1);
    const diff = Math.abs(val - targetDerivativeValue);

    if (diff < minDiff) {
      minDiff = diff;
      bestC = c;
    }
  }

  return bestC;
}

/**
 * 数学的座標(mathX, mathY)をスクリーンピクセル座標(screenX, screenY)に変換する。
 */
export function toScreen(mathX, mathY) {
  return {
    x: mathX * CONFIG.grid.scale,
    y: -mathY * CONFIG.grid.scale
  };
}

/**
 * スクリーンピクセル座標を数学的なx座標に変換する。
 */
export function toMathX(screenX) {
  return (screenX - window.width / 2) / CONFIG.grid.scale;
}

/**
 * 一般的な関数に対して平均値の定理を満たす点cを数値的に探索する。
 */
export function findMeanValuePoint(func, a, b) {
  if (Math.abs(a - b) < 0.001) return a;

  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const k = (func(end) - func(start)) / (end - start);

  const h = (x) => func(x) - k * x;
  const hStart = h(start);

  let bestX = start;
  let maxDiff = -1;

  const samples = 400;
  for (let i = 0; i <= samples; i++) {
    const x = start + (i / samples) * (end - start);
    const diff = Math.abs(h(x) - hStart);
    if (diff > maxDiff) {
      maxDiff = diff;
      bestX = x;
    }
  }

  return bestX;
}
