<template>
  <section class="my-8">
    <h3 class="mb-4 text-lg font-semibold text-sakura-600">
      🎮 シミュレーション：ベクトルを動かしてみよう！
    </h3>

    <!-- JSXGraphの描画領域 -->
    <div
      :id="boardId"
      ref="boardContainer"
      class="board-wrapper mx-auto w-full max-w-md rounded-2xl border-2
             border-sakura-200 bg-white shadow-lg"
    />

    <!-- 操作ガイド -->
    <div class="guide-container">
      <p class="guide-text">
        💡 <strong>青い矢印</strong>の先端をドラッグして、ベクトルの向きを変えてみよう！
      </p>
      <p class="guide-hint">
        方向が変わらない特別な向き（＝固有ベクトル）を見つけると色が変化するよ ✨
      </p>
    </div>

    <!-- 固有値情報の表示 -->
    <div class="eigen-info">
      <div class="eigen-card">
        <span class="eigen-label">固有値 λ₁ = 3</span>
        <span class="eigen-vector">固有ベクトル方向: (1, 1)</span>
      </div>
      <div class="eigen-card">
        <span class="eigen-label">固有値 λ₂ = 1</span>
        <span class="eigen-vector">固有ベクトル方向: (1, −1)</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const boardContainer = ref(null)
const boardId = 'jsxgraph-board'
let board = null

/**
 * 2つのベクトルが「同じ方向」かどうかを判定する
 * 正規化して内積の絶対値が閾値以上なら「固有ベクトル方向」と判断
 */
const isAlignedWithEigenvector = (vx, vy, ex, ey, threshold = 0.97) => {
  const vLen = Math.sqrt(vx * vx + vy * vy)
  const eLen = Math.sqrt(ex * ex + ey * ey)
  if (vLen < 0.01) return false
  const dot = Math.abs(vx * ex + vy * ey) / (vLen * eLen)
  return dot > threshold
}

onMounted(async () => {
  // JSXGraph を動的インポート（SSR対策 & バンドルサイズ最適化）
  const JXG = (await import('jsxgraph')).default

  board = JXG.JSXGraph.initBoard(boardId, {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    grid: true,
    showNavigation: false,
    showCopyright: false,
    keepAspectRatio: true,
  })

  // 行列 A = [[2,1],[1,2]] のパラメータ
  const matrixA = [[2, 1], [1, 2]]
  // 固有ベクトル方向: (1,1) と (1,-1)
  const eigenDirections = [[1, 1], [1, -1]]

  // 原点
  const origin = board.create('point', [0, 0], {
    fixed: true,
    visible: false,
  })

  // ユーザーがドラッグする入力ベクトルの先端
  const inputTip = board.create('point', [2, 1], {
    name: 'v',
    size: 5,
    color: '#3b82f6',
    highlightColor: '#2563eb',
  })

  // 入力ベクトル（青い矢印）
  const inputArrow = board.create('arrow', [origin, inputTip], {
    strokeColor: '#3b82f6',
    strokeWidth: 3,
    highlightStrokeColor: '#2563eb',
  })

  // 変換後ベクトルの先端（自動計算・ドラッグ不可）
  const outputTip = board.create('point', [0, 0], {
    name: 'Av',
    size: 4,
    color: '#f04388',
    fixed: true,
  })

  // 変換後ベクトル（ピンクの矢印）
  const outputArrow = board.create('arrow', [origin, outputTip], {
    strokeColor: '#f04388',
    strokeWidth: 3,
    dash: 2,
  })

  // 固有ベクトル方向を薄い点線で表示（ヒント用）
  eigenDirections.forEach((dir) => {
    board.create('line', [[0, 0], dir], {
      strokeColor: '#faa1cb',
      strokeWidth: 1,
      dash: 3,
      straightFirst: true,
      straightLast: true,
      fixed: true,
      highlight: false,
    })
  })

  /**
   * ドラッグ時の更新処理
   * 入力ベクトルに行列Aを適用し、固有ベクトル方向との一致を判定して色を変化させる
   */
  const updateTransform = () => {
    const vx = inputTip.X()
    const vy = inputTip.Y()

    // Av = [[2,1],[1,2]] * [vx, vy]
    const avx = matrixA[0][0] * vx + matrixA[0][1] * vy
    const avy = matrixA[1][0] * vx + matrixA[1][1] * vy

    outputTip.moveTo([avx, avy])

    // 固有ベクトル方向と一致するか判定
    const isEigen = eigenDirections.some((dir) =>
      isAlignedWithEigenvector(vx, vy, dir[0], dir[1])
    )

    if (isEigen) {
      // 固有ベクトル方向に揃ったとき → ゴールド色に変化
      inputArrow.setAttribute({ strokeColor: '#f59e0b' })
      inputTip.setAttribute({ color: '#f59e0b' })
      outputArrow.setAttribute({ strokeColor: '#f59e0b' })
      outputTip.setAttribute({ color: '#f59e0b' })
    } else {
      // 通常状態に復帰
      inputArrow.setAttribute({ strokeColor: '#3b82f6' })
      inputTip.setAttribute({ color: '#3b82f6' })
      outputArrow.setAttribute({ strokeColor: '#f04388' })
      outputTip.setAttribute({ color: '#f04388' })
    }
  }

  // 初回描画と、ドラッグのたびに更新
  inputTip.on('drag', updateTransform)
  updateTransform()
})

onBeforeUnmount(() => {
  // メモリリーク防止：JSXGraphボードの破棄
  if (board) {
    const JXG = window.JXG
    if (JXG) JXG.JSXGraph.freeBoard(board)
    board = null
  }
})
</script>

<style scoped>
/* 描画ボードのアスペクト比を正方形に固定 */
.board-wrapper {
  aspect-ratio: 1;
  min-height: 300px;
}

/* 操作ガイド */
.guide-container {
  margin-top: 0.75rem;
  text-align: center;
}
.guide-text {
  font-size: 0.875rem;
  color: #374151;
}
.guide-hint {
  font-size: 0.8rem;
  color: #f04388;
  margin-top: 0.25rem;
}

/* 固有値情報カード */
.eigen-info {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.eigen-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, #fef1f7, #fff);
  border: 1px solid #fccce3;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.8rem;
}
.eigen-label {
  font-weight: 600;
  color: #c2134f;
}
.eigen-vector {
  color: #6b7280;
  font-size: 0.75rem;
}
</style>
