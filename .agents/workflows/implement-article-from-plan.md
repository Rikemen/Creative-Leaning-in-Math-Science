---
description: make-article-plan.md で生成された記事設計HTMLをもとに、実際のアプリ記事・概念イラスト・シミュレーターを実装するワークフロー。
---

# 記事設計HTMLから実記事を実装するワークフロー

## 目的

`.agent/workflows/make-article-plan.md` で生成された記事設計HTMLを入力として、アプリ内で読める実際の記事を実装する。

このワークフローでは、記事本文だけでなく、記事トップの概念イラスト、数式、例題、練習問題、シミュレーター、記事カタログ登録までを扱う。

## 入力

ユーザーから以下のいずれかを受け取る。

- 単一の記事設計HTMLパス
- `docs/article-plans/` 配下の複数HTML
- 記事設計HTMLの一覧またはindex HTML

入力例:

```text
.agent/workflows/implement-article-from-plan.md docs/article-plans/mean-value-theorem-20260615.html
```

```text
.agent/workflows/implement-article-from-plan.md docs/article-plans/
```

## 参照ワークフロー

- 記事設計HTML生成: `.agent/workflows/make-article-plan.md`
- シミュレーター設計・実装方針: `.agent/workflows/make-simulator.md`
- 画像生成・配置: `.agent/workflows/generate-image.md`
- 実装前の開発計画が必要な場合: `.agent/workflows/make-dev-plan.md`

## 実装方針

- 記事設計HTMLの意図を保ちつつ、アプリの既存 `ArticleData` 形式・既存コンポーネント・既存カテゴリ構造に合わせる。
- 記事トップのビジュアルは、原則として簡易SVGではなく、概念を表すイラスト画像を使う。
- 概念イラストの生成・配置は `.agent/workflows/generate-image.md` に従う。
- 各記事には原則としてシミュレーターを付ける。
- 記事内容的にシミュレーター化が難しい場合は、スキップ理由を実装メモまたは最終報告に明記し、代替として静的図・表・例題を補強する。
- 既存のユーザー変更は戻さない。差分は記事実装に必要な範囲へ絞る。

## 実行手順

### 1. 設計HTMLを読み取る

対象HTMLから以下を抽出する。

- 記事タイトル
- slug案
- 対象読者
- 前提知識
- 学習ゴール
- 「これから何を学ぶのか」
- 「なぜそれを学ぶのか」
- 概念イラスト案
- 解説の流れ
- 具体例
- シミュレーション案
- 練習問題
- まとめ
- 素材・実装メモ

HTMLパースには、利用可能なら構造化パーサを使う。依存がない場合は、標準ライブラリや既存の構造に沿った最小限の抽出でよい。

### 2. 実装先を確認する

既存コードを読み、以下を確認する。

- 記事データ型: `src/content/types.ts`
- 記事カタログ: `src/content/articles.ts`
- 記事レジストリ: `src/content/contentRegistry.ts`
- 記事表示コンポーネント: `src/components/MathArticle.vue`
- 既存シミュレーター: `src/components/*Simulator.vue`, `src/components/SimulationBoard.vue`

既存パターンから外れる実装が必要な場合は、先に理由を整理する。

### 3. 概念イラストを設計・生成する

記事トップや導入セクションに使うビジュアルは、原則として概念イラスト画像にする。

手順:

1. 設計HTMLの「概念イラストでイメージ」から、画像の描写・構図・キャプションを確認する。
2. `.agent/workflows/generate-image.md` の統一テイストに従い、英語プロンプトを作る。
3. 複数枚生成する場合は、同ワークフローの事前承認手順に従い、生成枚数・配置先・描写案をユーザーへ確認する。
4. 画像ファイル名は原則として `src/assets/article-illustrations/{slug}-concept.png` とする。
5. 画像がまだ用意できない場合は、コード側では予定パス・alt・キャプションを先に設計し、最終報告で必要画像とファイル名を伝える。

イラスト生成プロンプトの基本形:

```text
A cute educational line art visualization of [concept]. Thick clean black hand-drawn outlines, flat coloring, simple flat shading, no gradient. Smooth curves, friendly and clear math concept. Pastel color palette (light blue, mint green, soft yellow), clean white background. Avoid photo, photorealistic, 3D render, gradient, complex texture, dark background, blurry.
```

### 4. 記事本文を実装する

既存の記事データ形式に合わせ、必要なファイルを追加する。

