/**
 * ホームビュー
 * メインのp5.jsキャンバスを表示するビュー
 */
import { applyStyles } from '../utils.js';

export function createHomeView() {
    const content = createDiv();
    content.id('content');

    const title = createElement('h1', '🏠 Home');
    const description = createP('p5.js で自由に描画できるキャンバスです。');

    // キャンバスはsketch.jsで作成済みなのでここでは作らない

    title.parent(content);
    description.parent(content);

    const contentStyle = {
        'margin-top': '80px',
        'padding': '20px 40px',
        'color': 'white'
    };

    const titleStyle = {
        'font-size': '28px',
        'margin-bottom': '10px'
    };

    applyStyles(content, contentStyle);
    applyStyles(title, titleStyle);
}

// draw関数をグローバルに公開（オプション：ホームビュー用の描画）
window.drawHome = function () {
    background(30, 30, 50);

    // 簡単なアニメーション例
    fill(255, 100, 150);
    noStroke();
    ellipse(mouseX, mouseY, 50, 50);
    ellipse(windowWidth / 2, windowHeight / 2, (frameCount % 50) * 10, (frameCount % 50) * 10);
};
