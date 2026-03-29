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
  apiKey: 'REDACTED_FIREBASE_API_KEY',
  authDomain: 'learning-angel-reboot.firebaseapp.com',
  projectId: 'learning-angel-reboot',
  storageBucket: 'learning-angel-reboot.firebasestorage.app',
  messagingSenderId: '413187001500',
  appId: '1:413187001500:web:d7da7402b7b3ad2a843159',
}

/** Firebase アプリインスタンス — Auth 等の他サービスでも使用 */
export const firebaseApp = initializeApp(firebaseConfig)

/**
 * App Check — reCAPTCHA Enterprise による不正リクエスト防止
 *
 * 開発環境（localhost）ではデバッグトークンを使用し、reCAPTCHA検証をスキップする。
 * デバッグトークンはブラウザのコンソールに出力されるので、
 * Firebase Console → 「App Check」→「デバッグトークンを管理」に登録すること。
 */
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
}

initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider('REDACTED_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true,
})

/**
 * Firebase AI Logic クライアント
 * Gemini Developer API バックエンドを使用（無料枠あり、Blazeプラン不要）
 */
export const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() })
