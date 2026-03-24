<template>
  <article class="space-y-6">
    <h2 class="text-2xl font-bold text-sakura-700">
      {{ articleData.title }}
    </h2>

    <!-- 記事本文セクション -->
    <section
      v-for="(section, index) in articleData.sections"
      :key="index"
      class="space-y-3"
    >
      <h3 class="text-lg font-semibold text-sakura-600">
        {{ section.heading }}
      </h3>
      <p class="leading-relaxed text-gray-700">
        {{ section.body }}
      </p>

      <!-- KaTeX数式ブロック（コピーボタン付き） -->
      <div
        v-for="(formula, formulaIndex) in section.formulas"
        :key="formulaIndex"
        class="math-block flex items-center justify-between"
      >
        <span class="katex-display">{{ formula }}</span>
        <button
          class="ml-3 shrink-0 rounded-lg bg-sakura-100 px-3 py-1 text-sm
                 text-sakura-600 transition hover:bg-sakura-200"
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
