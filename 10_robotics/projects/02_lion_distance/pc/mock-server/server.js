const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('Mock WebSocket server started on ws://localhost:8080');

const states = ['SLEEPING', 'ALERT', 'ROARING'];
let currentStateIndex = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // 初期状態を送信
  ws.send(states[currentStateIndex]);
  
  // 定期的に状態を変化させて送信する (3秒に1回)
  const intervalId = setInterval(() => {
    // 順番に状態を変える
    currentStateIndex = (currentStateIndex + 1) % states.length;
    const nextState = states[currentStateIndex];
    
    console.log(`Sending state: ${nextState}`);
    ws.send(nextState);
  }, 3000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
  });
});
