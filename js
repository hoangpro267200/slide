// ============================================
// FUTUREOS V12 - FULLSCREEN CINEMATIC MODE
// Production-Ready JavaScript
// ============================================

(function() {
    'use strict';

    // ============================================
    // STATE & CONFIGURATION
    // ============================================

    const STATE = {
        currentSlideIndex: 0,
        isTransitioning: false,
        slides: [],
        timelineNodes: []
    };

    const CONFIG = {
        observerThreshold: 0.5,
        transitionDuration: 1000,
        parallaxEnabled: true,
        parallaxStrength: 4
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        // Cache DOM elements
        STATE.slides = Array.from(document.querySelectorAll('.slide'));
        STATE.timelineNodes = Array.from(document.querySelectorAll('.timeline-node'));

        // Initialize components
        initProgressBar();
        initIntersectionObserver();
        initTimelineNavigation();
        initNextButtons();
        initKeyboardNavigation();
        initTouchGestures();
        
        if (CONFIG.parallaxEnabled) {
            initParallaxMouse();
        }

        // Mark first slide as visible
        if (STATE.slides[0]) {
            STATE.slides[0].classList.add('visible');
            setActiveSlide('slide-01');
        }

        console.log('✅ FutureOS V12 initialized');
        console.log(`📊 ${STATE.slides.length} slides loaded`);
    }

    // ============================================
    // PROGRESS BAR
    // ============================================

    function initProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;

        let ticking = false;

        function updateProgress() {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });

        updateProgress();
    }

    // ============================================
    // INTERSECTION OBSERVER
    // ============================================

    function initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.observerThreshold) {
                    entry.target.classList.add('visible');
                    setActiveSlide(entry.target.id);
                    updateCurrentSlideIndex();
                }
            });
        }, {
            threshold: CONFIG.observerThreshold,
            rootMargin: '0px'
        });

        STATE.slides.forEach(slide => observer.observe(slide));
    }

    // ============================================
    // TIMELINE NAVIGATION
    // ============================================

    function initTimelineNavigation() {
        STATE.timelineNodes.forEach(node => {
            node.addEventListener('click', () => {
                const target = node.getAttribute('data-target');
                const targetSlide = document.querySelector(target);
                
                if (targetSlide && !STATE.isTransitioning) {
                    cinematicTransition(targetSlide);
                }
            });
        });
    }

    function setActiveSlide(slideId) {
        // Update timeline nodes
        STATE.timelineNodes.forEach(node => {
            node.classList.remove('active', 'next');
            
            const target = node.getAttribute('data-target');
            if (target === `#${slideId}`) {
                node.classList.add('active');
            }
        });

        // Update next indicator
        const currentIndex = STATE.slides.findIndex(slide => slide.id === slideId);
        if (currentIndex >= 0 && currentIndex < STATE.slides.length - 1) {
            const nextSlideId = STATE.slides[currentIndex + 1].id;
            STATE.timelineNodes.forEach(node => {
                if (node.getAttribute('data-target') === `#${nextSlideId}`) {
                    node.classList.add('next');
                }
            });
        }
    }

    function updateCurrentSlideIndex() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        for (let i = 0; i < STATE.slides.length; i++) {
            const slide = STATE.slides[i];
            const slideTop = slide.offsetTop;
            const slideBottom = slideTop + slide.offsetHeight;
            
            if (scrollPosition >= slideTop && scrollPosition < slideBottom) {
                STATE.currentSlideIndex = i;
                break;
            }
        }
    }

    // ============================================
    // CINEMATIC TRANSITION ENGINE
    // ============================================

    function cinematicTransition(targetSlide) {
        if (STATE.isTransitioning || !targetSlide) return;
        
        STATE.isTransitioning = true;
        updateCurrentSlideIndex();
        
        const currentSlide = STATE.slides[STATE.currentSlideIndex];
        
        if (!currentSlide || currentSlide === targetSlide) {
            STATE.isTransitioning = false;
            return;
        }

        // Stage 1: Warp out current slide
        currentSlide.classList.add('warp-out');

        // Stage 2: Light sweep effect
        setTimeout(() => {
            document.body.classList.add('light-sweep');
        }, 100);

        // Stage 3: Scroll to target
        setTimeout(() => {
            targetSlide.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 280);

        // Stage 4: Remove sweep and warp in
        setTimeout(() => {
            document.body.classList.remove('light-sweep');
            targetSlide.classList.add('warp-in', 'visible');
        }, 600);

        // Stage 5: Cleanup
        setTimeout(() => {
            currentSlide.classList.remove('warp-out');
            targetSlide.classList.remove('warp-in');
            setActiveSlide(targetSlide.id);
            STATE.isTransitioning = false;
        }, CONFIG.transitionDuration);
    }

    // ============================================
    // NEXT BUTTONS
    // ============================================

    function initNextButtons() {
        const nextButtons = document.querySelectorAll('.next-btn');
        
        nextButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (STATE.isTransitioning) return;
                
                const target = btn.getAttribute('data-target');
                const targetSlide = document.querySelector(target);
                
                if (targetSlide) {
                    cinematicTransition(targetSlide);
                }
            });
        });
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================

    function initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (STATE.isTransitioning) return;

            updateCurrentSlideIndex();
            const currentIndex = STATE.currentSlideIndex;

            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault();
                    if (currentIndex < STATE.slides.length - 1) {
                        cinematicTransition(STATE.slides[currentIndex + 1]);
                    }
                    break;

                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        cinematicTransition(STATE.slides[currentIndex - 1]);
                    }
                    break;

                case 'Home':
                    e.preventDefault();
                    cinematicTransition(STATE.slides[0]);
                    break;

                case 'End':
                    e.preventDefault();
                    cinematicTransition(STATE.slides[STATE.slides.length - 1]);
                    break;
            }
        });
    }

    // ============================================
    // TOUCH GESTURES
    // ============================================

    function initTouchGestures() {
        let touchStartY = 0;
        let touchEndY = 0;
        const swipeThreshold = 50;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            if (STATE.isTransitioning) return;
            
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > swipeThreshold) {
                updateCurrentSlideIndex();
                const currentIndex = STATE.currentSlideIndex;
                
                if (diff > 0 && currentIndex < STATE.slides.length - 1) {
                    // Swipe up - next slide
                    cinematicTransition(STATE.slides[currentIndex + 1]);
                } else if (diff < 0 && currentIndex > 0) {
                    // Swipe down - previous slide
                    cinematicTransition(STATE.slides[currentIndex - 1]);
                }
            }
        }
    }

    // ============================================
    // PARALLAX MOUSE EFFECT
    // ============================================

    function initParallaxMouse() {
        let mouseX = 0;
        let mouseY = 0;
        let isMouseMoving = false;
        let mouseMoveTimeout;

        document.addEventListener('mousemove', (e) => {
            const { innerWidth, innerHeight } = window;
            mouseX = (e.clientX / innerWidth) - 0.5;
            mouseY = (e.clientY / innerHeight) - 0.5;
            isMouseMoving = true;
            
            updateParallax();
            
            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(() => {
                isMouseMoving = false;
                resetParallax();
            }, 2000);
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            isMouseMoving = false;
            resetParallax();
        });

        function updateParallax() {
            requestAnimationFrame(() => {
                const activeSlide = document.querySelector('.slide.visible .slide-body');
                if (!activeSlide || !isMouseMoving) return;
                
                const slide = activeSlide.closest('.slide');
                if (slide && (slide.classList.contains('warp-out') || slide.classList.contains('warp-in'))) {
                    return;
                }
                
                const rotateX = Math.max(-CONFIG.parallaxStrength, Math.min(CONFIG.parallaxStrength, mouseY * -CONFIG.parallaxStrength));
                const rotateY = Math.max(-CONFIG.parallaxStrength, Math.min(CONFIG.parallaxStrength, mouseX * CONFIG.parallaxStrength));
                
                activeSlide.style.transform = `
                    translateY(0) 
                    scale(1) 
                    perspective(1600px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg)
                `;
            });
        }

        function resetParallax() {
            requestAnimationFrame(() => {
                const activeSlide = document.querySelector('.slide.visible .slide-body');
                if (activeSlide) {
                    const slide = activeSlide.closest('.slide');
                    if (slide && !slide.classList.contains('warp-out') && !slide.classList.contains('warp-in')) {
                        activeSlide.style.transform = `
                            translateY(0) 
                            scale(1) 
                            perspective(1600px) 
                            rotateX(0deg) 
                            rotateY(0deg)
                        `;
                    }
                }
            });
        }
    }

    // ============================================
    // WINDOW RESIZE HANDLER
    // ============================================

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateCurrentSlideIndex();
            const currentSlide = STATE.slides[STATE.currentSlideIndex];
            if (currentSlide) {
                setActiveSlide(currentSlide.id);
            }
        }, 250);
    }, { passive: true });

    // ============================================
    // START APPLICATION
    // ============================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// ============================================
// CONSOLE BRANDING
// ============================================

console.log('%c🚀 FutureOS V12', 'color: #33ff77; font-size: 24px; font-weight: bold;');
console.log('%cFULLSCREEN CINEMATIC MODE', 'color: #33ff77; font-size: 14px;');
console.log('%c⌨️  Keyboard: ↑↓ or PgUp/PgDn to navigate', 'color: #999; font-size: 12px;');
console.log('%c👆 Touch: Swipe up/down to navigate', 'color: #999; font-size: 12px;');
console.log('%c🎯 Timeline: Click dots on right to jump', 'color: #999; font-size: 12px;');