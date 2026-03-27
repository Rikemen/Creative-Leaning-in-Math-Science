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
          <!-- 自動読み上げトグル -->
          <button
            class="ml-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all duration-200"
            :class="autoReadEnabled
              ? 'bg-sakura-100 text-sakura-600 shadow-sm'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"
            :aria-label="autoReadEnabled ? '自動読み上げをOFFにする' : '自動読み上げをONにする'"
            @click="toggleAutoRead"
          >
            <span class="text-sm">🔊</span>
            <span>{{ autoReadEnabled ? 'ON' : 'OFF' }}</span>
          </button>
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
        <!-- メッセージ一覧: assistantはv-htmlで数式描画、userはテキスト補間 -->
        <template v-for="(message, index) in chatHistory" :key="index">
          <div
            v-if="message.role === 'user'"
            class="max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base transition-all duration-300
                   ml-auto bg-sakura-100 text-gray-800 rounded-tr-none"
          >
            <!-- 画像付きメッセージの場合、サムネイルも表示 -->
            <img
              v-if="message.imageUrl"
              :src="message.imageUrl"
              alt="送信した画像"
              class="mb-2 max-h-32 rounded-lg object-cover"
            />
            {{ message.content }}
          </div>
          <!-- アシスタントメッセージ + 🔊ボタン -->
          <div v-else class="flex items-end gap-1.5">
            <div
              :class="[
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm md:text-base transition-all duration-300 rounded-tl-none',
                message.isError
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-700',
              ]"
              v-html="renderMathText(message.content)"
            />
            <!-- 音声読み上げボタン — エラーメッセージ以外に表示 -->
            <button
              v-if="!message.isError"
              class="shrink-0 rounded-full p-1.5 text-gray-400 transition-all duration-200
                     hover:bg-sakura-50 hover:text-sakura-500"
              :aria-label="speakingMessageIndex === index ? '読み上げを停止' : 'メッセージを読み上げ'"
              :disabled="isConverting && speakingMessageIndex !== index"
              @click="handleSpeakToggle(message.content, index)"
            >
              <!-- 再生中: パルスアニメーション -->
              <span
                v-if="speakingMessageIndex === index && isSpeaking"
                class="inline-flex items-center gap-0.5"
              >
                <span class="voice-dot" />
                <span class="voice-dot delay-100" />
                <span class="voice-dot delay-200" />
              </span>
              <!-- 変換中（ルビ振り+TTS生成中）: ローディング -->
              <span
                v-else-if="speakingMessageIndex === index && isConverting"
                class="inline-block w-4 h-4 border-2 border-sakura-300 border-t-transparent rounded-full animate-spin"
              />
              <!-- 待機中: スピーカーアイコン -->
              <span v-else class="text-base">🔊</span>
            </button>
          </div>
        </template>

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
                 hover:bg-sakura-100 disabled:opacity-40 disabled:cursor-not-allowed"
          :title="quick.label"
          :disabled="isLoading"
          @click="sendQuickQuestion(quick.prompt)"
        >
          {{ quick.icon }}
        </button>
      </div>

      <!-- 画像プレビュー（画像選択時に入力欄の上に表示） -->
      <div
        v-if="selectedImageUrl"
        class="flex items-center gap-3 border-t border-sakura-50 px-4 py-2"
      >
        <img
          :src="selectedImageUrl"
          alt="選択した画像"
          class="h-16 w-16 rounded-lg border border-sakura-200 object-cover shadow-sm"
        />
        <span class="flex-1 text-xs text-gray-500">📷 画像を選択中</span>
        <button
          class="shrink-0 rounded-full p-1.5 text-sm text-gray-400
                 hover:bg-red-50 hover:text-red-500 transition"
          aria-label="画像を取り消す"
          @click="clearSelectedImage"
        >
          ✕
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
        <!-- 非表示のファイル選択ダイアログ -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />
        <input
          v-model="userInput"
          type="text"
          class="flex-1 rounded-full border border-sakura-200 px-4 py-2
                 text-sm focus:border-sakura-400 focus:outline-none"
          :placeholder="selectedImageUrl ? '画像について質問してみよう...' : 'さくら先輩に質問してみよう...'"
          @keyup.enter="sendMessage"
        />
        <button
          class="btn-sakura shrink-0 px-4 py-2 text-sm
                 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="isLoading"
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
import { useVoice } from '../composables/useVoice.js'
import 'katex/dist/katex.min.css'
import { renderMathText } from '../utils/renderMathText.js'

defineProps({
  visible: { type: Boolean, default: false },
})
defineEmits(['update:visible'])

