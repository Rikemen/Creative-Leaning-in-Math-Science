import { getGenerativeModel } from 'firebase/ai'
import { ai } from '../config/firebaseInit.js'
import { sakuraSystemPrompt } from '../prompts/sakuraSystemPrompt.js'

/** 使用するモデル名 */
const MODEL_NAME = 'gemini-2.5-flash'

/**
 * さくら先輩用の GenerativeModel インスタンスをキャッシュ
 * systemInstruction をモデル生成時に設定することで、
 * 毎リクエストごとに渡す必要がなくなる。
 */
let chatModel = null
function getChatModel() {
  if (!chatModel) {
    chatModel = getGenerativeModel(ai, {
      model: MODEL_NAME,
      systemInstruction: { parts: [{ text: sakuraSystemPrompt }] },
    })
  }
  return chatModel
}

/**
 * 汎用の GenerativeModel を取得する（TTS・ルビ振り等、別システム指示が必要な用途）
 *
 * @param {string} modelName - モデル名
 * @param {object} [options] - 追加オプション（systemInstruction 等）
 * @returns {import('firebase/ai').GenerativeModel}
 */
export function getModel(modelName, options = {}) {
  return getGenerativeModel(ai, { model: modelName, ...options })
}

/**
 * Gemini APIへリクエストを送信し、さくら先輩としての応答を取得
 * @param {Array<{role: string, content: string}>} chatHistory - チャット履歴
 * @returns {Promise<string>} さくら先輩の応答テキスト
 */
export async function sendToGemini(chatHistory) {
  const model = getChatModel()

  // チャット履歴を SDK の Content 形式に変換
  // firebase/ai の role は 'user' | 'model'（'assistant'は不可）
  const contents = chatHistory.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  const result = await model.generateContent({ contents })
  return result.response.text() ?? '…ごめん、うまく考えがまとまらなかったみたい。'
}

/**
 * 画像付きでGemini Vision APIにリクエストを送信
 * @param {string} base64Image - Base64エンコードされた画像データ
 * @param {string} userPrompt - ユーザーの質問テキスト
 * @returns {Promise<string>} さくら先輩の応答テキスト
 */
export async function sendImageToGemini(base64Image, userPrompt) {
  const model = getChatModel()

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: userPrompt || 'この画像に書いてある数式や内容を教えて' },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
  })

  return result.response.text() ?? '…ごめん、画像がうまく読み取れなかったみたい。'
}
