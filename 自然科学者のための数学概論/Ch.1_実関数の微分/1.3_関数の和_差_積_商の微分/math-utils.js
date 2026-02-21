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
 * 2つの関数 f, g を受け取り、それらの和・差・積・商の微分（導関数）を計算する関数の集合を返す。
 * 各導関数は数値微分を用いて計算されるため、微分の諸性質（線形性、積の微分、商の微分など）の
 * 数値的な検証やプロットの生成にそのまま利用できる。
 * 
 * @param {Function} f - 対象となる関数1
 * @param {Function} g - 対象となる関数2
 * @returns {Object} 各演算の導関数のセット
 */
export function createCombinedDerivatives(f, g) {
    return {
        // 線形性: (f + g)' = f' + g'
        sum: (x) => calculateDerivative(x, (t) => f(t) + g(t)),
        // 線形性: (f - g)' = f' - g'
        difference: (x) => calculateDerivative(x, (t) => f(t) - g(t)),
        // 積の微分（ライプニッツ則）: (fg)' = f'g + fg'
        product: (x) => calculateDerivative(x, (t) => f(t) * g(t)),
        // 商の微分: (f/g)' = (f'g - fg') / g^2
        quotient: (x) => {
            // ゼロ除算を避けるための表明（分母が0の場合は計算不能）
            if (g(x) === 0) return NaN;
            return calculateDerivative(x, (t) => f(t) / g(t));
        }
    };
}
