import { ref } from 'vue'
import { sendToGemini, sendImageToGemini } from './useGemini.js'

/**
 * チャット機能の状態管理コンポーザブル
 * - チャット履歴の保持（MVPではメモリ上のみ、ページリロードで消失）
 * - ユーザーメッセージ送信 → Gemini API呼び出し → 応答表示の一連のフロー
 * - 画像付き質問 → Gemini Vision API呼び出し → 応答表示
 */
export function useChat() {
  const chatHistory = ref([
    {
      role: 'assistant',
      content: 'こんにちは！さくらだよ♪ 固有値と固有ベクトルについて、何でも聞いてね！',
    },
  ])

  const isLoading = ref(false)

  /**
   * ユーザーのメッセージを送信し、Gemini APIからの応答をチャット履歴に追加
   * @param {string} userMessage - ユーザーの入力テキスト
   */
  const sendUserMessage = async (userMessage) => {
    chatHistory.value.push({ role: 'user', content: userMessage })
    isLoading.value = true

    try {
      const response = await sendToGemini(chatHistory.value)
      chatHistory.value.push({ role: 'assistant', content: response })
    } catch (error) {
      chatHistory.value.push({
        role: 'assistant',
        content: 'ごめんね、ちょっとうまく繋がらなかったみたい…もう一回聞いてくれる？',
        isError: true,
      })
      console.error('Gemini API呼び出しエラー:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 画像付きメッセージを送信し、Gemini Vision APIからの応答をチャット履歴に追加
   * @param {string} base64Image - Base64エンコードされた画像データ
   * @param {string} userPrompt - ユーザーの質問テキスト
   * @param {string} imageUrl - プレビュー用のData URL（チャット履歴の表示用）
   */
  const sendImageMessage = async (base64Image, userPrompt, imageUrl) => {
    chatHistory.value.push({
      role: 'user',
      content: userPrompt,
      imageUrl,
    })
    isLoading.value = true

    try {
      const response = await sendImageToGemini(base64Image, userPrompt)
      chatHistory.value.push({ role: 'assistant', content: response })
    } catch (error) {
      chatHistory.value.push({
        role: 'assistant',
        content: 'ごめんね、画像がうまく読み取れなかったみたい…もう一回送ってくれる？',
        isError: true,
      })
      console.error('Gemini Vision API呼び出しエラー:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    chatHistory,
    isLoading,
    sendUserMessage,
    sendImageMessage,
  }
}
