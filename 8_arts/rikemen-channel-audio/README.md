# Rikemen CH. Audio Generator

Opening用5秒とEnding用15秒のオリジナル音声を生成します。特定の既存曲やサービス音源は使用していません。

## Composition

- Opening: Dマイナーのタイトなシンセ、キック、スナップ、上昇フレーズによる5秒のクールなロゴスティング
- Ending: 80 BPM、Cメジャー、木琴風メロディ、柔らかいパッド、控えめなベースによる15秒のほのぼのBGM
- Ending chord progression: `Cmaj7 → Fmaj7 → Am7 → Gsus4/G → C6`

## Generate WAV

```bash
node 8_arts/rikemen-channel-audio/generate-audio.mjs
```

## Generate MP3

```bash
ffmpeg -i 8_arts/rikemen-opening/audio/rikemen-opening-5s.wav \
  -c:a libmp3lame -b:a 320k \
  8_arts/rikemen-opening/audio/rikemen-opening-5s.mp3

ffmpeg -i 8_arts/rikemen-ending/audio/rikemen-ending-cozy-15s.wav \
  -c:a libmp3lame -b:a 320k \
  8_arts/rikemen-ending/audio/rikemen-ending-cozy-15s.mp3
```
