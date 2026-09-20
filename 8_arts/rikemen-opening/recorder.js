(function attachRecorder(globalScope) {
  'use strict';

  const MIME_CANDIDATES = Object.freeze([
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]);

  function selectMimeType(MediaRecorderClass) {
    if (!MediaRecorderClass || typeof MediaRecorderClass.isTypeSupported !== 'function') {
      return '';
    }
    return MIME_CANDIDATES.find((type) => MediaRecorderClass.isTypeSupported(type)) || '';
  }

  function combineStreams(videoStream, audioStream, MediaStreamClass) {
    const StreamClass = MediaStreamClass || globalScope.MediaStream;
    if (!StreamClass) {
      throw new Error('MediaStream is not supported in this browser.');
    }
    const tracks = [
      ...videoStream.getVideoTracks(),
      ...(audioStream ? audioStream.getAudioTracks() : []),
    ];
    return new StreamClass(tracks);
  }

  function stopCapturedVideo(videoStream) {
    videoStream.getVideoTracks().forEach((track) => track.stop());
  }

  class CanvasRecorder {
    constructor(options = {}) {
      this.MediaRecorderClass = options.MediaRecorderClass || globalScope.MediaRecorder;
      this.MediaStreamClass = options.MediaStreamClass || globalScope.MediaStream;
    }

    record({ canvas, audioStream, fps = 60, durationMs = 5000, onStart, onStop }) {
      if (!canvas || typeof canvas.captureStream !== 'function') {
        return Promise.reject(new Error('Canvas captureStream is not supported.'));
      }
      if (!this.MediaRecorderClass) {
        return Promise.reject(new Error('MediaRecorder is not supported.'));
      }

      const videoStream = canvas.captureStream(fps);
      const stream = combineStreams(videoStream, audioStream, this.MediaStreamClass);
      const mimeType = selectMimeType(this.MediaRecorderClass);
      const recorderOptions = mimeType
        ? { mimeType, videoBitsPerSecond: 16_000_000, audioBitsPerSecond: 192_000 }
        : { videoBitsPerSecond: 16_000_000, audioBitsPerSecond: 192_000 };

      return new Promise((resolve, reject) => {
        const chunks = [];
        let mediaRecorder;

        try {
          mediaRecorder = new this.MediaRecorderClass(stream, recorderOptions);
        } catch (error) {
          reject(error);
          return;
        }

        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        });
        mediaRecorder.addEventListener(
          'error',
          (event) => reject(event.error || new Error('Recording failed.')),
          { once: true },
        );
        mediaRecorder.addEventListener(
          'stop',
          () => {
            // The audio track belongs to the reusable Web Audio destination.
            // Only stop tracks created by canvas.captureStream().
            stopCapturedVideo(videoStream);
            if (typeof onStop === 'function') {
              onStop();
            }
            resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
          },
          { once: true },
        );

        mediaRecorder.start(100);
        if (typeof onStart === 'function') {
          onStart();
        }
        globalScope.setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, durationMs);
      });
    }
  }

  const api = Object.freeze({
    MIME_CANDIDATES,
    selectMimeType,
    combineStreams,
    stopCapturedVideo,
    CanvasRecorder,
  });
  globalScope.RikemenRecorder = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
