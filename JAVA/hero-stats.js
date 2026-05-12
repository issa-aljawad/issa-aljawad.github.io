(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateValue(element, duration) {
    const target = Number(element.dataset.target || 0);
    if (!Number.isFinite(target)) return;

    if (prefersReducedMotion) {
      element.textContent = String(target);
      return;
    }

    const start = performance.now();
    const shuffleUntil = duration * 0.55;

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      if (elapsed < shuffleUntil) {
        const digits = Math.max(String(target).length, 1);
        let text = "";

        for (let i = 0; i < digits; i += 1) {
          text += Math.floor(Math.random() * 10);
        }

        element.textContent = text;
      } else {
        const settleProgress = Math.min((elapsed - shuffleUntil) / (duration - shuffleUntil || 1), 1);
        const eased = 1 - Math.pow(1 - settleProgress, 3);
        element.textContent = String(Math.round(target * eased));
      }

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        element.textContent = String(target);
      }
    }

    window.requestAnimationFrame(frame);
  }

  function initHeroStats() {
    const metricsSection = document.querySelector(".hero-metrics");
    const counters = document.querySelectorAll(".hero-metric-counter");

    if (!metricsSection || counters.length === 0) return;

    let hasAnimated = false;

    function run() {
      if (hasAnimated) return;
      hasAnimated = true;

      counters.forEach((counter, index) => {
        window.setTimeout(() => animateValue(counter, 900 + index * 120), index * 90);
      });
    }

    if (!("IntersectionObserver" in window)) {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run();
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35
      }
    );

    observer.observe(metricsSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroStats, { once: true });
  } else {
    initHeroStats();
  }
})();
