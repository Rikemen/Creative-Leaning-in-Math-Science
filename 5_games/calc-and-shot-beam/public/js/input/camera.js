// Inject browser resources to test lifecycle races without a physical camera.
export class CameraController {
  constructor({ video, getUserMedia, loadModel, onState = () => {}, onPoses = () => {},
    timeoutMs = 30000, now = () => performance.now(),
    setTimer = (callback, ms) => globalThis.setTimeout(callback, ms),
    clearTimer = id => globalThis.clearTimeout(id) }) {
    Object.assign(this, { video, getUserMedia, loadModel, onState, onPoses, timeoutMs, now, setTimer, clearTimer });
    this.state = 'idle';
    this.run = null;
  }

  publish(state, reason = '') {
    this.state = state;
    this.onState({ state, reason });
  }

  async start() {
    this.stop(false);
    const run = { active: true, stream: null, model: null, inference: null, disposed: false };
    run.cancelled = new Promise(resolve => { run.cancel = () => resolve(false); });
    this.run = run;
    this.publish('requesting');
    const setup = async () => {
      const stream = await this.getUserMedia({ audio: false, video: {
        facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 },
      } });
      if (!run.active) { stream.getTracks().forEach(track => track.stop()); return false; }
      run.stream = stream;
      for (const track of stream.getVideoTracks()) {
        track.addEventListener('ended', () => this.fail(run, 'disconnected'), { once: true });
      }
      this.video.srcObject = stream;
      await this.video.play();
      if (!run.active) return false;
      this.video.width = this.video.videoWidth || 640;
      this.video.height = this.video.videoHeight || 480;
      this.publish('loading');
      run.model = await this.loadModel();
      if (!run.active) { this.dispose(run); return false; }
      const poses = await this.detect(run);
      if (!run.active) return false;
      this.onPoses(poses, run.frame);
      this.publish('ready');
      this.schedule(run);
      return true;
    };
    run.deadline = this.setTimer(() => this.fail(run, 'timeout'), this.timeoutMs);
    const work = setup().catch(error => {
      this.fail(run, error.name === 'NotAllowedError' ? 'denied'
        : error.name === 'NotFoundError' ? 'missing'
        : this.state === 'loading' ? 'model' : 'unavailable');
      return false;
    });
    const result = await Promise.race([work, run.cancelled]);
    this.clearTimer(run.deadline);
    return result;
  }

  async detect(run) {
    run.inference = Promise.resolve().then(() => {
      run.frame = { capturedAt: this.now(), width: this.video.width, height: this.video.height };
      return run.model.detect(this.video);
    });
    try { return await run.inference; }
    finally { run.inference = null; if (!run.active) this.dispose(run); }
  }

  async poll(run) {
    if (!run.active) return;
    run.deadline = this.setTimer(() => this.fail(run, 'timeout'), this.timeoutMs);
    try {
      const poses = await this.detect(run);
      this.clearTimer(run.deadline);
      if (!run.active) return;
      this.onPoses(poses, run.frame);
      this.schedule(run);
    } catch { this.fail(run, 'model'); }
  }

  schedule(run) {
    // Target a start every 80ms, without adding another 80ms after slow inference.
    // Detection stays sequential and capture timestamps keep their real age.
    const delay = Math.max(0, 80 - (this.now() - run.frame.capturedAt));
    run.next = this.setTimer(() => this.poll(run), delay);
  }

  dispose(run) {
    if (!run.model || run.inference || run.disposed) return;
    run.disposed = true;
    // ml5 1.3.0 exposes its underlying TFJS detector as model.
    run.model.model?.dispose();
  }

  release(run) {
    run.active = false;
    run.cancel();
    this.clearTimer(run.deadline);
    this.clearTimer(run.next);
    run.stream?.getTracks().forEach(track => track.stop());
    this.video.pause();
    this.video.srcObject = null;
    this.dispose(run);
    this.onPoses([]);
  }

  fail(run, reason) {
    if (!run.active || this.run !== run) return;
    this.release(run);
    this.run = null;
    this.publish('error', reason);
  }

  stop(notify = true) {
    if (this.run) this.release(this.run);
    this.run = null;
    if (notify) this.publish('stopped');
  }
}
