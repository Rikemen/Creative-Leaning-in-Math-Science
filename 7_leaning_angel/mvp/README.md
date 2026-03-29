# 🌸 さくら先輩の数学辞書

> 「いつでも質問できて、優しく教えてくれる"さくら先輩"とマンツーマンで学ぶ、恋愛シミュレーション風の数学辞書アプリ」

大学レベルの数学（線形代数など）を独学しているが、難解な専門書に挫折しそうな学生・社会人のためのWebアプリ。  
AI キャラクター「さくら先輩」が、優しく・正確に数学を解説してくれます。

---

## ✨ 主な機能

| 機能                                    | 概要                                                            |
| --------------------------------------- | --------------------------------------------------------------- |
| **📝 数学記事**                         | KaTeX による美しい数式表示 + 数式のワンタップコピー             |
| **🎮 インタラクティブシミュレーション** | JSXGraph で固有ベクトルの変換をドラッグ操作で体感               |
| **💬 AIチャット**                       | Gemini API 搭載。さくら先輩のキャラクターで数学を対話的に学べる |
| **📷 カメラ質問**                       | 手書きノートを撮影 → Vision AI が読み取り → 先輩が解説          |
| **🔊 音声読み上げ**                     | Gemini TTS で数式の読みも正確に音声再生                         |
| **🎭 感情連動アバター**                 | AI の応答内容に応じて、さくら先輩の表情が 7 パターンに自動切替  |
| **🔐 Firebase Auth**                    | メール/パスワード認証によるユーザー管理                         |

---

## 🛠️ 技術スタック

| カテゴリ                  | 技術                              |
| ------------------------- | --------------------------------- |
| フロントエンド            | Vue 3 + Vite                      |
| スタイリング              | Tailwind CSS 3                    |
| 数式レンダリング          | KaTeX                             |
| シミュレーション          | JSXGraph                          |
| AI（対話 / Vision / TTS） | Gemini API（`@google/genai` SDK） |
| 認証                      | Firebase Authentication           |
| ホスティング              | Firebase Hosting                  |

---

## 📂 プロジェクト構成

```
mvp/
├── src/
│   ├── components/        # Vue コンポーネント群
│   │   ├── ChatFloatingIcon.vue   # チャット起動アイコン
│   │   ├── ChatModal.vue          # チャット本体（ハーフモーダル）
│   │   ├── LoginScreen.vue        # ログイン / 新規登録画面
│   │   ├── MainHeader.vue         # ヘッダー（音声解説ボタン等）
│   │   ├── MathArticle.vue        # 数学記事の表示
│   │   ├── SakuraAvatar.vue       # さくら先輩の立ち絵（感情連動）
│   │   └── SimulationBoard.vue    # JSXGraph シミュレーション
│   ├── composables/       # Vue Composables（ロジック分離）
│   ├── config/            # Firebase 初期化等の設定
│   ├── content/           # 記事データ（現在: 固有値の1記事）
│   ├── prompts/           # AI プロンプト定義
│   ├── styles/            # グローバル CSS
│   ├── utils/             # ユーティリティ関数
│   ├── assets/            # 画像・音声アセット
│   ├── App.vue            # ルートコンポーネント
│   └── main.js            # エントリーポイント
├── firebase.json          # Firebase Hosting 設定
├── .firebaserc            # Firebase プロジェクト紐付け
├── proposal.md            # MVP 提案書
├── dev-log.md             # 開発ログ（全ステップの実装記録）
└── package.json
```

---

## 🚀 セットアップ

### 前提条件

- Node.js（v18 以上推奨）
- npm
- Firebase CLI（デプロイ時のみ）

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルをプロジェクトルートに作成し、以下を設定:

```env
# Gemini API キー（@google/genai SDK 用）
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase 設定
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ `.env` は `.gitignore` に含まれています。Git にコミットしないでください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### 4. 本番ビルド & デプロイ

```bash
npm run build
firebase deploy --only hosting
```

---

## 📝 記事の追加方法

現在は「固有値と固有ベクトル」の 1 記事のみを収録しています。  
新しい記事を追加する手順は以下の通りです。

### Step 1: 記事データファイルの作成

`src/content/` に新しい JS ファイルを作成する。  
既存の `eigenvalue.js` を雛形として使用:

```bash
cp src/content/eigenvalue.js src/content/determinant.js
```

### Step 2: 記事データの編集

`eigenvalue.js` の構造に倣い、以下を記述する:

- `title` — 記事タイトル
- `sections[]` — 各セクション（見出し、本文、数式、シミュレーション設定）

```js
// src/content/determinant.js
export default {
  title: "行列式 (Determinant)",
  sections: [
    {
      heading: "行列式とは？",
      body: "正方行列に対して定義されるスカラー値で...",
      formula: "\\det(A) = ad - bc",
    },
    // ... 追加セクション
  ],
};
```

### Step 3: 表示の接続（現時点では手動）

現在は `MathArticle.vue` が `eigenvalue.js` を直接インポートしている。  
新しい記事を表示するには、インポート先を差し替える必要がある。

> 📌 **今後の予定:** Phase 11 で vue-router を導入し、  
> `/article/:slug` のルーティングにより記事を動的に切り替えられるようにする。  
> 詳細は `dev-log.md` の Phase 11 を参照。

### 数式の書き方（KaTeX）

記事データ内の `formula` フィールドに LaTeX 記法で記述する:

```
インライン数式: $\\lambda$
ブロック数式:   $$Av = \\lambda v$$
```

> KaTeX の対応コマンド一覧: https://katex.org/docs/supported

### シミュレーションの追加

`SimulationBoard.vue` を参考に、JSXGraph のボード初期化コードを記述する。  
記事データ側にシミュレーション設定（行列パラメータなど）を持たせることも可能。

---

## 📚 関連ドキュメント

| ファイル                       | 内容                                             |
| ------------------------------ | ------------------------------------------------ |
| [`proposal.md`](./proposal.md) | MVP 提案書（コンセプト・スコープ・技術スタック） |
| [`dev-log.md`](./dev-log.md)   | 開発ログ（全 Phase のステップ・進捗・実装メモ）  |

---

## 🗺️ ロードマップ

- [ ] **Phase 11:** vue-router 導入 & 記事一覧ページの作成（マルチ単元対応）
- [ ] **V2:** 学習ログ・Firestore 連携
- [ ] **V2:** Live2D アニメーション
- [ ] **V2:** VOICEVOX 連携（高品質キャラボイス）
- [ ] **V2:** ダークモード対応

---

## 📄 ライセンス

※準備中
