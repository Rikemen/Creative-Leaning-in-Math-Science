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
          <!-- モバイル用: 丸型アバター -->
          <SakuraAvatar :current-expression="currentExpression" />
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
          <!-- アシスタントメッセージ（縦並び・左上ボタン配置） -->
          <div v-else class="flex flex-col items-start gap-1">
            <!-- 吹き出し上部のアクション領域: 名前と音声読み上げボタン -->
            <div class="flex items-center gap-2 pl-2">
              <span class="text-xs font-semibold text-sakura-500">🌸 さくら先輩</span>
              
              <!-- 音声読み上げボタン — エラーメッセージ以外に表示 -->
              <button
                v-if="!message.isError"
                class="flex items-center justify-center rounded-full px-1.5 py-0.5 text-gray-400 transition-all duration-200 hover:bg-sakura-50 hover:text-sakura-500"
                :aria-label="speakingMessageIndex === index ? '読み上げを停止' : 'メッセージを読み上げ'"
                :disabled="isConverting && speakingMessageIndex !== index"
                @click="handleSpeakToggle(message.content, index)"
              >
                <!-- 再生中: パルスアニメーション -->
                <span
                  v-if="speakingMessageIndex === index && isSpeaking"
                  class="inline-flex items-center gap-0.5 py-1 px-1"
                >
                  <span class="voice-dot" />
                  <span class="voice-dot delay-100" />
                  <span class="voice-dot delay-200" />
                </span>
                <!-- 変換中（ルビ振り+TTS生成中）: ローディング -->
                <span
                  v-else-if="speakingMessageIndex === index && isConverting"
                  class="inline-block w-3.5 h-3.5 border-2 border-sakura-300 border-t-transparent rounded-full animate-spin my-0.5"
                />
                <!-- 待機中: スピーカーアイコン -->
                <span v-else class="text-sm">🔊</span>
              </button>
            </div>

            <!-- メッセージバブル本体 -->
            <div
              :class="[
                'max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base transition-all duration-300 rounded-tl-none',
                message.isError
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-700',
              ]"
              v-html="renderMathText(message.content)"
            />
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

      <!-- ========= フッター領域（入力エリア）========= -->
      <!-- 立ち絵よりも手前に表示するため relative z-[60] を付与。背景は立ち絵を透かすため透明＋グラデーションに -->
      <div class="relative z-[60] bg-gradient-to-t from-white/80 via-white/40 to-transparent pt-4 pb-safe pb-4">
        <!-- ワンタップ質問ボタン -->
        <div class="flex gap-2 px-4 py-2">
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
        class="flex items-center gap-3 px-4 py-2"
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
      <div class="flex items-center gap-2 px-4 py-3">
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
          class="flex-1 min-w-0 rounded-full border border-sakura-200 px-4 py-2
                 text-sm focus:border-sakura-400 focus:outline-none"
          :placeholder="selectedImageUrl ? '画像について質問してみよう...' : 'さくら先輩に質問してみよう...'"
          @keyup.enter="sendMessage"
        />
        <button
          class="btn-sakura shrink-0 px-4 py-2 text-sm whitespace-nowrap
                 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="isLoading"
          @click="sendMessage"
        >
          送信
        </button>
      </div>
      <!-- ▲▲ フッター領域ここまで ▲▲ -->
      </div>

      <!-- 画面右下の立ち絵を内包（親が z-50 なので absolute z-10 にし、フッター z-60 の裏に隠れるようにする） -->
      <div
        class="absolute bottom-0 right-0 z-10 pointer-events-none"
      >
        <Transition name="expression-fade" mode="out-in">
          <img
            :key="currentExpression"
            :src="expressionImageSrc"
            :alt="`さくら先輩 — ${currentExpression}`"
            class="sakura-standing-img"
          />
        </Transition>
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
import { ref, watch, nextTick, computed } from 'vue'
import { useChat } from '../composables/useChat.js'
import { useVoice } from '../composables/useVoice.js'
import { useExpression, EXPRESSION_MAP } from '../composables/useExpression.js'
import SakuraAvatar from './SakuraAvatar.vue'
import 'katex/dist/katex.min.css'
import { renderMathText } from '../utils/renderMathText.js'

defineProps({
  visible: { type: Boolean, default: false },
})
defineEmits(['update:visible'])

const { chatHistory, isLoading, sendUserMessage, sendImageMessage, setEmotionCallback } = useChat()
const {
  isConverting, isSpeaking, speakingMessageIndex, autoReadEnabled,
  speakMessage, stopSpeaking, unlockAudio
} = useVoice()
const { currentExpression, setExpression } = useExpression()

// AI応答の感情タグで立ち絵の表情を自動切り替え
setEmotionCallback((emotion) => {
  setExpression(emotion)
})

// デスクトップ立ち絵用: 表情キー → 画像パスの算出
const expressionImageSrc = computed(() =>
  EXPRESSION_MAP[currentExpression.value] ?? EXPRESSION_MAP.smile
)

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
  unlockAudio() // 自動読み上げをONにした瞬間にアンロック
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
  unlockAudio() // 送信ボタンタップ時にアンロック

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
  unlockAudio() // クイック質問タップ時にアンロック
  sendUserMessage(prompt)
}

/**
 * 🔊ボタンのトグル処理
 * 同じメッセージをタップ → 停止、別のメッセージをタップ → 切り替え再生
 */
const handleSpeakToggle = (content, index) => {
  unlockAudio() // 🔊ボタンタップ時にアンロック
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

/* 表情切り替え時のクロスフェードアニメーション */
.expression-fade-enter-active,
.expression-fade-leave-active {
  transition: opacity 0.3s ease;
}
.expression-fade-enter-from,
.expression-fade-leave-to {
  opacity: 0;
}

/**
  * 立ち絵画像（背景透過PNG・モバイル/デスクトップ兼用）
  * - モバイル: チャットエリアに被りすぎないよう控えめなサイズ
  * - デスクトップ: よりダイナミックに大きく表示
  */
.sakura-standing-img {
  height: 40vh;
  max-height: 320px;
  width: auto;
  object-fit: contain;
  object-position: bottom right;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.12));
}

/* デスクトップ: 大きめに表示 */
@media (min-width: 768px) {
  .sakura-standing-img {
    height: 60vh;
    max-height: 600px;
  }
}
</style>
