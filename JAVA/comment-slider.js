/**
 * COMMENT SLIDER HANDLER
 * Handles slide navigation, progress tracking, and scroll reveals
 */

document.addEventListener('DOMContentLoaded', () => {
  const commentSection = document.querySelector('.comment-section');
  const slides = document.querySelectorAll('.comment-slide');
  const prevBtn = document.querySelector('.comment-nav-btn.prev');
  const nextBtn = document.querySelector('.comment-nav-btn.next');
  const progressBar = document.querySelector('.comment-progress-bar');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  let currentSlide = 0;
  const totalSlides = slides.length;

  // --- REVEAL ON SCROLL ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        commentSection.classList.add('reveal-active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Lower threshold for earlier activation

  if (commentSection) revealObserver.observe(commentSection);

  // --- SLIDER LOGIC ---
  const updateSlider = (index) => {
    if (!slides.length) return;
    
    // Remove active from all
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Set current slide
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    
    // Update Progress Thumb Position
    if (progressBar && progressBar.parentElement) {
      const containerWidth = progressBar.parentElement.offsetWidth;
      const thumbWidth = progressBar.offsetWidth;
      const maxTravel = containerWidth - thumbWidth;
      
      // Prevent division by zero if totalSlides is 1
      const progress = totalSlides > 1 ? currentSlide / (totalSlides - 1) : 1;
      const moveX = progress * maxTravel;
      
      progressBar.style.transform = `translateX(${moveX}px)`;
    }
  };

  // Initial Update
  if (progressBar) {
    // Slight delay to ensure layout is ready for calculation
    setTimeout(() => updateSlider(0), 100);
  }

  // Handle Resize to recalculate thumb position
  window.addEventListener('resize', () => updateSlider(currentSlide));

  // Navigation Click Events
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let nextIndex = currentSlide + 1;
      if (nextIndex >= totalSlides) nextIndex = 0;
      updateSlider(nextIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      let prevIndex = currentSlide - 1;
      if (prevIndex < 0) prevIndex = totalSlides - 1;
      updateSlider(prevIndex);
    });
  }

  // Auto-play (Optional, but adds high-end feel)
  let autoPlayTimer = null;

  if (!prefersReducedMotion) {
    autoPlayTimer = setInterval(() => {
      let nextIndex = (currentSlide + 1) % totalSlides;
      updateSlider(nextIndex);
    }, 8000);
  }

  // Reset timer on user interaction
  const resetTimer = () => {
    if (prefersReducedMotion) return;
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      let nextIndex = (currentSlide + 1) % totalSlides;
      updateSlider(nextIndex);
    }, 8000);
  };

  if (prevBtn) prevBtn.addEventListener('click', resetTimer);
  if (nextBtn) nextBtn.addEventListener('click', resetTimer);
});
