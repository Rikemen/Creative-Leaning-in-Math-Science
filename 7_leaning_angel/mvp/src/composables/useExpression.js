import { ref } from 'vue'

// 画像をViteの静的アセットとしてimport（背景透過済みPNG）
import sakuraSmile from '../assets/images/sakura_smile.png'
import sakuraWink from '../assets/images/sakura_wink.png'
import sakuraCareful from '../assets/images/sakura_careful.png'
import sakuraSurprise from '../assets/images/sakura_suprise.png'
import sakuraLove from '../assets/images/sakura_love.png'
import sakuraAngry from '../assets/images/sakura_angry.png'
import sakuraSleepy from '../assets/images/sakura_sleepy.png'

/**
 * 表情キー → 画像パスのマッピング
 * Step 9-2 でAI感情分析と接続する際に、このキーを使って表情を切り替える。
 */
export const EXPRESSION_MAP = {
  smile: sakuraSmile,
  wink: sakuraWink,
  careful: sakuraCareful,
  surprise: sakuraSurprise,
  love: sakuraLove,
  angry: sakuraAngry,
  sleepy: sakuraSleepy,
}

/** @type {readonly string[]} 利用可能な表情キーの一覧 */
export const EXPRESSION_KEYS = /** @type {const} */ (Object.keys(EXPRESSION_MAP))

/**
 * さくら先輩の表情（立ち絵）を管理するComposable
 *
 * Step 9-1: デフォルト smile で表示、手動切り替え可能
 * Step 9-2: AI感情タグから自動切り替え（後日接続）
 *
 * @returns {{
 *   currentExpression: import('vue').Ref<string>,
 *   currentImagePath: import('vue').ComputedRef<string>,
 *   setExpression: (key: string) => void,
 * }}
 */
export function useExpression() {
  /** 現在の表情キー（デフォルト: smile） */
  const currentExpression = ref('smile')

  /**
   * 表情を切り替える
   * 未定義のキーが渡された場合は smile にフォールバック
   * @param {string} key - EXPRESSION_MAP のキー
   */
  const setExpression = (key) => {
    if (!(key in EXPRESSION_MAP)) {
      console.warn(`[useExpression] 未定義の表情キー: "${key}" → smile にフォールバック`)
      currentExpression.value = 'smile'
      return
    }
    currentExpression.value = key
  }

  return {
    currentExpression,
    expressionMap: EXPRESSION_MAP,
    setExpression,
  }
}
