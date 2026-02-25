import { db, auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  limit
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import {
  signInAnonymously,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

// 匿名ログイン済みユーザーのuid（スコア保存時にFirestoreのルール検証に使う）
let currentUid = null;

/**
 * アプリ起動時に匿名認証でサインインする
 * ユーザーに名前/パスワード入力を求めずに「ログイン済み」状態を作るための最小コスト認証
 */
async function signInAsAnonymous() {
  const credential = await signInAnonymously(auth);
  currentUid = credential.user.uid;
  console.log('匿名ログイン完了:', currentUid);
}

/**
 * スコアをFirestoreに保存する
 * Security Rules が「request.auth.uid == data.uid」を要求するため uid を必ず含める
 */
async function saveScore(playerName, score) {
  if (!currentUid) throw new Error('未ログイン状態ではスコアを保存できません');

  await addDoc(collection(db, 'scores'), {
    name: playerName,
    score: score,
    uid: currentUid, // ← Security Rules のなりすまし防止チェックに対応
    date: new Date()
  });
}

/**
 * Firestoreからトップスコアを取得する（降順・上位5件）
 */
async function fetchTopScores() {
  const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}

/**
 * p5.js インスタンスモード
 *
 * なぜインスタンスモードか？
 * → type="module" でロードした場合、グローバルスコープに setup/draw を
 *   登録できないため。インスタンスモードなら変数の衝突もなく安全。
 */
const sketch = (p) => {
  // ゲームが使うデータ
  let topScores = [];
  let saveButton;
  let statusText = '';

  p.setup = async () => {
    p.createCanvas(600, 400);
    p.textFont('sans-serif');

    // 匿名ログインを先に完了させてからボタンを有効化
    try {
      await signInAsAnonymous();
      statusText = '✅ ログイン完了';
    } catch (e) {
      console.error('匿名ログイン失敗:', e);
      statusText = '❌ ログイン失敗（エミュレータが起動中か確認）';
    }
    p.redraw();

    // 「スコアを保存」ボタンをp5.domで作成
    saveButton = p.createButton('スコアを保存');
    saveButton.position(20, p.height + 10);
    saveButton.mousePressed(async () => {
      statusText = '保存中...';
      try {
        await saveScore('TestUser', Math.floor(Math.random() * 1000));
        topScores = await fetchTopScores();
        statusText = '✅ 保存しました！';
      } catch (e) {
        console.error('スコア保存エラー:', e);
        statusText = `❌ エラー: ${e.message}`;
      }
      p.redraw();
    });

    // 初期データを取得
    fetchTopScores()
      .then((scores) => {
        topScores = scores;
        p.redraw();
      })
      .catch((e) => console.error('スコア取得エラー:', e));

    // 非同期データ更新があるため、自動再描画を止めて手動管理する
    // （必要に応じて p.loop() に切り替える）
    p.noLoop();
  };

  p.draw = () => {
    p.background(240, 245, 255);

    // タイトル
    p.fill(30, 30, 80);
    p.noStroke();
    p.textSize(24);
    p.textAlign(p.LEFT, p.TOP);
    p.text('🏆 ランキング', 20, 20);

    // トップスコア一覧
    p.textSize(16);
    if (topScores.length === 0) {
      p.fill(120);
      p.text('データなし（エミュレータが起動しているか確認）', 20, 70);
    } else {
      topScores.forEach((entry, i) => {
        p.fill(60, 60, 120);
        p.text(`${i + 1}位  ${entry.name}  ${entry.score}点`, 20, 70 + i * 30);
      });
    }

    // ステータスメッセージ
    p.textSize(13);
    p.fill(80);
    p.text(statusText, 20, p.height - 30);
  };
};

// p5インスタンスを生成してキャンバスを body に追加
new p5(sketch);
