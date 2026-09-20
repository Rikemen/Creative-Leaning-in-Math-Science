---
description: CSVで受け取った複数の記事作成依頼を読み取り、各行ごとに /make-article-plan 相当の記事設計HTMLを生成する上位ワークフロー。
---

# 複数記事設計HTML一括生成ワークフロー

## 目的

ユーザーから複数の記事作成依頼を受け取ったときに、各記事について **本文をいきなり書かず**、まず `.agent/workflows/make-article-plan.md` の形式に従った記事設計HTMLを個別に生成する。

入力はCSVを基本とし、記事ごとのテーマ・対象読者・モチベーション・概念イラスト/シミュレーション候補・練習問題方針などを行単位で整理する。

## 参照ワークフロー

- 個別記事設計: `.agent/workflows/make-article-plan.md`
- シミュレーター設計・実装方針: `.agent/workflows/make-simulator.md`
- HTML基本仕様: `.agent/workflows/make-lightblue-doc.md`
- 画像生成・配置: `.agent/workflows/generate-image.md`
- サイドバー/ステータス表の流用仕様: `.agent/workflows/make-dev-plan.md`

本ワークフローは **複数記事の受付・検証・分配・進捗管理** を担当する。各記事HTMLの中身は `make-article-plan.md` に準拠する。

## 入力テンプレート

ユーザーには、原則として以下のCSV雛形を埋めてもらう。

```text
.agent/workflows/templates/article-plan-requests-template.csv
```

CSVを直接貼り付けても、ファイルパスとして渡してもよい。

## 入力CSVの扱い

### 必須列

以下の列は必須。空欄の場合は、生成前にユーザーへ確認するか、記事設計HTML内で `[要確認]` と明記する。

| 列名 | 内容 |
|---|---|
| `article_id` | 記事依頼を識別するID。例: `calculus-001` |
| `title_ja` | 日本語の記事タイトル案 |
| `topic` | 扱う概念・テーマ |
| `target_reader` | 対象読者 |
| `prerequisites` | 前提知識 |
| `learning_goal` | 読後にできるようになること |
| `why_learn` | なぜ学ぶのか、読者へのモチベーション |

### 推奨列

以下はできるだけ埋める。空欄でも記事設計HTMLは生成してよいが、`素材・実装メモ` や `未確定事項` に反映する。

| 列名 | 内容 |
|---|---|
| `motivation_origin` | 何を解決するために生まれた/発見されたか |
| `applications` | 応用例、後から見つかった有用性 |
| `related_fields` | 他分野との接続 |
| `generalization_or_specialization` | 一般化/特殊化の関係 |
| `visual_idea` | 概念イラスト案。互換性のため列名は維持する |
| `explanation_flow` | 解説の章立て案 |
| `worked_example` | 具体例・例題案 |
| `simulation_idea` | グラフ/表/図式/シミュレーション案。原則としてシミュレーター実装を前提に書く |
| `practice_policy` | 練習問題の方針 |
| `summary_points` | まとめに入れたい要点 |
| `assets_needed` | 必要素材 |
| `slug_hint` | 記事slug案 |
| `priority` | 優先度。例: `high`, `medium`, `low` |
| `notes` | その他メモ |

## 出力先

各記事のHTMLは、個別ワークフローと同じく以下へ出力する。

```text
docs/article-plans/{kebab-case-title}-{YYYYMMDD}.html
```

複数記事を生成した場合は、一覧用のインデックスHTMLも生成してよい。

```text
docs/article-plans/index-{YYYYMMDD}.html
```

インデックスHTMLを作る場合は、各記事のタイトル、出力ファイル、優先度、未確定事項数、生成ステータスを一覧化する。

## ファイル名決定ルール

1. `title_ja` または `topic` を簡潔な英語に翻訳する
2. 英語タイトルを `kebab-case` にする
3. 生成日を `YYYYMMDD` 形式で付与する
4. 同名ファイルがある場合は上書き前に確認する
5. `slug_hint` があり、記事テーマと一致していればファイル名のベースに使ってよい

## 実行手順

### 1. CSVを受け取る

ユーザーから以下のいずれかを受け取る。

- CSVファイルパス
- CSV本文の貼り付け
- CSV雛形を埋めるための情報

CSVファイルが存在しない場合は、`.agent/workflows/templates/article-plan-requests-template.csv` の利用を案内する。

### 2. CSVを検証する

以下を確認する。

- ヘッダー行が存在する
- 必須列がすべて存在する
- `article_id` が重複していない
- `title_ja` または `topic` が空でない
- カンマを含むセルがCSVとして正しくクォートされている

検証エラーがある場合は、HTML生成に進まず、修正が必要な行と列をユーザーに返す。

