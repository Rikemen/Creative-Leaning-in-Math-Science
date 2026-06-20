---
description: 画像生成とアセット配置のワークフロー
---

# 画像生成・アセット配置ワークフロー

**トリガー:** ユーザーから画像の生成、イラストの追加、またはモックアップ等のビジュアル素材の作成・スライドやコードへの適用が求められた場合。

**説明:**
本ワークフローは、AIツール（`generate_image`）を用いて高品質な画像を生成し、サンドボックス環境の制約を回避して、安全にワークスペース内のアセットディレクトリ（`assets/`等）に配置する手順を定義します。
セキュリティ境界やサンドボックスの制約により、エージェント環境（`.gemini/`）からプロジェクトワークスペース（`Documents/`等）へのファイルのコピーや削除はエージェントから実行できません。そのため、**エージェント側でコード修正を先行して行い、ファイルコピーや一時ファイルの削除といったサンドボックス外のコマンド操作はユーザーへ都度実行を依頼する**アプローチを徹底します。

---

## 1. 生成前の事前承認（複数枚生成時の必須プロセス）

- **適用条件:**
  - ユーザーから複数枚の画像生成を明示的に依頼された場合。
  - または、タスク（例: スライド内の全ピクトグラムの置き換えなど）の実行に伴い、結果的に画像生成が **2枚以上** になることが想定される場合。
- **アクション:**
  - 画像生成の処理を開始する前に、必ず立ち止まります。
  - 以下の内容を箇条書きで整理し、ユーザーにチャット上で提示して**事前に生成の許可（承認）を得て**ください。
    1. 生成する予定の画像トータル枚数
    2. 各画像の「配置先（どのスライド・セクションか）」
    3. 各画像の「具体的な描写イメージ・デザイン案」
  - ユーザーからの承認が得られるまで、実際の `generate_image` ツールの実行は保留してください。

## 2. 高品質な画像の生成

- **目的:** ユーザーの要望やスライドの内容に完全にマッチするプレミアムなデザインアセットを生成する。
- **アクション:**
  - `generate_image` ツールを実行します。
  - プロンプトを組み立てる際、プロジェクト固有のイラストを生成する場合は、後述の「5. イラストの統一テイスト（デザインガイドライン）」に定義されたスタイルとテンプレートを厳密に適用します。
  - プロジェクト外のフューチャリスティックなUIや3D表現などを生成する場合は、それに合わせて洗練されたディテール（例: "3D holographic UI", "neon-glow details", "premium dark tech style" 等）を英語で詳細に記述します。
  - `generate_image` の出力から、生成された画像ファイルの絶対パス（`/Users/rikemen/.gemini/antigravity-ide/brain/.../*.png`）を正確に特定します。

## 3. ワークスペース側コードの先行修正

- **目的:** 画像が正常に表示・動作するようにコード（HTML, CSS 等）を先に準備する。
- **アクション:**
  - コピー後の画像アセットファイル名（例: `assets/ar-learning-space.png`）をあらかじめ決めます。
  - スライドなどの対象ファイル（例: `slide.html`）を `replace_file_content` ツール等で編集し、画像を読み込むタグを追加します。
  - ライトボックス（Lightbox）などのズーム機能がある場合は、それが自動的に適用されるようなマークアップ構成（例: `<img>` タグのクラスや配置）を設計・適用します。

## 4. サンドボックス制約の回避とユーザーへの作業依頼

- **目的:** コピーやクリーンアップといったOSレベルの操作を、ユーザーの協力を得て安全かつ確実に完遂する。
- **アクション:**
  - エージェント環境からワークスペースへの `cp` コマンドや、一時スクリプトの `rm` コマンドはサンドボックスによりブロックされるため、エージェントはこれらを直接実行しようとしません。
  - 代わりに、ユーザーが自身のターミナルでコピー＆ペーストして実行するだけで完了できるよう、**正確なフルパスを含むコマンドライン文字列**を組み立ててチャット上で提示します。
  - ファイルのコピー元とコピー先、不要になったファイル（作成した一時スクリプト等がある場合）の削除コマンドを個別にコードブロック形式で記載し、ユーザーに実行を依頼します。

---

## 出力ガイドライン

