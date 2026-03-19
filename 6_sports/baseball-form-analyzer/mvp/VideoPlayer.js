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
    both: "Both",
    skeleton: "Skeleton",
    video: "Video",
  };

  /** @type {number} ニューモーフィズム枠の角丸半径 */
  static BORDER_RADIUS = 16;

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

    // cover トリミング用のソース切り出し座標
    this.srcX = 0;
    this.srcY = 0;
    this.srcW = 0;
    this.srcH = 0;

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

  /**
   * 描画領域を更新し、表示サイズとボタン位置を再計算する。
   * windowResized() から呼ばれることを想定。
   */
  resize(x, y, areaWidth, areaHeight) {
    this.x = x;
    this.y = y;
    this.areaWidth = areaWidth;
    this.areaHeight = areaHeight;

    if (this.video) {
      this._calculateDisplaySize();
    }
    this._repositionControls();
  }

  // ──────────────── 描画 ────────────────

  /** キャンバスの描画領域に動画をアスペクト比維持で中央配置し、表示モードに応じて描画する */
  draw() {
    if (!this.video) return;

    const showVideo = this.displayMode !== "skeleton";
    const showSkeleton = this.displayMode !== "video";
    const r = VideoPlayer.BORDER_RADIUS;

    // ── ニューモーフィズム枠を描画（影 + 角丸） ──
    this._drawFrame();

    // ── クリッピングマスクで角丸内に動画を収める ──
    push();
    drawingContext.save();
    this._clipRoundedRect(this.x, this.y, this.areaWidth, this.areaHeight, r);

    // 動画フレームは常に転送する（detect() が GPU テクスチャを必要とするため）
    // 9引数の image() でソース領域を指定し、cover トリミングを実現
    image(
      this.video,
      this.x, this.y, this.areaWidth, this.areaHeight,
      this.srcX, this.srcY, this.srcW, this.srcH,
    );

    // 骨格のみモード：動画の上をベースカラーで塗りつぶして隠す
    if (!showVideo) {
      fill(224, 229, 236);
      noStroke();
      rect(this.x, this.y, this.areaWidth, this.areaHeight);
    }

    if (showSkeleton) {
      this._drawPose();
      this._drawAngleArcs();
    }

    drawingContext.restore();
    pop();

    // 角度情報はモードに関係なく常に（クリップ外に）表示する
    this._drawAngles();

    // 検出はモードに関係なく常に動かす
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
      this.playButton.html("Play");
      this._setStepButtonsVisible(true);
    } else {
      this.video.play();
      this.playButton.html("Pause");
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

  /**
   * ボタンコンテナの幅と位置をパネルに合わせて更新する。
   * 初期化時・リサイズ時の両方で呼ばれる。
   */
  _repositionControls() {
    if (!this.controlsContainer) return;

    this.controlsContainer.style("width", this.areaWidth + "px");
    const canvasRect = document.querySelector("canvas").getBoundingClientRect();
    const posX = canvasRect.left + this.x;
    const posY = canvasRect.top + this.y + this.areaHeight;
    this.controlsContainer.position(posX, posY);
  }

  /**
   * ニューモーフィズムスタイルの枠を描画する。
   * 左上に白い影（ハイライト）、右下に暗い影（シャドウ）を付けた角丸矩形。
   */
  _drawFrame() {
    const r = VideoPlayer.BORDER_RADIUS;
    const ctx = drawingContext;

    push();
    noStroke();
    fill(224, 229, 236);

    // 右下の暗い影
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(163, 177, 198, 0.6)";
    rect(this.x, this.y, this.areaWidth, this.areaHeight, r);

    // 左上の明るい影（重ねて描画）
    ctx.shadowOffsetX = -6;
    ctx.shadowOffsetY = -6;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    rect(this.x, this.y, this.areaWidth, this.areaHeight, r);

    // 影をリセット
    ctx.shadowColor = "transparent";
    pop();
  }

  /**
   * Canvas2D のクリッピングパスとして角丸矩形を設定する。
   * drawingContext.save() / restore() と組み合わせて使う。
   */
  _clipRoundedRect(x, y, w, h, r) {
    const ctx = drawingContext;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();
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
   * cover 方式でパネルを埋めるソース切り出し範囲と、
   * キーポイント→キャンバス座標変換用のスケール/オフセットを算出する。
   * パネル全体を隙間なく埋めつつ、アスペクト比を維持する。
   */
  _calculateDisplaySize() {
    const videoW = this.video.width;
    const videoH = this.video.height;
    const videoAspect = videoW / videoH;
    const areaAspect = this.areaWidth / this.areaHeight;

    // cover 方式: パネルを埋めるため「大きい方」に合わせてはみ出しをトリミング
    if (videoAspect > areaAspect) {
      // 動画が横長 → 高さを合わせ、横をトリミング
      this.srcH = videoH;
      this.srcW = videoH * areaAspect;
      this.srcX = (videoW - this.srcW) / 2;
      this.srcY = 0;
    } else {
      // 動画が縦長 → 幅を合わせ、縦をトリミング
      this.srcW = videoW;
      this.srcH = videoW / areaAspect;
      this.srcX = 0;
      this.srcY = (videoH - this.srcH) / 2;
    }

    // cover 方式ではパネル全体 = 表示領域
    this.displayWidth = this.areaWidth;
    this.displayHeight = this.areaHeight;
    this.offsetX = this.x;
    this.offsetY = this.y;

    // キーポイントのスケール: 元動画のソース切り出し領域 → パネル領域
    this.scaleX = this.areaWidth / this.srcW;
    this.scaleY = this.areaHeight / this.srcH;
  }

  /** 再生/停止・コマ送り・コマ戻しボタンを生成し、動画パネルの真下に配置する */
  _createControls() {
    this.controlsContainer = createDiv("");
    this.controlsContainer.addClass("neumorphic-controls");

    // 初期配置
    this._repositionControls();

    // ボタンの並び順: [Prev] [Pause] [Next] [Both]
    this.backButton = createButton("Prev");
    this.backButton.addClass("neumorphic-btn");
    this.backButton.mousePressed(() => this.step(-VideoPlayer.STEP_SECONDS));
    this.backButton.style("visibility", "hidden");
    this.backButton.parent(this.controlsContainer);

    this.playButton = createButton("Pause");
    this.playButton.addClass("neumorphic-btn");
    this.playButton.mousePressed(() => this.togglePlay());
    this.playButton.parent(this.controlsContainer);

    this.forwardButton = createButton("Next");
    this.forwardButton.addClass("neumorphic-btn");
    this.forwardButton.mousePressed(() => this.step(VideoPlayer.STEP_SECONDS));
    this.forwardButton.style("visibility", "hidden");
    this.forwardButton.parent(this.controlsContainer);

    this.displayModeButton = createButton(VideoPlayer.DISPLAY_MODE_LABELS[this.displayMode]);
    this.displayModeButton.addClass("neumorphic-btn");
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
          this.offsetX + (pointA.x - this.srcX) * this.scaleX,
          this.offsetY + (pointA.y - this.srcY) * this.scaleY,
          this.offsetX + (pointB.x - this.srcX) * this.scaleX,
          this.offsetY + (pointB.y - this.srcY) * this.scaleY,
        );
      }

      // ── キーポイント（関節点）を描画 ──
      fill(0, 255, 100);
      noStroke();
      for (const kp of keypoints) {
        if (kp.confidence < VideoPlayer.CONFIDENCE_THRESHOLD) continue;
        circle(
          this.offsetX + (kp.x - this.srcX) * this.scaleX,
          this.offsetY + (kp.y - this.srcY) * this.scaleY,
          8,
        );
      }
    }
    pop();
  }

  /**
   * 検出された骨格から関節角度を算出し、パネル下部のテキストエリアに描画する。
   * 信頼度不足のキーポイントを含む角度は "--" で表示する。
   */
  _drawAngles() {
    if (this.poses.length === 0) return;

    const keypoints = this.poses[0].keypoints;
    const angles = calculatePoseAngles(keypoints, VideoPlayer.CONFIDENCE_THRESHOLD);

    push();
    fill(80);
    noStroke();
    textSize(13);
    textFont('Inter');

    // パネル直下の角度表示エリアに描画（ANGLE_DISPLAY_HEIGHT は sketch.js で定義）
    const baseY = this.y + this.areaHeight + 6;
    const colWidth = this.areaWidth / 2;

    angles.forEach((entry, index) => {
      // 左3項目を左列、右3項目を右列に配置
      const col = index < 3 ? 0 : 1;
      const row = index % 3;
      const displayValue = entry.angle !== null ? `${entry.angle}°` : "--";

      text(
        `${entry.label}: ${displayValue}`,
        this.x + col * colWidth + 8,
        baseY + row * 16,
      );
    });
    pop();
  }

  /** @type {number} 円弧の半径（キャンバス上のピクセル） */
  static ARC_RADIUS = 22;

  /**
   * 骨格の各関節頂点に円弧と角度値を直接描画する。
   * 添付画像のように弧を頂点に描き、角度数値を弧の外側に配置する。
   */
  _drawAngleArcs() {
    if (this.poses.length === 0) return;

    const keypoints = this.poses[0].keypoints;
    const threshold = VideoPlayer.CONFIDENCE_THRESHOLD;
    const r = VideoPlayer.ARC_RADIUS;

    push();
    for (const def of ANGLE_DEFINITIONS) {
      const kpA = keypoints[def.pointA];
      const kpB = keypoints[def.vertex];
      const kpC = keypoints[def.pointC];

      if (
        kpA.confidence < threshold ||
        kpB.confidence < threshold ||
        kpC.confidence < threshold
      ) continue;

      // キャンバス座標に変換（cover トリミングの srcX/srcY オフセットを適用）
      const bx = this.offsetX + (kpB.x - this.srcX) * this.scaleX;
      const by = this.offsetY + (kpB.y - this.srcY) * this.scaleY;
      const ax = this.offsetX + (kpA.x - this.srcX) * this.scaleX;
      const ay = this.offsetY + (kpA.y - this.srcY) * this.scaleY;
      const cx = this.offsetX + (kpC.x - this.srcX) * this.scaleX;
      const cy = this.offsetY + (kpC.y - this.srcY) * this.scaleY;

      // 頂点からの各ベクトル方向（ラジアン）
      const angleA = Math.atan2(ay - by, ax - bx);
      const angleC = Math.atan2(cy - by, cx - bx);

      // 短い方の弧を描くために start/stop を決定する
      let start = angleA;
      let stop = angleC;
      let diff = stop - start;

      // diff を [-π, π] に正規化して短い方を選ぶ
      while (diff < -Math.PI) diff += TWO_PI;
      while (diff > Math.PI) diff -= TWO_PI;

      if (diff < 0) {
        // angleA → angleC が反時計回りなので swap して時計回りに
        start = angleC;
        stop = angleA;
      } else {
        start = angleA;
        stop = angleA + diff;
      }

      // ── 円弧の描画 ──
      noFill();
      stroke(255, 220, 50, 220);
      strokeWeight(1.5);
      arc(bx, by, r * 2, r * 2, start, stop);

      // ── 角度数値を弧の中間方向に配置 ──
      const midAngle = start + (stop - start) / 2;
      const textR = r + 14;
      const tx = bx + textR * Math.cos(midAngle);
      const ty = by + textR * Math.sin(midAngle);

      const angleDeg = calculateAngle(kpA, kpB, kpC);
      if (angleDeg === null) continue;

      fill(255, 220, 50);
      noStroke();
      textSize(10);
      textAlign(CENTER, CENTER);
      text(`${angleDeg}°`, tx, ty);
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
