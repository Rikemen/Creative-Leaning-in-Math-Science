// ──────────────────────────────────────────────
// Squat Maze — ゲーム本体（エントリポイント）
// p5.js インスタンスモードで動作する。
// game.html が <script type="module"> で読み込む。
//
// 各モジュールに責務を委譲し、ここではゲームループの
// 骨格（setup / draw / keyPressed / リセット）のみを管理する。
// ──────────────────────────────────────────────

import { Player } from './game/player.js';
import { Walls } from './game/walls.js';
import { Obstacles } from './game/obstacles.js';
import { checkWallCollision, checkObstacleCollision } from './game/collision.js';
import { drawHUD, drawHitFlash } from './game/hud.js';
import { drawReadyScreen, drawGameOverScreen } from './game/screens.js';
import { initPoseTracker, getNoseY, onResizePoseTracker } from './game/pose-tracker.js';
import { saveScoreToFirestore } from './game/score-saver.js';
import {
  BACKGROUND_COLOR,
  HIT_FLASH_DURATION,
  SCROLL_SPEED
} from './game/constants.js';

const sketch = (p) => {
  // ── ゲーム状態: "ready" → "playing" → "gameover" ──
  let gameState = 'ready';

  // ── ゲームオブジェクト ──
  let player;
  let walls;
  let obstacles;

  // ── 被弾フラッシュ演出 ──
  let flashTimer = 0;

  // ── スコア（移動距離の累計） ──
  let score = 0;

  // ── setup ──
  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('Inter');
    player = new Player(p);
    walls = new Walls(p);
    obstacles = new Obstacles(p);

    // カメラ + 姿勢推定の初期化
    await initPoseTracker(p);
  };

  // ── draw: 状態ごとに描画を分岐 ──
  p.draw = () => {
    p.background(BACKGROUND_COLOR);

    switch (gameState) {
      case 'ready':
        drawReadyScreen(p);
        break;
      case 'playing':
        updatePlaying();
        drawPlaying();
        break;
      case 'gameover':
        drawGameOverScreen(p);
        break;
    }
  };

  // ────────────────────────────────
  // Playing 状態の更新
  // ────────────────────────────────
  function updatePlaying() {
    walls.update();
    obstacles.update();

    // 姿勢推定の鼻座標でプレイヤー位置を更新（取得できなければマウスで代替）
    const noseY = getNoseY();
    player.updatePosition(noseY !== null ? noseY : p.mouseY);
    player.update();

    // スコア加算（移動距離 = スクロール速度の累計）
    score += SCROLL_SPEED;

    // 当たり判定
    checkCollisions();

    // フラッシュタイマー
    if (flashTimer > 0) flashTimer--;
  }

  /**
   * 壁・障害物との衝突を判定し、ヒット時に演出を発火する。
   * 無敵中はスキップされる（player.hit() が false を返す）。
   */
  function checkCollisions() {
    if (player.invincible) return;

    const hitWall = checkWallCollision(player, walls.topVertices, walls.bottomVertices);
    const hitObstacle = checkObstacleCollision(player, obstacles.blocks);

    if (hitWall || hitObstacle) {
      const { accepted, dead } = player.hit();
      if (accepted) {
        flashTimer = HIT_FLASH_DURATION;
        if (dead) {
          gameState = 'gameover';
          saveScoreToFirestore(Math.floor(score));
        }
      }
    }
  }

  // ────────────────────────────────
  // Playing 画面の描画
  // ────────────────────────────────
  function drawPlaying() {
    walls.draw();
    obstacles.draw();
    player.draw();
    drawHUD(p, player, score);

    // 被弾時の赤フラッシュオーバーレイ（HUD より上に重ねる）
    if (flashTimer > 0) {
      drawHitFlash(p, flashTimer);
    }
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
    flashTimer = 0;
    score = 0;
  }

  // ── ウィンドウリサイズ追従 ──
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    player.onResize();
    walls.onResize();
    obstacles.onResize();
    onResizePoseTracker(p);
  };
};

// p5 インスタンスを生成してキャンバスを <body> に挿入
new p5(sketch);
