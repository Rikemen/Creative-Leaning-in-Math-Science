# Linter (ESLint)を1.5に追加 (formetter (Prettier) にさらに追加)

## 静的解析 (ESLint)

コードのバグを未然に防ぎ、一貫したコーディングスタイルを維持するために [ESLint](https://eslint.org/) を導入しています。

### 設定のポイント

- **p5.js への対応**:
  - p5.js は `setup()` や `draw()`、`width` などのグローバル変数を多用するため、標準設定では「未定義エラー」が発生します。
  - これを解決するため、`p5-globals.mjs` に p5.js 固有のグローバル変数を定義し、`eslint.config.mjs` で読み込んでいます。
- **設定ファイル**:
  - `eslint.config.mjs`: メインの設定ファイル（Flat Config 形式）。
  - `p5-globals.mjs`: p5.js 独自のグローバル変数を外部定義として管理。

### 主なルール

| ルール名         | 設定    | 内容                               |
| :--------------- | :------ | :--------------------------------- |
| `no-unused-vars` | `error` | 使用されていない変数を許容しない   |
| `no-console`     | `warn`  | `console.log` 等の使用に警告を出す |

## プロジェクト構成

「設定」と「実装」を分離し、見通しを良くするために以下の構造を採用しています。

```text
. (Root)
├── src/                    # プログラムの本体（主にここを編集）
│   ├── index.html          # エントリポイント
│   ├── sketch.js           # メインロジック（p5.js）
│   ├── math-utils.js       # 数学関連のユーティリティ
│   ├── drawing-utils.js    # 描画関連のユーティリティ
│   └── config.js           # 設定定数
├── .vscode/                # VS Code 用の共有設定（保存時自動保存など）
├── eslint.config.mjs       # ESLint メイン設定
├── p5-globals.mjs          # p5.js 固有のグローバル変数定義
├── .prettierrc             # Prettier 設定
├── .prettierignore         # 整形除外設定
├── package.json            # npm 依存関係・スクリプト
└── README.md               # 本ドキュメント
```

## プロジェクトのコピー・利用手順

このディレクトリをベースに新しいプロジェクトを作成する場合は、以下の手順で行ってください。

### 1. ディレクトリのコピー

このディレクトリ全体を新しい場所にコピーします。その際、`node_modules` フォルダは含めない（または削除する）ようにしてください。

### 2. 依存関係のインストール

コピー先のディレクトリでターミナルを開き、以下のコマンドを実行して必要なライブラリをインストールします。

```bash
npm install
```

### 3. 関数の追加とリンターへの登録

p5.js の新しい関数やグローバル変数を使用して ESLint のエラー（'xxx' is not defined）が出る場合は、ルート直下の `p5-globals.mjs` のリストに変数名を追記してください。

### 4. コーディングの開始

`src/` ディレクトリ内のファイルを編集して開発を進めます。VS Code を使用している場合、ファイルを保存するたびに Prettier による整形と ESLint によるチェック（および一部の自動修正）が実行されます。

### 使用方法

1. **エディタ連携**:
   VS Code を使用している場合は、[ESLint 拡張機能](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)をインストールすることで、コーディング中にリアルタイムでエラーを確認できます。
2. **設定のカスタマイズ**:
   新しい p5.js の関数を使用して「未定義」エラーが出る場合は、`p5-globals.mjs` にその名前を追記してください。
