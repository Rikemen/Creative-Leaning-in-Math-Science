import { getGeminiApiKey } from '../config/env.js'
import { sakuraSystemPrompt } from '../prompts/sakuraSystemPrompt.js'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * Gemini APIへリクエストを送信し、さくら先輩としての応答を取得
 * @param {Array<{role: string, content: string}>} chatHistory - チャット履歴
 * @returns {Promise<string>} さくら先輩の応答テキスト
 */
export async function sendToGemini(chatHistory) {
  const apiKey = getGeminiApiKey()

  // チャット履歴をGemini APIのフォーマットに変換
  const contents = chatHistory.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  const requestBody = {
    system_instruction: {
      parts: [{ text: sakuraSystemPrompt }],
    },
    contents,
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '…ごめん、うまく考えがまとまらなかったみたい。'
}

/**
 * 画像付きでGemini Vision APIにリクエストを送信
 * @param {string} base64Image - Base64エンコードされた画像データ
 * @param {string} userPrompt - ユーザーの質問テキスト
 * @returns {Promise<string>} さくら先輩の応答テキスト
 */
export async function sendImageToGemini(base64Image, userPrompt) {
  const apiKey = getGeminiApiKey()

  const requestBody = {
    system_instruction: {
      parts: [{ text: sakuraSystemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: userPrompt || 'この画像に書いてある数式や内容を教えて' },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Gemini Vision API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '…ごめん、画像がうまく読み取れなかったみたい。'
}
