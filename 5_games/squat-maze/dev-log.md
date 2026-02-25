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

---

### 🔜 次のアクション (Next)

- **画面開発とルーティング**
  - Canvasを表示する。
  - 画面遷移に必要な全画面を作成し、ルーティングについて検討する。
  - README.mdの作成をする（随時更新する想定。ディレクトリ構成・各ファイルの役割・使い方、次回以降のセットアップ手順。）
  - SPEC.mdの作成をする（ゲームの仕様・ルール・操作方法など。必要に応じてRules, Wolkflowsに追加する。）
  - ゲーム部分の実装