原則:

- `src/content/{category}/{slug}.ts` に `ArticleData` を作る。
- セクションは設計HTMLの流れを保ちつつ、読者が読み切れる粒度に再構成してよい。
- 数式はKaTeXでレンダリング可能なLaTeX文字列にする。
- 本文には、直感、定義、式の意味、例題、誤解しやすい点、練習への橋渡しを含める。
- 既存レンダラが未対応の表現を大量に入れる場合は、先にレンダラ拡張の必要性を判断する。

最低限入れるセクション:

- 直感・モチベーション
- 定義・主要公式
- 具体例
- シミュレーターまたは代替可視化の説明
- 練習問題・まとめ

### 5. シミュレーターを実装する

各記事には原則としてシミュレーターを付ける。

実装前に `.agent/workflows/make-simulator.md` を確認し、`EpsilonDeltaSimulator.vue` と `DerivativeSimulator.vue` のデザイン/システムパターンに合わせる。

実装判断:

- 既存の `DerivativeSimulator.vue`, `EpsilonDeltaSimulator.vue`, `DifferentiationRulesSimulator.vue`, `SimulationBoard.vue` で表現できる場合は再利用する。
- 記事固有の操作が必要な場合は、`src/components/{Concept}Simulator.vue` を追加する。
- 複数記事で同じUIになる場合は、汎用コンポーネント化を検討する。
- 軽量なスライダー + SVG + 結果カードで足りる場合は、`CalculusConceptSimulator.vue` の `SimulatorConfig` と `ArticleDetail.vue` の `calculusConceptSlugs` に追加する。
- 記事内容的にシミュレーターが不自然な場合は、理由を記録し、代替として静的な概念イラスト・表・例題を強化する。

シミュレーターに必ず定義する項目:

- 操作できる入力
- 表示する出力
- 読者が気づくべき変化
- 初期値
- モバイルで破綻しない固定寸法・レスポンシブ制約

### 6. カタログとレジストリへ登録する

記事を追加したら、既存構造に合わせて以下を更新する。

- `src/content/articles.ts`
- `src/content/contentRegistry.ts`
- 必要に応じて i18n キー

登録後、記事一覧・サイドバー・`/article/:slug` で読み込める状態にする。

### 7. 検証する

`src/` 配下の `.ts` / `.vue` を変更した場合は、`.agent/rules/lint-after-code-change.md` に従い、変更ファイルだけESLintを実行する。

推奨検証:

```bash
./node_modules/.bin/eslint <変更したsrcファイル...>
```

記事カタログやレジストリを更新した場合:

```bash
./node_modules/.bin/vitest run src/content/__tests__/articles.spec.ts src/content/__tests__/contentRegistry.spec.ts
```

型・ビルド確認が必要な規模なら:

```bash
npm run build
```

フロントエンドUIやシミュレーターを追加した場合は、必要に応じてローカルサーバーで目視確認する。

## スキップ条件

次の場合は、シミュレーター実装をスキップしてよい。

- 操作できるパラメータがなく、静的な定義記事として完結する
- シミュレーターより表・概念イラスト・例題の方が理解に有効
- 正しいシミュレーターを作るには別ライブラリや大きな仕様確認が必要
- 今回の依頼範囲では画像や本文実装が優先されている

スキップする場合も、最終報告で「どの記事を、なぜスキップしたか」を明記する。

## 最終報告

完了時に以下を簡潔に報告する。

- 実装した記事一覧
- 追加/変更した主要ファイル
- 生成または必要になった概念イラストのファイル名
- 実装したシミュレーター一覧
- シミュレーターをスキップした記事と理由
- 実行した検証コマンドと結果

## 品質チェックリスト

- [ ] 設計HTMLの学習ゴールが記事本文に反映されている
- [ ] 記事トップのビジュアルが簡易SVGではなく概念イラストになっている、または生成予定として明記されている
- [ ] `.agent/workflows/generate-image.md` に沿った画像プロンプト・保存先・ファイル名がある
- [ ] 原則としてシミュレーターがある
- [ ] シミュレーターをスキップした場合、理由と代替可視化がある
- [ ] 例題と練習問題が分かれている
- [ ] 数式がKaTeXで破綻しない
- [ ] 記事カタログとレジストリが同期している
- [ ] 変更した `src/` ファイルにESLintを実行している
- [ ] 必要に応じて記事レジストリテストとビルドが通っている
