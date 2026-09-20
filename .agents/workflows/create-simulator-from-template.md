---
description: public/simulations/_template を記事slug名のシミュレーターフォルダへコピーして新規シミュレーターを作成する
---

# シミュレーター新規作成ワークフロー

**Trigger:** `/create-simulator-from-template`

**Description:**
記事ごとの p5.js シミュレーターを、`public/simulations/_template/` から適切な命名規則で作成する。

---

## 1. 対象記事 slug の確認

- **Goal:** 作成するシミュレーターの保存先を一意に決める。
- **Action:**
  - ユーザーから記事 slug を受け取る。
  - 未指定の場合は、対象記事を確認してから進める。
  - slug は既存記事の slug と同じ kebab-case を原則とする。

命名規則:

```text
public/simulations/{articleSlug}/index.html
public/simulations/{articleSlug}/sketch.js
```

例:

```text
article slug: derivative-coefficient
保存先: public/simulations/derivative-coefficient/
```

## 2. 既存ファイルの確認

- **Goal:** 既存シミュレーターを誤って上書きしない。
- **Action:**
  - `public/simulations/{articleSlug}/` が存在するか確認する。
  - 存在する場合は、上書きせずユーザーへ報告して STOP。
  - `_template` が存在しない場合も STOP し、先にテンプレート整備を提案する。

確認コマンド:

```bash
test -d public/simulations/_template && echo "template exists"
test -e public/simulations/{articleSlug} && echo "target exists"
```

## 3. テンプレートをコピーする

- **Goal:** 記事slug名の独立したシミュレーターを作る。
- **Action:**
  - `_template` を `public/simulations/{articleSlug}/` へコピーする。
  - コピー後、最低限 `index.html` の `<title>` と `<h1>` を記事内容に合わせる。
  - `sketch.js` はテンプレートの構造を保ち、記事固有の描画・計算ロジックへ置き換える。

実行例:

```bash
cp -R public/simulations/_template public/simulations/{articleSlug}
```

## 4. 実装ルール

- **Goal:** すべての記事シミュレーターで体験と保守性を揃える。
- **Action:**
  - レイアウト順は以下を維持する。

```text
タイトル
説明
パラメータ説明
スライダーなどの操作UI
描画領域
状態メッセージ
式・値の確認
```

  - 状態メッセージは描画領域に重ねず、`#status-message` に表示する。
  - スライダーは `updateRangeProgress()` で進捗表示を同期する。
  - 共通スタイルは `public/simulations/shared/simulation.css` を使い、記事固有CSSは必要最小限にする。
  - Vueコンポーネントやアプリ本体の状態に依存させない。
  - p5.js の描画ロジックは原則 `sketch.js` に閉じ込める。

## 5. 単体確認

- **Goal:** 記事埋め込み前に単体URLで動作することを確認する。
- **Action:**
  - dev server を起動する。
  - `/simulations/{articleSlug}/index.html` を開く。
  - 以下を確認する。

確認項目:

- HTML が 200 で返る
- canvas が非空で表示される
- スライダーがスマホでも操作しやすい
- 状態メッセージが描画領域に被らない
- コンソールエラーがない

確認URL:

```text
http://127.0.0.1:8080/simulations/{articleSlug}/index.html
```

## 6. 検証

静的ファイルのみの変更でも、アプリ全体の配信に影響しないことを確認する。

推奨:

```bash
npm run build
```

---

**補足:**

- フォルダ名は記事 slug と一致させる。
- slug は小文字英数字と `-` を使う kebab-case とする。
- `_template` と `shared/` は記事slugとして使わない。
