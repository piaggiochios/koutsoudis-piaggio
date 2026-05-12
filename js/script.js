/**
 * Piaggio Koutsoudis — Main JavaScript
 * =========================================================================== */

document.addEventListener('DOMContentLoaded', function () {


    // =========================================================================
    // 1. DOM Elements
    // =========================================================================

    const header              = document.getElementById('header');
    const mobileMenuBtn       = document.querySelector('.mobile-menu-btn');
    const navMenu             = document.querySelector('.nav-menu');
    const scrollTopBtn        = document.getElementById('scrollTop');
    const langButtons         = document.querySelectorAll('.lang-btn');
    const translatableElements = document.querySelectorAll('[data-el], [data-en]');


    // =========================================================================
    // 2. State
    // =========================================================================

    const browserLang = navigator.language.startsWith('el') ? 'el' : 'en';
    const currentLang = localStorage.getItem('preferredLang') || browserLang;


    // =========================================================================
    // 3. Scroll Animations
    // =========================================================================

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        const animatedElements = document.querySelectorAll(
            '.about-content, .about-image, .service-card, ' +
            '.benefit-item, .contact-content, .map-container, ' +
            '.contact-image, .brand-item'
        );

        animatedElements.forEach(el => observer.observe(el));
    }


    // =========================================================================
    // 4. Header & Scroll-to-Top
    // =========================================================================

    let ticking = false;

    function handleScrollEffects() {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }

        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('active', window.scrollY > 300);
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScrollEffects();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });


    // =========================================================================
    // 5. Mobile Menu
    // =========================================================================

    function toggleMobileMenu() {
        const isActive = navMenu.classList.toggle('active');

        mobileMenuBtn.textContent = isActive ? '✕' : '☰';
        mobileMenuBtn.setAttribute('aria-expanded', isActive);
        document.body.classList.toggle('menu-open', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';

        if (isActive) {
            navMenu.querySelector('a')?.focus();
        }
    }

    function closeMobileMenu() {
        if (!navMenu || !navMenu.classList.contains('active')) return;

        navMenu.classList.remove('active');
        mobileMenuBtn.textContent = '☰';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }


    // =========================================================================
    // 6. Language System
    // =========================================================================

    function changeLanguage(lang) {
        translatableElements.forEach(element => {
            if (!element.hasAttribute(`data-${lang}`)) return;

            const newText = element.getAttribute(`data-${lang}`);

            if (element.tagName === 'META') {
                element.setAttribute('content', newText);
            } else if (element.tagName === 'TITLE') {
                document.title = newText;
            } else if (element.children.length === 0) {
                element.textContent = newText;
            } else {
                element.innerHTML = newText;
            }
        });

        document.documentElement.lang = lang;

        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        localStorage.setItem('preferredLang', lang);
        updateAccessibilityLabels(lang);
    }

    function updateAccessibilityLabels(lang) {
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute(
                'aria-label',
                lang === 'el' ? 'Εναλλαγή μενού' : 'Toggle menu'
            );
        }

        if (scrollTopBtn) {
            scrollTopBtn.setAttribute(
                'aria-label',
                lang === 'el' ? 'Κύλιση προς τα επάνω' : 'Scroll to top'
            );
        }
    }


    // =========================================================================
    // 7. Slideshows
    // =========================================================================

    function initSlideshow(selector) {
        const slides = document.querySelectorAll(selector);
        if (!slides.length) return;

        let current = 0;

        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 4000);
    }


    // =========================================================================
    // 8. Smooth Scroll
    // =========================================================================

    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();
        closeMobileMenu();

        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, null, targetId);
    });


    // =========================================================================
    // 9. Close Menu on Outside Click / Escape Key
    // =========================================================================

    document.addEventListener('click', function (e) {
        if (
            navMenu &&
            navMenu.classList.contains('active') &&
            !e.target.closest('nav') &&
            !e.target.closest('.mobile-menu-btn')
        ) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileMenu();
    });


    // =========================================================================
    // 10. Init
    // =========================================================================

    function init() {
        // Τρέξε τη γλώσσα ΜΟΝΟ αν δεν είναι η προεπιλεγμένη (Ελληνικά), 
        // για να γλιτώσεις επεξεργασία στο start-up.
        if (currentLang !== 'el') {
            changeLanguage(currentLang);
        }

        langButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                changeLanguage(this.getAttribute('data-lang'));
            });
        });

        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Δώσε προτεραιότητα στο layout και μετά ξεκίνα τα animations
        setTimeout(() => {
            initScrollAnimations();
            initSlideshow('.about-image img');
            initSlideshow('.contact-image img');
        }, 1000); // 1 δευτερόλεπτο καθυστέρηση

        handleScrollEffects();
    }

    init();

});