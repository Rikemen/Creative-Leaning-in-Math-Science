# Firebase Hosting・メール認証・記録・ランキング追加計画

| Loop | Task | User-facing summary | Unit test | Refactor checkpoint |
| --- | --- | --- | --- | --- |
| F01 | Hosting配信準備 | ゲスト版をFirebaseから配信できる形にする。 | 設定確認・単体対象外 | 配信対象を限定 |
| F02 | ローカル保存 | ゲストの履歴を端末に残す。 | local-records | UID領域と分離 |
| F03 | 認証アダプター | ログイン状態をゲームから分離する。 | auth-state | SDKを境界へ |
| F04 | 登録・確認 | メール確認までの画面を用意する。 | email-verification | 確認の正本をAuthへ |
| F05 | アカウント初期化 | 確認済み会員に最初のプレイヤーを作る。 | ensure-account | 冪等性 |
| F06 | 所有者のRules | 本人だけが記録を読めるようにする。 | rules | クエリと権限を一致 |
| F07 | 通常記録の保存 | 会員のプレイ結果を保存する。 | save-practice | 集計を一度だけ |
| F08 | 履歴画面 | 通信失敗でも記録を見失わない表示にする。 | records-state | 空と失敗を区別 |
| F09 | ゲスト履歴取り込み | 希望する端末記録を会員へ移す。 | guest-import | ベストを上書きしない |
| F10 | 公開設定 | ニックネームとランキング参加を設定する。 | player-privacy | 公開情報を最小化 |
| F11 | 挑戦開始 | 比較条件と時間を固定する。 | start-ranked | ルールを版管理 |
| F12 | 結果検証 | 同じ条件でスコアを計算し直す。 | validate-ranked | 純粋な検証関数 |
| F13 | ベスト確定 | 結果とランキングを一度だけ更新する。 | finish-ranked | 読み取りを先に |
| F14 | ランキング表示 | 条件別の上位と自己ベストを表示する。 | leaderboard | インデックスを同時定義 |
| F15 | アカウント削除 | 公開行も含めて記録を削除できるようにする。 | delete-account | 再試行可能な削除 |
| F16 | 実環境確認 | 認証メール・別端末・公開URLを確認する。 | 全対象＋実機 | 本番とEmulatorを分離 |

## ゴール・範囲

[アーキテクチャ](../architecture.md)と[データモデル](../conceptual-data-model.md)を実装へつなぐ追加計画。ゲーム本体の32工程は維持し、最初のゲスト公開にF01〜02、将来の会員公開にF03〜09、ランキング公開にF10〜16を追加する。アカウント削除F15の非公開データ部分は会員公開時点でも必要なので、先行して実装する。

## 前提・リスク

管理先は `5_games/calc-and-shot-beam/`。FirebaseプロジェクトID、課金、リージョン、認証の承認ドメインは未設定・未確認。ゲームを作る前から認証を必須にしない。Cloud Functions追加時にBlazeとApp Checkの実環境準備が必要。

## 詳細ループ

以下は1回15分以下の変更単位。複数画面・端末・ケースは追加Loopへ分ける。コードは「失敗テスト→最小実装→対象テスト→整理→変更時に再実行」。コマンドは今後のテスト基盤で `npm run test:firebase -- <対象>` を定義して使う案で、現在利用可能なコマンドではない。RulesはAuth／Firestore Emulator、Functionsの権限・トランザクションはEmulator結合テストも追加する。

