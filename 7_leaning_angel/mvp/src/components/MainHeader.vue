<template>
  <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
    <div class="container mx-auto flex items-center justify-between px-4 py-3">
      <h1 class="text-xl font-bold text-sakura-600">
        🌸 さくら先輩の数学辞書
      </h1>
      <!-- 音声解説ボタン：タップで先輩が記事概要を読み上げる -->
      <button
        class="btn-sakura flex items-center gap-2 text-sm"
        @click="handleVoicePlay"
      >
        🔊 音声解説
      </button>
    </div>
  </header>
</template>

<script setup>
// 音声再生処理 — MVPでは事前録音ファイルを再生
const handleVoicePlay = () => {
  // TODO: VOICEVOX APIまたは事前録音音声の再生処理を実装
  console.log('音声解説を再生')
}
</script>
