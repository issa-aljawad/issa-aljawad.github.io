(function () {
    const deck = document.getElementById('cardDeck');
    const display = document.getElementById('categoryDisplay');
    const triggers = document.querySelectorAll('.scroll-trigger');
    if (!deck || !display || triggers.length === 0) return;

    const cards = deck.querySelectorAll('.deck-card');
    const categories = display.querySelectorAll('.category-text');
    const wrap = deck.closest('.works-scroll-wrap');

    const prevBtn = document.getElementById('deckPrev');
    const nextBtn = document.getElementById('deckNext');
    const indicator = document.getElementById('deckIndicator');
    const total = triggers.length;
    let currentIndex = -1;   // ← FIXED: was 0, now -1 forces initial setActive(0) to actually apply classes

    const dots = [];

    if (wrap) wrap.style.setProperty('--works-count', String(total));

    if (indicator) {
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'deck-dot';
            dot.dataset.index = i;
            dot.setAttribute('aria-label', `Go to project ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            indicator.appendChild(dot);
            dots.push(dot);
        }
    }

    function setActive(index) {
        if (index === currentIndex) return;   // ← ADDED: short-circuit redundant calls
        currentIndex = index;

        cards.forEach((card, i) => {
            card.classList.remove(
                'is-past',
                'is-active',
                'is-upcoming-1',
                'is-upcoming-2',
                'is-upcoming-3',
                'is-upcoming-4'
            );

            const offset = i - index;

            if (offset < 0) card.classList.add('is-past');
            else if (offset === 0) card.classList.add('is-active');
            else if (offset === 1) card.classList.add('is-upcoming-1');
            else if (offset === 2) card.classList.add('is-upcoming-2');
            else if (offset === 3) card.classList.add('is-upcoming-3');
            else card.classList.add('is-upcoming-4');
        });

        categories.forEach((c, i) => {
            c.classList.toggle('is-active', i === index);
        });

        dots.forEach((d, i) => {
            d.classList.toggle('is-active', i === index);
            d.setAttribute('aria-current', i === index ? 'true' : 'false');
        });

        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === total - 1;
    }

    function goTo(index) {
        if (index < 0 || index >= total) return;
        triggers[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    document.addEventListener('keydown', (e) => {
        const rect = deck.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (!inView) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(currentIndex - 1);
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(currentIndex + 1);
        }
    });

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = parseInt(entry.target.dataset.index, 10);
                    setActive(idx);
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        });

        triggers.forEach((t) => io.observe(t));
    }

    // Initial state — card 0 active on page load
    setActive(0);

    // Safety net: if the observer immediately overrode our init and the page
    // is still at the top, re-assert card 0 after the browser settles.
    requestAnimationFrame(() => {
        if (currentIndex !== 0 && window.scrollY < 100) {
            setActive(0);
        }
    });
})();