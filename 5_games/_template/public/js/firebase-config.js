/**
 * Firebase 初期化と各サービスのエクスポート
 *
 * なぜCDN（gstatic.com）のESMインポートを使うか？
 * → public/ 配下はビルドツール（Webpack等）なしの純粋なブラウザ環境のため、
 *   npm の node_modules を直接 import できない。
 *   Firebase Hosting の /__/firebase/ CDN か gstatic の ESM CDN を使う必要がある。
 *
 * ─── セットアップ手順 ─────────────────────────
 * 1. Firebase Console でプロジェクトを作成
 * 2. 「ウェブアプリを追加」で取得した設定値を firebaseConfig に貼り付ける
 * 3. App Check を使う場合は reCAPTCHA v3 のサイトキーを設定する
 * ────────────────────────────────────────────────
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
import {
	getFirestore,
	connectFirestoreEmulator
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import {
	getAuth,
	connectAuthEmulator
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import {
	initializeAppCheck,
	ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app-check.js';

// ─── ▼ ここを自分のプロジェクトの値に差し替える ──────────────
const firebaseConfig = {
	apiKey: 'YOUR_API_KEY',
	authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
	projectId: 'YOUR_PROJECT_ID',
	storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
	messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
	appId: 'YOUR_APP_ID',
	measurementId: 'YOUR_MEASUREMENT_ID'
};
// ─── ▲ ここまで ────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ローカル開発時はエミュレータに接続、本番時は App Check を有効化
const isLocal =
	location.hostname === 'localhost' || location.hostname === '127.0.0.1';

if (isLocal) {
	// エミュレータ接続（ローカル開発用）
	connectFirestoreEmulator(db, 'localhost', 8080);
	connectAuthEmulator(auth, 'http://localhost:9099');
	console.log('🛠 Emulator mode: ローカルサービスに接続しました');
} else {
	// App Check（本番用）: 正規アプリ以外からの Firestore アクセスを拒否する
	// ── 使わない場合はこのブロックを削除してよい ──
	initializeAppCheck(app, {
		provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
		isTokenAutoRefreshEnabled: true
	});
}

export { db, auth };
