// Touch play has no model dependency. Load only after an explicit camera action.
export const ML5_URL = 'https://unpkg.com/ml5@1.3.0/dist/ml5.min.js';
let library;

function loadLibrary() {
  if (library) return library;
  library = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ML5_URL;
    script.crossOrigin = 'anonymous';
    const timer = setTimeout(() => finish(new Error('ml5 load timeout')), 20000);
    function finish(error) {
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) { script.remove(); reject(error); }
      else resolve(window.ml5);
    }
    script.onload = () => finish(typeof window.ml5?.bodyPose === 'function' ? null : new Error('ml5 unavailable'));
    script.onerror = () => finish(new Error('ml5 load failed'));
    document.head.append(script);
  }).catch(error => { library = null; throw error; });
  return library;
}

export async function loadBodyPose() {
  const ml5 = await loadLibrary();
  return await ml5.bodyPose('MoveNet', { modelType: 'SINGLEPOSE_LIGHTNING', flipped: false });
}