### 3. 記事ごとの不足情報を整理する

必須列が空欄の場合:

- 件数が少ない場合はユーザーに確認する
- 件数が多い場合は `[要確認]` としてHTML内に明記し、一覧にも残す

推奨列が空欄の場合:

- 生成は続行してよい
- 該当記事の `素材・実装メモ` と `未確定事項` に記載する

### 4. 各記事HTMLを生成する

各CSV行について `.agent/workflows/make-article-plan.md` の必須セクションを満たすHTMLを生成する。

各記事HTMLに必ず入れるもの:

- 記事概要
- これから何を学ぶのか
- なぜそれを学ぶのか
- 概念イラストでイメージ
  - `.agent/workflows/generate-image.md` に渡すプロンプト案
  - 画像保存先・ファイル名案
- 解説の流れ
- 具体例で練習
- グラフ・表・図式・シミュレーション
  - 原則としてシミュレーター実装案
  - `.agent/workflows/make-simulator.md` に基づく実装方式、入力、初期値、出力、読者の気づき、候補コンポーネント名、`ArticleDetail.vue` 登録方法
  - スキップする場合の理由と代替可視化
- 練習問題
- まとめ
- 素材・実装メモ

### 5. 一括生成サマリーを作る

生成後、ユーザーへ以下を報告する。

- 生成した記事設計HTMLの一覧
- 生成しなかった記事がある場合、その理由
- 各記事の主な未確定事項
- 次にユーザーが用意すべき素材や情報

必要に応じて `docs/article-plans/index-{YYYYMMDD}.html` も生成する。

## CSV列からHTMLセクションへの対応

| CSV列 | HTML反映先 |
|---|---|
| `title_ja`, `topic`, `target_reader`, `prerequisites`, `learning_goal` | 記事概要 |
| `topic`, `learning_goal` | これから何を学ぶのか |
| `why_learn`, `motivation_origin`, `applications`, `related_fields`, `generalization_or_specialization` | なぜそれを学ぶのか |
| `visual_idea`, `assets_needed` | 概念イラストでイメージ |
| `explanation_flow` | 解説の流れ |
| `worked_example` | 具体例で練習 |
| `simulation_idea` | グラフ・表・図式・シミュレーション。`.agent/workflows/make-simulator.md` に従い、専用Vueコンポーネント / `CalculusConceptSimulator.vue` 設定追加 / 代替可視化の判断も反映する |
| `practice_policy` | 練習問題 |
| `summary_points` | まとめ |
| `assets_needed`, `slug_hint`, `notes` | 素材・実装メモ |

## CSV記入ルール

- 1行につき1記事。
- セル内でカンマを使う場合は、そのセル全体をダブルクォートで囲む。
- セル内改行は避け、複数項目は ` / ` または `; ` で区切る。
- 不明な項目は空欄にせず、可能なら `要相談`、`未定`、`不要` のいずれかを書く。
- 優先度は `high`, `medium`, `low` のいずれかを推奨する。

## 出力品質チェックリスト

- [ ] CSVの全行が処理対象として認識されている
- [ ] `article_id` に重複がない
- [ ] 必須列の不足が報告またはHTML内で明示されている
- [ ] 各記事HTMLが `make-article-plan.md` の必須セクションを満たしている
- [ ] 各記事HTMLに概念イラストの生成プロンプト案・保存先・ファイル名案がある
- [ ] 各記事HTMLに原則としてシミュレーター実装案がある
- [ ] 各シミュレーター実装案が `.agent/workflows/make-simulator.md` の設計項目を満たしている
- [ ] シミュレーターをスキップする場合、理由と代替可視化が明記されている
- [ ] 各記事HTMLの `data-section` が一意である
- [ ] 各記事のファイル名が重複していない
- [ ] 未確定事項が記事ごとに整理されている
- [ ] 生成サマリーで、ユーザーが次に用意すべき情報が分かる

## 注意事項

- このワークフローでは記事本文の実装やVueコンポーネント実装には入らない。
- あくまで複数の記事設計HTMLを生成するための受付・分配・管理ワークフローである。
- 記事トップのビジュアルは、原則として簡易SVGではなく `.agent/workflows/generate-image.md` に従う概念イラストとして設計する。
- 各記事には原則としてシミュレーター案を入れる。難しい場合のみ理由と代替可視化を明記する。
- シミュレーター案は、既存の ε-δ シミュレータ・微分係数シミュレータと同じデザイン/システム方針を参照するため、`.agent/workflows/make-simulator.md` を必ず確認する。
- 数学的・歴史的事実に不確実性がある場合は、断定せず `[要確認]` と明記する。
- ユーザーが「本文まで書いて」と明示した場合でも、まず記事設計HTMLを作るか確認する。
