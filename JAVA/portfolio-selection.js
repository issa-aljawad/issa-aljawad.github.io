(function () {
  function initPortfolioChoice() {
    const selectionSection = document.querySelector(".portfolio-choice-section");
    if (!selectionSection) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              selectionSection.classList.add("start-animation");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1
        }
      );
      observer.observe(selectionSection);
    } else {
      selectionSection.classList.add("start-animation");
    }
  }

  function initFeaturedRevealSequence() {
    const gallery = document.querySelector(".featured-gallery");
    if (!gallery) return;

    const mobileQuery = window.matchMedia("(max-width: 820px)");
    let hasTitlePlayed = false;
    let hasCardsPlayed = false;

    function playCards() {
      if (hasCardsPlayed) return;
      hasCardsPlayed = true;
      gallery.classList.add("is-cards-revealed");
    }

    function playTitle() {
      if (hasTitlePlayed) return;
      hasTitlePlayed = true;
      window.setTimeout(() => {
        gallery.classList.add("is-title-revealed");
      }, 1000);
    }

    function isSectionInViewport() {
      const rect = gallery.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      return rect.top <= viewportHeight && rect.bottom >= 0;
    }

    function isSectionEndInViewport() {
      const rect = gallery.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      return rect.bottom <= viewportHeight;
    }

    function handleMobileScroll() {
      if (!mobileQuery.matches || (hasTitlePlayed && hasCardsPlayed)) return;

      if (isSectionInViewport()) {
        playTitle();
      }

      if (isSectionEndInViewport()) {
        playCards();
      }

      if (hasTitlePlayed && hasCardsPlayed) {
        window.removeEventListener("scroll", handleMobileScroll);
        window.removeEventListener("resize", handleMobileScroll);
      }
    }

    if (mobileQuery.matches) {
      window.addEventListener("scroll", handleMobileScroll, { passive: true });
      window.addEventListener("resize", handleMobileScroll);
      handleMobileScroll();
      return;
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playTitle();
              window.setTimeout(playCards, 1000);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "-50% 0px -50% 0px",
          threshold: 0
        }
      );

      observer.observe(gallery);
    } else {
      playTitle();
      window.setTimeout(playCards, 1000);
    }
  }

  function initFeaturedGallery() {
    const gallery = document.querySelector(".featured-gallery");
    if (!gallery) return;

    const rail = gallery.querySelector(".featured-gallery__rail");
    const cards = Array.from(gallery.querySelectorAll(".featured-gallery__card-link"));
    const names = Array.from(gallery.querySelectorAll(".featured-gallery__hover-name"));
    const prevButton = gallery.querySelector(".featured-gallery__nav-button--prev");
    const nextButton = gallery.querySelector(".featured-gallery__nav-button--next");
    const mobileQuery = window.matchMedia("(max-width: 820px)");

    if (!rail || cards.length === 0 || names.length === 0 || !prevButton || !nextButton) return;

    const deckTransforms = [
      { x: 0, y: 16, rotate: 0, scale: 1, lift: -10, z: 6, opacity: 1 },
      { x: 46, y: 18, rotate: 3, scale: 0.94, lift: 0, z: 5, opacity: 0.94 },
      { x: 82, y: 22, rotate: 6, scale: 0.88, lift: 0, z: 4, opacity: 0.82 },
      { x: -82, y: 22, rotate: -6, scale: 0.88, lift: 0, z: 4, opacity: 0.82 },
      { x: -46, y: 18, rotate: -3, scale: 0.94, lift: 0, z: 5, opacity: 0.94 }
    ];

    let activeIndex = Math.floor(cards.length / 2);
    let touchStartX = 0;
    let touchStartY = 0;

    function getDeckSlot(index) {
      return (index - activeIndex + cards.length) % cards.length;
    }

    function applyDesktopState() {
      gallery.classList.remove("featured-gallery--mobile-deck");

      cards.forEach((card) => {
        card.classList.remove("is-active");
        card.style.removeProperty("--deck-x");
        card.style.removeProperty("--deck-y");
        card.style.removeProperty("--deck-rotate");
        card.style.removeProperty("--deck-scale");
        card.style.removeProperty("--deck-lift");
        card.style.removeProperty("--deck-z");
        card.style.removeProperty("--deck-opacity");
        card.style.removeProperty("pointer-events");
        card.removeAttribute("tabindex");
      });

      names.forEach((name) => name.classList.remove("is-active"));
    }

    function applyMobileState() {
      gallery.classList.add("featured-gallery--mobile-deck");

      cards.forEach((card, index) => {
        const slot = getDeckSlot(index);
        const state = deckTransforms[slot];
        const isActive = slot === 0;

        card.classList.toggle("is-active", isActive);
        card.style.setProperty("--deck-x", state.x + "px");
        card.style.setProperty("--deck-y", state.y + "px");
        card.style.setProperty("--deck-rotate", state.rotate + "deg");
        card.style.setProperty("--deck-scale", String(state.scale));
        card.style.setProperty("--deck-lift", state.lift + "px");
        card.style.setProperty("--deck-z", String(state.z));
        card.style.setProperty("--deck-opacity", String(state.opacity));
        card.style.setProperty("pointer-events", isActive ? "auto" : "none");
        card.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      names.forEach((name, index) => {
        name.classList.toggle("is-active", index === activeIndex);
      });
    }

    function render() {
      if (mobileQuery.matches) {
        applyMobileState();
      } else {
        applyDesktopState();
      }
    }

    function step(direction) {
      if (!mobileQuery.matches) return;
      activeIndex = (activeIndex + direction + cards.length) % cards.length;
      render();
    }

    function handleTouchStart(event) {
      if (!mobileQuery.matches) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }

    function handleTouchEnd(event) {
      if (!mobileQuery.matches) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 30 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

      if (deltaX < 0) {
        step(1);
      } else {
        step(-1);
      }
    }

    prevButton.addEventListener("click", () => step(-1));
    nextButton.addEventListener("click", () => step(1));
    rail.addEventListener("touchstart", handleTouchStart, { passive: true });
    rail.addEventListener("touchend", handleTouchEnd, { passive: true });

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", render);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(render);
    }

    render();
  }

  function init() {
    initPortfolioChoice();
    initFeaturedRevealSequence();
    initFeaturedGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
