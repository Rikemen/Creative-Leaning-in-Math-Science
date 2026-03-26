import katex from 'katex'

/**
 * テキスト中の数式記法（$...$, $$...$$）をKaTeXでHTMLに変換するユーティリティ
 *
 * 処理の流れ:
 * 1. $$...$$ （ブロック数式）を先に検出・変換
 * 2. $...$  （インライン数式）を次に検出・変換
 * 3. 通常テキストは HTML 特殊文字をエスケープ
 * 4. 改行は <br> に変換
 *
 * @param {string} text - Gemini APIからの応答テキスト
 * @returns {string} HTMLに変換された文字列
 */
export function renderMathText(text) {
  if (!text) return ''

  // $$...$$ と $...$ を検出・分割するための正規表現
  // $$...$$ を先にマッチさせることで、$$ の中の $ を誤検出しない
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\s$](?:[^$]*[^\s$])?\$)/g

  const parts = []
  let lastIndex = 0
  let match

  while ((match = mathRegex.exec(text)) !== null) {
    // 数式の手前の通常テキスト
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      })
    }

    // 数式部分
    const raw = match[0]
    const isBlock = raw.startsWith('$$')
    // デリミタを除去して中身を取り出す
    const formula = isBlock
      ? raw.slice(2, -2).trim()
      : raw.slice(1, -1)

    parts.push({
      type: 'math',
      content: formula,
      displayMode: isBlock,
    })

    lastIndex = match.index + raw.length
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  // 各パートをHTMLに変換して結合
  return parts
    .map((part) => {
      if (part.type === 'math') {
        return renderKatex(part.content, part.displayMode)
      }
      return escapeAndFormatText(part.content)
    })
    .join('')
}

/**
 * LaTeX文字列をKaTeXでHTMLに変換
 * パースエラー時は元の文字列をそのまま表示（クラッシュさせない）
 */
function renderKatex(latex, displayMode) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    })
  } catch (error) {
    console.warn('KaTeXレンダリング失敗:', latex, error)
    // エラー時はデリミタ付きの元テキストをエスケープして返す
    const delimiter = displayMode ? '$$' : '$'
    return escapeHtml(`${delimiter}${latex}${delimiter}`)
  }
}

/**
 * XSS対策: HTML特殊文字をエスケープし、改行を <br> に変換
 * Gemini APIの応答のみが対象のため、追加のサニタイズは不要
 */
function escapeAndFormatText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>')
}

/** HTML特殊文字のエスケープ */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
