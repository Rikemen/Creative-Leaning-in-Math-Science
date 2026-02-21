import { CONFIG } from './config.js';

/**
 * 視覚化対象の数学的関数 f(x)
 * ここを変更することで任意の関数を視覚化できる。
 */
export function targetMathFunction(x) {
    // f(x) = x * x (微分係数の変化が分かりやすい基本的な例)
    return x * x;
}

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
