# 開発ログ

## 概要

開発の手順、今後の To Do などの記録をするためのファイル。
インクリメント開発を行うために利用する。

---

## タスク管理

### ✅ 完了済み (Done)

- **Firebase プロジェクトのセットアップ**
  - プロジェクト「squat-maze」を利用。
  - Firebase Console でプロジェクトを作成し、Web アプリを追加。
  - `npm install firebase` 等で初期設定を行う（コンソールの指示に従う）。

- **Firebase CLI の初期化と環境設定**
  - `firebase init` を実行（Hosting, Firestore, Authentication, Emulator を利用）。
  - 接続先の設定：
    - `firebase projects:list` で Google アカウントの確認。
    - `firebase login` によるログインの再実行。
    - `firebase use [プロジェクト名]` でデプロイ先を指定。
    - `firebase use --add` による登録（`.firebaserc` に保存され、次回から略称で実行可能）。

- **Emulator のセットアップとデータ永続化**
  - `firebase emulators:start` を実行し、Emulator が正常に動作するか確認。
  - `package.json` に以下の `dev` スクリプトを追加することで、`npm run dev` で起動でき、
    かつ停止時にデータが自動保存される。
    ```json
    "dev": "firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data"
    ```
  - `emulator-data/` は `.gitignore` に追加してリポジトリ管理外にした。

- **Firestore ランキング機能の実装**
  - `public/js/firebase-config.js` を作成し、Firebase 初期化・Emulator 自動切替を設定。
  - `public/js/main.js` に p5.js インスタンスモードでキャンバスを実装。
  - Firestore の `scores` コレクションへのスコア保存（`addDoc`）と読み取り（`getDocs`）を実装。

- **p5.js のインスタンスモード採用**
  - `type="module"` 環境ではグローバル `setup()` が `window` に登録されないため、
    `new p5(sketch)` のインスタンスモードを採用。

- **Firebase ESM CDN を使った構成**
  - `public/` 配下はビルドツールなしで動作させるため、`node_modules` の代わりに
    `https://www.gstatic.com/firebasejs/12.9.0/` の ESM CDN からインポート。

- **Firestore Security Rules の整備**
  - 別プロジェクト（animal-sound-game-myself）のルールが `firebase init` 時に混入していたため削除。
  - `scores` コレクションは「誰でも読める」「ログイン済みユーザーのみ書ける」ルールに変更。
  - Security Rules のバージョン・構文・ワイルドカードの意味を整理。

- **匿名認証の実装**
  - Firebase Console で匿名認証（Anonymous）を有効化。
  - `signInAnonymously()` を起動時に自動実行し、ユーザーに操作を求めずに uid を取得。
  - スコア保存時に `uid` を Firestore に記録し、なりすまし防止を実現。

- **本番デプロイ完了**
  - `firebase deploy` で Firestore Rules・Hosting を本番環境へ反映。
  - 公開 URL: https://squat-maze.web.app

- **全画面の UI 実装（2026-02-26）**
  - `index.html`（ホーム）、`ranking.html`、`game.html`、`setting.html`、`404.html` を新規作成。
  - デザイントークンを全ページ共通化：TailwindCSS CDN ＋ Google Fonts（Inter）＋ Material Symbols Outlined。
  - Tailwind カスタムテーマにブランドカラー（`primary: #1754cf`, `bg-light`, `bg-dark`）を定義。
  - `darkMode: 'class'` による手動ダークモード切り替えに対応。

- **Web Components による Header / Footer の共通化（2026-02-26）**
  - `public/js/components/app-header.js` を新規作成。
    - ロゴ・ナビ・アカウントボタンを含むヘッダー。
    - 現在ページのナビリンクを `aria-current="page"` で自動ハイライト。
    - ページ名のみで照合するため、ディレクトリ変更に強い設計。
  - `public/js/components/app-footer.js` を新規作成。
    - コピーライト年号を JS で自動生成（`new Date().getFullYear()`）。
  - **Shadow DOM を使わない**選択：Tailwind CDN のクラスを外側から当てるため Light DOM で実装。
  - 全 HTML で `<app-header>` / `<app-footer>` 1行だけ書けば共通 UI が挿入される。

- **ランキング画面の Firebase 連携実装（2026-02-26）**
  - `public/js/ranking.js` を新規作成。
  - Firestore `scores` コレクションからトップ10をスコア降順で取得（`orderBy` + `limit`）。
  - ローディング中はプレースホルダー行を表示し、完了後に除去する UI 制御。
  - 日付は Firestore Timestamp → `YYYY.MM.DD` 形式へ変換。
  - XSS 対策: ユーザー名を `innerHTML` に展開する前に `escapeHtml()` でサニタイズ。
  - 取得失敗時はエラーメッセージを表示し、テーブルは空のまま維持する。

---

### 🔜 次のアクション (Next)

- **ゲーム画面の実装**
  - ゲームの仕様を設計する（ワンボタンゲームでp5.playなどで実装する? ml5は次のアプリでこのアプリを引き継ぐ形で実装するか）
  - `game.html` / `game.js` にキャンバスを表示し、ゲームロジックを実装する。
  - `setting.html` / `setting.js` に設定項目（難易度・音量など）を実装する。

- **ドキュメント整備**
  - `README.md` の作成（ディレクトリ構成・各ファイルの役割・ローカル起動手順）。
  - `SPEC.md` の作成（ゲームの仕様・ルール・操作方法）。必要に応じて `Rules`・`Workflows` にも追加する。

- **ルーティング・ナビゲーション**
  - ページ間遷移の動作確認・ナビハイライトの動作確認。
  - モバイル向けのハンバーガーメニュー対応を検討する。
