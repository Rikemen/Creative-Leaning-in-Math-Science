let lionState = "UNKNOWN"; // 'SLEEPING', 'ALERT', 'ROARING'
let prevState = "UNKNOWN";
let socket;
let isStarted = false;

// 擬似的な咆哮音用のオシレーター
let roarOsc;
let roarEnv;

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  
  // スタートボタンの処理
  const startOverlay = document.getElementById('start-overlay');
  startOverlay.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    isStarted = true;
    
    // Audio Contextを開始
    userStartAudio();
    initAudio();
    
    // WebSocket接続の開始
    connectWebSocket();
  });
}

function initAudio() {
  // 擬似的な吠える音を作るための設定
  roarOsc = new p5.Oscillator('sawtooth');
  roarEnv = new p5.Envelope();
  
  // エンベロープの設定 (attackTime, decayTime, suspendRatio, releaseTime)
  roarEnv.setADSR(0.1, 0.5, 0.1, 0.5);
  // (attackLevel, releaseLevel)
  roarEnv.setRange(0.8, 0);
  
  roarOsc.start();
  roarOsc.amp(roarEnv);
  // 低い音に設定
  roarOsc.freq(80);
}

function playRoar() {
  if (isStarted && roarOsc && roarEnv) {
    // 荒々しい音にするため周波数を少し揺らす（簡易的）
    roarOsc.freq(80 + random(-20, 20));
    roarEnv.play();
  }
}

function connectWebSocket() {
  socket = new WebSocket('ws://localhost:8080');
  
  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };
  
  socket.onmessage = (event) => {
    const newState = event.data;
    console.log('Received state:', newState);
    
    // 状態が有効なものか確認
    if (['SLEEPING', 'ALERT', 'ROARING'].includes(newState)) {
      lionState = newState;
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed. Reconnecting in 3s...');
    // 切断されたら3秒後に再接続
    setTimeout(connectWebSocket, 3000);
  };
}

function draw() {
  background(30);
  
  if (!isStarted) {
    return;
  }
  
  // 状態が変わった時のエッジ検出処理
  if (lionState !== prevState) {
    if (lionState === 'ROARING') {
      playRoar();
    }
    prevState = lionState;
  }
  
  // 状態に応じた描画
  push();
  translate(width / 2, height / 2);
  
  if (lionState === 'SLEEPING') {
    background(20, 20, 50); // 暗い青系
    fill(100, 100, 200);
    textSize(100);
    text("😴", 0, -20);
    fill(255);
    textSize(24);
    text("SLEEPING (遠距離: 2m〜)", 0, 80);
  } else if (lionState === 'ALERT') {
    background(150, 100, 20); // 警戒のオレンジ系
    fill(255, 200, 50);
    textSize(100);
    text("🤨", 0, -20);
    fill(255);
    textSize(24);
    text("ALERT (中距離: 1m〜2m)", 0, 80);
  } else if (lionState === 'ROARING') {
    background(150, 20, 20); // 威嚇の赤系
    fill(255, 50, 50);
    textSize(120);
    // 激しく揺らす
    translate(random(-5, 5), random(-5, 5));
    text("🦁", 0, -20);
    fill(255);
    textSize(24);
    text("ROARING! (近距離: 〜1m)", 0, 80);
  } else {
    fill(255);
    textSize(24);
    text("Waiting for connection...", 0, 0);
  }
  pop();
}
