// ──────────────────────────────────────────────
// Squat Maze — ゲーム本体（エントリポイント）
// p5.js インスタンスモードで動作する。
// game.html が <script type="module"> で読み込む。
// ──────────────────────────────────────────────

import { Player } from './game/player.js';
import { Walls } from './game/walls.js';
import { Obstacles } from './game/obstacles.js';
import { checkWallCollision, checkObstacleCollision } from './game/collision.js';
import {
  BACKGROUND_COLOR,
  HIT_FLASH_DURATION,
  INITIAL_LIVES,
  LIFE_BAR_WIDTH,
  LIFE_BAR_HEIGHT,
  LIFE_BAR_GAP,
  LIFE_BAR_MARGIN_X,
  LIFE_BAR_MARGIN_BOTTOM,
  SCROLL_SPEED,
  SCORE_MARGIN_X,
  SCORE_MARGIN_BOTTOM
} from './game/constants.js';

const sketch = (p) => {
  // ── ゲーム状態: "ready" → "playing" → "gameover" ──
  let gameState = 'ready';

  // ── プレイヤー ──
  let player;

  // ── 壁 ──
  let walls;

  // ── 障害物 ──
  let obstacles;

  // ── 被弾フラッシュ演出 ──
  let flashTimer = 0;

  // ── スコア（移動距離の累計） ──
  let score = 0;

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
    player.update(); // 無敵タイマーの更新

    // ── スコア加算（移動距離 = スクロール速度の累計） ──
    score += SCROLL_SPEED;

    // ── 当たり判定 ──
    checkCollisions();

    // ── フラッシュタイマー ──
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
        if (dead) gameState = 'gameover';
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
    drawHUD();

    // 被弾時の赤フラッシュオーバーレイ（HUD より上に重ねる）
    if (flashTimer > 0) {
      drawHitFlash();
    }
  }

  /**
   * 画面左下にライフ HUD を描画する。
   * 「LIFE:」ラベルの右に縦バーを並べ、残ライフを白、失ったライフを暗灰色で表示。
   */
  function drawHUD() {
    p.push();
    p.drawingContext.shadowBlur = 0;
    p.drawingContext.shadowColor = 'transparent';

    // ── ラベル ──
    p.fill(255);
    p.noStroke();
    p.textAlign(p.LEFT, p.BOTTOM);
    p.textSize(9);
    p.textStyle(p.BOLD);
    // レタースペーシングを広めに（トラッキング）
    p.drawingContext.letterSpacing = '2px';
    const labelX = LIFE_BAR_MARGIN_X;
    const baseY = p.height - LIFE_BAR_MARGIN_BOTTOM;
    p.text('LIFE:', labelX, baseY);
    p.drawingContext.letterSpacing = '0px';

    // ── バー描画 ──
    const barStartX = labelX + p.textWidth('LIFE:') + 10;
    for (let i = 0; i < INITIAL_LIVES; i++) {
      const barX = barStartX + i * (LIFE_BAR_WIDTH + LIFE_BAR_GAP);
      if (i < player.lives) {
        // 残ライフ: 白バー + グロー
        p.drawingContext.shadowBlur = 6;
        p.drawingContext.shadowColor = 'rgba(255,255,255,0.6)';
        p.fill(255);
      } else {
        // 失ったライフ: 暗いバー（グロー無し）
        p.drawingContext.shadowBlur = 0;
        p.drawingContext.shadowColor = 'transparent';
        p.fill(60);
      }
      p.rect(barX, baseY - LIFE_BAR_HEIGHT, LIFE_BAR_WIDTH, LIFE_BAR_HEIGHT);
    }

    p.drawingContext.shadowBlur = 0;

    // ── スコア表示（画面右下） ──
    drawScoreHUD();

    p.pop();
  }

  /**
   * 画面右下にスコア（移動距離）をゼロ埋め 6 桁で表示する。
   * ライフ HUD（左下）と対称的な位置に配置。
   */
  function drawScoreHUD() {
    const label = 'SCORE:';
    const value = String(Math.floor(score)).padStart(6, '0');

    p.fill(255);
    p.noStroke();
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.textSize(9);
    p.textStyle(p.BOLD);
    p.drawingContext.letterSpacing = '2px';

    const baseX = p.width - SCORE_MARGIN_X;
    const baseY = p.height - SCORE_MARGIN_BOTTOM;
    p.text(`${label} ${value}`, baseX, baseY);

    p.drawingContext.letterSpacing = '0px';
  }

  /** 画面全体を赤く一瞬フラッシュさせる演出 */
  function drawHitFlash() {
    p.push();
    p.noStroke();
    // 壁のglow描画で設定されたシャドウを明示的にリセット
    p.drawingContext.shadowBlur = 0;
    p.drawingContext.shadowColor = 'transparent';
    // フラッシュの透明度をタイマーに連動（最初が最も強く、徐々にフェードアウト）
    const alpha = p.map(flashTimer, 0, HIT_FLASH_DURATION, 0, 1);
    p.fill(255, 50, 50, alpha * 150);
    p.rect(0, 0, p.width, p.height);
    p.pop();
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
    flashTimer = 0;
    score = 0;
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
