<template>
  <section class="my-8">
    <h3 class="mb-4 text-lg font-semibold text-sakura-600">
      🎮 シミュレーション：ベクトルを動かしてみよう！
    </h3>
    <!-- JSXGraphの描画領域 -->
    <div
      ref="boardContainer"
      class="mx-auto aspect-square w-full max-w-md rounded-2xl border-2
             border-sakura-200 bg-white shadow-lg"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const boardContainer = ref(null)

onMounted(() => {
  // TODO: JSXGraphを初期化し、固有ベクトルのインタラクティブな図を描画
  // 行列Aによる変換で「方向が変わらないベクトル＝固有ベクトル」を体感させる
  console.log('JSXGraph初期化:', boardContainer.value)
})
</script>
