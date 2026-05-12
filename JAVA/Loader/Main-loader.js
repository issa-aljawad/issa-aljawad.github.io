/* ======================================================
   MAIN TEAR LOADER
====================================================== */

(() => {
  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  const assetBase = new URL("../../Assets/Loader/Main/", scriptUrl).href;
  const removeDelay = 3500;
  const finalRevealDelay = 2550;
  const loaderAssets = [
    "mask.webp",
    "inner-background.webp",
    "character.webp",
    "eyes-closed.webp",
    "tear-frame.webp",
    "upper-right-slach.webp",
    "lower-right-slash.webp"
  ];

  function createMainLoader() {
    const loader = document.createElement("section");
    loader.className = "main-tear-loader";
    loader.setAttribute("aria-label", "Main page loading animation");

    loader.innerHTML = `
      <svg class="main-tear-loader__viewport-cutout" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="mainIndexCutoutInvert">
              <feComponentTransfer>
                <feFuncR type="table" tableValues="1 0"></feFuncR>
                <feFuncG type="table" tableValues="1 0"></feFuncG>
                <feFuncB type="table" tableValues="1 0"></feFuncB>
              </feComponentTransfer>
            </filter>
            <mask
              id="mainIndexCutoutMask"
              x="-10"
              y="-10"
              width="21"
              height="21"
              maskUnits="objectBoundingBox"
              maskContentUnits="objectBoundingBox"
              mask-type="luminance">
              <rect x="0" y="0" width="1" height="1" fill="white"></rect>
              <image
                class="main-tear-loader__viewport-mask-image"
                href="${assetBase}mask.webp"
                x="0.04"
                y="0.24125"
                width="0.92"
                height="0.5175"
                preserveAspectRatio="none"
                filter="url(#mainIndexCutoutInvert)">
              </image>
            </mask>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="#000" mask="url(#mainIndexCutoutMask)"></rect>
        </svg>
      <div class="main-tear-loader__scene">
        <svg class="main-tear-loader__masked-background" viewBox="0 0 1920 1080" aria-hidden="true">
          <defs>
            <mask id="mainTearBackgroundMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" mask-type="luminance">
              <image href="${assetBase}mask.webp" x="0" y="0" width="1920" height="1080" preserveAspectRatio="none"></image>
            </mask>
          </defs>
          <g mask="url(#mainTearBackgroundMask)">
            <image
              class="main-tear-loader__inner-background"
              href="${assetBase}inner-background.webp"
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="none">
            </image>
          </g>
        </svg>
        <svg class="main-tear-loader__masked-face" viewBox="0 0 1920 1080" aria-hidden="true">
          <defs>
            <mask id="mainTearFaceMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" mask-type="luminance">
              <image href="${assetBase}mask.webp" x="0" y="0" width="1920" height="1080" preserveAspectRatio="none"></image>
            </mask>
          </defs>
          <g mask="url(#mainTearFaceMask)">
            <image
              class="main-tear-loader__face-image"
              href="${assetBase}character.webp"
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="xMidYMid meet">
            </image>
            <image
              class="main-tear-loader__face-image main-tear-loader__face-image--closed"
              href="${assetBase}eyes-closed.webp"
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="xMidYMid meet">
            </image>
          </g>
        </svg>
        <img class="main-tear-loader__layer main-tear-loader__frame" src="${assetBase}tear-frame.webp" alt="">
        <img class="main-tear-loader__layer main-tear-loader__slash main-tear-loader__slash--upper" src="${assetBase}upper-right-slach.webp" alt="">
        <img class="main-tear-loader__layer main-tear-loader__slash main-tear-loader__slash--lower" src="${assetBase}lower-right-slash.webp" alt="">
      </div>
    `;

    return loader;
  }

  function preloadMainLoaderAssets() {
    return Promise.all(loaderAssets.map((asset) => new Promise((resolve) => {
      const image = new Image();

      image.onload = resolve;
      image.onerror = resolve;
      image.src = `${assetBase}${asset}`;

      if (image.decode) {
        image.decode().then(resolve).catch(resolve);
      }
    })));
  }

  function syncViewportMaskToScene(loader) {
    const scene = loader.querySelector(".main-tear-loader__scene");
    const maskImage = loader.querySelector(".main-tear-loader__viewport-mask-image");

    if (!scene || !maskImage) return;

    const sceneRect = scene.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const maskState = {
      x: sceneRect.left / viewportWidth,
      y: sceneRect.top / viewportHeight,
      width: sceneRect.width / viewportWidth,
      height: sceneRect.height / viewportHeight
    };

    loader._mainViewportMaskState = maskState;

    maskImage.setAttribute("x", maskState.x);
    maskImage.setAttribute("y", maskState.y);
    maskImage.setAttribute("width", maskState.width);
    maskImage.setAttribute("height", maskState.height);
  }

  function parseCssTime(value, fallback) {
    const text = String(value || "").trim();

    if (text.endsWith("ms")) return Number.parseFloat(text) || fallback;
    if (text.endsWith("s")) return (Number.parseFloat(text) || fallback / 1000) * 1000;

    return Number.parseFloat(text) || fallback;
  }

  function cubicBezier(x1, y1, x2, y2) {
    const sampleCurveX = (time) => ((1 - 3 * x2 + 3 * x1) * time + (3 * x2 - 6 * x1)) * time * time + 3 * x1 * time;
    const sampleCurveY = (time) => ((1 - 3 * y2 + 3 * y1) * time + (3 * y2 - 6 * y1)) * time * time + 3 * y1 * time;
    const sampleCurveDerivativeX = (time) => (3 * (1 - 3 * x2 + 3 * x1) * time + 2 * (3 * x2 - 6 * x1)) * time + 3 * x1;

    return (progress) => {
      let time = progress;

      for (let i = 0; i < 8; i += 1) {
        const currentX = sampleCurveX(time) - progress;
        const derivative = sampleCurveDerivativeX(time);

        if (Math.abs(currentX) < 0.000001 || Math.abs(derivative) < 0.000001) break;
        time -= currentX / derivative;
      }

      return sampleCurveY(Math.min(1, Math.max(0, time)));
    };
  }

  function animateViewportMaskExpand(loader) {
    const maskImage = loader.querySelector(".main-tear-loader__viewport-mask-image");
    const maskState = loader._mainViewportMaskState;

    if (!maskImage || !maskState) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const duration = parseCssTime(rootStyles.getPropertyValue("--main-loader-final-reveal-duration"), 420);
    const finalScale = Number.parseFloat(rootStyles.getPropertyValue("--main-loader-final-scale")) || 15;
    const ease = cubicBezier(0.76, 0, 0.24, 1);
    const centerX = maskState.x + maskState.width / 2;
    const centerY = maskState.y + maskState.height / 2;
    const startedAt = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = ease(progress);
      const scale = 1 + (finalScale - 1) * eased;
      const width = maskState.width * scale;
      const height = maskState.height * scale;

      maskImage.setAttribute("x", centerX - width / 2);
      maskImage.setAttribute("y", centerY - height / 2);
      maskImage.setAttribute("width", width);
      maskImage.setAttribute("height", height);

      if (progress < 1 && loader.isConnected) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function playMainLoader() {
    if (!document.body || document.querySelector(".main-tear-loader")) return;

    const loader = createMainLoader();
    document.body.prepend(loader);

    requestAnimationFrame(() => {
      syncViewportMaskToScene(loader);
      preloadMainLoaderAssets().then(() => {
        if (!loader.isConnected) return;

        loader.classList.add("is-playing");
        window.setTimeout(() => {
          animateViewportMaskExpand(loader);
        }, finalRevealDelay);

        window.setTimeout(() => {
          loader.remove();
        }, removeDelay);
      });
    });
  }

  window.MainTearLoader = {
    play: playMainLoader
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", playMainLoader, { once: true });
  } else {
    playMainLoader();
  }
})();
