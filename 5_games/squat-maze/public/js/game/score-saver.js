// ──────────────────────────────────────────────
// ScoreSaver — Firestore へのスコア保存
// 匿名認証でユーザーを特定し、scores コレクションに書き込む。
// ゲーム体験を壊さないよう、保存失敗はログに留める設計。
// ──────────────────────────────────────────────

import { db, auth } from '../firebase-config.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

/**
 * スコアを Firestore の scores コレクションに保存する。
 * 匿名認証でユーザーを特定し、Firestore ルールの uid 一致要件を満たす。
 * signInAnonymously は既にサインイン済みなら現在のユーザーを返すため冪等。
 * @param {number} finalScore - 保存するスコア値
 */
export async function saveScoreToFirestore(finalScore) {
  try {
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;

    await addDoc(collection(db, 'scores'), {
      score: finalScore,
      uid,
      createdAt: serverTimestamp()
    });

    console.log(`✅ スコア保存完了: ${finalScore}`);
  } catch (error) {
    // ゲーム体験を壊さないようエラーはコンソールに留める
    console.error('❌ スコア保存に失敗:', error);
  }
}
