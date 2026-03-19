/**
 * VideoPlayer - p5.js 上で動画の読み込み・表示・再生制御・コマ送りを管理するクラス
 *
 * 複数インスタンスを生成すれば、キャンバス内の異なる領域に動画を並べて表示できる。
 * 動画未読み込み時はプレースホルダを表示し、クリックまたはドラッグ&ドロップで
 * ローカルファイルを選択できる。
 *
 * 使用例:
 *   const player = new VideoPlayer(0, 0, 400, 400);
 *   player.init(bodyPose);   // setup() 内で呼ぶ（プレースホルダのみ表示）
 *   player.draw();           // draw() 内で呼ぶ
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
   * @param {number} x - 描画領域の左上X座標
   * @param {number} y - 描画領域の左上Y座標
   * @param {number} areaWidth - 描画領域の幅
   * @param {number} areaHeight - 描画領域の高さ
   */
  constructor(x, y, areaWidth, areaHeight) {
    this.x = x;
    this.y = y;
    this.areaWidth = areaWidth;
    this.areaHeight = areaHeight;

    // 読み込み後に確定する状態
    this.video = null;
    this.blobUrl = null;
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
    this.deleteButton = null;

    // bodyPose関連
    this.bodyPose = null;
    this.connections = [];
    this.poses = [];
    this.isDetecting = false;

    // 表示モード: "both"（動画+骨格）, "skeleton"（骨格のみ）, "video"（動画のみ）
    this.displayMode = "both";

    // ファイル入力要素（非表示、クリックで発火用）
    this.fileInput = null;

    // ドラッグオーバー中かどうか（プレースホルダのハイライト用）
    this.isDragOver = false;
  }

  // ──────────────── ライフサイクル ────────────────

  /**
   * bodyPose モデルを受け取り、ファイル選択UIを準備する。
   * 動画の読み込みはユーザーのファイル選択後に行われる。
   * setup() 内で呼ぶこと。
   * @param {ml5.BodyPose} bodyPose - bodyPoseモデル
   */
  init(bodyPose) {
    this.bodyPose = bodyPose;
    this.connections = bodyPose.getSkeleton();
    this._createFileInput();
    this._setupDragAndDrop();
    this._setupTapToUpload();
  }

  /**
   * ユーザーが選択したファイルから動画を読み込み、再生を開始する。
   * @param {File} file - ユーザーが選択した動画ファイル
   */
  async loadFromFile(file) {
    // 既存の動画があれば先に破棄する
    if (this.video) {
      this._disposeVideo();
    }

    // BlobURL を生成し、動画を読み込む
    this.blobUrl = URL.createObjectURL(file);
    this.video = await this._loadVideoAsync(this.blobUrl);

    this._calculateDisplaySize();
    this.video.volume(0);
    this.video.hide();
    this.video.loop();
    this.playing = true;

    this._createControls();

    // 動画のフレームデータが準備されるまで待機（GPU texture エラー回避）
    await this._waitForVideoReady();
  }

  /**
   * 動画・ボタン・骨格データをすべて破棄し、プレースホルダ表示に戻す。
   * Delete ボタンから呼ばれる。
   */
  unload() {
    this._disposeVideo();
    this._removeControls();
    this.poses = [];
    this.isDetecting = false;
    this.displayMode = "both";
    this.isDragOver = false;
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

  /** キャンバスの描画領域に動画またはプレースホルダを表示する */
  draw() {
    // 動画未読み込み → プレースホルダを描画
    if (!this.video) {
      this._drawFrame();
      this._drawPlaceholder();
      return;
    }

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
      this.x,
      this.y,
      this.areaWidth,
      this.areaHeight,
      this.srcX,
      this.srcY,
      this.srcW,
      this.srcH,
    );

    // 骨格のみモード：動画の上を黒で塗りつぶして隠す（骨格線の視認性を向上）
    if (!showVideo) {
      fill(0);
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
    this.displayModeButton.html(
      VideoPlayer.DISPLAY_MODE_LABELS[this.displayMode],
    );
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

  // ──────────────── ファイル選択・ドラッグ&ドロップ ────────────────

  /** 非表示の <input type="file"> を生成し、ファイル選択フローを構築する */
  _createFileInput() {
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = "video/mp4,video/quicktime,video/webm,video/*";
    this.fileInput.style.display = "none";
    document.body.appendChild(this.fileInput);

    this.fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this._onFileSelected(file);
      }
      // 同じファイルを再選択できるよう値をリセット
      this.fileInput.value = "";
    });
  }

  /** ドラッグ&ドロップのイベントをキャンバス上で監視する */
  _setupDragAndDrop() {
    const canvasEl = document.querySelector("canvas");
    if (!canvasEl) return;

    // ドラッグオーバー時にこのパネル上にいるかを判定する
    canvasEl.addEventListener("dragover", (event) => {
      event.preventDefault();
      // 動画読み込み済みのパネルにはドロップさせない
      if (this.video) return;

      if (this._isInsidePanel(event.clientX, event.clientY)) {
        this.isDragOver = true;
      } else {
        this.isDragOver = false;
      }
    });

    canvasEl.addEventListener("dragleave", () => {
      this.isDragOver = false;
    });

    canvasEl.addEventListener("drop", (event) => {
      event.preventDefault();
      this.isDragOver = false;
      // 動画読み込み済みなら無視
      if (this.video) return;

      if (this._isInsidePanel(event.clientX, event.clientY)) {
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("video/")) {
          this._onFileSelected(file);
        }
      }
    });
  }

  /**
   * クリック位置がこのパネル内にあるかどうかを判定する。
   * キャンバスの画面上の位置を考慮して判定する。
   */
  _isInsidePanel(clientX, clientY) {
    const canvasRect = document.querySelector("canvas").getBoundingClientRect();
    const localX = clientX - canvasRect.left;
    const localY = clientY - canvasRect.top;
    return (
      localX >= this.x &&
      localX <= this.x + this.areaWidth &&
      localY >= this.y &&
      localY <= this.y + this.areaHeight
    );
  }

  /**
   * キャンバスにネイティブ click イベントを設定し、タップでファイル選択を発火する。
   * p5.js の mousePressed() 経由だとユーザージェスチャの文脈が途切れ、
   * モバイルブラウザが fileInput.click() をブロックするため、直接バインドする。
   */
  _setupTapToUpload() {
    const canvasEl = document.querySelector("canvas");
    if (!canvasEl) return;

    canvasEl.addEventListener("click", (event) => {
      // 動画読み込み済みならファイル選択は不要
      if (this.video) return;

      if (this._isInsidePanel(event.clientX, event.clientY)) {
        this.fileInput.click();
      }
    });
  }

  /**
   * ファイル選択後のコールバック。BlobURL からの動画読み込みを開始する。
   * @param {File} file - 選択された動画ファイル
   */
  async _onFileSelected(file) {
    try {
      await this.loadFromFile(file);
    } catch (error) {
      console.error("動画の読み込みに失敗:", error);
    }
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

  // ──────────────── プレースホルダ描画 ────────────────

  /**
   * 動画未読み込み時にパネル内に表示するプレースホルダを描画する。
   * ニューモーフィズム枠内にアイコンとテキストを配置する。
   */
  _drawPlaceholder() {
    const r = VideoPlayer.BORDER_RADIUS;
    const centerX = this.x + this.areaWidth / 2;
    const centerY = this.y + this.areaHeight / 2;

    push();
    drawingContext.save();
    this._clipRoundedRect(this.x, this.y, this.areaWidth, this.areaHeight, r);

    // 背景
    const bgColor = this.isDragOver
      ? color(210, 220, 235)
      : color(224, 229, 236);
    fill(bgColor);
    noStroke();
    rect(this.x, this.y, this.areaWidth, this.areaHeight);

    // ドラッグ中はボーダーをハイライト
    if (this.isDragOver) {
      stroke(100, 160, 255, 180);
      strokeWeight(3);
      noFill();
      // 内側に破線風の枠を描画
      const inset = 16;
      drawingContext.setLineDash([8, 6]);
      rect(
        this.x + inset,
        this.y + inset,
        this.areaWidth - inset * 2,
        this.areaHeight - inset * 2,
        r,
      );
      drawingContext.setLineDash([]);
    }

    // アップロードアイコン（上向き矢印 + ボックス）
    const iconY = centerY - 30;
    stroke(160, 170, 185);
    strokeWeight(2.5);
    noFill();

    // 矢印の軸
    line(centerX, iconY - 16, centerX, iconY + 10);
    // 矢印の先端
    line(centerX - 8, iconY - 8, centerX, iconY - 16);
    line(centerX + 8, iconY - 8, centerX, iconY - 16);
    // トレイ（受け皿）
    const trayW = 32;
    const trayH = 10;
    line(
      centerX - trayW / 2,
      iconY + 10,
      centerX - trayW / 2,
      iconY + 10 + trayH,
    );
    line(
      centerX - trayW / 2,
      iconY + 10 + trayH,
      centerX + trayW / 2,
      iconY + 10 + trayH,
    );
    line(
      centerX + trayW / 2,
      iconY + 10 + trayH,
      centerX + trayW / 2,
      iconY + 10,
    );

    // テキスト
    noStroke();
    fill(130, 140, 160);
    textSize(14);
    textFont("Inter");
    textAlign(CENTER, CENTER);
    text("Upload Video", centerX, centerY + 20);

    fill(160, 170, 185);
    textSize(11);
    text("Click or Drag & Drop", centerX, centerY + 40);

    drawingContext.restore();
    pop();
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

  /**
   * createVideo を Promise 化し、ロード完了まで待機可能にする。
   * iOS Safari でのインライン再生に必要な属性をロード開始前に設定する。
   */
  _loadVideoAsync(filePath) {
    return new Promise((resolve) => {
      const vid = createVideo([filePath], () => resolve(vid));

      // iOS Safari 対応: ロード開始前にインライン再生・ミュート属性を設定
      // （ロード完了後では手遅れ — ブラウザが再生モードを確定済み）
      vid.elt.setAttribute("playsinline", "");
      vid.elt.setAttribute("webkit-playsinline", "");
      vid.elt.muted = true;
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

  /**
   * キーポイントのX座標をキャンバス描画座標に変換する。
   * cover トリミングのオフセットとスケールを一括適用する。
   * @param {number} keypointX - 元動画上のX座標
   * @returns {number} キャンバス上のX座標
   */
  _toCanvasX(keypointX) {
    return this.offsetX + (keypointX - this.srcX) * this.scaleX;
  }

  /**
   * キーポイントのY座標をキャンバス描画座標に変換する。
   * @param {number} keypointY - 元動画上のY座標
   * @returns {number} キャンバス上のY座標
   */
  _toCanvasY(keypointY) {
    return this.offsetY + (keypointY - this.srcY) * this.scaleY;
  }

  /** 再生/停止・コマ送り・コマ戻し・表示モード・削除ボタンを生成し、動画パネルの真下に配置する */
  _createControls() {
    this.controlsContainer = createDiv("");
    this.controlsContainer.addClass("neumorphic-controls");

    // 初期配置
    this._repositionControls();

    // ボタンの並び順: [Prev] [Pause] [Next] [Both] [Delete]
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

    this.displayModeButton = createButton(
      VideoPlayer.DISPLAY_MODE_LABELS[this.displayMode],
    );
    this.displayModeButton.addClass("neumorphic-btn");
    this.displayModeButton.mousePressed(() => this.toggleDisplayMode());
    this.displayModeButton.parent(this.controlsContainer);

    this.deleteButton = createButton("Delete");
    this.deleteButton.addClass("neumorphic-btn neumorphic-btn--delete");
    this.deleteButton.mousePressed(() => this.unload());
    this.deleteButton.parent(this.controlsContainer);
  }

  /** コントロールボタン群のDOMを削除する */
  _removeControls() {
    if (this.controlsContainer) {
      this.controlsContainer.remove();
      this.controlsContainer = null;
    }
    this.playButton = null;
    this.backButton = null;
    this.forwardButton = null;
    this.displayModeButton = null;
    this.deleteButton = null;
  }

  /** 動画要素とBlobURLを破棄する（UIボタンは別途 _removeControls で削除） */
  _disposeVideo() {
    if (this.video) {
      this.video.pause();
      this.video.remove();
      this.video = null;
    }
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
    this.playing = false;
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
        )
          continue;

        line(
          this._toCanvasX(pointA.x),
          this._toCanvasY(pointA.y),
          this._toCanvasX(pointB.x),
          this._toCanvasY(pointB.y),
        );
      }

      // ── キーポイント（関節点）を描画 ──
      fill(0, 255, 100);
      noStroke();
      for (const kp of keypoints) {
        if (kp.confidence < VideoPlayer.CONFIDENCE_THRESHOLD) continue;
        circle(this._toCanvasX(kp.x), this._toCanvasY(kp.y), 8);
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
    const angles = calculatePoseAngles(
      keypoints,
      VideoPlayer.CONFIDENCE_THRESHOLD,
    );

    push();
    fill(80);
    noStroke();
    textSize(13);
    textFont("Inter");

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
      )
        continue;

      // キャンバス座標に変換（cover トリミングのオフセット・スケールを適用）
      const bx = this._toCanvasX(kpB.x);
      const by = this._toCanvasY(kpB.y);
      const ax = this._toCanvasX(kpA.x);
      const ay = this._toCanvasY(kpA.y);
      const cx = this._toCanvasX(kpC.x);
      const cy = this._toCanvasY(kpC.y);

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
