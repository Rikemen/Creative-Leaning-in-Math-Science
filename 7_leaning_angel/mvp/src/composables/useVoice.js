import { ref } from 'vue'
import { getModel } from './useGemini.js'
import { voiceConversionPrompt } from '../prompts/voiceConversionPrompt.js'

/** ルビ振り変換に使用するモデル */
const TEXT_MODEL = 'gemini-2.5-flash'

/** TTS専用モデル — Gemini 2.5 Flash TTS Preview */
const TTS_MODEL = 'gemini-2.5-flash-preview-tts'

/**
 * さくら先輩のキャラクターに合わせたTTSボイス設定
 * Despina: 柔らかく温かみのある女性声。
 */
const SAKURA_VOICE_NAME = 'Despina'

/**
 * TTS用の演出指示プレフィックス
 * Gemini TTSはLLMベースなので、自然言語で声の演出を制御できる。
 */
const TTS_DIRECTION_PREFIX = `優しく明るいトーンで、ゆっくりめに、親しみを込めて読み上げてください。
数学の解説をしている大学院生の先輩のような話し方で：

`

/** TTS音声のサンプルレート（Gemini TTS仕様: 24kHz） */
const TTS_SAMPLE_RATE = 24000

/**
 * チャット応答の音声読み上げ機能を提供するComposable
 *
 * 処理フロー:
 * 1. ルビ振り変換（Step 7-1）: LaTeX数式 → 日本語読みテキスト
 * 2. Gemini TTS（Step 7-2）: テキスト → PCM音声データ
 * 3. AudioContext再生: PCM → Float32 → ブラウザ再生
 *
 * @returns {{
 *   isConverting: import('vue').Ref<boolean>,
 *   isSpeaking: import('vue').Ref<boolean>,
 *   speakingMessageIndex: import('vue').Ref<number|null>,
 *   convertToSpeechText: (rawText: string) => Promise<string>,
 *   speakMessage: (rawText: string, messageIndex: number) => Promise<void>,
 *   stopSpeaking: () => void
 * }}
 */
