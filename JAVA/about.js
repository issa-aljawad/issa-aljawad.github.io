document.addEventListener('DOMContentLoaded', () => {
  const aboutSection = document.querySelector('#about');

  if (!aboutSection) return;

  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutSection.classList.add('reveal');
        aboutObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -80px 0px'
  });

  aboutObserver.observe(aboutSection);

  // Hologram Mouse Tracking
  const card = document.querySelector('.cv-card');
  if (card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  }
});
