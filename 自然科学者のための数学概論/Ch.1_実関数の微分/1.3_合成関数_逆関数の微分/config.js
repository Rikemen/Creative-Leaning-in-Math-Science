/**
 * グラフ描画の設定
 * 数値定義や色のパレットを一括管理し、変更を容易にする。
 */
export const CONFIG = {
  grid: {
    cellSize: 50, // グリッド1マスのピクセル数
    scale: 50, // 数学的な「1」が何ピクセルに相当するか
  },
  style: {
    canvasWidth: 800,
    canvasHeight: 600,
    colors: {
      background: [250, 252, 255], // 視認性の高い明るい背景
      grid: [220, 220, 220],
      axis: [100, 100, 100],
      text: [30, 30, 30],
      graph: [0, 120, 215], // 信頼感のある青色
      pointer: [230, 40, 60], // 注目を集める赤色
      tangent: [40, 160, 80], // 自然な緑色の接線
    },
  },
};
