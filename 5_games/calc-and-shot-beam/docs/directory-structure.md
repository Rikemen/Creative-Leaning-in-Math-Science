# ディレクトリ構成

`squat-maze`の「ルートにFirebase設定、public配下にHTML・JS・素材」という構成を参考にした。ゲームの業務コードやFirebase本番設定をコピーしたものではない。

```text
calc-and-shot-beam/
├── README.md
├── package.json                 # ESM・Emulator起動コマンド（依存未追加）
├── .firebaserc                  # ローカル専用demo ID
├── firebase.json                # Hosting / Auth・Firestore Emulator設定
├── firestore.rules              # 準備段階は全拒否
├── firestore.indexes.json       # 実クエリ実装時に定義
├── .gitignore
├── public/                      # Hostingで配信する領域
│   ├── index.html               # 現在は「準備中」の仮ページ
│   ├── 404.html
│   ├── styles/                  # ページ・部品のCSS
│   ├── js/
│   │   ├── game/                # セッション進行・ゲーム状態
│   │   ├── input/               # カメラ・姿勢・照準・タッチ
│   │   ├── render/              # p5描画・背景・腕・カード・演出
│   │   ├── audio/               # 効果音の再生と停止
│   │   ├── auth/                # 保護者ログイン・メール確認
│   │   ├── players/             # 複数プレイヤーの選択・管理
│   │   ├── records/             # 履歴・成績・ランキング・端末保存
│   │   ├── ui/                  # 開始・練習・結果・設定画面
│   │   ├── components/          # 共通UI部品
│   │   └── lib/                 # Firebase初期化・汎用処理
│   └── assets/
│       ├── images/
│       ├── audio/
│       ├── icons/
│       └── fonts/
├── functions/                   # サーバー実装先。配信登録は未実施
│   ├── README.md
│   └── src/
│       ├── accounts/
│       ├── players/
│       ├── runs/
│       ├── ranked/
│       └── lib/
├── shared/                      # SDK・描画に依存しない共通処理
│   ├── README.md
│   ├── game/
│   └── contracts/
├── tests/
│   ├── README.md
│   ├── unit/
│   ├── firebase/
│   ├── e2e/
│   └── fixtures/
├── assets-source/               # 配信しない素材制作元
│   ├── README.md
│   ├── images/
│   ├── audio/
│   └── prompts/
├── docs/
│   ├── directory-structure.md
│   └── asset-manifest.md
└── system-design/               # 既存の設計資料を維持
    ├── architecture.md
    ├── architecture.html
    ├── conceptual-data-model.md
    └── dev-plans/
        ├── roadmap.md
        ├── firebase-account-records-plan.md
        └── reference-assets/
```

空の配置先には `.gitkeep` を置き、Gitでもディレクトリを保持する。ファイル実装時に不要になった `.gitkeep` は削除できる。まだ必要ない空のJSファイルや動かない画面リンクは作らない。

## 設計資料からのパス整理

- 単体テストの実装先は `tests/unit/` に集約する。
- Firebase初期化は `public/js/lib/`、認証操作は `public/js/auth/`、プレイヤー管理は `public/js/players/`。
- 本番音源は `public/assets/audio/`。参考元の `public/sounds/` と異なり、配信素材をassetsにまとめる。
- 共用する問題生成・得点計算は `shared/game/`。共用時のビルドは未導入であり、Hosting外のファイルをブラウザが直接importする構成にしない。
- `game.html`、`players.html`、`records.html`等の画面ファイルを追加するかは画面実装時に決める。現在のトップページに認証やゲームが動くふりをするUIは置かない。

## 開発用設定

`squat-maze`の標準ポートとの衝突を避け、Hosting 5100、Auth 9199、Firestore 8180、Emulator UI 5150とした。ポートの空きとCLI起動は未確認。`demo-calc-and-shot-beam` は実クラウドプロジェクトではなくEmulator用のID。本番プロジェクトは別途指定する。

Firebase CLIが利用可能ならプロジェクト内で `npm run dev` がHostingのみ、`npm run dev:firebase` がHosting・Auth・Firestoreを起動する。Firestore Emulatorの前提環境も別途必要。今回依存インストールや起動は行っていない。

Functionsの実行環境、SDK、ビルド、テストを導入した時点で `firebase.json` にFunctionsを登録する。今はデプロイ可能な関数があると扱わない。Firestore Rulesは全拒否なので、保存機能は権限実装後に利用可能になる。

設定形式の参考：[Firebase Hosting設定](https://firebase.google.com/docs/hosting/full-config)、[Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite/connect_and_prototype)。
