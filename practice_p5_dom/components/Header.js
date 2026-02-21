import { applyStyles } from '../utils.js';
import { navigateTo } from '../router.js';

/**
 * 共通ヘッダーコンポーネント
 * SPAのナビゲーションを提供
 */
export function createHeader() {
    // 1. 要素を作る
    const header = createDiv();
    const title = createDiv('My p5.js App');

    // ボタンをまとめるコンテナ（右側に配置）
    const buttonContainer = createDiv();

    // 4つのボタンを作成
    const settingsBtn = createButton('⚙️ Settings');
    const saveBtn = createButton('💾 Save');
    const helpBtn = createButton('❓ Help');
    const loginBtn = createButton('🔑 Login');

    // 2. 親子関係を作る
    title.parent(header);
    buttonContainer.parent(header);

    // ボタンをコンテナに入れる
    settingsBtn.parent(buttonContainer);
    saveBtn.parent(buttonContainer);
    helpBtn.parent(buttonContainer);
    loginBtn.parent(buttonContainer);

    // 3. スタイルを定義
    const headerStyle = {
        'width': '100%',
        'height': '60px',
        'background-color': '#222',
        'color': 'white',
        'display': 'flex',
        'justify-content': 'space-between',
        'align-items': 'center',
        'padding': '0 20px',
        'box-sizing': 'border-box',
        'position': 'fixed',
        'top': '0',
        'z-index': '100',
        'font-family': 'sans-serif'
    };

    const buttonContainerStyle = {
        'display': 'flex',
        'gap': '10px',
        'align-items': 'center'
    };

    const btnStyle = {
        'padding': '8px 16px',
        'cursor': 'pointer',
        'border': 'none',
        'border-radius': '4px',
        'background-color': '#ff0066',
        'color': 'white',
        'font-weight': 'bold',
        'transition': 'background-color 0.2s ease, transform 0.1s ease'
    };

    const titleStyle = {
        'cursor': 'pointer',
        'font-size': '18px',
        'font-weight': 'bold'
    };

    // 4. スタイルを一括適用
    applyStyles(header, headerStyle);
    applyStyles(title, titleStyle);
    applyStyles(buttonContainer, buttonContainerStyle);
    applyStyles(settingsBtn, btnStyle);
    applyStyles(saveBtn, btnStyle);
    applyStyles(helpBtn, btnStyle);
    applyStyles(loginBtn, btnStyle);

    // 5. SPA ナビゲーション（ページ遷移ではなくビュー切り替え）
    title.mousePressed(() => {
        navigateTo('home');
    });

    settingsBtn.mousePressed(() => {
        navigateTo('settings');
    });

    saveBtn.mousePressed(() => {
        navigateTo('save');
    });

    helpBtn.mousePressed(() => {
        navigateTo('help');
    });

    loginBtn.mousePressed(() => {
        navigateTo('login');
    });

    return header;
}