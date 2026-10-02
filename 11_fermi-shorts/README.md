# Aru × フェルミ推定 Remotion テンプレート

Aruキャラがホワイトボードに書きながら解説する、30秒・9:16ショート動画用のRemotionテンプレートです。

問題ごとのJSONを `src/problems/` に追加すると、Studioでの確認、macOS標準音声によるナレーション生成、MP4出力ができます。

## セットアップ

```bash
npm install
```

登録済みの問題を確認します。

```bash
npm run list:problems
```

現在のサンプルは次の2件です。

- `biwa` — 琵琶湖の水は何リットル？
- `convenience-stores-example` — 日本にコンビニは何店舗ある？

## 新しい動画を作る

ここでは `tokyo-poles` という問題を追加する例で説明します。

### 1. 問題JSONを作る

既存のサンプルをコピーします。

```bash
cp src/problems/biwa.json src/problems/tokyo-poles.json
```

作成した `src/problems/tokyo-poles.json` を編集します。

```json
{
  "slug": "tokyo-poles",
  "title": "東京に電柱は何本ある？",
  "shortLabel": "Aru",
  "totalFrames": 900,
  "reactionDelayFrames": 0,
  "writingPlan": [
    {
      "text": "東京に電柱は何本ある？",
      "start": 105,
      "duration": 62,
      "top": 45,
      "left": 70,
      "size": 54,
      "emphasis": true,
      "width": 760
    },
    {
      "text": "本数 ＝ 道路長 ÷ 間隔",
      "start": 180,
      "duration": 60,
      "top": 180,
      "left": 70,
      "size": 46,
      "width": 600
    }
  ],
  "captions": [
    {
      "text": "フェルミ推定。東京に電柱は何本ある？",
      "start": 0,
      "end": 105
    },
    {
      "text": "道路の長さを、電柱の間隔で割って考えます。",
      "start": 105,
      "end": 900
    }
  ],
  "narration": [
    {
      "from": 0,
      "text": "フェルミ推定。東京に電柱は何本ある？"
    },
    {
      "from": 105,
      "text": "道路の長さを、電柱の間隔で割って考えます。"
    }
  ]
}
```

`slug` はファイル名と同じ値にしてください。

```text
src/problems/tokyo-poles.json
             └─ slug: "tokyo-poles"
```

`src/problems/index.ts` への登録は不要です。`src/problems/` に置かれたJSONはコマンドから自動的に見つけられます。

### 2. 問題が認識されているか確認する

```bash
npm run list:problems
```

一覧に次のように表示されれば認識されています。

```text
tokyo-poles    東京に電柱は何本ある？
```

### 3. Studioで映像を確認する

```bash
npm run select:problem -- tokyo-poles
npm run select:problem -- tokyo-poles
```

`select:problem` は `tokyo-poles.json` の内容全体を `src/problems/current-problem.json` にコピーします。`current-problem.json` は選択結果なので、通常は直接編集しません。

### 4. ナレーションを使うか決める

ナレーションを使う場合は、`src/Narration.tsx` の設定を `true` にします。

```ts
export const NARRATION_ENABLED = true;
```

ナレーションを使わない場合は `false` のままにします。

```ts
export const NARRATION_ENABLED = false;
```

### 5. MP4を出力する

#### Macでナレーション生成からMP4出力まで行う

```bash
npm run make:problem -- tokyo-poles
```

このコマンドは次の処理を順番に行います。

1. `tokyo-poles` を現在の問題として選択
2. macOSの `say` でナレーション音声を生成
3. RemotionでMP4をレンダリング

出力先は次のとおりです。

```text
out/tokyo-poles.mp4
```

使用するmacOS音声を変える場合は、環境変数 `VOICE` を指定します。

```bash
VOICE="Otoya" npm run make:problem -- tokyo-poles
```

生成された音声は次の場所に保存されます。

```text
public/audio/narration/01.aiff
public/audio/narration/02.aiff
...
```

注意: `make:problem` は `NARRATION_ENABLED` を自動では変更しません。音声を動画に含めるには、実行前に `true` にしてください。

#### ナレーションを生成せずにMP4を出力する

```bash
npm run render:problem -- tokyo-poles
```

