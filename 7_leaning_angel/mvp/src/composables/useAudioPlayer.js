import { ref, onUnmounted } from 'vue'

/**
 * 音声ファイルの再生・停止を管理するComposable
 *
 * 単一のAudioインスタンスを保持し、再生状態をリアクティブに追跡する。
 * コンポーネントのアンマウント時に自動でクリーンアップされるため、
 * メモリリークの心配は不要。
 *
 * @param {string} audioSrc - 音声ファイルのURL（Viteのimportで解決済みのパス）
 * @returns {{ isPlaying: import('vue').Ref<boolean>, togglePlayback: () => void }}
 */
export function useAudioPlayer(audioSrc) {
  const isPlaying = ref(false)
  /** @type {HTMLAudioElement | null} */
  let audioInstance = null

  /**
   * Audioインスタンスを遅延初期化する。
   * 初回再生時まで生成を遅らせることで、ユーザー操作前のリソース消費を回避。
   */
  const getOrCreateAudio = () => {
    if (!audioInstance) {
      audioInstance = new Audio(audioSrc)

      // 再生完了時に状態をリセット — ボタン表示を「再生」に戻す
      audioInstance.addEventListener('ended', () => {
        isPlaying.value = false
      })
    }
    return audioInstance
  }

  /**
   * 再生/停止をトグルする。
   * 停止時は先頭に戻すことで、次回タップ時に最初から再生される。
   */
  const togglePlayback = () => {
    const audio = getOrCreateAudio()

    if (isPlaying.value) {
      audio.pause()
      audio.currentTime = 0
      isPlaying.value = false
    } else {
      audio.play().catch((error) => {
        // ブラウザのAutoplay Policyによるブロック時のフォールバック
        console.warn('音声再生がブロックされました:', error.message)
        isPlaying.value = false
      })
      isPlaying.value = true
    }
  }

  // コンポーネント破棄時にAudioリソースを解放
  onUnmounted(() => {
    if (audioInstance) {
      audioInstance.pause()
      audioInstance.removeAttribute('src')
      audioInstance = null
    }
  })

  return {
    isPlaying,
    togglePlayback,
  }
}
