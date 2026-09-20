---
description: ユーザーから複数の記事タイトルだけを受け取り、article-plan-requests-template.csv と同じ列構造の記事設計依頼CSVを生成する。
---

# 記事タイトル一覧から記事設計依頼CSVを生成するワークフロー

## 目的

ユーザーから **複数の記事タイトルだけ** が与えられたときに、`.agent/workflows/templates/article-plan-requests-template.csv` と同じ列構造のCSVを生成する。

生成したCSVは、後続の `.agent/workflows/make-article-plans.md` に渡して、各記事の記事設計HTMLを一括生成するための入力として使う。

タイトルだけでは情報が不足するため、可能な限り `terakan-books/` 内の教科書データを参照し、`[要確認]` を減らす。

## 参照先

- CSV雛形: `.agent/workflows/templates/article-plan-requests-template.csv`
- 複数記事設計HTML生成: `.agent/workflows/make-article-plans.md`
- 個別記事設計HTML生成: `.agent/workflows/make-article-plan.md`
- シミュレーター設計・実装方針: `.agent/workflows/make-simulator.md`
- 教科書データ索引: `terakan-books/INDEX.md`
- 教科書データ機械索引: `terakan-books/index.json`

## terakan-books の参照方針

`terakan-books/` には教科書本文Markdown、メタJSON、図版画像が多数含まれる。毎回全ファイルを読むとトークン量が大きくなるため、以下の順序で参照する。

1. まず `terakan-books/INDEX.md` または `terakan-books/index.json` を読む
2. 記事タイトルと目次項目を照合して、関連する `terakan_XX` を特定する
3. 関連する `terakan_XX_meta.json` の `table_of_contents` で節の位置を確認する
4. 関連する `terakan_XX.md` の該当節周辺だけを読む
5. 必要な図版がある場合のみ、同じディレクトリ内の画像ファイル名を `assets_needed` に入れる

全文を横断的に読むのは避ける。索引で候補を絞れない場合だけ、タイトルキーワードで `rg` 検索する。

### terakan-books からCSVへ反映する内容

教科書データから判断できる場合は、以下の列を `[要確認]` のままにしない。

| 列名 | terakan-booksから埋める方針 |
|---|---|
| `target_reader` | 教科書の性格と節の難度から推定する。例: `自然科学・工学で微分法を使う大学初年級の読者` |
| `prerequisites` | 該当前後の節から必要な前提を抽出する |
| `learning_goal` | 該当節で読者が扱えるようになる定理・計算・概念を書く |
| `why_learn` | 該当節が前後の節で果たす役割、応用上の必要性を書く |
| `motivation_origin` | 教科書本文から分かる導入動機を書く。分からない場合のみ `[要確認]` |
| `applications` | 本文・前後文脈・自然科学向けの用途から推定できる応用を書く |
| `related_fields` | 関連する章・分野・応用先を書く |
| `generalization_or_specialization` | 前後節や多変数化などの関係を書く |
| `visual_idea` | 本文中の図・式・幾何的意味から図解案を書く |
| `explanation_flow` | 該当節の展開を記事向けの章立てに直す |
| `worked_example` | 本文中の例・式変形・典型計算から例題案を書く |
| `simulation_idea` | グラフ・曲面・行列式・微分操作など、操作可能な可視化案を書く |
| `practice_policy` | 該当節の問題化方針を基本/標準/発展で書く |
| `summary_points` | 該当節の要点を3〜5個で書く |
| `assets_needed` | 必要な図解・既存画像・新規シミュレーション候補を書く |

推測が強い場合は、セルの末尾に `（要確認）` を付ける。完全に判断できない場合だけ `[要確認]` を使う。

## 入力形式

ユーザーからの記事タイトル一覧は、以下のどの形式でも受け取ってよい。

### 箇条書き

```text
- 微分係数
- ε-δ論法
- 固有値と固有ベクトル
```

### 改行区切り

```text
微分係数
ε-δ論法
固有値と固有ベクトル
```

### カンマ区切り

```text
微分係数, ε-δ論法, 固有値と固有ベクトル
```

### 番号付き

```text
1. 微分係数
2. ε-δ論法
3. 固有値と固有ベクトル
```

## 出力先

生成CSVは以下に保存する。

