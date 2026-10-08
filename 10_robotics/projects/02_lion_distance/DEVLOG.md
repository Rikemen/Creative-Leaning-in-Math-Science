# 開発ログ (DEVLOG) - ライオンプロジェクト

## タスクリスト

### Phase 1: PC側モック開発
- [x] ディレクトリ構造の作成
- [x] `index.html`, `sketch.js` (p5.js UI) の作成
- [x] 擬似的な音声再生 (Oscillator) の実装 (音声ファイル差し替えまで)
- [x] `mock-server/server.js` (ダミーWebSocketサーバー) の作成

### Phase 2: ESP32 シミュレーション開発 (ブラウザ版Wokwiを使用)
- [ ] ESP32用 `lion_distance.ino` の作成 (距離センサーロジック・ステートマシン)
- [ ] Wi-Fi/WebSocket 通信処理の実装
- [ ] ブラウザ版Wokwi (https://wokwi.com) でのシミュレーションテスト

### Phase 3: 実機連携
- [ ] 実機配線
- [ ] センサーノイズのフィルタリング処理調整
- [ ] 最終結合テスト
