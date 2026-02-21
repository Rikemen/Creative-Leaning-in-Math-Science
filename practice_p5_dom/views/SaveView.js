/**
 * 保存ビュー
 */
import { applyStyles } from '../utils.js';

export function createSaveView() {
    const content = createDiv();
    content.id('content');

    const title = createElement('h1', '💾 Save');
    const description = createP('作品を保存・エクスポートできます。');

    // 保存オプション
    const optionContainer = createDiv();

    const saveCanvasBtn = createButton('📷 キャンバスをPNGで保存');
    const saveJsonBtn = createButton('📄 設定をJSONで保存');

    title.parent(content);
    description.parent(content);
    optionContainer.parent(content);
    saveCanvasBtn.parent(optionContainer);
    saveJsonBtn.parent(optionContainer);

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
        'display': 'flex',
        'gap': '15px',
        'flex-wrap': 'wrap'
    };

    const btnStyle = {
        'padding': '15px 30px',
        'cursor': 'pointer',
        'border': 'none',
        'border-radius': '8px',
        'background': 'linear-gradient(135deg, #ff0066, #ff6600)',
        'color': 'white',
        'font-size': '16px',
        'font-weight': 'bold',
        'transition': 'transform 0.2s ease'
    };

    applyStyles(content, contentStyle);
    applyStyles(title, titleStyle);
    applyStyles(optionContainer, optionStyle);
    applyStyles(saveCanvasBtn, btnStyle);
    applyStyles(saveJsonBtn, btnStyle);

    // ボタンアクション
    saveCanvasBtn.mousePressed(() => {
        saveCanvas('my-sketch', 'png');
    });

    saveJsonBtn.mousePressed(() => {
        const data = {
            timestamp: new Date().toISOString(),
            settings: { theme: 'dark' }
        };
        saveJSON(data, 'settings.json');
    });
}
