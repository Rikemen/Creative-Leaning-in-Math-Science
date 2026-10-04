---
name: check-sketch-imports
description: "sketch.jsの実装時に、index.htmlにp5.jsや必要な自作クラスの読み込みが漏れていないか確認・自動補完する"
---

# `sketch.js` 読み込み確認スキル

## 目的
`sketch.js` を利用する際、`index.html` に `p5.js` や `VectorSpaceElement.js` などの必要なライブラリ・自作クラスが正しく読み込まれていないことによる動作不良（コンソールに何も表示されない等）を未然に防ぐためのスキルです。

## 発動条件
- ユーザーから `sketch.js` の新規作成や修正を依頼されたとき
- 「プレビュー画面が動かない」「コンソールに何も出ない」といったトラブルシューティングを行うとき

## 確認・実行手順

1. **`index.html` の読み込みチェック**
   該当ディレクトリの `index.html` を確認し、`<script src="sketch.js"></script>` の直前に以下のスクリプトタグが存在するか確認します。
   
   ```html
   <!-- p5.jsの読み込み -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
   
   <!-- 自作クラスの読み込み (必ず基底クラスのVectorSpaceElement.jsを先頭にする) -->
   <script src="VectorSpaceElement.js"></script>
   <script src="Matrix.js"></script>
   <script src="Polynomial.js"></script>
   ```

2. **不足している場合の自動補完**
   もし上記スクリプトが不足している場合は、ユーザーの指示を待たず、`replace_file_content` ツールなどを用いて直ちに `index.html` に読み込みタグを追記してください。

3. **依存関係の順序確認**
   クラスの継承関係（`VectorSpaceElement` は `Matrix` や `Polynomial` の親クラス）があるため、必ず `VectorSpaceElement.js` が最初に読み込まれていることを確認してください。
