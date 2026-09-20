# サーバー処理

Callable Functionsの実装先。現時点ではディレクトリのみで、関数・依存・実行環境は未導入。`firebase.json` のfunctions配信対象にもまだ登録していない。

| ディレクトリ | 担当 |
| --- | --- |
| src/accounts/ | 保護者アカウントの初期化・削除 |
| src/players/ | プレイヤー追加・編集・削除・公開設定 |
| src/runs/ | 通常記録保存・ゲスト記録取り込み |
| src/ranked/ | 挑戦開始・スコア検証・結果確定 |
| src/lib/ | Admin初期化、認可、入力検証などサーバー専用処理 |

導入時に `package.json`、`tsconfig.json`、`src/index.ts` とテスト基盤を追加する。対応ランタイム・SDK版・Functionsリージョンを確認し、Firebase設定へ登録する。

`../shared/` の公開可能な純粋ロジックを共用する場合、Functions配信パッケージに含まれるようビルドで取り込む。配信対象外の相対パスを実行時に読み込まない。サーバー専用の認可・認証情報をブラウザ用出力へ混ぜない。