| Loop／依存 | 目的・最初に書くテスト | 最小実装とファイル案 | 実行・完了条件 |
| --- | --- | --- | --- |
| F01／ゲストゲーム完成 | 配信ルート・既存作品への影響を確認、単体対象外 | firebase.jsonをpublic配信に限定。プロジェクトIDを指定してEmulator接続 | Hosting Emulatorで画像・音が表示。コードと資料を配信しない |
| F02／ゲーム結果あり | 重複、保存失敗、件数上限 | public/js/records/local-store.js | `npm run test:firebase -- local-records`、再読込で復元 |
| F03／F02 | 未ログイン・未確認・確認済み・ログアウト | public/js/auth/auth-service.js | `npm run test:firebase -- auth-state`、別UIDへのキャッシュ漏れなし |
| F04／F03 | 確認リンク後の再読込・再送制御 | public/js/ui/account.js | `npm run test:firebase -- email-verification`、Emulator操作リンクで確認状態遷移 |
| F05／F04 | 同時初期化でもPlayerが1人 | functions/src/accounts/ensure-account.ts | `npm run test:firebase -- ensure-account`、複数呼出しで同じ結果 |
| F06／F05 | 未確認・別UID・未知パス・直接writeを拒否 | firestore.rules、tests/firebase/rules.test.js | `npm run test:firebase -- rules`、所有者パスだけread可能 |
| F07／F06 | 再送・異なる内容・過大値・別Player | functions/src/runs/save-practice.ts | `npm run test:firebase -- save-practice`、RunとStatsが1回だけ更新 |
| F08／F07 | 空・読込中・失敗・未同期を区別 | public/js/records/member-store.js | `npm run test:firebase -- records-state`、失敗時も前回表示を保持 |
| F09／F08 | 同じ履歴の再取り込み・既存ベスト保持 | functions/src/runs/import-guest.ts | `npm run test:firebase -- guest-import`、unverifiedで保存、ランキングに入らない |
| F10／F05 | 非公開化と同時の結果投稿 | functions/src/players/update-player.ts | `npm run test:firebase -- player-privacy`、非公開完了後に公開行なし |
| F11／F10 | 未確認・別Player・未許可ルール・多重開始 | functions/src/ranked/start.ts | `npm run test:firebase -- start-ranked`、締切とseedをサーバー固定 |
| F12／F11 | 正常、時間外、重複、改ざん値、降格、ペイロード上限 | functions/src/ranked/validate.ts、共有の純粋ゲームロジック | `npm run test:firebase -- validate-ranked`、申告得点に依存しない |
| F13／F12 | 二重送信・並行ベスト・公開停止 | functions/src/ranked/finish.ts | `npm run test:firebase -- finish-ranked`、Run・Stats・Best・Entryの整合性 |
| F14／F13 | 同点順・非公開Board・limit・難易度別 | public/js/records/leaderboard.js、firestore.indexes.json | `npm run test:firebase -- leaderboard`、実クエリとRulesが一致 |
| F15／F07、公開行はF13後 | 削除途中の障害と再実行、新規投稿拒否 | functions/src/accounts/delete.ts | `npm run test:firebase -- delete-account`、子データと公開行の残留なし |
| F16／公開対象の全Loop | メール・認証・実index・App Checkは手動確認も必要 | docs/release-checklist.md | 対象全テストとHTTPSで確認。Functions→Rules/index→Hostingの順で配信を確認 |

整理時はESM互換性、FunctionsのAdmin初期化、Firestoreトランザクションの全read先行を守る。`.agent/rules/esm-compatibility.md`、`cloud-functions-new-service.md`、`firestore-query-safety.md` を参照。画面CSSを扱う際はゲーム専用CSSへ配置する。

## 検証戦略

認証状態・冪等性・所有者・競技条件・トークン更新・削除再実行は自動テスト。確認メール配信、実index構築、App Check、別端末ログインは本番相当環境で確認する。通常プレイとランキング挑戦の停止ルールを親子試遊でも確認し、降格後も遊べることを検証する。

## 戻し方

既存ゲームのHosting targetやFirestoreへ変更を広げない。公開機能フラグで会員保存・ランキング挑戦を段階的に有効化し、問題時は保存済みデータを保持したまま対象機能を停止する。Rulesを一時的に全許可する復旧方法は採用しない。
