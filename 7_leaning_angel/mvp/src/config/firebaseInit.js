/**
 * Firebase アプリ初期化 & AI Logic クライアント生成
 *
 * このモジュールがFirebaseの全サービス（AI Logic, Auth等）の起点になる。
 * firebaseConfig の apiKey は Firebase の識別用キーであり、
 * Gemini APIキーとは別物 — ブラウザに露出しても App Check で保護される。
 */
import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAI, GoogleAIBackend } from 'firebase/ai'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** Firebase アプリインスタンス — Auth 等の他サービスでも使用 */
export const firebaseApp = initializeApp(firebaseConfig)

/**
 * App Check — reCAPTCHA v3 による不正リクエスト防止
 *
 * 開発環境（localhost）ではデバッグトークンを使用し、reCAPTCHA検証をスキップする。
 * デバッグトークンはブラウザのコンソールに出力されるので、
 * Firebase Console → 「App Check」→「デバッグトークンを管理」に登録すること。
 */
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
}

initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
})

/**
 * Firebase AI Logic クライアント
 * Gemini Developer API バックエンドを使用（無料枠あり、Blazeプラン不要）
 */
export const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() })
