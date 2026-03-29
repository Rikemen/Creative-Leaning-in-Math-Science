/**
 * Firebase アプリ初期化 & AI Logic クライアント生成
 *
 * このモジュールがFirebaseの全サービス（AI Logic, Auth等）の起点になる。
 * firebaseConfig の apiKey は Firebase の識別用キーであり、
 * Gemini APIキーとは別物 — ブラウザに露出しても App Check で保護される。
 */
import { initializeApp } from 'firebase/app'
import { getAI, GoogleAIBackend } from 'firebase/ai'

const firebaseConfig = {
  apiKey: 'AIzaSyB--Qvgype7svS6c1HKR77YBiT9f0Umogw',
  authDomain: 'learning-angel.firebaseapp.com',
  projectId: 'learning-angel',
  storageBucket: 'learning-angel.firebasestorage.app',
  messagingSenderId: '877398823956',
  appId: '1:877398823956:web:6a4aaca41af73c39a50301',
}

/** Firebase アプリインスタンス — Auth 等の他サービスでも使用 */
export const firebaseApp = initializeApp(firebaseConfig)

/**
 * Firebase AI Logic クライアント
 * Gemini Developer API バックエンドを使用（無料枠あり、Blazeプラン不要）
 */
export const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() })
