<template>
  <div class="min-h-screen bg-gradient-to-b from-sakura-50 to-white">
    <!-- 認証状態のロード中 -->
    <div v-if="!isAuthReady" class="flex flex-col items-center justify-center min-h-screen">
      <div class="w-12 h-12 border-4 border-sakura-200 border-t-sakura-500 rounded-full animate-spin mb-4"></div>
      <p class="text-sakura-600 font-medium">読み込み中...</p>
    </div>

    <!-- 未ログイン時：ログイン画面 -->
    <LoginScreen v-else-if="!currentUser" />

    <!-- ログイン済みのメインコンテンツ -->
    <template v-else>
      <!-- ヘッダー：タイトル＆音声解説ボタン -->
      <MainHeader />

      <!-- メインコンテンツ：記事本文＋シミュレーション -->
      <main class="container mx-auto px-4 py-6">
        <MathArticle />
        <SimulationBoard />
      </main>

      <!-- フローティングチャット：さくら先輩への質問UI -->
      <ChatFloatingIcon @open-chat="isChatOpen = true" />
      <ChatModal v-model:visible="isChatOpen" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from './composables/useAuth.js'
import LoginScreen from './components/LoginScreen.vue'
import MainHeader from './components/MainHeader.vue'
import MathArticle from './components/MathArticle.vue'
import SimulationBoard from './components/SimulationBoard.vue'
import ChatFloatingIcon from './components/ChatFloatingIcon.vue'
import ChatModal from './components/ChatModal.vue'

const { currentUser, isAuthReady } = useAuth()

// チャットモーダルの開閉状態
const isChatOpen = ref(false)
</script>
