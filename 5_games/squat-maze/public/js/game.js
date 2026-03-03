// ──────────────────────────────────────────────
// Squat Maze — ゲーム本体（エントリポイント）
// p5.js インスタンスモードで動作する。
// game.html が <script type="module"> で読み込む。
// ──────────────────────────────────────────────

import { Player } from './game/player.js';
import { Walls } from './game/walls.js';
import { Obstacles } from './game/obstacles.js';
import { BACKGROUND_COLOR } from './game/constants.js';

const sketch = (p) => {
  // ── ゲーム状態: "ready" → "playing" → "gameover" ──
  let gameState = 'ready';

  // ── プレイヤー ──
  let player;

  // ── 壁 ──
  let walls;

  // ── 障害物 ──
  let obstacles;

  // ── setup ──
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('Inter');
    player = new Player(p);
    walls = new Walls(p);
    obstacles = new Obstacles(p);
  };

  // ── draw: 状態ごとに描画を分岐 ──
  p.draw = () => {
    p.background(BACKGROUND_COLOR);

    switch (gameState) {
      case 'ready':
        drawReadyScreen();
        break;
      case 'playing':
        updatePlaying();
        drawPlaying();
        break;
      case 'gameover':
        drawGameOverScreen();
        break;
    }
  };

  // ────────────────────────────────
  // Ready 画面
  // ────────────────────────────────
  function drawReadyScreen() {
    p.push();
    p.fill(255, 255, 255, 100 + 80 * p.sin(p.frameCount * 0.05));
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(10);
    p.textStyle(p.BOLD);

    // パルスするスタートメッセージ
    p.text('[ PRESS SPACE TO START ]', p.width / 2, p.height / 2);

    // タイトル
    p.fill(255);
    p.textSize(14);
    p.text('NAVIGATION ENGAGED', p.width / 2, p.height / 2 - 40);
    p.pop();
  }

  // ────────────────────────────────
  // Playing 状態の更新
  // ────────────────────────────────
  function updatePlaying() {
    walls.update();
    obstacles.update();
    player.updatePosition(p.mouseY);
  }

  // ────────────────────────────────
  // Playing 画面の描画
  // ────────────────────────────────
  function drawPlaying() {
    walls.draw();
    obstacles.draw();
    player.draw();
  }

  // ────────────────────────────────
  // Game Over 画面
  // ────────────────────────────────
  function drawGameOverScreen() {
    p.push();
    // 半透明オーバーレイ
    p.fill(0, 0, 0, 180);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);

    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(20);
    p.textStyle(p.BOLD);
    p.text('MISSION FAILED', p.width / 2, p.height / 2 - 20);

    p.textSize(10);
    p.fill(255, 255, 255, 100 + 80 * p.sin(p.frameCount * 0.05));
    p.text('[ PRESS SPACE TO RETRY ]', p.width / 2, p.height / 2 + 30);
    p.pop();
  }

  // ── キー入力 ──
  p.keyPressed = () => {
    if (p.key === ' ') {
      switch (gameState) {
        case 'ready':
          gameState = 'playing';
          break;
        case 'gameover':
          resetGame();
          break;
      }
    }
  };

  // ── ゲーム状態のリセット ──
  function resetGame() {
    gameState = 'playing';
    player.reset();
    walls.reset();
    obstacles.reset();
  }

  // ── ウィンドウリサイズ追従 ──
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    player.onResize();
    walls.onResize();
    obstacles.onResize();
  };
};

// p5 インスタンスを生成してキャンバスを <body> に挿入
new p5(sketch);
