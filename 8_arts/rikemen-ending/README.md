# Rikemen CH. ほのぼの15秒エンディング

生成り紙、パステルカラー、ポストカード、手描きモチーフを使ったYouTube共通Endingです。10人のキャラクターが画面の外周から視聴者を見送ります。

## 仕様

- 1920×1080 / 60fps / 900フレーム（15秒）
- p5.js 1.9.4
- Rampart OneとNoto Sans JPによる日本語表示
- Web Audio APIによる木琴・ベル風ジングル
- MediaRecorderによる音声付きWebM書き出し
- 原画は `assets/01_Feru.png`〜`assets/10_Newt.png` を変更せず参照

## プレビュー

リポジトリのルートでローカルサーバーを起動します。

```bash
python3 -m http.server 8000
```

ブラウザで次を開きます。

```text
http://localhost:8000/8_arts/rikemen-ending/
```

- 「音付きで再生」：15秒の映像とジングルを再生
- フレームスライダー：任意のフレームを静止確認
- 「YouTube配置ガイド」：動画2枠と登録枠の位置をプレビュー上に表示
- 「15秒を録画（WebM）」：音声付きWebMをダウンロード

ブラウザのコンソールからも操作できます。

```js
RikemenEnding.replay({ sound: true });
RikemenEnding.seek(540);
const webmBlob = await RikemenEnding.record();
```

## MP4への変換

```bash
ffmpeg -i rikemen-ending.webm -t 15 -r 60 \
  -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart \
  rikemen-ending-1080p.mp4
```

出力は15.000秒、1920×1080、60fps、H.264 / AACを想定しています。

```bash
ffprobe -v error \
  -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 rikemen-ending-1080p.mp4
```

## YouTube終了画面の配置

YouTube Studioの「エディタ → 終了画面」で、次の3要素を動画の最後15秒へ追加します。

- おすすめ: 左のポストカードへ動画または再生リストを配置
- つぎに見る: 右のポストカードへ動画を配置
- チャンネル登録: 中央下の丸いステッカーへ登録要素を配置

背景は要素が表示されない環境でもメッセージカードとして成立します。動画の位置はStudio上でプレビューし、必要なら背景を再生成せずYouTube側で調整してください。

## テスト

```bash
node --test 8_arts/rikemen-ending/test/*.test.cjs
```

15秒タイムライン、YouTube領域、全10人の安全配置、決定的な紙・飾り、ジングル、録画形式、ドキュメント契約を検証します。
