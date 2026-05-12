(function () {
  function initNavVisibility() {
    const nav = document.querySelector(".nav-bar");
    if (!nav) return;

    let scrollStopTimeoutId = null;
    let lastScrollY = window.scrollY;
    const showAfterScrollDelay = 180;
    const scrollDeltaThreshold = 6;
    const desktopRevealZoneHeight = 36;
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    const hero = document.querySelector("#hero-section-1");
    let isInHero = true;

    function isMobileNav() {
      return mobileQuery.matches;
    }

    function updateHeroState() {
      if (!hero) {
        isInHero = false;
        document.body.classList.remove("is-in-hero");
        nav.classList.remove("is-over-hero");
        return;
      }

      const heroBottom = hero.offsetTop + hero.offsetHeight;
      isInHero = window.scrollY < heroBottom - nav.offsetHeight;
      document.body.classList.toggle("is-in-hero", isInHero);
      nav.classList.toggle("is-over-hero", isInHero);

      if (isInHero) {
        nav.classList.add("is-visible");
        nav.classList.remove("is-hidden");
      }
    }

    function showNav() {
      if (isInHero) return;
      nav.classList.add("is-visible");
      nav.classList.remove("is-hidden");
      updateHeroState();
    }

    function hideNav() {
      if (isInHero) return;
      if (nav.classList.contains("is-open")) return;
      nav.classList.add("is-hidden");
      updateHeroState();
    }

    updateHeroState();

    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        updateHeroState();
        if (isInHero) return;

        if (!isMobileNav()) {
          hideNav();
          window.clearTimeout(scrollStopTimeoutId);
          return;
        }

        if (delta > scrollDeltaThreshold && currentScrollY > nav.offsetHeight) {
          hideNav();
        } else if (delta < -scrollDeltaThreshold) {
          showNav();
        }

        window.clearTimeout(scrollStopTimeoutId);
        scrollStopTimeoutId = window.setTimeout(showNav, showAfterScrollDelay);
      },
      { passive: true }
    );

    window.addEventListener("mousemove", (event) => {
      if (isMobileNav() || isInHero) return;

      if (event.clientY <= desktopRevealZoneHeight) {
        showNav();
      } else if (!nav.matches(":hover") && !nav.classList.contains("is-open")) {
        hideNav();
      }
    });

    nav.addEventListener("mouseleave", () => {
      if (isMobileNav() || isInHero) return;
      hideNav();
    });

    window.addEventListener("resize", updateHeroState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavVisibility, { once: true });
  } else {
    initNavVisibility();
  }
})();
