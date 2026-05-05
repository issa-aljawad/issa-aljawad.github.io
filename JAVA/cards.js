(function () {
    const section = document.getElementById('projects');
    const stageLink = document.getElementById('featuredArtworkLink');
    const display = document.getElementById('categoryDisplay');
    const dataItems = document.querySelectorAll('.works-data-item');
    const triggers = document.querySelectorAll('.scroll-trigger');

    if (!section || !stageLink || !display || dataItems.length === 0 || triggers.length === 0) return;

    const categories = display.querySelectorAll('.category-text');
    const wrap = section.querySelector('.works-scroll-wrap');
    const total = triggers.length;
    let currentIndex = -1;

    if (wrap) {
        wrap.style.setProperty('--works-count', String(total));
    }

    function setActive(index) {
        if (index === currentIndex || index < 0 || index >= dataItems.length) return;
        currentIndex = index;

        const activeItem = dataItems[index];
        const image = activeItem.dataset.image;
        const category = activeItem.dataset.category;

        stageLink.href = activeItem.getAttribute('href') || '#';
        stageLink.setAttribute('aria-label', `Open featured artwork: ${activeItem.textContent.trim()}`);
        stageLink.style.setProperty('--featured-image', `url("${image}")`);
        stageLink.style.setProperty('--featured-index', String(index));
        section.style.setProperty('--featured-image', `url("${image}")`);

        categories.forEach((categoryItem, itemIndex) => {
            categoryItem.classList.toggle('is-active', itemIndex === index);
        });

        display.setAttribute('data-active-category', category);
    }

    function goTo(index) {
        if (index < 0 || index >= total) return;
        triggers[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.addEventListener('keydown', (event) => {
        const rect = section.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (!inView) return;

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goTo(currentIndex - 1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            goTo(currentIndex + 1);
        }
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = parseInt(entry.target.dataset.index, 10);
                setActive(index);
            });
        }, {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        });

        triggers.forEach((trigger) => observer.observe(trigger));
    }

    setActive(0);

    requestAnimationFrame(() => {
        if (currentIndex !== 0 && window.scrollY < 100) {
            setActive(0);
        }
    });
})();
