/**
 * SPA ルーター
 * ハッシュベースのルーティングで画面を切り替える
 */

// 現在のビュー名を保持
let currentView = 'home';

// ビューのインポート（動的に読み込む）
let views = {};

/**
 * ビューを登録する
 * @param {string} name - ビュー名
 * @param {Function} createFn - ビューを生成する関数
 */
export function registerView(name, createFn) {
    views[name] = createFn;
}

/**
 * 指定したビューに遷移する
 * @param {string} viewName - 遷移先のビュー名
 */
export function navigateTo(viewName) {
    // URLハッシュを更新（ブラウザの戻る/進むに対応）
    if (window.location.hash !== `#${viewName}`) {
        window.location.hash = viewName;
    }

    // 既存のコンテンツコンテナを削除
    const existingContent = select('#content');
    if (existingContent) {
        existingContent.remove();
    }

    // 新しいビューを描画
    if (views[viewName]) {
        views[viewName]();
        currentView = viewName;
    } else {
        console.warn(`ビュー "${viewName}" は登録されていません`);
        views['home']?.();
        currentView = 'home';
    }

    // キャンバスの表示制御
    const canvas = select('#main-canvas');
    if (canvas) {
        if (currentView === 'home') {
            canvas.show();
        } else {
            // canvas.hide();
        }
    }
}

/**
 * 現在のビュー名を取得
 * @returns {string}
 */
export function getCurrentView() {
    return currentView;
}

/**
 * URLハッシュからビュー名を取得し、遷移する
 */
export function handleHashChange() {
    const hash = window.location.hash.slice(1) || 'home';
    navigateTo(hash);
}

/**
 * ルーターを初期化
 * - ハッシュ変更イベントをリッスン
 * - 初期ビューを表示
 */
export function initRouter() {
    // ブラウザの戻る/進むボタンに対応
    window.addEventListener('hashchange', handleHashChange);

    // 初期表示
    handleHashChange();
}
