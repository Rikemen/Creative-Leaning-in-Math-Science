/**
 * ranking.js — ランキング画面の初期化・Firebase連携
 *
 * 責務:
 *   - Firebase Firestore からトップスコアを取得してテーブルに描画する
 *   - BACK TO HOME ボタンの遷移制御
 *
 * Firebase認証・DB接続は firebase-config.js に集約しており、
 * このファイルはデータ取得とDOM操作だけに集中する。
 */

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  initBackButton();
  loadRanking();
});

/**
 * BACK TO HOME ボタンにホーム遷移を登録する
 */
function initBackButton() {
  const button = document.getElementById('btn-back-home');
  if (!button) return;
  button.addEventListener('click', () => {
    window.location.href = './index.html';
  });
}

/**
 * Firestoreからスコアを取得してテーブルを描画する
 * 取得失敗時はエラーメッセージを表示し、テーブルは空のまま維持する。
 */
async function loadRanking() {
  const tbody = document.getElementById('ranking-table-body');
  const loadingRow = document.getElementById('ranking-loading-row');
  const errorEl = document.getElementById('ranking-error');

  try {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const scores = snapshot.docs.map((doc) => doc.data());

    // ローディング行を除去
    loadingRow?.remove();

    if (scores.length === 0) {
      showError(errorEl, 'No scores yet. Be the first!');
      return;
    }

    // スコア行を生成してテーブルに追加
    tbody.innerHTML = scores.map((entry, index) => buildRow(entry, index)).join('');
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    loadingRow?.remove();
    showError(errorEl, 'Failed to load ranking. Please try again.');
  }
}

/**
 * ランキング1行分のHTMLを生成する
 * @param {{ name: string, score: number, date: Date }} entry - スコアエントリ
 * @param {number} index - 0始まりのインデックス
 * @returns {string} テーブル行のHTML文字列
 */
function buildRow(entry, index) {
  const rank = String(index + 1).padStart(2, '0');
  const playerName = escapeHtml(entry.name ?? 'Anonymous');
  const score = (entry.score ?? 0).toLocaleString();
  const date = entry.date?.toDate ? formatDate(entry.date.toDate()) : '—';

  return /* html */ `
    <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
      <td class="py-5 px-4 font-bold text-slate-400">${rank}</td>
      <td class="py-5 px-4 font-bold tracking-wider uppercase">${playerName}</td>
      <td class="py-5 px-4 text-right font-mono font-medium">${score}</td>
      <td class="py-5 px-4 text-right text-slate-500 text-xs">${date}</td>
    </tr>
  `;
}

/**
 * Date オブジェクトを "YYYY.MM.DD" 形式にフォーマットする
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/**
 * XSS対策: ユーザー由来の文字列をエスケープする
 * Firestore に保存されたプレイヤー名を innerHTML に展開するため必須。
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * エラーメッセージを表示する
 * @param {HTMLElement} el - エラー表示先の要素
 * @param {string} message
 */
function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}
