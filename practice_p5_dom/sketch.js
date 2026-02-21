/**
 * メインスケッチ（SPA版）
 * - ルーターを初期化
 * - 各ビューを登録
 * - ヘッダーを作成
 */

import { createHeader } from './components/Header.js';
import { registerView, initRouter, getCurrentView } from './router.js';

// ビューのインポート
import { createHomeView } from './views/HomeView.js';
import { createSettingsView } from './views/SettingsView.js';
import { createSaveView } from './views/SaveView.js';
import { createHelpView } from './views/HelpView.js';
import { createLoginView } from './views/LoginView.js';

// p5.js setup関数
window.setup = function () {
    // キャンバスを作成（全体で1つだけ管理）
    // ヘッダー(60px)の分だけ高さを引く
    const canvas = createCanvas(windowWidth, windowHeight - 60);
    background(175);

    canvas.position(0, 60);
    canvas.id('main-canvas'); // IDをつけて管理しやすくする

    // ヘッダーを作成（常に表示）
    createHeader();

    // ビューをルーターに登録
    registerView('home', createHomeView);
    registerView('settings', createSettingsView);
    registerView('save', createSaveView);
    registerView('help', createHelpView);
    registerView('login', createLoginView);

    // ルーターを初期化（URLハッシュに基づいて初期ビューを表示）
    initRouter();
};

// p5.js draw関数（ホームビュー用の描画）
window.draw = function () {
    // ホームビューの時だけ描画処理を実行
    if (getCurrentView() === 'home' && typeof window.drawHome === 'function') {
        window.drawHome();
    }
};

// ウィンドウリサイズ対応
window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight - 60);
};