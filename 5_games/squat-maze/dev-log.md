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

## ゲームインクリメント開発

p5.js + ml5.js によるスクワット迷路ゲームの実装タスク。
デザイン参照: `mock/stitch_game_v3.html`（モノクロ・ネオン風サイドスクロール）

### フェーズ1: 基盤構築

- [x] **Task 1-1: p5.js キャンバスの初期化（10分）**
  - `game.js` にインスタンスモード (`new p5(sketch)`) でキャンバスを生成。
  - `windowWidth × windowHeight` のフルスクリーン描画。
  - 黒背景 (`#050505`) の描画を確認。

- [x] **Task 1-2: ゲーム状態管理の雛形（10分）**
  - `gameState` 変数（`"ready"` / `"playing"` / `"gameover"`）を定義。
  - 各状態で異なる `draw()` 分岐を実装（中身は仮テキスト表示のみ）。
  - スペースキーで `"ready"` → `"playing"` への遷移を確認。

- [x] **Task 1-3: プレイヤー描画（10分）**
  - 画面左側に白いひし形（45° 回転の正方形）をプレイヤーとして描画。
  - プレイヤーの Y 座標を変数化（後で ml5.js から制御するため）。
  - 仮操作：マウスの Y 位置でプレイヤーが上下移動することを確認。

- [x] **Task 1-4: プレイヤーをクラスとして別ファイルにリファクタリング（10分）**
  - `public/js/game/player.js` を新規作成。
  - `Player` クラスを定義し、`draw()` メソッドでひし形を描画。
  - `game.js` から `Player` をインポートし、`new Player()` でインスタンス化。
  - プレイヤーの Y 座標を `player.y` で外部から更新できるようにする。

- [x] **Task 1-5: 定数を別ファイルとしてリファクタリング（10分）**
  - `public/js/game/constants.js` を新規作成。
  - 定数を `game.js` から移動。

### フェーズ2: 壁と障害物

- [x] **Task 2-1: 上下の壁を描画（10分）**
  - 画面上部・下部にギザギザの壁（`clip-path polygon` 風の頂点列）を `beginShape()` で描画。
  - 壁の境界線に白い発光エフェクト（`stroke` + `shadow`）を付ける。

- [x] **Task 2-2: 壁のスクロール（10分）**
  - 壁の頂点座標を毎フレーム左方向にオフセット。
  - 画面外に出た頂点を右端に再生成し、無限スクロールを実現。
  - `scrollSpeed` 変数で速度を制御。

- [x] **Task 2-3: 壁の通路幅をランダム化（10分）**
  - 壁の頂点生成時に、上壁と下壁の間隔（通路幅）をランダムに変動させる。
  - 最低通路幅の制約を設け、ゲームが理不尽にならないよう調整。

- [x] **Task 2-4: 障害物ブロックの追加（10分）**
  - 通路内にランダムに小さなブロック（長方形）を配置。
  - 壁と同様に左方向にスクロール。
  - `obstacles` 配列で管理し、画面外に出たら削除。

### フェーズ3: 当たり判定とライフ

- [x] **Task 3-1: 当たり判定の実装（10分）**
  - プレイヤーのバウンディングボックスと壁の頂点列の衝突判定。
  - プレイヤーと障害物ブロックの矩形衝突判定。
  - 衝突時に一時的な赤フラッシュ演出（無敵時間付き）。

- [x] **Task 3-2: ライフシステム（10分）**
  - ライフ変数（初期値 3）を定義。
  - 衝突時にライフを 1 減算。無敵時間中は減らさない。
  - ライフ 0 で `gameState` を `"gameover"` に遷移。

- [x] **Task 3-3: ライフの HUD 表示（10分）**
  - 画面左下に「LIFE:」＋ 縦バー 3 本で残ライフを表示（モック準拠）。
  - ライフ減少時にバーを消す演出。
  - フォント: Inter, 白色, トラッキング広め。

### フェーズ4: スコアとゲームオーバー

- [ ] **Task 4-2: ゲームオーバー画面（10分）**
  - `gameState === "gameover"` 時にオーバーレイ表示。
  - 最終スコアを大きく中央に表示。
  - 「RETRY」ボタン（`createButton` or キー入力）でゲーム状態をリセット。

- [ ] **Task 4-3: スコアの Firestore 保存（10分）**
  - ゲームオーバー時に `firebase-config.js` の設定を使って `scores` コレクションに保存。
  - `{ score, uid, createdAt }` のドキュメント構造。
  - 匿名認証済みユーザーのみ書き込み可能。

### フェーズ5: ml5.js 姿勢推定

- [x] **Task 5-1: Webカメラ映像の取得（10分）**
  - `p5.createCapture(VIDEO)` でカメラ映像を取得。
  - カメラ映像は非表示（ゲーム画面の邪魔にならないよう）。
  - カメラ許可ダイアログのハンドリング。

- [x] **Task 5-2: ml5.js MoveNet による姿勢推定（10分）**
  - `ml5.bodyPose('MoveNet')` でモデルをロード。
  - カメラ映像からリアルタイムにキーポイント（nose 等）を取得。
  - コンソールに頭の Y 座標をログ出力して動作確認。

- [x] **Task 5-3: 姿勢推定とプレイヤー位置の連動（10分）**
  - 鼻（nose）の Y 座標をキャンバスの Y 座標にマッピング。
  - マッピング範囲の調整（カメラ解像度 → キャンバス座標系）。
  - マウス操作とのフォールバック切り替え（カメラ未許可時）。

### フェーズ6: 演出と仕上げ

- [ ] **Task 6-1: 難易度の段階的上昇（10分）**
  - スコアに応じて `scrollSpeed` を徐々に増加。
  - 通路幅の最低値を徐々に狭める。
  - 障害物の出現頻度を増加。

- [ ] **Task 6-2: 効果音の追加（10分）**
  - 衝突時・ゲームオーバー時・スコア更新時の SE を `p5.SoundFile` で再生。
  - 音声ファイルは `public/assets/sounds/` に配置。
  - ミュート切り替えの対応。
