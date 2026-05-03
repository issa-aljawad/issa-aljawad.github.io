/**
 * PROJECT ANIMATION MANAGER
 * Consolidates all SVG animation logic for the project deck.
 */

const AnimationManager = (function () {
    // Selectors
    const DECK_CARDS = ".deck-card";
    const LOGO_DISPLAY_ID = "cardLogoDisplay";

    // State
    const states = {
        loaded: new Set(),
        activeIndices: new Set(),
        isSectionVisible: false
    };

    /**
     * SHARED SVG FETCHER
     */
    async function fetchSVG(path) {
        try {
            const response = await fetch(`${path}?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (e) {
            console.error(`Could not fetch SVG at ${path}:`, e);
            return null;
        }
    }

    /**
     * CLEAN RESTART HELPER
     */
    function restartAnimation(element) {
        if (!element) return;
        element.style.animation = "none";
        void element.offsetHeight; // force reflow
        element.style.animation = "";
    }

    /**
     * ========================================================
     * TYPE 0: MORTAL KOMBAT 11 / MOVIE (Dragon & Spear)
     * ========================================================
     */
    function setupDragonSpear(container, svgText) {
        container.innerHTML = svgText;
        const svg = container.querySelector("svg");
        if (!svg) return;

        svg.removeAttribute("width");
        svg.removeAttribute("height");

        // Add filter if not exists
        if (!svg.querySelector("#roughen")) {
            svg.insertAdjacentHTML("afterbegin", `
                <defs>
                    <filter id="roughen">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
                    </filter>
                </defs>
            `);
        }

        const shapes = svg.querySelectorAll("path, rect, circle, ellipse, line, polyline, polygon");
        shapes.forEach((shape, i) => {
            const length = shape.getTotalLength ? shape.getTotalLength() : 1000;
            const delay = Math.min(i * 0.004, 1.2);
            shape.style.setProperty("--path-length", length);
            shape.style.setProperty("--delay", `${delay}s`);
            shape.style.strokeDasharray = length;
            shape.style.strokeDashoffset = length;
        });
    }

    /**
     * ========================================================
     * TYPE 1: DYING LIGHT 2 (Zombie & Blood Hand)
     * ========================================================
     */
    function setupZombieBlood(container, svgText, isBlood = false) {
        container.innerHTML = svgText;
        const svg = container.querySelector("svg");
        if (!svg) return;

        svg.removeAttribute("width");
        svg.removeAttribute("height");

        if (isBlood) {
            svg.classList.add("blood-hand-svg");
            svg.setAttribute("aria-label", "Blood hand pulse reveal animation");

            // Glow layer
            const glowLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            glowLayer.setAttribute("class", "blood-hand-glow-layer");
            svg.querySelectorAll("path, circle, rect, ellipse, polygon, polyline, line").forEach(s => {
                glowLayer.appendChild(s.cloneNode(true));
            });
            svg.insertBefore(glowLayer, svg.firstElementChild);

            // Wrap pieces
            svg.querySelectorAll("path, circle, rect, ellipse, polygon, polyline, line").forEach((shape, i) => {
                if (shape.parentNode === glowLayer) return;
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", `blood-hand-piece p${i % 16}`);
                if (i === 0) g.classList.add("blood-hand-main-piece");
                shape.parentNode.insertBefore(g, shape);
                g.appendChild(shape);
            });
        }
    }

    /**
     * ========================================================
     * TYPE 3: AC MIRAGE (Spear Pull)
     * ========================================================
     */
    function setupACSpear(container, svgText) {
        const mount = container.querySelector(".ac-svg-mount") || container;
        mount.innerHTML = svgText;
        const svg = mount.querySelector("svg");
        if (!svg) return;

        svg.classList.add("ac-logo");

        const chain = svg.querySelector("#chain");
        const spear = svg.querySelector("#spear");
        const text = svg.querySelector("#view-the-art");
        const gauntlet = svg.querySelector("#gauntlet");

        if (!chain || !spear || !text || !gauntlet) return;

        if (svg.querySelector("#chain-pull-set")) return; // already grouped

        const chainPullSet = document.createElementNS("http://www.w3.org/2000/svg", "g");
        chainPullSet.setAttribute("id", "chain-pull-set");
        const frontPullSet = document.createElementNS("http://www.w3.org/2000/svg", "g");
        frontPullSet.setAttribute("id", "front-pull-set");

        gauntlet.parentNode.insertBefore(chainPullSet, gauntlet);
        gauntlet.parentNode.insertBefore(frontPullSet, gauntlet.nextSibling);

        chainPullSet.appendChild(chain);
        frontPullSet.appendChild(spear);
        frontPullSet.appendChild(text);
    }

    /**
     * ========================================================
     * TYPE 4: GENESIS SENSHI (RAIN)
     * ========================================================
     */
    function setupGenesisRain(container) {
        if (container.children.length > 0) return; // already created

        const DROP_COUNT = 80; // slightly fewer for integration
        for (let i = 0; i < DROP_COUNT; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';

            // Random position and depth
            const z = Math.random();
            const delay = Math.random() * -5;
            const duration = 0.6 + (1 - z) * 1.4;

            drop.style.left = `${Math.random() * 120 - 10}%`;
            drop.style.width = `${1 + z * 1.5}px`;
            drop.style.height = `${40 + z * 60}px`;
            drop.style.opacity = 0.1 + z * 0.4;
            drop.style.animation = `genesisRain ${duration}s linear ${delay}s infinite`;

            container.appendChild(drop);
        }
    }

    /**
     * CORE SYNC LOGIC
     */
    async function syncAnimations() {
        if (!states.isSectionVisible) return;

        const cards = document.querySelectorAll(DECK_CARDS);
        const display = document.getElementById(LOGO_DISPLAY_ID);
        if (!display) return;

        cards.forEach(async (card) => {
            const index = card.dataset.index;
            const stage = document.querySelector(".works-stage");
            const elements = stage.querySelectorAll(`[data-index="${index}"]`);

            elements.forEach(async el => {
                const isActive = card.classList.contains("is-active");
                el.classList.toggle("active", isActive);

                // Load SVG if requested and not yet loaded
                const path = el.dataset.svg;
                if (isActive && path && !states.loaded.has(`${index}-${el.className}`)) {
                    const svgText = await fetchSVG(path);
                    if (svgText) {
                        if (el.classList.contains("card-svg-logo") || el.classList.contains("card-svg-spear-0")) {
                            setupDragonSpear(el, svgText);
                        } else if (el.classList.contains("card-svg-zombie-1")) {
                            setupZombieBlood(el, svgText);
                        } else if (el.classList.contains("card-svg-blood-hand-1")) {
                            setupZombieBlood(el, svgText, true);
                        } else if (el.classList.contains("ac-hand-animation")) {
                            setupACSpear(el, svgText);
                        }
                        states.loaded.add(`${index}-${el.className}`);
                    }
                }

                // Handle Non-SVG logic (Genesis Rain)
                if (isActive && el.classList.contains("card-genesis-wrap")) {
                    setupGenesisRain(el);
                }

                // Trigger animations inside SVG
                if (isActive) {
                    restartAnimation(el); // Restart wrapper animation if any
                    const svg = el.querySelector("svg");
                    if (svg) {
                        svg.classList.remove("is-animating");
                        void svg.offsetHeight;
                        svg.classList.add("is-animating");
                    }
                } else {
                    const svg = el.querySelector("svg");
                    if (svg) svg.classList.remove("is-animating");
                }
            });
        });
    }

    /**
     * INITIALIZE
     */
    function init() {
        const section = document.getElementById("projects");
        if (!section) return;

        // Observe section visibility
        const intersectObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                states.isSectionVisible = entry.isIntersecting;
                if (states.isSectionVisible) {
                    syncAnimations();
                }
            });
        }, { threshold: 0.1 });

        intersectObserver.observe(section);

        // Observe card changes
        const cards = document.querySelectorAll(DECK_CARDS);
        if (cards.length === 0) return;

        const observer = new MutationObserver(() => syncAnimations());
        cards.forEach(card => observer.observe(card, { attributes: true, attributeFilter: ["class"] }));

        // Optimized Marquee Cleanup
        const marqueeTrack = document.querySelector(".logos-track");
        if (marqueeTrack && marqueeTrack.children.length > 0) {
            const clone = marqueeTrack.innerHTML;
            marqueeTrack.innerHTML += clone; // Dynamic duplication
        }
    }

    /**
     * SCROLL REVEAL MANAGER
     */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(".works-heading, .card-deck");

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal-active");
                    // Unobserve to keep the animation one-time
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5 // Triggers when element is halfway in view
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    return { init, initScrollReveal };
})();

document.addEventListener("DOMContentLoaded", () => {
    AnimationManager.init();
    AnimationManager.initScrollReveal();
});