const { chatHistory, isLoading, sendUserMessage, sendImageMessage } = useChat()
const {
  isConverting, isSpeaking, speakingMessageIndex, autoReadEnabled,
  speakMessage, stopSpeaking,
} = useVoice()
const userInput = ref('')
const historyContainer = ref(null)
const fileInput = ref(null)

// 画像選択状態の管理
const selectedImageUrl = ref(null)   // プレビュー用 Data URL
const selectedImageBase64 = ref(null) // API送信用 Base64

// メッセージが追加されたら最下部へスクロール
watch(
  () => [chatHistory.value.length, isLoading.value],
  async () => {
    await nextTick()
    if (!historyContainer.value) return

    historyContainer.value.scrollTo({
      top: historyContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
)

/**
 * 自動読み上げトグル — 新しいassistantメッセージを検知して自動再生
 *
 * isLoadingがtrue→falseに変わった瞬間 = 応答が完了した瞬間を捕捉。
 * その時点でchatHistoryの末尾がassistantメッセージならTTS再生を起動する。
 */
watch(
  () => isLoading.value,
  (newLoading, oldLoading) => {
    // ローディング完了の瞬間だけ反応（true → false）
    if (oldLoading && !newLoading && autoReadEnabled.value) {
      const lastMessage = chatHistory.value[chatHistory.value.length - 1]
      if (lastMessage?.role === 'assistant' && !lastMessage.isError) {
        const lastIndex = chatHistory.value.length - 1
        speakMessage(lastMessage.content, lastIndex)
      }
    }
  }
)

/**
 * トグルOFFにした際、再生中の音声も停止する
 */
const toggleAutoRead = () => {
  autoReadEnabled.value = !autoReadEnabled.value
  if (!autoReadEnabled.value && isSpeaking.value) {
    stopSpeaking()
  }
}

// ワンタップ質問の定義
const quickQuestions = [
  { icon: '💡', label: '意味を教えて', prompt: 'この概念の意味を分かりやすく教えて' },
  { icon: '📝', label: '具体例を教えて', prompt: '具体的な例を使って説明して' },
  { icon: '🔄', label: 'もう一度説明して', prompt: 'もう少し噛み砕いて説明してくれる？' },
]

// テキストメッセージ送信（ローディング中は送信をガード）
const sendMessage = () => {
  if (isLoading.value) return

  // 画像が選択されている場合は画像付きメッセージとして送信
  if (selectedImageUrl.value) {
    const prompt = userInput.value.trim() || 'この画像に書いてある数式や内容を教えて'
    sendImageMessage(selectedImageBase64.value, prompt, selectedImageUrl.value)
    clearSelectedImage()
    userInput.value = ''
    return
  }

  // テキストのみのメッセージ送信
  if (!userInput.value.trim()) return
  sendUserMessage(userInput.value)
  userInput.value = ''
}

// ワンタップ質問送信（ローディング中は送信をガード）
const sendQuickQuestion = (prompt) => {
  if (isLoading.value) return
  sendUserMessage(prompt)
}

/**
 * 🔊ボタンのトグル処理
 * 同じメッセージをタップ → 停止、別のメッセージをタップ → 切り替え再生
 */
const handleSpeakToggle = (content, index) => {
  if (speakingMessageIndex.value === index && isSpeaking.value) {
    stopSpeaking()
  } else {
    speakMessage(content, index)
  }
}

// カメラボタン → 非表示のfile inputをクリックしてダイアログを開く
const handleCameraClick = () => {
  fileInput.value?.click()
}

/**
 * ファイル選択時の処理
 * FileReaderで画像をData URLに変換し、プレビュー表示用とAPI送信用の両方を保持
 */
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImageUrl.value = e.target.result
    // Data URLからBase64部分だけを抽出（Step 5-2のAPI送信用）
    selectedImageBase64.value = e.target.result.split(',')[1]
  }
  reader.readAsDataURL(file)

  // 同じファイルを再度選択できるようにvalueをリセット
  event.target.value = ''
}

// 選択した画像をクリア
const clearSelectedImage = () => {
  selectedImageUrl.value = null
  selectedImageBase64.value = null
}
</script>

<style scoped>
/* 音声再生中のパルスアニメーション */
.voice-dot {
  @apply inline-block w-1 h-1 rounded-full bg-sakura-400;
  animation: voicePulse 0.8s ease-in-out infinite;
}
.voice-dot.delay-100 {
  animation-delay: 0.1s;
}
.voice-dot.delay-200 {
  animation-delay: 0.2s;
}

@keyframes voicePulse {
  0%, 100% { transform: scaleY(1); opacity: 0.5; }
  50% { transform: scaleY(2.5); opacity: 1; }
}
</style>
