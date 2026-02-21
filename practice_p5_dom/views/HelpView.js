/**
 * ヘルプビュー
 */
import { applyStyles } from '../utils.js';

export function createHelpView() {
    const content = createDiv();
    content.id('content');

    const title = createElement('h1', '❓ Help');
    const description = createP('使い方やよくある質問を確認できます。');

    // ヘルプ項目
    const faqContainer = createDiv();

    const faqs = [
        { q: 'キャンバスに描画するには？', a: 'ホーム画面でマウスを動かすと描画できます。' },
        { q: '作品を保存するには？', a: 'Saveページでキャンバスの保存ができます。' },
        { q: 'テーマを変更するには？', a: 'Settingsページでダーク/ライトモードを切り替えられます。' }
    ];

    title.parent(content);
    description.parent(content);
    faqContainer.parent(content);

    faqs.forEach(faq => {
        const item = createDiv();
        const question = createElement('h3', `Q: ${faq.q}`);
        const answer = createP(`A: ${faq.a}`);

        question.parent(item);
        answer.parent(item);
        item.parent(faqContainer);

        applyStyles(item, {
            'padding': '15px',
            'margin-bottom': '10px',
            'background-color': 'rgba(255,255,255,0.05)',
            'border-radius': '8px',
            'border-left': '4px solid #ff0066'
        });

        applyStyles(question, {
            'margin': '0 0 8px 0',
            'color': '#ff6699'
        });

        applyStyles(answer, {
            'margin': '0',
            'color': '#aaa'
        });
    });

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

    const faqStyle = {
        'margin-top': '30px'
    };

    applyStyles(content, contentStyle);
    applyStyles(title, titleStyle);
    applyStyles(faqContainer, faqStyle);
}
