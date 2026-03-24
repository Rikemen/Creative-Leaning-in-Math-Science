/**
 * 環境変数の一元管理モジュール
 * import.meta.env を直接参照する代わりにこのモジュールを経由することで、
 * 設定漏れの早期検出と型安全性を確保する
 */

/**
 * Gemini APIキーを取得
 * @returns {string} APIキー
 * @throws {Error} 環境変数が未設定の場合
 */
export function getGeminiApiKey() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'VITE_GEMINI_API_KEY が設定されていません。' +
      '.env.example を .env にコピーし、APIキーを設定してください。'
    )
  }

  return apiKey
}
