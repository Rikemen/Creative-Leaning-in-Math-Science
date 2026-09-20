# Rikemen CH. 5秒オープニング

10人のキャラクターが科学的な軌道へ集まり、中央に `Rikemen CH.` が現れるYouTube共通オープニングです。

## 仕様

- 1920×1080 / 60fps / 300フレーム（5秒）
- p5.js 1.9.4
- Web Audio APIによるオリジナル電子ジングル
- MediaRecorderによるWebM書き出し
- 原画はリポジトリ直下の `assets/01_Feru.png`〜`assets/10_Newt.png` を参照

## プレビュー

リポジトリのルートでローカルサーバーを起動します。

```bash
python3 -m http.server 8000
```

ブラウザで次を開きます。

```text
http://localhost:8000/8_arts/rikemen-opening/
```

- 「音付きで再生」：5秒の映像とジングルを再生
- フレームスライダー：任意のフレームを静止確認
- 「5秒を録画（WebM）」：音声付きWebMをダウンロード

ブラウザのコンソールからも操作できます。

```js
RikemenOpening.replay({ sound: true });
RikemenOpening.seek(150);
const webmBlob = await RikemenOpening.record();
```

## MP4への変換

録画した `rikemen-opening.webm` があるディレクトリで実行します。

```bash
ffmpeg -i rikemen-opening.webm -t 5 -r 60 \
  -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart \
  rikemen-opening-1080p.mp4
```

出力確認の例です。

```bash
ffprobe -v error \
  -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 rikemen-opening-1080p.mp4
```

## テスト

Node.jsの組み込みテストランナーだけを使用します。

```bash
node --test 8_arts/rikemen-opening/test/*.test.cjs
```

タイムライン境界、全10素材、決定的な粒子、音の終了時刻、録画形式のフォールバックを検証します。
