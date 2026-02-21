/**
 * 設定ビュー
 */
import { applyStyles } from '../utils.js';

export function createSettingsView() {
    const content = createDiv();
    content.id('content');

    const title = createElement('h1', '⚙️ Settings');
    const description = createP('アプリケーションの設定を変更できます。');

    // 設定オプションの例
    const optionContainer = createDiv();

    const themeLabel = createP('🎨 テーマ設定');
    const darkBtn = createButton('ダークモード');
    const lightBtn = createButton('ライトモード');

    title.parent(content);
    description.parent(content);
    optionContainer.parent(content);
    themeLabel.parent(optionContainer);
    darkBtn.parent(optionContainer);
    lightBtn.parent(optionContainer);

    // スタイル適用
    const contentStyle = {
        'margin-top': '80px',
        'padding': '20px 40px',
        'color': 'white'
    };

    const titleStyle = {
        'font-size': '28px',
        'margin-bottom': '10px'
    };

    const optionStyle = {
        'margin-top': '30px',
        'padding': '20px',
        'background-color': 'rgba(255,255,255,0.1)',
        'border-radius': '8px'
    };

    const btnStyle = {
        'padding': '10px 20px',
        'margin-right': '10px',
        'cursor': 'pointer',
        'border': 'none',
        'border-radius': '4px',
        'background-color': '#4a4a6a',
        'color': 'white'
    };

    applyStyles(content, contentStyle);
    applyStyles(title, titleStyle);
    applyStyles(optionContainer, optionStyle);
    applyStyles(darkBtn, btnStyle);
    applyStyles(lightBtn, btnStyle);

    // ボタンアクション
    darkBtn.mousePressed(() => {
        document.body.style.backgroundColor = '#1a1a2e';
    });

    lightBtn.mousePressed(() => {
        document.body.style.backgroundColor = '#f0f0f0';
        content.style('color', '#333');
    });
}