- **成果物の提示:** 生成した画像をエージェントのメッセージやスライドのプレビューに紐付け、ユーザーが確認できるようにします。
- **指示の明瞭性:** ユーザーに依頼するコマンドは、ディレクトリ移動が不要なように**絶対パスを使用した完結したコマンド**として提示してください。
- **後始末（クリーンアップ）:** 調査やコピー検証のためにワークスペース内に一時作成したプログラムファイル（`.py`, `.js` 等）がある場合、それらを削除するコマンドも必ず一緒に提示し、ゴミファイルをプロジェクトに残さないようにします。
- **言語:** すべての解説、ユーザーへの依頼、および生成されるドキュメントは日本語（`language-strategies.md` に準拠）で記述します。

---

## 5. イラストの統一テイスト（デザインガイドライン）

プロジェクトのイラストフォルダ（[illustrations](file:///Users/rikemen/Documents/rikemen/rikemen-rikejo-app/src/assets/illustrations)）には、クリーンで親しみやすい数学・科学・歴史上の偉人をモチーフにしたキャラクターイラストが格納されています。
新しいビジュアルアセット（人物・動物・建物・グラフ・概念・アーキテクチャ・ワークフロー等）を生成する際は、以下のガイドラインに従ってプロンプトを組み立ててください。

### 🎨 テイストの言語化（スタイル特徴）
* **線画 (Line Art)**: 均一な太さを持つ、くっきりとした**黒の主線（輪郭線）**。手描き風の温かみがありつつもデジタルで綺麗にクリーン処理された線。
* **着色 (Coloring)**: グラデーションを一切使用しない**フラットカラー（アニメ塗り・ベタ塗り）**。
* **陰影 (Shading)**: 境界がはっきりした、シンプルな1段階の影（セルフシャドウ）のみ。
* **配色 (Palette)**: 彩度が高すぎない、クリーンで柔らかな色彩。水色（`#0284c7`等）、薄い黄色、薄いピンク、柔らかな緑などをベースにする。
* **背景 (Background)**: 完全な白（`clean white background`）または透過背景。
* **全体的な雰囲気 (Vibe)**: 知的でありながら親しみやすくキュートな、ミニマルで教育的なイラスト（Cute, educational, friendly, clean line art illustration）。

### 📝 画像生成用英語プロンプト・テンプレート

#### ① 人物・動物・キャラクター
人物や動物などのキャラクターを描く場合は、以下のテンプレートを使用します。顔立ちや表情はキュートで親しみやすいアニメ調（目が少し大きめ、頬に淡い赤み）を指示します。
> **Prompt:** `A cute educational line art illustration of [主体（例: a friendly owl wearing glasses）]. Thick clean black outlines, flat coloring, simple flat shading, no gradient. Minimalist design, pastel color palette (light blue, yellow, soft green). Clean white background, friendly and welcoming aesthetic.`

#### ② グラフ・数学・シミュレーション（概念の可視化）
数式やグラフ、シミュレーション概念を描く場合は、手書きの味を残したクリーンな線画とフラットな面塗りで視覚化します。
> **Prompt:** `A cute educational line art visualization of [グラフやグラフ内の数式オブジェクト（例: a 3D parabolic wave graph）]. Thick clean black hand-drawn outlines, flat coloring, simple flat shading, no gradient. Smooth curves, friendly and clear math concept. Pastel color palette (light blue, mint green), clean white background.`

#### ③ 概念・建物・アーキテクチャ（システム構成やワークフロー）
システム構成、ワークフロー、その他の抽象的な概念図を生成する場合、一般的なアイコン表記（データベース、矢印、クラウドなど）を手描き風のキュートな線画スタイルで描かせます。
> **Prompt:** `A cute minimalist line art diagram representing [概念やアーキテクチャ（例: client-server database synchronization）]. Thick clean black hand-drawn style outlines, flat coloring, simple shading, no gradient. Standard symbols (like small databases, arrows, clouds) drawn in a cute educational style. Pastel color palette, clean white background, clear and easy to understand.`

### ⚠️ 生成時の注意（除外キーワード）
生成した画像が立体的になったりリアルになりすぎたりするのを防ぐため、以下のキーワードをネガティブプロンプトやプロンプト末尾の除外指定に含めてください。
* **除外キーワード:** `photo, photorealistic, 3D render, gradient, complex texture, shadow gradients, dark background, noisy textures, glowing neon (unless requested), sketch, blurry.`

