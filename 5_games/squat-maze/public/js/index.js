/**
 * index.js — ホーム画面のインタラクション制御
 *
 * 責務:
 *   - ページ読み込み時のフェードインアニメーション起動
 *   - 各ボタンからの画面遷移
 *
 * このファイルは p5.js / Firebase に依存しない。
 * ホーム画面に閉じた純粋なDOM操作のみを行う。
 */

// DOM 構築完了後に実行（defer 属性で非同期ロードなのでこのまま最上位でも安全だが明示的にイベント購読）
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initButtonNavigation();
});

/**
 * フェードインアニメーションを起動する
 * CSS の .home-fadein → .is-visible トランジションを利用する。
 * requestAnimationFrame を挟むことで、初回レンダリング前のスタイル適用を確実に行う。
 */
function initFadeIn() {
  const fadeTarget = document.querySelector('.home-fadein');
  if (!fadeTarget) return;

  // ブラウザの描画タイミングに合わせて1フレーム遅らせてクラスを付与する
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fadeTarget.classList.add('is-visible');
    });
  });
}

/**
 * ボタンに画面遷移ハンドラを登録する
 * href による <a> タグではなく <button> を使っているため、JS 側で遷移を制御する。
 * 将来的にトランジションアニメーションを挟む場合もここを編集すれば済む。
 */
function initButtonNavigation() {
  const navigationMap = [
    { id: 'btn-game-start', destination: './game.html' },
    { id: 'btn-ranking', destination: './ranking.html' },
    { id: 'btn-settings', destination: './setting.html' }
  ];

  for (const { id, destination } of navigationMap) {
    const button = document.getElementById(id);
    if (!button) continue;

    button.addEventListener('click', () => {
      window.location.href = destination;
    });
  }
}
