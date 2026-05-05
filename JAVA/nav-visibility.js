(function () {
  function initNavVisibility() {
    const nav = document.querySelector(".nav-bar");
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let hideTimeoutId = null;
    let showTimeoutId = null;
    const revealZoneHeight = 28;
    const hideDelay = 260;
    const showDelay = 180;

    function showNav() {
      window.clearTimeout(hideTimeoutId);
      nav.classList.remove("is-hidden");
    }

    function queueShow() {
      window.clearTimeout(showTimeoutId);
      showTimeoutId = window.setTimeout(showNav, showDelay);
    }

    function queueHide() {
      window.clearTimeout(hideTimeoutId);
      window.clearTimeout(showTimeoutId);
      if (window.scrollY <= 0) return;

      hideTimeoutId = window.setTimeout(() => {
        if (!nav.matches(":hover")) {
          nav.classList.add("is-hidden");
        }
      }, hideDelay);
    }

    function updateNav() {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (scrollingDown) {
        nav.classList.add("is-hidden");
      } else if (currentScrollY <= 0) {
        showNav();
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateNav);
      },
      { passive: true }
    );

    window.addEventListener("mousemove", (event) => {
      if (event.clientY <= revealZoneHeight) {
        queueShow();
      } else {
        queueHide();
      }
    });

    nav.addEventListener("mouseenter", () => {
      window.clearTimeout(showTimeoutId);
      showNav();
    });
    nav.addEventListener("mouseleave", queueHide);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavVisibility, { once: true });
  } else {
    initNavVisibility();
  }
})();
