import { GoogleGenAI } from '@google/genai'
import { getGeminiApiKey } from '../config/env.js'
import { sakuraSystemPrompt } from '../prompts/sakuraSystemPrompt.js'

/** 使用するモデル名（公式SDKのクイックスタートに準拠） */
const MODEL_NAME = 'gemini-2.5-flash'

/**
 * GoogleGenAIクライアントのシングルトン生成
 * APIキーの取得を遅延させることで、.env未設定時の早期エラー検出を維持する
 */
let aiClient = null
function getClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: getGeminiApiKey() })
  }
  return aiClient
}

/**
 * Gemini APIへリクエストを送信し、さくら先輩としての応答を取得
 * @param {Array<{role: string, content: string}>} chatHistory - チャット履歴
 * @returns {Promise<string>} さくら先輩の応答テキスト
 */
export async function sendToGemini(chatHistory) {
  const ai = getClient()

  // チャット履歴を公式SDKのContent形式に変換
  // SDKの role は 'user' | 'model'（'assistant'は不可）
  const contents = chatHistory.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction: sakuraSystemPrompt,
    },
  })

  return response.text ?? '…ごめん、うまく考えがまとまらなかったみたい。'
}

/**
 * 画像付きでGemini Vision APIにリクエストを送信
 * @param {string} base64Image - Base64エンコードされた画像データ
 * @param {string} userPrompt - ユーザーの質問テキスト
 * @returns {Promise<string>} さくら先輩の応答テキスト
 */
export async function sendImageToGemini(base64Image, userPrompt) {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
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
    config: {
      systemInstruction: sakuraSystemPrompt,
    },
  })

  return response.text ?? '…ごめん、画像がうまく読み取れなかったみたい。'
}
