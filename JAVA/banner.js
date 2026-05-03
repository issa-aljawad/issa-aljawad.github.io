document.addEventListener('DOMContentLoaded', () => {
  const toggleBtns = document.querySelectorAll('.header-toggle-btn');
  const marquees = document.querySelectorAll('.logos-marquee-wrap');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');

      // Update buttons
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update marquees
      marquees.forEach(marquee => {
        if (marquee.id === `marquee-${target}`) {
          marquee.classList.add('active');
        } else {
          marquee.classList.remove('active');
        }
      });
    });
  });

  // Reveal Animation on Scroll
  const bannerSection = document.querySelector('#companies');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bannerSection.classList.add('reveal');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.8 // Trigger only when 80% of the section is in view
  });

  if (bannerSection) {
    revealObserver.observe(bannerSection);
  }
});
