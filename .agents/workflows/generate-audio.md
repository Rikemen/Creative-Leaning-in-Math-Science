---
description: 記事を指定して音声ファイルを生成し、記事ページに紐づける
---

# 音声ファイル生成ワークフロー

**Trigger:** `/generate-audio`

**Description:**
指定した記事の音声解説ファイル（WAV）を生成し、記事詳細ページで再生できる状態にする。

---

## 1. 対象記事の確認

- **Goal:** どの記事の音声を生成するか特定する。
- **Action:**
  - ユーザーから slug を受け取る。未指定の場合は利用可能な slug 一覧を表示して選択を促す。
  - 利用可能な slug は `scripts/audio-gen/generate-all.ts` の `ARTICLE_LOADERS` を参照。
  - 既に `public/audio/{slug}.wav` が存在する場合、上書きするか確認する。

## 2. 環境の事前チェック

- **Goal:** 音声生成に必要な環境が揃っているか確認する。
- **Action:**
  - `.env` に `GEMINI_API_KEY` が設定されているか確認する（値は表示しない）。
  - `@google/genai` パッケージがインストールされているか `package.json` で確認する。
  - **IF 不足がある場合:** ユーザーにセットアップ手順を案内して STOP。

## 3. 音声ファイルの生成

- **Goal:** ナレーション原稿生成 → TTS音声化 → WAV保存 を実行する。
- **Action:**
  - 以下のコマンドを実行する:
    ```bash
    npm run audio:generate:one {slug}
    ```
  - 既存ファイルを上書きする場合は `--force` を付与:
    ```bash
    npx tsx --env-file=.env scripts/audio-gen/generate-all.ts --slug {slug} --force
    ```
  - 503/429 エラーは自動リトライされる（指数バックオフ、最大5回）。
  - 完了後、`public/audio/{slug}.wav` が生成されたことを確認する。

## 4. 動作確認

- **Goal:** 記事ページで音声プレイヤーが正しく表示・動作することを確認する。
- **Action:**
  - dev サーバー（`npm run dev`）が起動していることを確認する。
  - ブラウザで `/article/{slug}` にアクセスし、以下を確認する:
    - 音声プレイヤーが記事タイトル上部に表示されている
    - ▶️ 再生ボタンで音声が再生される
    - シークバー、10秒スキップ、倍速切り替えが動作する
  - **IF プレイヤーが表示されない場合:**
    - `public/audio/{slug}.wav` が存在するか確認
    - ブラウザの DevTools > Network で `/audio/{slug}.wav` への HEAD リクエストが 200 を返しているか確認

## 5. コミット

- **Goal:** 変更をコミットする。
- **Action:**
  - 音声ファイル（`.wav`）は `.gitignore` で除外済みのためコミット不要。
  - スクリプトやコンポーネントに変更があった場合のみ、通常のコミットフローに従う。

---

**補足:**

- 音声ファイルの保存先: `public/audio/{slug}.wav`
- 音声ファイルは Git 管理対象外（`.gitignore` に `public/audio/*.wav` を記載済み）
- 各環境で `npm run audio:generate` で再生成する運用
- AudioPlayer コンポーネント（`src/components/AudioPlayer.vue`）が `HEAD` リクエストで音声ファイルの存在を確認し、存在する記事のみプレイヤーを表示する
