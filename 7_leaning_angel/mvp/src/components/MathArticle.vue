<template>
  <article class="article-container">
    <!-- タイトル：恋愛シミュレーション風の装飾付き -->
    <div class="article-title-wrapper">
      <span class="article-title-deco">♡</span>
      <h2 class="article-title">
        {{ articleData.title }}
      </h2>
      <span class="article-title-deco">♡</span>
    </div>

    <!-- 記事本文セクション — セクションごとにカード化 -->
    <section
      v-for="(section, index) in articleData.sections"
      :key="index"
      class="section-card"
    >
      <h3 class="section-heading">
        {{ section.heading }}
      </h3>

      <!-- 先輩の吹き出し風テキスト -->
      <div class="section-body-bubble">
        <p class="section-body">
          {{ section.body }}
        </p>
      </div>

      <!-- KaTeX数式ブロック（コピーボタン付き） -->
      <div
        v-for="(formula, formulaIndex) in section.formulas"
        :key="formulaIndex"
        class="math-block flex items-center justify-between"
      >
        <span class="katex-display font-mono text-gray-800">{{ formula }}</span>
        <button
          class="ml-3 shrink-0 rounded-lg bg-sakura-100 px-3 py-1 text-sm
                 text-sakura-600 transition hover:bg-sakura-200 active:scale-95"
          @click="copyFormula(formula)"
        >
          📋 コピー
        </button>
      </div>
    </section>
  </article>
</template>

<script setup>
import { copyToClipboard } from '../utils/clipboard.js'
import { eigenvalueArticle } from '../content/eigenvalue.js'

// 表示する記事データ（MVPでは固有値の1記事のみ）
const articleData = eigenvalueArticle

// 数式のコピー処理
const copyFormula = async (formula) => {
  await copyToClipboard(formula)
}
</script>

<style scoped>
/* 記事全体のレイアウト */
.article-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* タイトル装飾：ハートマークで挟む恋愛ゲーム風 */
.article-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.article-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #c2134f; /* sakura-700 */
  text-align: center;
}
.article-title-deco {
  color: #f76da8; /* sakura-400 */
  font-size: 1rem;
  animation: heartbeat 1.5s ease-in-out infinite;
}

/* セクションカード：ホバーで浮き上がるギャルゲー風テキストボックス */
.section-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 241, 247, 0.8));
  border: 1px solid #fccce3; /* sakura-200 */
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(240, 67, 136, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(240, 67, 136, 0.15);
}

/* 見出し：下線装飾付き */
.section-heading {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e02068; /* sakura-600 */
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #fde6f0; /* sakura-100 */
}

/* 吹き出し風メッセージ：ギャルゲーのテキストウィンドウを意識 */
.section-body-bubble {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  position: relative;
  border: 1px solid #fde6f0; /* sakura-100 */
}
.section-body-bubble::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 1.5rem;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid #fde6f0;
  border-left: 1px solid #fde6f0;
  transform: rotate(45deg);
}
.section-body {
  color: #374151; /* gray-700 */
  line-height: 1.8;
  font-size: 0.938rem;
}

/* ハートビートアニメーション */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
