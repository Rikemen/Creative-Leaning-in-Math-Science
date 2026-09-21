---
description: 16:9のYouTube用サムネイル画像を生成し、該当ディレクトリに配置する
---

# YouTubeサムネイル作成・配置ワークフロー

**トリガー:** ユーザーから動画用のサムネイル画像の作成（`/create-thumbnails`）を依頼された場合。

**説明:**
本ワークフローは、動画のテーマに沿った16:9のYouTube用サムネイル用背景画像を `generate_image` ツールを用いて作成し、プロジェクト内の該当動画ディレクトリの `thumbnails/` フォルダへ配置する手順を定義します。

---

## 1. デザインテーマのすり合わせ
- ユーザーに対して、どのようなテーマやテイストのサムネイルを作成したいか（例：サイバー調、ポップなイラスト調、ダークテーマなど）、キーワードやコンセプトを質問します。
- ユーザーから特に指定がない場合は、対象の動画の内容（README.mdなどの概要欄）から類推して、魅力的なプロンプトを構築します。

## 2. 画像の生成
- `generate_image` ツールを実行し、YouTubeサムネイルとして必須であるアスペクト比（**AspectRatio: "16:9"**）を指定して画像を生成します。
- **プロンプトのスタイル例（サイバー・数学/情報系テイストの場合）:**
  > `A highly stylized, dark blue and neon cyber-themed mathematical background for a YouTube thumbnail about [テーマ]. Features glowing [キーとなるモチーフ] in a digital grid space. High contrast, cinematic lighting, modern educational style. No text.`
  ※ユーザーからイラスト調などの別テイストの指定があれば、それに従います。
- `generate_image` 実行後、生成された画像ファイルの絶対パス（`/Users/rikemen/.gemini/antigravity-ide/brain/.../*.jpg` または `.png`）を特定します。

## 3. アセットディレクトリの作成とファイルコピー
- 該当の動画ディレクトリ（例: `1_linear_algebra/1_28_行列式/`）の下に、画像を保存するための `thumbnails/` ディレクトリが存在するか確認します。
- セキュリティ境界（サンドボックス）の制約により、エージェント環境（`.gemini/`）からプロジェクトワークスペースへの直接のファイルコピーはブロックされるため、ターミナル上でユーザー自身に実行してもらうコマンドを組み立てて提示します。
- 以下の形式で、**絶対パスを使用した完結したコマンド**を提示してください。

```bash
# 1. サムネイル用ディレクトリの作成
mkdir -p /Users/rikemen/Documents/rikemen/Creative-Leaning-in-Math-Science/[動画カテゴリ]/[該当ディレクトリ]/thumbnails

# 2. 生成された画像のコピー（ファイル名は適宜わかりやすいものに変更）
cp /Users/rikemen/.gemini/antigravity-ide/brain/[...]/[生成画像名].jpg /Users/rikemen/Documents/rikemen/Creative-Leaning-in-Math-Science/[動画カテゴリ]/[該当ディレクトリ]/thumbnails/background.jpg
```

## 4. 完了報告
- コピーコマンドをユーザーに提示し、実行が完了したら、その画像を使って `preview.html` などのサムネイルプレビュー作成に進める準備が整ったことを報告してタスクを完了します。