出力先は同じく `out/tokyo-poles.mp4` です。

## JSONの各項目

### 問題全体

| 項目 | 必須 | 内容 |
| --- | --- | --- |
| `slug` | 必須 | 問題を識別する名前。JSONのファイル名と合わせます |
| `title` | 必須 | 問題のタイトル |
| `shortLabel` | 任意 | 右上の丸いラベルに表示する文字。省略時は `Aru` |
| `totalFrames` | 必須 | 動画全体のフレーム数。30fpsなので900フレームは30秒 |
| `reactionDelayFrames` | 任意 | 最後の書字完了から驚くAruを表示するまでの待ち時間。0以上で指定し、省略時は0 |
| `writingPlan` | 必須 | ホワイトボードに書く内容 |
| `captions` | 必須 | 画面下部に表示する字幕 |
| `narration` | 必須 | 音声生成に使う文章と再生開始位置 |

### `writingPlan`

| 項目 | 必須 | 内容 |
| --- | --- | --- |
| `text` | 必須 | ホワイトボードに表示する文章 |
| `start` | 必須 | 書き始めるフレーム |
| `duration` | 必須 | 書き終わるまでのフレーム数 |
| `size` | 必須 | 文字サイズ |
| `top` | 任意 | ホワイトボード内の上位置。省略時は自動配置 |
| `left` | 任意 | ホワイトボード内の左位置 |
| `width` | 任意 | 文章を配置する最大幅 |
| `emphasis` | 任意 | `true` の場合は強調表示 |
| `color` | 任意 | 文字色 |
| `page` | 任意 | 表示するページ番号 |

### `captions`

- `text`: 字幕として表示する文章
- `start`: 表示開始フレーム
- `end`: 表示終了フレーム

### `narration`

- `text`: macOSの `say` に読ませる文章
- `from`: 動画内で音声再生を始めるフレーム

字幕用の文章と読み上げ用の文章は別々に調整できます。数式などは、`narration` 側を音声で読みやすい表現にしてください。

## 長い文章とページ分割

- `top` を省略すると、文章が自動配置されます。
- 1枚のホワイトボードに収まらない場合は、自動的に次のページへ送られます。
- 明示的にページを分ける場合は、各行に `"page": 2` のように指定します。
- 複数ページになると、右上に `1 / 3` のようなページ番号が表示されます。
- ページ切替時にはwhoosh効果音が再生されます。

## その他のコマンド

現在選択されている問題をStudioで開きます。

```bash
npm run start
```

現在選択されている問題を固定ファイル名でMP4出力します。

```bash
npm run render
```

```text
out/current-problem.mp4
```

現在選択されている問題のナレーションだけをMacで生成します。

```bash
npm run audio:mac
```

現在選択されている問題をGIFで出力します。

```bash
npm run render:gif
```

```text
out/current-problem.gif
```

## ファイル構成

```text
.
├─ package.json                    # npmコマンドと依存パッケージ
├─ remotion.config.ts              # Remotion設定
├─ public/
│  ├─ audio/                       # 効果音と生成ナレーション
│  └─ characters/                  # Aruキャラクター画像
├─ scripts/
│  ├─ generate-narration-mac.sh    # macOS音声の生成
│  ├─ list-problems.mjs            # 問題一覧の表示
│  ├─ make-problem.mjs             # 選択・音声生成・MP4出力
│  ├─ render-problem.mjs           # 問題を指定したMP4出力
│  └─ select-problem.mjs           # 現在の問題を選択
└─ src/
   ├─ FermiVideo.tsx               # 動画テンプレート本体
   ├─ Narration.tsx                # ナレーション再生と有効・無効設定
   ├─ Root.tsx                     # Remotion Composition
   ├─ index.ts                     # Remotionエントリーポイント
   ├─ layout.ts                    # 文字配置とページ分割
   ├─ problemSchema.ts             # 問題JSONの型定義
   └─ problems/
      ├─ biwa.json                 # 琵琶湖サンプル
      ├─ convenience-stores-example.json
      ├─ current-problem.json      # コマンドで選択された問題のコピー
      └─ index.ts                  # current-problem.jsonの読み込み
```
