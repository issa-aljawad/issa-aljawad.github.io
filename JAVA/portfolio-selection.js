(function () {
  function init() {
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
