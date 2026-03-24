<template>
  <div class="min-h-screen bg-gradient-to-b from-sakura-50 to-white">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MainHeader from './components/MainHeader.vue'
import MathArticle from './components/MathArticle.vue'
import SimulationBoard from './components/SimulationBoard.vue'
import ChatFloatingIcon from './components/ChatFloatingIcon.vue'
import ChatModal from './components/ChatModal.vue'

// チャットモーダルの開閉状態
const isChatOpen = ref(false)
</script>
