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
    this.playing = false;

    // UIボタン群のコンテナとボタン
    this.controlsContainer = null;
    this.playButton = null;
    this.backButton = null;
    this.forwardButton = null;
  }

  // ──────────────── ライフサイクル ────────────────

  /**
   * 動画を読み込み、ボタンを生成して自動再生を開始する。
   * setup() 内で await して呼ぶこと。
   */
  async load() {
    this.video = await this._loadVideoAsync(this.path);
    this._calculateDisplaySize();
    this.video.volume(0);
    this.video.hide();
    this.video.loop();
    this.playing = true;

    this._createControls();
  }

  // ──────────────── 描画 ────────────────

  /** キャンバスの描画領域に動画をアスペクト比維持で中央配置する */
  draw() {
    if (!this.video) return;

    const offsetX = this.x + (this.areaWidth - this.displayWidth) / 2;
    const offsetY = this.y + (this.areaHeight - this.displayHeight) / 2;
    image(this.video, offsetX, offsetY, this.displayWidth, this.displayHeight);
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

  // ──────────────── 内部メソッド ────────────────

  /** createVideo を Promise 化し、ロード完了まで待機可能にする */
  _loadVideoAsync(filePath) {
    return new Promise((resolve) => {
      const vid = createVideo([filePath], () => resolve(vid));
    });
  }

  /** 動画を描画領域内にアスペクト比を維持して収める表示サイズを計算する */
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
  }
}
