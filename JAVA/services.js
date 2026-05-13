(function () {
  function init() {
    const servicesSection = document.querySelector(".services-section");
    if (!servicesSection) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              servicesSection.classList.add("start-animation");
              const spineLine = document.getElementById("services-spine-line");
              if (spineLine) spineLine.classList.add("start-animation");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.3 // Trigger when 30% of the section is visible
        }
      );
      observer.observe(servicesSection);
    } else {
      servicesSection.classList.add("start-animation");
    }

    // Hologram Mouse Tracking for Service Boxes
    const serviceBoxes = document.querySelectorAll('.service-box');
    serviceBoxes.forEach(box => {
      box.addEventListener('mousemove', (e) => {
        const rect = box.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        box.style.setProperty('--mouse-x', `${x}%`);
        box.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
