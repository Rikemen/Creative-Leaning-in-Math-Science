# Firebase Web App Base Template

Firebase Hosting + Firestore + Auth を使ったWebアプリのスターターテンプレート。

ビルドツール不要。HTML / CSS / Vanilla JS でシンプルに開発できる。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| ホスティング | Firebase Hosting |
| DB | Cloud Firestore |
| 認証 | Firebase Auth |
| スタイリング | TailwindCSS CDN + Vanilla CSS |
| UIコンポーネント | Web Components |
| フォント | Google Fonts (Inter) |
| アイコン | Material Symbols Outlined |

## セットアップ

### 前提条件

- [Node.js](https://nodejs.org/) v18 以上
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- Firebase プロジェクト（[Firebase Console](https://console.firebase.google.com/) で作成）

### 1. リポジトリをクローン

```bash
git clone https://github.com/YOUR_USERNAME/firebase-webapp-base.git
cd firebase-webapp-base
```

### 2. Firebase プロジェクトを紐づける

```bash
firebase login
firebase use --add
```

または `.firebaserc` の `YOUR_PROJECT_ID` を手動で書き換える。

### 3. Firebase 設定を更新

`public/js/firebase-config.js` を開き、`firebaseConfig` オブジェクトを
Firebase Console の「プロジェクトの設定 > マイアプリ」で取得した値に差し替える。

### 4. 依存関係をインストール

```bash
npm install
```

### 5. ローカル開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:5000 にアクセスする。

> **Note:** Firestore / Auth はローカルのエミュレータに自動接続されるため、本番環境には影響しない。

## ディレクトリ構造

```
.
├── public/                      ← Firebase Hosting の配信ルート
│   ├── index.html               ← ホーム画面
│   ├── about.html               ← サンプル追加ページ
│   ├── 404.html                 ← エラーページ
│   ├── style.css                ← デザイントークン + グローバルCSS
│   ├── assets/                  ← 画像・アイコン等
│   └── js/
│       ├── firebase-config.js   ← Firebase初期化（エミュ/本番切替）
│       ├── index.js             ← ホーム画面スクリプト
│       ├── components/          ← 共通Web Components
│       │   ├── app-header.js    ← ナビヘッダー
│       │   └── app-footer.js    ← フッター
│       └── lib/                 ← 汎用ユーティリティ
│
├── firebase.json                ← Hosting + Emulator 設定
├── firestore.rules              ← Firestore セキュリティルール
├── firestore.indexes.json       ← Firestore インデックス
├── .firebaserc                  ← プロジェクトID
├── package.json
├── .gitignore
├── .prettierrc
└── README.md
```

## カスタマイズガイド

### ページを追加する

1. `about.html` をコピーして新しい HTML ファイルを作る
2. `public/js/components/app-header.js` の `navLinks` 配列にエントリを追加する
3. ページ固有のスクリプトがあれば `public/js/` に配置する

### ブランドカラーを変更する

以下の **2箇所** を同じ値に更新する：

1. **`public/style.css`** の `:root` セクション（CSS変数）
2. **各HTMLファイル** の `tailwind.config` スクリプト内の `colors`

### Firestore コレクションを追加する

1. `firestore.rules` にコレクションのルールを追加する
2. 必要に応じて `firestore.indexes.json` にインデックスを定義する

### App Check を有効にする

1. Firebase Console で App Check を有効化し、reCAPTCHA v3 のサイトキーを取得する
2. `public/js/firebase-config.js` の `YOUR_RECAPTCHA_SITE_KEY` を差し替える

App Check が不要な場合は、`firebase-config.js` の `initializeAppCheck` ブロックを削除してよい。

## デプロイ

```bash
firebase deploy
```

特定のサービスのみデプロイする場合：

```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## ライセンス

MIT
