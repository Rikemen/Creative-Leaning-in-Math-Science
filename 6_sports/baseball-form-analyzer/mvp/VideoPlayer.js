/**
 * VideoPlayer - p5.js 上で動画の読み込み・表示・再生制御・コマ送りを管理するクラス
 *
 * 複数インスタンスを生成すれば、キャンバス内の異なる領域に動画を並べて表示できる。
 *
 * 使用例:
 *   const player = new VideoPlayer("/assets/movies/swing.MOV", 0, 0, 400, 400);
 *   await player.load();   // setup() 内で呼ぶ
 *   player.draw();          // draw() 内で呼ぶ
 */
class VideoPlayer {
  /** @type {number} コマ送り1ステップの秒数 */
  static STEP_SECONDS = 0.035;

  /** @type {number} キーポイントの信頼度閾値（これ未満は描画しない） */
  static CONFIDENCE_THRESHOLD = 0.3;

  /** @type {string[]} 表示モードの定義（ボタンで順にサイクルする） */
  static DISPLAY_MODES = ["both", "skeleton", "video"];

  /** @type {Object<string, string>} 各モードのボタンラベル（現在のモードを示す） */
  static DISPLAY_MODE_LABELS = {
    both: "🦴+🎬",
    skeleton: "🦴",
    video: "🎬",
  };

  /**
   * @param {string} path - 動画ファイルのパス
   * @param {number} x - 描画領域の左上X座標
   * @param {number} y - 描画領域の左上Y座標
   * @param {number} areaWidth - 描画領域の幅
   * @param {number} areaHeight - 描画領域の高さ
   */
  constructor(path, x, y, areaWidth, areaHeight) {
    this.path = path;
    this.x = x;
    this.y = y;
    this.areaWidth = areaWidth;
    this.areaHeight = areaHeight;

    // 読み込み後に確定する状態
    this.video = null;
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.playing = false;

    // UIボタン群のコンテナとボタン
    this.controlsContainer = null;
    this.playButton = null;
    this.backButton = null;
    this.forwardButton = null;
    this.displayModeButton = null;

    // bodyPose関連
    this.bodyPose = null;
    this.connections = [];
    this.poses = [];
    this.isDetecting = false;

    // 表示モード: "both"（動画+骨格）, "skeleton"（骨格のみ）, "video"（動画のみ）
    this.displayMode = "both";
  }

  // ──────────────── ライフサイクル ────────────────

  /**
   * 動画を読み込み、ボタンを生成して自動再生を開始する。
   * setup() 内で await して呼ぶこと。
   * @param {ml5.BodyPose} bodyPose - PoseNetモデル
   */
  async load(bodyPose) {
    this.video = await this._loadVideoAsync(this.path);
    this._calculateDisplaySize();
    this.video.volume(0);
    this.video.hide();
    this.video.loop();
    this.playing = true;

    this._createControls();

    // bodyPoseモデルを保持（detectはdraw()ループ内で毎フレーム呼ぶ）
    this.bodyPose = bodyPose;
    this.connections = bodyPose.getSkeleton();

    // 動画のフレームデータが準備されるまで待機（GPU texture エラー回避）
    await this._waitForVideoReady();
  }

  // ──────────────── 描画 ────────────────

  /** キャンバスの描画領域に動画をアスペクト比維持で中央配置し、表示モードに応じて描画する */
  draw() {
    if (!this.video) return;

    const showVideo = this.displayMode !== "skeleton";
    const showSkeleton = this.displayMode !== "video";

    // 動画フレームは常にキャンバスへ転送する（detect() がGPUテクスチャを必要とするため）
    image(this.video, this.offsetX, this.offsetY, this.displayWidth, this.displayHeight);

    // 骨格のみモード：動画の上を黒で塗りつぶして隠す
    if (!showVideo) {
      push();
      fill(0);
      noStroke();
      rect(this.x, this.y, this.areaWidth, this.areaHeight);
      pop();
    }

    if (showSkeleton) {
      this._drawPose();
    }

    // 検出はモードに関係なく常に動かす（切替時に即座に骨格が表示されるように）
    this._detectPose();
  }

  // ──────────────── 表示モード切り替え ────────────────

  /** 表示モードを both → skeleton → video → both … の順にサイクルする */
  toggleDisplayMode() {
    const modes = VideoPlayer.DISPLAY_MODES;
    const currentIndex = modes.indexOf(this.displayMode);
    this.displayMode = modes[(currentIndex + 1) % modes.length];
    this.displayModeButton.html(VideoPlayer.DISPLAY_MODE_LABELS[this.displayMode]);
  }

  // ──────────────── 再生制御 ────────────────

  /** 再生 ⇔ 停止を切り替える */
  togglePlay() {
    if (this.playing) {
      this.video.pause();
      this.playButton.html("play");
      this._setStepButtonsVisible(true);
    } else {
      this.video.play();
      this.playButton.html("pause");
      this._setStepButtonsVisible(false);
    }
    this.playing = !this.playing;
  }

  /** コマ送り/戻しボタンの表示を切り替える（レイアウトを崩さず visibility で制御） */
  _setStepButtonsVisible(visible) {
    const value = visible ? "visible" : "hidden";
    this.backButton.style("visibility", value);
    this.forwardButton.style("visibility", value);
  }

  /**
   * 指定秒数だけ再生位置を移動する（コマ送り / コマ戻し）
   * 再生中は無視される。
   * @param {number} deltaSec - 移動量（正:進む / 負:戻る）
   */
  step(deltaSec) {
    if (this.playing) return;

    const duration = this.video.duration();
    const clamped = Math.max(
      0,
      Math.min(duration, this.video.time() + deltaSec),
    );
    this.video.time(clamped);
  }

