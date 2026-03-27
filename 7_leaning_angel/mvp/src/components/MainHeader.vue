<template>
  <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
    <div class="container mx-auto flex items-center justify-between px-4 py-3">
      <h1 class="text-xl font-bold text-sakura-600">
        🌸 さくら先輩の数学辞書
      </h1>
      <!-- 音声解説ボタン：タップで先輩が記事概要を読み上げる -->
      <button
        :class="[
          'flex items-center gap-2 text-sm rounded-full px-6 py-2 shadow-md',
          'transition-all duration-200 active:scale-95',
          isPlaying
            ? 'bg-sakura-600 text-white hover:bg-sakura-700 hover:shadow-lg'
            : 'btn-sakura'
        ]"
        @click="togglePlayback"
      >
        <!-- 再生中は停止アイコン＋パルスアニメーション、停止中はスピーカーアイコン -->
        <span v-if="isPlaying" class="inline-flex items-center gap-1">
          <span class="voice-pulse-dot" />
          <span class="voice-pulse-dot delay-100" />
          <span class="voice-pulse-dot delay-200" />
        </span>
        <span v-else>🔊</span>
        {{ isPlaying ? '停止' : '音声解説' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAudioPlayer } from '../composables/useAudioPlayer.js'
import sampleVoiceUrl from '../assets/audio/sample-voice.mp3'

// 事前録音された音声ファイルを再生するComposable
const { isPlaying, togglePlayback } = useAudioPlayer(sampleVoiceUrl)
</script>

<style scoped>
/* 再生中の波形風パルスアニメーション — 3つのドットが時差で跳ねる */
.voice-pulse-dot {
  @apply inline-block w-1.5 h-1.5 rounded-full bg-white;
  animation: voicePulse 0.8s ease-in-out infinite;
}
.voice-pulse-dot.delay-100 {
  animation-delay: 0.1s;
}
.voice-pulse-dot.delay-200 {
  animation-delay: 0.2s;
}

@keyframes voicePulse {
  0%, 100% { transform: scaleY(1); opacity: 0.6; }
  50% { transform: scaleY(2.2); opacity: 1; }
}
</style>
