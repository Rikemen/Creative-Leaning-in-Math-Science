import { CONFIG } from './config.js';

/**
 * 微分係数の数値計算（前進差分近似）
 * 定義通り f'(x) = lim(h->0) (f(x+h) - f(x)) / h を十分小さなhで近似する。
 */
export function calculateDerivative(x, func, h = 0.0001) {
    // 早期リターン: h=0によるゼロ除算を未然に防ぐ。
    if (h === 0) return 0;

    const yTarget = func(x);
    const yNeighbor = func(x + h);
    return (yNeighbor - yTarget) / h;
}

/**
 * 数学的座標(mathX, mathY)をスクリーンピクセル座標(screenX, screenY)に変換する。
 * 数学のy軸正方向は上だが、スクリーンのy軸は下方向なので反転させる。
 * @returns {{x: number, y: number}}
 */
export function toScreen(mathX, mathY) {
    return {
        x: mathX * CONFIG.grid.scale,
        y: -mathY * CONFIG.grid.scale
    };
}

/**
 * スクリーンピクセル座標を数学的なx座標に変換する。
 * キャンバス中央（原点）からの相対位置をスケールで割る。
 */
export function toMathX(screenX) {
    return (screenX - window.width / 2) / CONFIG.grid.scale;
}

/**
 * 一般的な関数に対して平均値の定理を満たす点cを数値的に探索する。
 * 区間 [a, b] において、補助関数 h(x) = f(x) - kx (kは割線の傾き) の
 * 極値（絶対値が最大となる点）を探索する。
 * 
 * @param {Function} func - 対象となる数学的関数
 * @param {number} a - 始点のx座標
 * @param {number} b - 終点のx座標
 * @returns {number} 平均値の定理を満たす点c
 */
export function findMeanValuePoint(func, a, b) {
    if (Math.abs(a - b) < 0.001) return a;

    const start = Math.min(a, b);
    const end = Math.max(a, b);
    const k = (func(end) - func(start)) / (end - start);

    // 補助関数: h(x) = f(x) - kx
    // 平均値の定理より、この関数の微分が0になる点 (h'(c) = f'(c) - k = 0) を探せばよい。
    const h = (x) => func(x) - k * x;
    const hStart = h(start);

    let bestX = start;
    let maxDiff = -1;

    // 区間内をサンプリングして、h(a) = h(b) から最も離れた点（極値）を探す
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


