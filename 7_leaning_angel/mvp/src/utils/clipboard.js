/**
 * テキストをクリップボードにコピーする
 * Clipboard APIに対応していない環境ではlegacyなexecCommandにフォールバック
 * @param {string} text - コピーするテキスト
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  // フォールバック: Clipboard API非対応の環境向け
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}