export function useVoice() {
  /** ルビ振り変換のローディング状態 */
  const isConverting = ref(false)

  /** TTS音声の再生中状態 */
  const isSpeaking = ref(false)

  /** 現在再生中のメッセージのインデックス（🔊ボタンのハイライト用） */
  const speakingMessageIndex = ref(null)

  /** 自動読み上げモード — ONなら新しいassistant応答を自動でTTS再生 */
  const autoReadEnabled = ref(false)

  /** 再生中のAudioContextとSourceNode — 停止制御用 */
  let currentAudioContext = null
  let currentSourceNode = null

  /**
   * キャンセルフラグ — stopSpeaking時にtrueにし、
   * speakMessage内の各async境界で確認することで、
   * 変換途中にOFFにしても変換完了後の再生を防止する。
   */
  let cancelRequested = false

  /**
   * チャット応答テキストを音声読み上げ用テキストに変換する（Step 7-1）
   *
   * @param {string} rawText - さくら先輩のチャット応答（LaTeX数式含む）
   * @returns {Promise<string>} 読み上げ用に変換されたプレーンテキスト
   */
  const convertToSpeechText = async (rawText) => {
    if (!rawText?.trim()) return ''

    isConverting.value = true

    try {
      const rubyModel = getModel(TEXT_MODEL, {
        systemInstruction: { parts: [{ text: voiceConversionPrompt }] },
      })

      const result = await rubyModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: rawText }],
          },
        ],
      })

      const convertedText = result.response.text() ?? rawText

      console.log('[useVoice] ルビ振り変換前:', rawText)
      console.log('[useVoice] ルビ振り変換後:', convertedText)

      return convertedText
    } catch (error) {
      console.error('[useVoice] ルビ振り変換エラー:', error)
      // 変換失敗時は元テキストをフォールバックとして返す
      return rawText
    } finally {
      isConverting.value = false
    }
  }

  /**
   * Gemini TTS APIでテキストをPCM音声データに変換する。
   * 返却されるデータは16-bit signed PCM, 24kHz, monoのBase64文字列。
   *
   * @param {string} speechText - 読み上げ用テキスト（ルビ振り済み）
   * @returns {Promise<string>} Base64エンコードされたPCM音声データ
   */
  const generateSpeechAudio = async (speechText) => {
    // TTS専用モデルは responseModalities と speechConfig をモデル生成時に設定
    const ttsModel = getModel(TTS_MODEL, {
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: SAKURA_VOICE_NAME,
            },
          },
        },
      },
    })

    // 演出指示 + 読み上げテキストを結合してTTSに送信
    const prompt = TTS_DIRECTION_PREFIX + speechText

    const result = await ttsModel.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    })

    // TTS応答からBase64音声データを抽出
    const audioData = result.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!audioData) {
      throw new Error('TTS応答に音声データが含まれていません')
    }

    return audioData
  }

  /**
   * Base64エンコードされたPCM音声データをブラウザで再生する。
   *
   * Gemini TTSの出力形式は 16-bit signed integer PCM, 24kHz, mono。
   * AudioContext で再生するには Float32 (-1.0〜1.0) への変換が必要。
   *
   * @param {string} base64Audio - Base64エンコードされたPCM音声データ
   * @returns {Promise<void>} 再生完了で解決するPromise
   */
  const playPcmAudio = (base64Audio) => {
    return new Promise((resolve, reject) => {
      try {
        // Base64 → バイナリ → Int16Array への変換
        const binaryString = atob(base64Audio)
        const byteArray = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i)
        }
        const int16Array = new Int16Array(byteArray.buffer)

        // Int16 (-32768〜32767) → Float32 (-1.0〜1.0) に正規化
        const float32Array = new Float32Array(int16Array.length)
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0
        }

        // AudioContext を生成し、バッファに格納して再生
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: TTS_SAMPLE_RATE,
        })
        const audioBuffer = audioContext.createBuffer(1, float32Array.length, TTS_SAMPLE_RATE)
        audioBuffer.getChannelData(0).set(float32Array)

        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContext.destination)

        // 停止制御用にインスタンスを保持
        currentAudioContext = audioContext
        currentSourceNode = source

        // 再生完了時のクリーンアップ
        source.onended = () => {
          audioContext.close()
          currentAudioContext = null
          currentSourceNode = null
          resolve()
        }

        source.start(0)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * メッセージを音声で読み上げる — ルビ振り変換→TTS生成→再生の一連のフロー
   *
   * @param {string} rawText - チャット応答のテキスト（LaTeX数式含む）
   * @param {number} messageIndex - チャット履歴内のメッセージインデックス
   */
  const speakMessage = async (rawText, messageIndex) => {
    // 再生中なら停止してから新しいメッセージを再生
    if (isSpeaking.value) {
      stopSpeaking()
    }

    cancelRequested = false
    speakingMessageIndex.value = messageIndex
    isSpeaking.value = true

    try {
      // Step 1: ルビ振り変換（LaTeX → 日本語読み）
      const speechText = await convertToSpeechText(rawText)
      if (cancelRequested) return // OFF切り替え時のキャンセル

      // Step 2: Gemini TTS で音声データ生成
      console.log('[useVoice] TTS生成開始...')
      const audioData = await generateSpeechAudio(speechText)
      if (cancelRequested) return // OFF切り替え時のキャンセル
      console.log('[useVoice] TTS生成完了、再生開始')

      // Step 3: ブラウザで再生
      await playPcmAudio(audioData)
      console.log('[useVoice] 再生完了')
    } catch (error) {
      // キャンセル起因のエラーは正常系なのでログ抑制
      if (!cancelRequested) {
        console.error('[useVoice] 音声読み上げエラー:', error)
      }
    } finally {
      isSpeaking.value = false
      speakingMessageIndex.value = null
    }
  }

  /**
   * 再生中の音声を停止する
   */
  const stopSpeaking = () => {
    cancelRequested = true
    if (currentSourceNode) {
      try {
        currentSourceNode.stop()
      } catch {
        // すでに停止済みの場合は無視
      }
    }
    if (currentAudioContext) {
      currentAudioContext.close()
      currentAudioContext = null
      currentSourceNode = null
    }
    isSpeaking.value = false
    speakingMessageIndex.value = null
  }

  return {
    isConverting,
    isSpeaking,
    speakingMessageIndex,
    autoReadEnabled,
    convertToSpeechText,
    speakMessage,
    stopSpeaking,
  }
}
