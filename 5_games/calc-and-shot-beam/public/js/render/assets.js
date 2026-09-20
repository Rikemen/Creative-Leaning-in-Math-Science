export const ASSET_MANIFEST = Object.freeze({
  city: { src: '/assets/images/city.webp', width: 1600, height: 900 },
  heroBack: { src: '/assets/images/hero-back.png', width: 1024, height: 1024 },
  armsIdle: { src: '/assets/images/arms-idle.png', width: 1024, height: 1024 },
  armsFire: { src: '/assets/images/arms-fire.png', width: 1024, height: 1024 },
});

// A failed or stalled image never blocks game startup or causes repeated fetches.
export function createAssetLoader(makeImage = () => new Image(), timeoutMs = 8000) {
  let pending;
  return () => pending ??= Promise.all(Object.entries(ASSET_MANIFEST).map(([id, spec]) =>
    new Promise(resolve => {
      let image, timer, settled = false;
      const finish = value => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        if (image) { image.onload = null; image.onerror = null; }
        resolve([id, value]);
      };
      try {
        image = makeImage();
        timer = setTimeout(() => finish(null), timeoutMs);
        image.onload = () => finish(image.naturalWidth === spec.width && image.naturalHeight === spec.height ? image : null);
        image.onerror = () => finish(null);
        image.src = spec.src;
      } catch { finish(null); }
    })
  )).then(Object.fromEntries);
}

export const loadAssets = createAssetLoader();
