/**
 * 画像ファイルをBase64文字列にエンコードする
 * カメラ質問機能でGemini Vision APIに画像を送信する際に使用
 * @param {File} imageFile - エンコード対象の画像ファイル
 * @returns {Promise<string>} Base64エンコードされた画像データ（data:プレフィックスなし）
 */
export function encodeImageToBase64(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      // "data:image/jpeg;base64," プレフィックスを除去してBase64部分のみ返す
      const base64String = reader.result.split(',')[1]
      resolve(base64String)
    }

    reader.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'))
    }

    reader.readAsDataURL(imageFile)
  })
}