```text
docs/article-plan-requests/article-plan-requests-{YYYYMMDD}.csv
```

同名ファイルが存在する場合は、上書き前に確認する。

## 出力CSVの列構造

出力CSVのヘッダーは、必ず `.agent/workflows/templates/article-plan-requests-template.csv` と同じにする。

```csv
article_id,title_ja,topic,target_reader,prerequisites,learning_goal,why_learn,motivation_origin,applications,related_fields,generalization_or_specialization,visual_idea,explanation_flow,worked_example,simulation_idea,practice_policy,summary_points,assets_needed,slug_hint,priority,notes
```

## タイトルだけから埋める列

タイトルだけが入力された場合でも、まず `terakan-books` を参照して内容を補完する。索引・本文から判断できない列のみ `[要確認]` とする。

| 列名 | 生成方針 |
|---|---|
| `article_id` | 分野推定 + 連番。分野が不明な場合は `article-001` のようにする |
| `title_ja` | ユーザーが与えたタイトルをそのまま入れる |
| `topic` | タイトルから主要概念を抽出。判断できなければタイトルと同じ |
| `target_reader` | `terakan-books` の節内容から推定。判断不能なら `[要確認]` |
| `prerequisites` | 前後節・本文から必要前提を抽出。判断不能なら `[要確認]` |
| `learning_goal` | 節の中心定理・手法・計算から作成。判断不能なら `[要確認]` |
| `why_learn` | 前後節での役割・自然科学での用途から作成。判断不能なら `[要確認]` |
| `motivation_origin` | 本文の導入・定理の必要性から作成。判断不能なら `[要確認]` |
| `applications` | 本文と自然科学向け文脈から作成。推測なら `（要確認）` |
| `related_fields` | 前後章・応用分野・接続概念から作成 |
| `generalization_or_specialization` | 一変数/多変数、定理の拡張、特殊例の関係から作成 |
| `visual_idea` | 図・式・幾何的直感から作成 |
| `explanation_flow` | 節の流れを記事向け章立てに変換 |
| `worked_example` | 典型式・定理適用・計算例から作成 |
| `simulation_idea` | 操作可能なグラフ/表/図式/シミュレーション案を作成する。`.agent/workflows/make-simulator.md` を前提に、専用Vueコンポーネント / `CalculusConceptSimulator.vue` 設定追加 / 代替可視化の候補も短く書く |
| `practice_policy` | 基本・標準・発展の問題方針を作成 |
| `summary_points` | 節の要点を3〜5個で作成 |
| `assets_needed` | 既存図版ファイル名、または新規図解/シミュレーション案を書く |
| `slug_hint` | タイトルを簡潔な英語に翻訳し、kebab-caseで生成 |
| `priority` | `medium` |
| `notes` | 参照した `terakan_XX` と、残った未確定事項を書く |

## article_id の生成ルール

可能ならタイトルから分野を推定して接頭辞を付ける。

| タイトルの例 | 接頭辞 |
|---|---|
| 微分、積分、極限、級数 | `calculus` |
| 行列、ベクトル、固有値、線形写像 | `linear-algebra` |
| 確率、統計、ベイズ、分布 | `probability-statistics` |
| 複素数、正則、留数、オイラー | `complex-analysis` |
| 微分方程式、ODE | `ode` |
| 偏微分方程式、PDE、熱方程式、波動方程式 | `pde` |
| 曲線、曲面、多様体、曲率 | `differential-geometry` |
| 判定できない | `article` |

連番はCSV内の出現順で3桁にする。

例:

```csv
calculus-001
calculus-002
linear-algebra-003
```

## slug_hint の生成ルール

1. 日本語タイトルを簡潔な英語にする
2. 小文字化する
3. 空白・記号をハイフンに置き換える
4. 連続ハイフンを1つにする
5. 先頭/末尾のハイフンを削る

翻訳に迷う場合は、ローマ字ではなく概念名として自然な英語を優先する。

例:

| title_ja | slug_hint |
|---|---|
| 微分係数 | `derivative-coefficient` |
| ε-δ論法 | `epsilon-delta-definition` |
| 固有値と固有ベクトル | `eigenvalues-and-eigenvectors` |
| ベイズの定理 | `bayes-theorem` |

