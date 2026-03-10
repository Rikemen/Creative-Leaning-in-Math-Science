// ──────────────────────────────────────────────
// ScoreSaver — Firestore へのスコア保存とランキング判定
// 匿名認証でユーザーを特定し、scores コレクションに書き込む。
// ゲーム体験を壊さないよう、保存失敗はログに留める設計。
//
// ランキング10位以内の場合のみスコアを保存する:
// 1. fetchTop10Scores() で現在の上位10件を取得
// 2. 自スコアが10位以内か判定
// 3. ニックネーム付きで保存
// ──────────────────────────────────────────────

import { db, auth } from '../firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

const RANKING_SIZE = 10;

/**
 * Firestore から上位10件のスコアを取得する。
 * ゲームオーバー時にランクイン判定に使用する。
 *
 * @returns {Promise<number[]>} スコア値の降順配列（最大10件）
 */
export async function fetchTop10Scores() {
  try {
    const q = query(
      collection(db, 'scores'),
      orderBy('score', 'desc'),
      limit(RANKING_SIZE)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data().score ?? 0);
  } catch (error) {
    console.error('❌ ランキング取得に失敗:', error);
    // 取得失敗時は空配列を返す（判定上「ランクイン」扱いになる）
    return [];
  }
}

/**
 * スコアがランキング10位以内に入るか判定する。
 * まだ10件未満の場合は常にランクイン判定とする。
 *
 * @param {number} finalScore - 今回のスコア
 * @param {number[]} top10Scores - 現在の上位10件のスコア配列（降順）
 * @returns {boolean} ランクインなら true
 */
export function isRankedIn(finalScore, top10Scores) {
  // まだランキングが10件に達していない場合は無条件でランクイン
  if (top10Scores.length < RANKING_SIZE) return true;

  // 10位（配列の末尾）より高ければランクイン
  const lowestRankedScore = top10Scores[top10Scores.length - 1];
  return finalScore > lowestRankedScore;
}

/**
 * スコアをニックネーム付きで Firestore に保存する。
 * 匿名認証でユーザーを特定し、Firestore ルールの uid 一致要件を満たす。
 *
 * @param {number} finalScore - 保存するスコア値
 * @param {string} nickname - プレイヤーのニックネーム（空の場合は Anonymous）
 */
export async function saveScoreToFirestore(finalScore, nickname) {
  try {
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;

    const playerName = nickname?.trim() || 'Anonymous';

    await addDoc(collection(db, 'scores'), {
      score: finalScore,
      name: playerName,
      uid,
      createdAt: serverTimestamp()
    });

    console.log(`✅ スコア保存完了: ${finalScore} (${playerName})`);
  } catch (error) {
    // ゲーム体験を壊さないようエラーはコンソールに留める
    console.error('❌ スコア保存に失敗:', error);
  }
}
