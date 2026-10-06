const WebSocket = require('ws');

// ESP32と同じポート番号（81）で待ち受ける
// MacOS環境等で権限エラーが出る場合は 8081 などに変更してください
const PORT = 81;

const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock WebSocket server is running on ws://localhost:${PORT}`);

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    // 送信されてきた角度（バッファの場合があるため文字列化）
    console.log(`Received angle: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

wss.on('error', (error) => {
  console.error(`WebSocket Server Error:`, error);
  if (error.code === 'EACCES') {
    console.error(`Port ${PORT} requires admin privileges. Please change to 8081 in server.js and sketch.js.`);
  }
});
