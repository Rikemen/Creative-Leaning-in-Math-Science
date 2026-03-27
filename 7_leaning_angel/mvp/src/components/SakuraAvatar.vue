<template>
  <!-- 立ち絵コンテナ — デスクトップ: モーダル左横に固定 / モバイル: ヘッダー内アバター -->
  <div class="sakura-avatar-container">
    <!-- デスクトップ用: 大きな立ち絵（モーダル左横） -->
    <Transition name="expression-fade" mode="out-in">
      <img
        :key="currentExpression"
        :src="imageSrc"
        :alt="`さくら先輩 — ${currentExpression}`"
        class="sakura-standing hidden md:block"
      />
    </Transition>

    <!-- モバイル用: 丸型アバター（ヘッダーのアイコン差し替え用） -->
    <Transition name="expression-fade" mode="out-in">
      <img
        :key="currentExpression"
        :src="imageSrc"
        :alt="`さくら先輩 — ${currentExpression}`"
        class="sakura-avatar-circle md:hidden"
      />
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EXPRESSION_MAP } from '../composables/useExpression.js'

const props = defineProps({
  /** 現在の表情キー */
  currentExpression: {
    type: String,
    default: 'smile',
    validator: (value) => value in EXPRESSION_MAP,
  },
})

/** 表情キーに対応する画像パスを算出 */
const imageSrc = computed(() =>
  EXPRESSION_MAP[props.currentExpression] ?? EXPRESSION_MAP.smile
)
</script>

<style scoped>
/* デスクトップ用: 画面右下の立ち絵（透過PNG対応） */
.sakura-standing {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 51;
  height: 60vh;
  max-height: 600px;
  width: auto;
  object-fit: contain;
  object-position: bottom right;
  pointer-events: none;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.12));
}

/* モバイル用: ヘッダーの丸型アバター */
.sakura-avatar-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  object-fit: cover;
  /* 顔が中心に来るよう上寄せトリミング */
  object-position: top center;
  border: 2px solid var(--sakura-200, #f9c4d2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 表情切り替え時のクロスフェード */
.expression-fade-enter-active,
.expression-fade-leave-active {
  transition: opacity 0.3s ease;
}
.expression-fade-enter-from,
.expression-fade-leave-to {
  opacity: 0;
}
</style>
