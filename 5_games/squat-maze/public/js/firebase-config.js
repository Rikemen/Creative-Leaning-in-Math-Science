/**
 * Firebase 初期化と各サービスのエクスポート
 *
 * なぜCDN（gstatic.com）のESMインポートを使うか？
 * → public/ 配下はビルドツール（Webpack等）なしの純粋なブラウザ環境のため、
 *   npm の node_modules を直接 import できない。
 *   Firebase Hosting の /__/firebase/ CDN か gstatic の ESM CDN を使う必要がある。
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

const firebaseConfig = {
  apiKey: 'AIzaSyC184IJoJBSxGS_94eZ77G8WERolH50wQ8',
  authDomain: 'squat-maze.firebaseapp.com',
  projectId: 'squat-maze',
  storageBucket: 'squat-maze.firebasestorage.app',
  messagingSenderId: '846375889208',
  appId: '1:846375889208:web:ece395a5ab576fd26039cd',
  measurementId: 'G-X6R0XWGQ3H'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ローカル開発時のみエミュレータに接続する
// 本番環境（Firebase Hosting）では hostname が localhost にならないため自動的にスキップされる
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('🛠 Emulator mode: ローカルサービスに接続しました');
}

export { db, auth };
