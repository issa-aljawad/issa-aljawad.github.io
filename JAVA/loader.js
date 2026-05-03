/* =============================================================
   LOADER TRANSITION
   Anime-style purple flame loader for first load and internal page switches.
============================================================= */

(() => {
  const SKIP_NEXT_LOAD_KEY = "portfolio-loader-skip-next-load";
  const INTRO_LEAVE_DELAY = 1280;
  const INTRO_REMOVE_DELAY = 1840;
  const NAVIGATE_DELAY = 720;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE_TITLES = {
    "branding.html": "Branding",
    "poster-design.html": "Poster Design",
    "3d-character-creation.html": "3D Character Creation",
    "3d-texturing.html": "3D Texturing",
    "mortal-kombat-11.html": "Mortal Kombat 11",
    "dying-light-2.html": "Dying Light 2",
    "mortal-kombat-movie.html": "Mortal Kombat Movie",
    "assassins-creed-mirage.html": "Assassin's Creed Mirage",
    "genesis-senshi.html": "Genesis Senshi"
  };

  const loaderHTML = `
    <div id="stage" class="stage loader-stage" aria-hidden="true">
      <div class="loader-flame-scene">
        <div class="loader-flame-glow"></div>
        <div class="loader-flame-aura"></div>
        <div class="loader-flame loader-flame--outer"></div>
        <div class="loader-flame loader-flame--mid"></div>
        <div class="loader-flame loader-flame--inner"></div>
        <div class="loader-flame-core"></div>
        <div class="loader-ring loader-ring--one"></div>
        <div class="loader-ring loader-ring--two"></div>
        <div class="loader-spark loader-spark--one"></div>
        <div class="loader-spark loader-spark--two"></div>
        <div class="loader-spark loader-spark--three"></div>
        <div class="loader-spark loader-spark--four"></div>
      </div>
      <div class="loader-title" id="loaderTitle">
        <div class="loader-title-kicker">Now Viewing</div>
        <div class="loader-title-main" aria-label=""></div>
      </div>
    </div>
  `;

  let isPlaying = false;

  function ensureGrain() {
    if (!document.body || document.querySelector(".global-grain")) return;
    document.body.insertAdjacentHTML("afterbegin", '<div class="global-grain" aria-hidden="true"></div>');
  }

  function mountStage() {
    if (!document.body) return null;

    ensureGrain();

    const existing = document.getElementById("stage");
    if (existing) return existing;

    document.body.insertAdjacentHTML("afterbegin", loaderHTML);
    return document.getElementById("stage");
  }

  function getBasename(url) {
    const pathname = new URL(url, window.location.href).pathname.toLowerCase();
    const parts = pathname.split("/");
    return parts[parts.length - 1] || "";
  }

  function getLoaderTitle(url = window.location.href) {
    const basename = getBasename(url);

    if (!basename || basename === "index.html") return "";

    if (PAGE_TITLES[basename]) return PAGE_TITLES[basename];

    if (url === window.location.href && document.title) {
      return document.title.replace(/\s*-\s*Issa Al Jawad\s*$/i, "").trim();
    }

    return basename
      .replace(/\.html$/i, "")
      .split("-")
      .map((part) => {
        if (/^\d+d$/i.test(part)) return part.toUpperCase();
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function buildTitleWords(titleEl, title) {
    const mainEl = titleEl.querySelector(".loader-title-main");
    if (!mainEl) return;

    mainEl.setAttribute("aria-label", title);
    mainEl.replaceChildren();

    title
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word, index) => {
        const wordEl = document.createElement("span");
        wordEl.className = "loader-title-word";
        wordEl.style.setProperty("--word-index", index);
        wordEl.textContent = word;
        mainEl.appendChild(wordEl);
      });
  }

  function applyTitle(stage, title) {
    const titleEl = stage.querySelector("#loaderTitle");
    if (!titleEl) return;

    if (!title) {
      const mainEl = titleEl.querySelector(".loader-title-main");
      if (mainEl) {
        mainEl.setAttribute("aria-label", "");
        mainEl.replaceChildren();
      }
      titleEl.classList.remove("is-visible");
      return;
    }

    buildTitleWords(titleEl, title);
    titleEl.classList.add("is-visible");
  }

  function resetStage(stage) {
    stage.classList.remove("is-transitioning", "is-leaving");
    void stage.offsetWidth;
  }

  function startTransition(stage, title = "") {
    resetStage(stage);
    applyTitle(stage, title);

    window.requestAnimationFrame(() => {
      stage.classList.add("is-transitioning");
    });
  }

  function playIntro() {
    if (prefersReducedMotion) return;

    const stage = mountStage();
    if (!stage) return;

    startTransition(stage, getLoaderTitle());

    window.setTimeout(() => {
      stage.classList.add("is-leaving");
    }, INTRO_LEAVE_DELAY);

    window.setTimeout(() => {
      stage.remove();
    }, INTRO_REMOVE_DELAY);
  }

  function shouldHandleLink(anchor, event) {
    if (!anchor || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target.toLowerCase() !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;

    const rawHref = anchor.getAttribute("href");
    if (!rawHref) return false;
    if (
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:")
    ) {
      return false;
    }

    const nextUrl = new URL(anchor.href, window.location.href);
    const currentUrl = new URL(window.location.href);

    if (nextUrl.origin !== currentUrl.origin) return false;

    const sameDocument =
      nextUrl.pathname === currentUrl.pathname &&
      nextUrl.search === currentUrl.search;

    if (sameDocument && nextUrl.hash) return false;
    if (nextUrl.href === currentUrl.href) return false;

    return true;
  }

  function bindInternalNavigation() {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!shouldHandleLink(anchor, event) || isPlaying) return;
      if (prefersReducedMotion) return;

      event.preventDefault();
      isPlaying = true;

      const stage = mountStage();
      if (!stage) {
        window.location.href = anchor.href;
        return;
      }

      startTransition(stage, getLoaderTitle(anchor.href));

      try {
        window.sessionStorage.setItem(SKIP_NEXT_LOAD_KEY, "1");
      } catch (error) {
        console.warn("loader.js: Unable to persist navigation loader state.", error);
      }

      window.setTimeout(() => {
        window.location.href = anchor.href;
      }, NAVIGATE_DELAY);
    });
  }

  bindInternalNavigation();

  let skipIntro = false;
  try {
    skipIntro = window.sessionStorage.getItem(SKIP_NEXT_LOAD_KEY) === "1";
    if (skipIntro) {
      window.sessionStorage.removeItem(SKIP_NEXT_LOAD_KEY);
    }
  } catch (error) {
    skipIntro = false;
  }

  if (!skipIntro) {
    if (document.readyState === "complete") {
      playIntro();
    } else {
      window.addEventListener("load", playIntro, { once: true });
    }
  }
})();
