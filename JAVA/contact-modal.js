/**
 * CONTACT MODAL HANDLER
 * Controls the high-fidelity contact popup
 */

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('closeModal');
  const form = document.getElementById('modalForm');
  const firstInput = form?.querySelector('.form-input');
  let lastTrigger = null;

  // Select all "Let's Create" links across the site
  // This includes Banner-3, Service Pages (if linked), and footer CTAs
  const triggerLinks = document.querySelectorAll('a[href*="#contact"], .cta-btn');

  const openModal = (e) => {
    // If it's a hash link, prevent default behavior to show modal instead
    if (e.currentTarget.getAttribute('href')?.includes('#contact')) {
      e.preventDefault();
    }
    lastTrigger = e.currentTarget;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    firstInput?.focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
    lastTrigger?.focus();
  };

  // Add click events to triggers
  triggerLinks.forEach(link => {
    link.addEventListener('click', openModal);
  });

  // Close events
  closeBtn.addEventListener('click', closeModal);

  // Close on clicking outside the modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate high-end submission
    const submitBtn = form.querySelector('.modal-submit');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'SENDING...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      submitBtn.textContent = 'MESSAGE SENT!';
      submitBtn.style.background = '#fff';
      submitBtn.style.color = '#000';
      
      setTimeout(() => {
        closeModal();
        // Reset form
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '';
        submitBtn.style.pointerEvents = '';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
      }, 2000);
    }, 1500);
  });
});
