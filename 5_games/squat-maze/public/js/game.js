// ──────────────────────────────────────────────
// Squat Maze — ゲーム本体（エントリポイント）
// p5.js インスタンスモードで動作する。
// game.html が <script type="module"> で読み込む。
//
// 各モジュールに責務を委譲し、ここではゲームループの
// 骨格（setup / draw / keyPressed / リセット）のみを管理する。
// UI の DOM 操作は overlay-ui.js に集約している。
// ──────────────────────────────────────────────

import { Player } from './game/player.js';
import { Walls } from './game/walls.js';
import { Obstacles } from './game/obstacles.js';
import { checkWallCollision, checkObstacleCollision } from './game/collision.js';
import { drawHUD, drawHitFlash } from './game/hud.js';
import { drawReadyScreen, drawGameOverScreen, drawNicknameScreen } from './game/screens.js';
import { initPoseTracker, getNoseY, onResizePoseTracker } from './game/pose-tracker.js';
import { fetchTop10Scores, isRankedIn, saveScoreToFirestore } from './game/score-saver.js';
import { getScrollSpeed } from './game/difficulty.js';
import { initSounds, playSelect, playBGM, stopBGM, playHit, playDeath } from './game/sound-manager.js';
import {
  showNicknameUI, removeNicknameUI,
  showGameOverButtons, removeGameOverButtons
} from './game/overlay-ui.js';
import {
  BACKGROUND_COLOR,
  HIT_FLASH_DURATION
} from './game/constants.js';

const sketch = (p) => {
  // ── ゲーム状態: "ready" → "playing" → "nickname" or "gameover" ──
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

    // サウンドの読み込み（失敗してもゲームは継続する）
    await initSounds();

    // 全初期化完了: ローディング画面を除去
    document.getElementById('loading-screen')?.remove();
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
      case 'nickname':
        drawNicknameScreen(p, score);
        break;
      case 'gameover':
        drawGameOverScreen(p, score);
        break;
    }
  };

  // ────────────────────────────────
  // Playing 状態の更新
  // ────────────────────────────────
  function updatePlaying() {
    // スコアに連動した動的スクロール速度を取得
    const scrollSpeed = getScrollSpeed(score);

    // 壁の難易度（通路幅の最低保証比率）をスコアから更新
    walls.updateDifficulty(score);
    // 障害物の難易度（高さの上限）をスコアから更新
    obstacles.updateDifficulty(score);

    walls.update(scrollSpeed);
    obstacles.update(scrollSpeed);

    // 姿勢推定の鼻座標でプレイヤー位置を更新（取得できなければマウスで代替）
    const noseY = getNoseY();
    player.updatePosition(noseY !== null ? noseY : p.mouseY);
    player.update();

    // スコア加算（移動距離 = スクロール速度の累計）
    score += scrollSpeed;

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
          stopBGM();
          playDeath();
          // ランキング判定を非同期で行い、結果に応じて状態を分岐
          handleGameOver();
        } else {
          playHit();
        }
      }
    }
  }

  /**
   * ゲームオーバー時のランキング判定と状態遷移を行う。
   * Firestore から上位10件を取得し、ランクインなら nickname 画面へ、
   * そうでなければ通常の gameover 画面へ遷移する。
   */
  async function handleGameOver() {
    const finalScore = Math.floor(score);

    try {
      const top10 = await fetchTop10Scores();
      if (isRankedIn(finalScore, top10)) {
        gameState = 'nickname';
        showNicknameUI(
          async (nickname) => {
            removeNicknameUI();
            await saveScoreToFirestore(finalScore, nickname);
            transitionToGameOver();
          },
          playSelect
        );
        return;
      }
    } catch (error) {
      console.warn('ランキング判定に失敗（通常ゲームオーバーに遷移）:', error);
    }

    // 10位圏外 or 判定失敗: 通常ゲームオーバー（スコア保存なし）
    transitionToGameOver();
  }

  /** ゲームオーバー画面への共通遷移処理 */
  function transitionToGameOver() {
    gameState = 'gameover';
    showGameOverButtons(
      () => { playSelect(); resetGame(); },
      () => { playSelect(); window.location.href = './index.html'; },
      playSelect
    );
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
          playSelect();
          playBGM();
          gameState = 'playing';
          break;
        case 'gameover':
          playSelect();
          resetGame();
          break;
        // nickname 状態では Space を無視（入力フィールドが受け取る）
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
    removeNicknameUI();
    removeGameOverButtons();
    playBGM();
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