  // ──────────────── 内部メソッド（初期化系） ────────────────

  /** createVideo を Promise 化し、ロード完了まで待機可能にする */
  _loadVideoAsync(filePath) {
    return new Promise((resolve) => {
      const vid = createVideo([filePath], () => resolve(vid));
    });
  }

  /** 動画の最初のフレームが描画可能になるまで待機する（GPU texture エラー回避） */
  _waitForVideoReady() {
    return new Promise((resolve) => {
      const videoEl = this.video.elt;
      if (videoEl.readyState >= 2) {
        resolve();
        return;
      }
      videoEl.addEventListener("loadeddata", () => resolve(), { once: true });
    });
  }

  /**
   * 動画を描画領域内にアスペクト比を維持して収める表示サイズと、
   * キャンバス上のオフセット・スケール係数を算出する。
   * load() 時に1回だけ呼ばれ、以降は draw() で使い回す。
   */
  _calculateDisplaySize() {
    const videoAspect = this.video.width / this.video.height;
    const areaAspect = this.areaWidth / this.areaHeight;

    if (videoAspect > areaAspect) {
      this.displayWidth = this.areaWidth;
      this.displayHeight = this.areaWidth / videoAspect;
    } else {
      this.displayWidth = this.areaHeight * videoAspect;
      this.displayHeight = this.areaHeight;
    }

    // 描画時に毎フレーム再計算しなくて済むよう、ここで確定させる
    this.offsetX = this.x + (this.areaWidth - this.displayWidth) / 2;
    this.offsetY = this.y + (this.areaHeight - this.displayHeight) / 2;
    this.scaleX = this.displayWidth / this.video.width;
    this.scaleY = this.displayHeight / this.video.height;
  }

  /** 再生/停止・コマ送り・コマ戻しボタンを生成し、動画パネルの真下に配置する */
  _createControls() {
    // ボタンをまとめるコンテナ div を作成（flexbox で横1行に並べる）
    this.controlsContainer = createDiv("");
    this.controlsContainer.style("display", "flex");
    this.controlsContainer.style("justify-content", "center");
    this.controlsContainer.style("gap", "4px");
    this.controlsContainer.style("width", this.areaWidth + "px");

    // キャンバスの位置を基準に、動画パネルの真下に絶対配置
    const canvasRect = document.querySelector("canvas").getBoundingClientRect();
    const posX = canvasRect.left + this.x;
    const posY = canvasRect.top + this.y + this.areaHeight;
    this.controlsContainer.position(posX, posY);

    // ボタンの並び順: [◀︎] [pause] [▶︎]
    this.backButton = createButton("◀︎");
    this.backButton.mousePressed(() => this.step(-VideoPlayer.STEP_SECONDS));
    this.backButton.style("visibility", "hidden");
    this.backButton.parent(this.controlsContainer);

    this.playButton = createButton("pause");
    this.playButton.mousePressed(() => this.togglePlay());
    this.playButton.parent(this.controlsContainer);

    this.forwardButton = createButton("▶︎");
    this.forwardButton.mousePressed(() => this.step(VideoPlayer.STEP_SECONDS));
    this.forwardButton.style("visibility", "hidden");
    this.forwardButton.parent(this.controlsContainer);

    this.displayModeButton = createButton(VideoPlayer.DISPLAY_MODE_LABELS[this.displayMode]);
    this.displayModeButton.mousePressed(() => this.toggleDisplayMode());
    this.displayModeButton.parent(this.controlsContainer);
  }

  // ──────────────── 内部メソッド（描画・検出系） ────────────────

  /**
   * 検出された骨格をキャンバス上に描画する。
   * push/pop で描画設定を保護し、他の描画処理への影響を防ぐ。
   */
  _drawPose() {
    if (this.poses.length === 0) return;

    push();
    for (const pose of this.poses) {
      const keypoints = pose.keypoints;

      // ── 骨格線を描画 ──
      stroke(0, 255, 100, 150);
      strokeWeight(2);
      for (const [indexA, indexB] of this.connections) {
        const pointA = keypoints[indexA];
        const pointB = keypoints[indexB];
        if (
          pointA.confidence < VideoPlayer.CONFIDENCE_THRESHOLD ||
          pointB.confidence < VideoPlayer.CONFIDENCE_THRESHOLD
        ) continue;

        line(
          this.offsetX + pointA.x * this.scaleX,
          this.offsetY + pointA.y * this.scaleY,
          this.offsetX + pointB.x * this.scaleX,
          this.offsetY + pointB.y * this.scaleY,
        );
      }

      // ── キーポイント（関節点）を描画 ──
      fill(0, 255, 100);
      noStroke();
      for (const kp of keypoints) {
        if (kp.confidence < VideoPlayer.CONFIDENCE_THRESHOLD) continue;
        circle(this.offsetX + kp.x * this.scaleX, this.offsetY + kp.y * this.scaleY, 8);
      }
    }
    pop();
  }

  /**
   * 1フレーム分の骨格検出を非同期で実行する。
   * 前回の検出が完了していなければスキップし、検出の重複を防ぐ。
   */
  async _detectPose() {
    if (!this.bodyPose || this.isDetecting) return;

    this.isDetecting = true;
    try {
      this.poses = await this.bodyPose.detect(this.video);
    } catch (error) {
      console.warn("骨格検出エラー:", error);
    }
    this.isDetecting = false;
  }
}
