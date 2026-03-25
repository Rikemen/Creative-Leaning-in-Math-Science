<template>
  <!-- ハーフモーダル：画面下部からスライドイン -->
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col
             rounded-t-3xl bg-white shadow-2xl"
    >
      <!-- モーダルヘッダー -->
      <div class="flex items-center justify-between border-b border-sakura-100 px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🌸</span>
          <span class="font-bold text-sakura-600">さくら先輩</span>
        </div>
        <button
          class="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          aria-label="チャットを閉じる"
          @click="$emit('update:visible', false)"
        >
          ✕
        </button>
      </div>

      <!-- チャット履歴 -->
      <div
        ref="historyContainer"
        class="flex-1 space-y-4 overflow-y-auto p-4"
      >
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          :class="[
            'max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base transition-all duration-300',
            message.role === 'user'
              ? 'ml-auto bg-sakura-100 text-gray-800 rounded-tr-none'
              : 'bg-gray-100 text-gray-700 rounded-tl-none',
          ]"
        >
          {{ message.content }}
        </div>

        <!-- ローディング表示 -->
        <div
          v-if="isLoading"
          class="bg-gray-50 text-gray-400 italic max-w-[80%] rounded-2xl p-3 text-sm"
        >
          先輩が考え中...
        </div>
      </div>

      <!-- ワンタップ質問ボタン -->
      <div class="flex gap-2 border-t border-sakura-50 px-4 py-2">
        <button
          v-for="quick in quickQuestions"
          :key="quick.icon"
          class="rounded-full bg-sakura-50 p-2 text-xl transition
                 hover:bg-sakura-100"
          :title="quick.label"
          @click="sendQuickQuestion(quick.prompt)"
        >
          {{ quick.icon }}
        </button>
      </div>

      <!-- 入力エリア -->
      <div class="flex items-center gap-2 border-t border-sakura-100 px-4 py-3">
        <!-- カメラボタン（Vision AI用） -->
        <button
          class="shrink-0 rounded-full p-2 text-xl text-sakura-400
                 hover:bg-sakura-50"
          aria-label="画像で質問する"
          @click="handleCameraClick"
        >
          📷
        </button>
        <input
          v-model="userInput"
          type="text"
          class="flex-1 rounded-full border border-sakura-200 px-4 py-2
                 text-sm focus:border-sakura-400 focus:outline-none"
          placeholder="さくら先輩に質問してみよう..."
          @keyup.enter="sendMessage"
        />
        <button
          class="btn-sakura shrink-0 px-4 py-2 text-sm"
          @click="sendMessage"
        >
          送信
        </button>
      </div>
    </div>
  </Transition>

  <!-- オーバーレイ背景 -->
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-40 bg-black/30"
      @click="$emit('update:visible', false)"
    />
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChat } from '../composables/useChat.js'

defineProps({
  visible: { type: Boolean, default: false },
})
defineEmits(['update:visible'])

const { chatHistory, isLoading, sendUserMessage } = useChat()
const userInput = ref('')
const historyContainer = ref(null)

// メッセージが追加されたら最下部へスクロール
watch(
  () => [chatHistory.value.length, isLoading.value],
  async () => {
    await nextTick()
    if (historyContainer.value) {
      historyContainer.value.scrollTo({
        top: historyContainer.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  }
)

// ワンタップ質問の定義
const quickQuestions = [
  { icon: '💡', label: '意味を教えて', prompt: 'この概念の意味を分かりやすく教えて' },
  { icon: '📝', label: '具体例を教えて', prompt: '具体的な例を使って説明して' },
  { icon: '🔄', label: 'もう一度説明して', prompt: 'もう少し噛み砕いて説明してくれる？' },
]

// テキストメッセージ送信
const sendMessage = () => {
  if (!userInput.value.trim()) return
  sendUserMessage(userInput.value)
  userInput.value = ''
}

// ワンタップ質問送信
const sendQuickQuestion = (prompt) => {
  sendUserMessage(prompt)
}

// カメラ（画像アップロード）処理
const handleCameraClick = () => {
  // TODO: ファイル選択ダイアログ→画像をBase64変換→Gemini Vision APIに送信
  console.log('カメラ質問機能を起動')
}
</script>
