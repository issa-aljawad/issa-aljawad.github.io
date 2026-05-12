/* ======================================================
   SUBINDEX LOADER
====================================================== */

(() => {
  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  const assetBase = new URL("../../Assets/Loader/Featured/", scriptUrl).href;
  const finalRevealDelay = 2650;
  const removeDelay = 3350;
  const defaultTextAsset = "text.webp";
  const loaderAssets = [
    "mask.webp",
    "inner-background.webp",
    "character.webp",
    "smile.webp",
    "eyes-closed.webp",
    "slashes.webp",
    "upper-frame.webp",
    "lower-frame.webp"
  ];

  function createSubindexLoader(options = {}) {
    const textAsset = options.textAsset || defaultTextAsset;
    const loader = document.createElement("section");
    loader.className = "subindex-loader";
    loader.setAttribute("aria-label", "Subindex loading animation");

    loader.innerHTML = `
      <svg class="subindex-loader__viewport-cutout" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="subindexSectionCutoutInvert">
            <feComponentTransfer>
              <feFuncR type="table" tableValues="1 0"></feFuncR>
              <feFuncG type="table" tableValues="1 0"></feFuncG>
              <feFuncB type="table" tableValues="1 0"></feFuncB>
            </feComponentTransfer>
          </filter>
          <mask
            id="subindexSectionCutoutMask"
            x="-10"
            y="-10"
            width="21"
            height="21"
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
            mask-type="luminance">
            <rect x="0" y="0" width="1" height="1" fill="white"></rect>
            <image
              class="subindex-loader__viewport-mask-image"
              href="${assetBase}mask.webp"
              x="0.04"
              y="0.24125"
              width="0.92"
              height="0.5175"
              preserveAspectRatio="none"
              filter="url(#subindexSectionCutoutInvert)">
            </image>
          </mask>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="#000" mask="url(#subindexSectionCutoutMask)"></rect>
      </svg>
      <div class="subindex-loader__scene">
        <img class="subindex-loader__layer subindex-loader__inner-background" src="${assetBase}inner-background.webp" alt="">
        <svg class="subindex-loader__masked-character" viewBox="0 0 1920 1080" aria-hidden="true">
          <defs>
            <mask id="subindexCharacterMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" mask-type="luminance">
              <image href="${assetBase}mask.webp" x="0" y="0" width="1920" height="1080" preserveAspectRatio="none"></image>
            </mask>
          </defs>
          <g mask="url(#subindexCharacterMask)">
            <image
              class="subindex-loader__character"
              href="${assetBase}character.webp"
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="none">
            </image>
            <image
              class="subindex-loader__smile"
              href="${assetBase}smile.webp"
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="none">
            </image>
            <image
              class="subindex-loader__eyes-closed"
              href="${assetBase}eyes-closed.webp"
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="none">
            </image>
          </g>
        </svg>
        <img class="subindex-loader__layer subindex-loader__slashes" src="${assetBase}slashes.webp" alt="">
        <img class="subindex-loader__layer subindex-loader__text" src="${assetBase}${textAsset}" alt="">
        <img class="subindex-loader__layer subindex-loader__upper-frame" src="${assetBase}upper-frame.webp" alt="">
        <img class="subindex-loader__layer subindex-loader__lower-frame" src="${assetBase}lower-frame.webp" alt="">
      </div>
    `;

    return loader;
  }

  function preloadSubindexLoaderAssets(options = {}) {
    const assets = [...loaderAssets, options.textAsset || defaultTextAsset];

    return Promise.all(assets.map((asset) => new Promise((resolve) => {
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
    const scene = loader.querySelector(".subindex-loader__scene");
    const maskImage = loader.querySelector(".subindex-loader__viewport-mask-image");

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

    loader._subindexViewportMaskState = maskState;

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
    const maskImage = loader.querySelector(".subindex-loader__viewport-mask-image");
    const maskState = loader._subindexViewportMaskState;

    if (!maskImage || !maskState) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const duration = parseCssTime(rootStyles.getPropertyValue("--subindex-loader-final-reveal-duration"), 420);
    const finalScale = Number.parseFloat(rootStyles.getPropertyValue("--subindex-loader-final-scale")) || 15;
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

  function playSubindexLoader(options = {}) {
    if (!document.body || document.querySelector(".subindex-loader")) return;

    const loader = createSubindexLoader(options);
    document.body.prepend(loader);

    requestAnimationFrame(() => {
      syncViewportMaskToScene(loader);
      preloadSubindexLoaderAssets(options).then(() => {
        if (!loader.isConnected) return;

        loader.classList.add("is-playing");
        window.setTimeout(() => {
          animateViewportMaskExpand(loader);
        }, finalRevealDelay);

        window.setTimeout(() => {
          if (typeof options.onComplete === "function") {
            options.onComplete();
          } else {
            loader.remove();
          }
        }, removeDelay);
      });
    });
  }

  function setupSubindexLoaderLinks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest(
        "a[href*='/Projects/'], a[href*='Projects/'], a[href*='/Services/'], a[href*='Services/'], a[href*='/2D-portfolio.html'], a[href*='2D-portfolio.html'], a[href*='/3D-portfolio.html'], a[href*='3D-portfolio.html']"
      );

      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || link.target === "_blank") return;
      const normalizedHref = href.toLowerCase();
      let textAsset = "text.webp";

      if (
        normalizedHref.includes("/services/") ||
        normalizedHref.includes("services/")
      ) {
        textAsset = "services-text.webp";
      } else if (normalizedHref.includes("2d-portfolio.html")) {
        textAsset = "2Dportfolio-text.webp";
      } else if (normalizedHref.includes("3d-portfolio.html")) {
        textAsset = "3Dportfolio-text.webp";
      }

      event.preventDefault();
      playSubindexLoader({
        textAsset,
        onComplete: () => {
          window.location.href = link.href;
        }
      });
    });
  }

  window.SubindexLoader = {
    play: playSubindexLoader
  };

  const shouldAutoplay = !document.currentScript || document.currentScript.dataset.auto !== "false";
  const shouldBindLinks = document.currentScript && document.currentScript.dataset.bindLinks === "true";

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", () => {
      if (shouldBindLinks) setupSubindexLoaderLinks();
      if (shouldAutoplay) playSubindexLoader();
    }, { once: true });
  } else {
    if (shouldBindLinks) setupSubindexLoaderLinks();
    if (shouldAutoplay) playSubindexLoader();
  }
})();
