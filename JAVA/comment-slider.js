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
  // Trigger when the section's vertical center aligns with the viewport's center
  if (commentSection) {
    const checkCenter = () => {
      const rect = commentSection.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      if (sectionCenter <= viewportCenter) {
        commentSection.classList.add('reveal-active');
        window.removeEventListener('scroll', checkCenter);
        window.removeEventListener('resize', checkCenter);
      }
    };
    window.addEventListener('scroll', checkCenter, { passive: true });
    window.addEventListener('resize', checkCenter, { passive: true });
    checkCenter();
  }

  // --- SLIDER LOGIC ---
  const updateSlider = (index) => {
    // Remove active from all
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Set current slide
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    
    // Update Progress Thumb Position
    // The thumb moves along the grey line
    if (progressBar && progressBar.parentElement) {
      const containerWidth = progressBar.parentElement.offsetWidth;
      const thumbWidth = progressBar.offsetWidth;
      const maxTravel = containerWidth - thumbWidth;
      const moveX = (currentSlide / (totalSlides - 1)) * maxTravel;
      
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

  // --- TOUCH SWIPE (mobile + tablet) ---
  const slider = document.querySelector('.comment-slider');
  if (slider && totalSlides > 1) {
    const SWIPE_THRESHOLD = 50; // px to count as a horizontal swipe
    let startX = 0;
    let startY = 0;
    let tracking = false;

    slider.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Only react to dominantly horizontal swipes
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

      if (deltaX < 0) {
        // Swipe left → next slide
        updateSlider((currentSlide + 1) % totalSlides);
      } else {
        // Swipe right → previous slide
        updateSlider((currentSlide - 1 + totalSlides) % totalSlides);
      }
      resetTimer();
    }, { passive: true });

    slider.addEventListener('touchcancel', () => {
      tracking = false;
    }, { passive: true });
  }
});