## 実行手順

### 1. タイトル一覧を抽出する

- 箇条書き記号、番号、余分な空白を取り除く。
- 空行は無視する。
- 同じタイトルが複数ある場合は、重複として報告し、1件に統合してよいか確認する。

### 2. terakan-books索引を読む

以下の順で軽量に参照する。

1. `terakan-books/INDEX.md` を読む
2. 必要に応じて `terakan-books/index.json` を読む
3. タイトルと一致・近似する目次項目を探す
4. 候補が複数ある場合は、章番号や前後項目で絞る

対象が見つかったら、該当する `terakan_XX.md` と `terakan_XX_meta.json` だけを開く。

### 3. CSVヘッダーを取得する

`.agent/workflows/templates/article-plan-requests-template.csv` の1行目を読み取り、出力CSVのヘッダーとして使用する。

テンプレートが見つからない場合は、このワークフロー内の「出力CSVの列構造」に定義されたヘッダーを使う。

### 4. 各タイトルをCSV行へ変換する

各タイトルについて以下を行う。

1. `article_id` を生成する
2. `title_ja` を設定する
3. `topic` を推定する
4. `terakan-books` の該当節を参照して詳細列を埋める
5. 判断不能な列だけ `[要確認]` にする
6. `slug_hint` を生成する
7. `priority` は `medium` にする
8. `notes` に参照元と未確定事項を書く

### 5. CSVとして保存する

- 必ずCSVとして正しくエスケープする。
- セル内にカンマ・ダブルクォート・改行がある場合はCSV仕様に従ってクォートする。
- 手書きでCSV文字列を組み立てず、可能なら標準ライブラリ等のCSV writerを使う。

### 6. 生成結果を報告する

ユーザーへ以下を報告する。

- 生成したCSVファイルパス
- 記事タイトル件数
- 重複や除外があった場合の内容
- 参照した `terakan_XX` 一覧
- 残った `[要確認]` の概要
- 次に `.agent/workflows/make-article-plans.md` で記事設計HTMLを生成できること

## 出力例

入力:

```text
微分係数
ε-δ論法
固有値と固有ベクトル
```

出力CSV例（terakan-booksが参照できない場合の最小例）:

```csv
article_id,title_ja,topic,target_reader,prerequisites,learning_goal,why_learn,motivation_origin,applications,related_fields,generalization_or_specialization,visual_idea,explanation_flow,worked_example,simulation_idea,practice_policy,summary_points,assets_needed,slug_hint,priority,notes
calculus-001,微分係数,微分係数,[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],derivative-coefficient,medium,タイトルのみから生成。詳細は要確認。
calculus-002,ε-δ論法,ε-δ論法,[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],epsilon-delta-definition,medium,タイトルのみから生成。詳細は要確認。
linear-algebra-003,固有値と固有ベクトル,固有値と固有ベクトル,[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],[要確認],eigenvalues-and-eigenvectors,medium,タイトルのみから生成。詳細は要確認。
```

## 品質チェックリスト

- [ ] タイトル一覧から空行・番号・箇条書き記号が除去されている
- [ ] 重複タイトルが検出されている
- [ ] `terakan-books/INDEX.md` または `terakan-books/index.json` を先に確認している
- [ ] 該当する `terakan_XX` だけを開いている
- [ ] ヘッダーが `article-plan-requests-template.csv` と一致している
- [ ] 全行の列数が一致している
- [ ] `article_id` が一意である
- [ ] `slug_hint` が空でない
- [ ] terakan-booksから判断できる詳細列が埋められている
- [ ] 判断不能な列だけ `[要確認]` になっている
- [ ] `notes` に参照元 `terakan_XX` が書かれている
- [ ] CSVとして標準パーサーで読み取れる
- [ ] 保存先が `docs/article-plan-requests/` である

## 注意事項

- このワークフローはCSV生成までを担当する。
- 記事設計HTMLの生成は `.agent/workflows/make-article-plans.md` を使う。
- タイトルだけでは記事品質に必要な情報が不足するため、`terakan-books` で補完しても根拠が薄い情報は推測しすぎず `[要確認]` または `（要確認）` を残す。
- 教科書本文を長く引用しない。CSVには要約・設計情報として反映する。
