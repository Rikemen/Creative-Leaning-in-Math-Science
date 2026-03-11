// ──────────────────────────────────────────────
// OverlayUI — p5 キャンバス上に重ねる HTML DOM UI を管理する
// ニックネーム入力、ゲームオーバーボタンなど、
// Canvas 外の HTML 要素の生成・除去をここに集約する。
//
// game.js から呼び出し、コールバックで結果を返す設計。
// ゲーム状態やスコア保存の責務は持たない（純粋な UI モジュール）。
// ──────────────────────────────────────────────

// ── DOM 参照 ──
let nicknameContainer = null;
let nicknameInput = null;
let gameOverButtonContainer = null;

// ────────────────────────────────
// ニックネーム入力 UI
// ────────────────────────────────

/**
 * ニックネーム入力フィールドを p5 キャンバス上に表示する。
 * 入力確定時に onConfirm コールバックを nickname 文字列付きで呼ぶ。
 *
 * @param {function(string): void} onConfirm - 確定時コールバック（nickname を引数に受け取る）
 * @param {function(): void} playSE - OK ボタンクリック時の SE 再生関数
 */
export function showNicknameUI(onConfirm, playSE) {
  // コンテナ: キャンバスの上に絶対配置
  nicknameContainer = document.createElement('div');
  Object.assign(nicknameContainer.style, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, 10px)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    zIndex: '100'
  });

  // テキスト入力フィールド
  nicknameInput = document.createElement('input');
  nicknameInput.type = 'text';
  nicknameInput.maxLength = 10;
  nicknameInput.placeholder = 'YOUR NAME';
  nicknameInput.id = 'nickname-input';
  Object.assign(nicknameInput.style, {
    width: '180px',
    padding: '8px 12px',
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '4px',
    outline: 'none',
    caretColor: '#FFD700'
  });

  // フォーカス時の枠線エフェクト
  nicknameInput.addEventListener('focus', () => {
    nicknameInput.style.borderColor = '#FFD700';
    nicknameInput.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
  });
  nicknameInput.addEventListener('blur', () => {
    nicknameInput.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    nicknameInput.style.boxShadow = 'none';
  });

  /** 入力を確定して nickname をコールバックに渡す */
  function confirm() {
    const nickname = nicknameInput?.value?.trim() || '';
    onConfirm(nickname);
  }

  // Enter キーで確定（p5 の keyPressed への伝播を阻止）
  nicknameInput.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') confirm();
  });

  // OK ボタン
  const okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.id = 'nickname-ok-button';
  Object.assign(okButton.style, {
    padding: '8px 16px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#FFD700',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    letterSpacing: '1px'
  });
  okButton.addEventListener('click', () => {
    playSE();
    confirm();
  });

  nicknameContainer.appendChild(nicknameInput);
  nicknameContainer.appendChild(okButton);
  document.body.appendChild(nicknameContainer);

  // 入力フィールドに自動フォーカス
  setTimeout(() => nicknameInput.focus(), 100);
}

/** ニックネーム入力 UI を DOM から除去する */
export function removeNicknameUI() {
  if (nicknameContainer) {
    nicknameContainer.remove();
    nicknameContainer = null;
    nicknameInput = null;
  }
}

// ────────────────────────────────
// ゲームオーバーボタン UI
// ────────────────────────────────

/** ネオン風ボタンの共通スタイル */
const BUTTON_BASE_STYLE = {
  padding: '10px 24px',
  fontSize: '13px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 'bold',
  letterSpacing: '2px',
  border: '2px solid rgba(255, 255, 255, 0.6)',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

/**
 * ホバーエフェクトを付与するヘルパー
 * @param {HTMLButtonElement} button - 対象ボタン
 * @param {string} normalBg - 通常時の背景色
 * @param {string} hoverBg - ホバー時の背景色
 * @param {string} glowColor - ホバー時のグロー色
 */
function addHoverEffect(button, normalBg, hoverBg, glowColor) {
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = hoverBg;
    button.style.boxShadow = `0 0 12px ${glowColor}`;
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = normalBg;
    button.style.boxShadow = 'none';
  });
}

/**
 * ゲームオーバー画面に Retry / Home ボタンを表示する。
 *
 * @param {function(): void} onRetry - Retry ボタン押下時のコールバック
 * @param {function(): void} onHome - Home ボタン押下時のコールバック
 * @param {function(): void} playSE - ボタンクリック時の SE 再生関数
 */
export function showGameOverButtons(onRetry, onHome, playSE) {
  gameOverButtonContainer = document.createElement('div');
  Object.assign(gameOverButtonContainer.style, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, 30px)',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    zIndex: '100'
  });

  // Retry ボタン
  const retryButton = document.createElement('button');
  retryButton.textContent = '🔄 RETRY';
  retryButton.id = 'btn-retry';
  const retryNormalBg = 'rgba(255, 255, 255, 0.1)';
  Object.assign(retryButton.style, BUTTON_BASE_STYLE, {
    color: '#ffffff',
    backgroundColor: retryNormalBg
  });
  addHoverEffect(retryButton, retryNormalBg, 'rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.3)');
  retryButton.addEventListener('click', () => {
    playSE();
    onRetry();
  });

  // Home ボタン
  const homeButton = document.createElement('button');
  homeButton.textContent = '🏠 HOME';
  homeButton.id = 'btn-home';
  const homeNormalBg = 'rgba(255, 255, 255, 0.05)';
  Object.assign(homeButton.style, BUTTON_BASE_STYLE, {
    color: '#aaaaaa',
    backgroundColor: homeNormalBg
  });
  addHoverEffect(homeButton, homeNormalBg, 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.2)');
  homeButton.addEventListener('click', () => {
    playSE();
    onHome();
  });

  gameOverButtonContainer.appendChild(retryButton);
  gameOverButtonContainer.appendChild(homeButton);
  document.body.appendChild(gameOverButtonContainer);
}

/** ゲームオーバーボタン UI を DOM から除去する */
export function removeGameOverButtons() {
  if (gameOverButtonContainer) {
    gameOverButtonContainer.remove();
    gameOverButtonContainer = null;
  }
}
