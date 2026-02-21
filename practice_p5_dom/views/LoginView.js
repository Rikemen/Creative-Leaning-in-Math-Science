/**
 * ログインビュー
 */
import { applyStyles } from '../utils.js';

export function createLoginView() {
    const content = createDiv();
    content.id('content');

    const title = createElement('h1', '🔑 Login');
    const description = createP('アカウントにログインしてください。');

    // ログインフォーム
    const formContainer = createDiv();

    const emailLabel = createP('メールアドレス');
    const emailInput = createInput('email');
    emailInput.attribute('placeholder', 'example@mail.com');

    const passLabel = createP('パスワード');
    const passInput = createInput('password');
    passInput.attribute('placeholder', '••••••••');

    const loginButton = createButton('ログイン');
    const signupLink = createP('アカウントをお持ちでない方は新規登録へ');

    title.parent(content);
    description.parent(content);
    formContainer.parent(content);
    emailLabel.parent(formContainer);
    emailInput.parent(formContainer);
    passLabel.parent(formContainer);
    passInput.parent(formContainer);
    loginButton.parent(formContainer);
    signupLink.parent(formContainer);

    // スタイル適用
    const contentStyle = {
        'margin-top': '80px',
        'padding': '20px 40px',
        'color': 'white',
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center'
    };

    const titleStyle = {
        'font-size': '28px',
        'margin-bottom': '10px'
    };

    const formStyle = {
        'margin-top': '30px',
        'padding': '30px',
        'background-color': 'rgba(255,255,255,0.1)',
        'border-radius': '12px',
        'width': '300px'
    };

    const inputStyle = {
        'width': '100%',
        'padding': '12px',
        'margin-bottom': '15px',
        'border': 'none',
        'border-radius': '6px',
        'font-size': '14px',
        'box-sizing': 'border-box'
    };

    const labelStyle = {
        'margin': '0 0 5px 0',
        'font-size': '14px',
        'color': '#aaa'
    };

    const btnStyle = {
        'width': '100%',
        'padding': '12px',
        'cursor': 'pointer',
        'border': 'none',
        'border-radius': '6px',
        'background': 'linear-gradient(135deg, #ff0066, #ff6600)',
        'color': 'white',
        'font-size': '16px',
        'font-weight': 'bold',
        'margin-top': '10px'
    };

    const linkStyle = {
        'margin-top': '20px',
        'font-size': '12px',
        'color': '#888',
        'text-align': 'center'
    };

    applyStyles(content, contentStyle);
    applyStyles(title, titleStyle);
    applyStyles(formContainer, formStyle);
    applyStyles(emailLabel, labelStyle);
    applyStyles(emailInput, inputStyle);
    applyStyles(passLabel, labelStyle);
    applyStyles(passInput, inputStyle);
    applyStyles(loginButton, btnStyle);
    applyStyles(signupLink, linkStyle);

    // ログインボタンアクション
    loginButton.mousePressed(() => {
        const email = emailInput.value();
        const pass = passInput.value();

        if (email && pass) {
            alert(`ログイン試行: ${email}`);
            // TODO: 実際の認証処理をここに実装
        } else {
            alert('メールアドレスとパスワードを入力してください');
        }
    });
}
