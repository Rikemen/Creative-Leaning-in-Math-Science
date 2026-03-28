<template>
  <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
    <div class="container mx-auto flex items-center justify-between px-4 py-3">
      <h1 class="text-xl font-bold text-sakura-600">
        🌸 さくら先輩の数学辞書
      </h1>
      <div class="flex items-center gap-3">
        <!-- 音声解説ボタン：タップで先輩が記事概要を読み上げる -->
        <button
          :class="[
            'flex items-center gap-2 text-sm rounded-full px-4 sm:px-6 py-2 shadow-md',
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
          <span class="hidden sm:inline">{{ isPlaying ? '停止' : '音声解説' }}</span>
        </button>

        <!-- ログアウトボタン -->
        <button
          @click="handleSignOut"
          title="ログアウト"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
        >
          <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAudioPlayer } from '../composables/useAudioPlayer.js'
import { useAuth } from '../composables/useAuth.js'
import sampleVoiceUrl from '../assets/audio/sample-voice.mp3'

// 事前録音された音声ファイルを再生するComposable
const { isPlaying, togglePlayback } = useAudioPlayer(sampleVoiceUrl)

// ログアウト機能
const { signOut } = useAuth()
const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('ログアウトエラー', error)
  }
}
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
