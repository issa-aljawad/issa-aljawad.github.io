document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".header-toggle-btn");
  const marquees = document.querySelectorAll(".logos-marquee-wrap");

  if (!buttons.length || !marquees.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      buttons.forEach((button) => {
        const isActive = button === btn;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      marquees.forEach((marquee) => {
        const isActive = marquee.id === `marquee-${target}`;
        marquee.classList.toggle("active", isActive);
        marquee.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
    });
  });

  // Inline external SVG scribbles so parent CSS can animate their paths
  const scribbleHosts = document.querySelectorAll("svg[data-src]");
  if (scribbleHosts.length) {
    const cache = new Map();
    scribbleHosts.forEach((host) => {
      const src = host.getAttribute("data-src");
      if (!src) return;
      if (!cache.has(src)) {
        cache.set(src, fetch(src).then((r) => r.text()));
      }
      cache.get(src).then((markup) => {
        const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
        const sourceSvg = parsed.querySelector("svg");
        if (!sourceSvg) return;
        host.innerHTML = sourceSvg.innerHTML;
      });
    });
  }

  // Position Tracker for Auto-Highlight Effect (wandlor + dl2)
  const highlightItems = document.querySelectorAll(
    '.logo-item[data-brand="wandlor"], .logo-item[data-brand="dl2"]'
  );
  const HIGHLIGHT_HOLD_MS = 6000; // match wandlor-highlight-sequence duration
  const lockedUntil = new WeakMap();

  function trackWandlor() {
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth <= 768;

    highlightItems.forEach((item) => {
      // On mobile, skip the duplicated logos (kept for seamless loop) so the animation plays once per track
      if (isMobile && item.getAttribute("aria-hidden") === "true") return;

      const rect = item.getBoundingClientRect();

      // Trigger highlight when the logo's center crosses the viewport's center
      const viewportCenter = viewportWidth / 2;
      const logoCenter = rect.left + rect.width / 2;
      const tolerance = rect.width / 2;

      const isAtCenter = Math.abs(logoCenter - viewportCenter) < tolerance;
      const now = performance.now();
      const lockExpiry = lockedUntil.get(item) || 0;

      if (isAtCenter && now >= lockExpiry) {
        item.classList.add("auto-highlight");
        lockedUntil.set(item, now + HIGHLIGHT_HOLD_MS);
      } else if (now >= lockExpiry) {
        item.classList.remove("auto-highlight");
      }
    });
    requestAnimationFrame(trackWandlor);
  }

  // Start tracking
  if (highlightItems.length) {
    trackWandlor();
  }
});