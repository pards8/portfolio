document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navLinks = document.querySelectorAll(".nav-link");
const slides = document.querySelectorAll(".slide");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let aboutTransitionRunning = false;
let activeIndicatorLink = null;
const navIndicator = document.createElement("span");
navIndicator.className = "nav-indicator";
navIndicator.setAttribute("aria-hidden", "true");
navigation.prepend(navIndicator);

function moveNavigationIndicator(link, animate = true) {
    if (!link) return;

    const shouldAnimate = animate && activeIndicatorLink !== null && !reducedMotion;
    navIndicator.classList.toggle("is-ready", shouldAnimate);
    navIndicator.style.width = `${link.offsetWidth}px`;
    navIndicator.style.height = `${link.offsetHeight}px`;
    navIndicator.style.transform = `translate3d(${link.offsetLeft}px, ${link.offsetTop}px, 0)`;
    activeIndicatorLink = link;
}

function setActiveNavigation(activeLink) {
    navLinks.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    moveNavigationIndicator(activeLink);
}

const initialActiveLink =
    document.querySelector(`.nav-link[href="${window.location.hash || "#home"}"]`) ||
    document.querySelector('.nav-link[href="#home"]');
setActiveNavigation(initialActiveLink);

function updateActiveNavigationFromScroll() {
    const anchor = window.innerHeight * 0.45;
    const activeSlide = Array.from(slides).find((slide) => {
        const bounds = slide.getBoundingClientRect();
        return bounds.top <= anchor && bounds.bottom > anchor;
    }) || slides[0];
    const activeLink = document.querySelector(`.nav-link[href="#${activeSlide.id}"]`);
    if (activeLink && activeLink !== activeIndicatorLink) setActiveNavigation(activeLink);
}

window.addEventListener("scroll", updateActiveNavigationFromScroll, { passive: true });
window.addEventListener("resize", () => {
    moveNavigationIndicator(activeIndicatorLink, false);
    updateActiveNavigationFromScroll();
});
window.addEventListener("hashchange", updateActiveNavigationFromScroll);
updateActiveNavigationFromScroll();
requestAnimationFrame(() => navIndicator.classList.add("is-ready"));

function matchAboutLayoutToHome() {
    const home = document.querySelector("#home");
    const about = document.querySelector("#about");
    const homeAccent = document.querySelector(".hero-accent");
    const homePortrait = document.querySelector(".hero-portrait");
    const aboutPanel = document.querySelector(".about-panel");
    const aboutAccent = document.querySelector(".about-accent");
    const aboutPortrait = document.querySelector(".about-photo");
    if (window.innerWidth <= 800) {
        homeAccent.style.removeProperty("height");
        homeAccent.style.removeProperty("top");
        homeAccent.style.removeProperty("bottom");
        aboutPanel.style.removeProperty("height");
        aboutPanel.style.removeProperty("min-height");
        aboutPanel.style.removeProperty("margin-top");
        aboutAccent.style.removeProperty("height");
        aboutAccent.style.removeProperty("bottom");
        aboutAccent.style.removeProperty("right");
        aboutAccent.style.removeProperty("width");
        aboutAccent.style.removeProperty("transform");
        aboutAccent.style.removeProperty("transform-origin");
        aboutPortrait.style.removeProperty("top");
        aboutPortrait.style.removeProperty("width");
        return;
    }

    homeAccent.style.removeProperty("height");
    homeAccent.style.removeProperty("top");
    homeAccent.style.removeProperty("bottom");
    aboutPanel.style.removeProperty("height");
    aboutPanel.style.removeProperty("min-height");
    aboutPanel.style.removeProperty("margin-top");
    aboutAccent.style.removeProperty("height");
    aboutAccent.style.removeProperty("bottom");
    aboutAccent.style.removeProperty("right");
    aboutAccent.style.removeProperty("width");
    aboutAccent.style.removeProperty("transform");
    aboutAccent.style.removeProperty("transform-origin");
    aboutPortrait.style.removeProperty("top");
    aboutPortrait.style.removeProperty("width");

    const homeBounds = home.getBoundingClientRect();
    const accentBounds = homeAccent.getBoundingClientRect();
    const portraitBounds = homePortrait.getBoundingClientRect();
    const sharedHeight = Math.ceil(accentBounds.height);
    const centeredTop = Math.max(0, (home.clientHeight - sharedHeight) / 2);
    const portraitCenterOffset = portraitBounds.top + portraitBounds.height / 2 -
        (homeBounds.top + centeredTop + sharedHeight / 2);
    homeAccent.style.height = `${sharedHeight}px`;
    homeAccent.style.top = `${centeredTop}px`;
    homeAccent.style.bottom = "auto";
    aboutPanel.style.height = `${sharedHeight}px`;
    aboutPanel.style.minHeight = `${sharedHeight}px`;
    aboutPanel.style.marginTop = `${Math.max(0, (about.clientHeight - sharedHeight) / 2)}px`;
    aboutAccent.style.height = `${sharedHeight}px`;
    aboutAccent.style.bottom = "auto";
    aboutPortrait.style.top = `calc(50% + ${portraitCenterOffset}px)`;
    aboutPortrait.style.width = `${portraitBounds.width}px`;

    const aboutPanelBounds = aboutPanel.getBoundingClientRect();
    const aboutPortraitBounds = aboutPortrait.getBoundingClientRect();
    const portraitCenter = aboutPortraitBounds.left + aboutPortraitBounds.width / 2;
    aboutAccent.style.left = "0";
    aboutAccent.style.right = "auto";
    aboutAccent.style.width = `${portraitCenter - aboutPanelBounds.left}px`;
}

matchAboutLayoutToHome();
let resizeFrame = 0;
window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(() => {
            matchAboutLayoutToHome();
            resizeFrame = requestAnimationFrame(matchAboutLayoutToHome);
        });
    });
});

function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
    if (!isOpen) requestAnimationFrame(() => moveNavigationIndicator(activeIndicatorLink, false));
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMenu();
        setActiveNavigation(link);
    });
});

function animateSharedSectionTransition({
    targetSection,
    sourcePortrait,
    targetPortrait,
    sourceAccent,
    targetAccent,
    targetHash
}) {
    aboutTransitionRunning = true;
    closeMenu();
    matchAboutLayoutToHome();
    const enteringAbout = targetSection.id === "about";
    if (enteringAbout) {
        targetSection.classList.remove("is-content-visible");
        targetSection.classList.add("is-transitioning-content");
        void targetSection.offsetWidth;
        targetSection.classList.add("is-content-visible");
    }

    const targetTop = targetSection.getBoundingClientRect().top + window.scrollY;
    const duration = 1250;
    const animationOptions = { duration, easing: "cubic-bezier(.65, 0, .35, 1)", fill: "both" };
    const sharedElements = [
        { source: sourceAccent, target: targetAccent, radius: "0px" },
        { source: sourcePortrait, target: targetPortrait, radius: "30px" }
    ];

    const animations = sharedElements.map(({ source, target, radius }) => {
        const sourceRect = source.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const clone = source.cloneNode(true);

        clone.classList.add("shared-transition-clone");
        clone.classList.remove("is-shared-transition-source");
        clone.removeAttribute("id");
        Object.assign(clone.style, {
            position: "fixed",
            inset: "auto",
            top: `${sourceRect.top}px`,
            left: `${sourceRect.left}px`,
            width: `${sourceRect.width}px`,
            height: `${sourceRect.height}px`,
            margin: "0",
            transform: "none",
            borderRadius: radius,
            opacity: "1"
        });
        document.body.append(clone);
        source.classList.add("is-shared-transition-source");
        target.classList.add("is-shared-transition-source");

        const animation = clone.animate([
            {
                left: `${sourceRect.left}px`,
                top: `${sourceRect.top}px`,
                width: `${sourceRect.width}px`,
                height: `${sourceRect.height}px`,
                borderRadius: radius,
                opacity: 1
            },
            {
                left: `${targetRect.left}px`,
                top: `${sourceRect.top}px`,
                width: `${targetRect.width}px`,
                height: `${sourceRect.height}px`,
                borderRadius: radius
            }
        ], animationOptions);

        return { animation, clone, source, target };
    });

    const scrollStart = window.scrollY;
    const scrollDistance = targetTop - scrollStart;
    const startedAt = performance.now();
    history.replaceState(null, "", targetHash);

    function moveBetweenSections(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, scrollStart + scrollDistance * eased);

        if (progress < 1) {
            requestAnimationFrame(moveBetweenSections);
            return;
        }

        window.scrollTo(0, targetTop);
        animations.forEach(({ animation, clone, source, target }) => {
            animation.cancel();
            clone.remove();
            source.classList.remove("is-shared-transition-source");
            target.classList.remove("is-shared-transition-source");
        });
        if (enteringAbout) targetSection.classList.remove("is-transitioning-content");
        aboutTransitionRunning = false;
    }

    requestAnimationFrame(moveBetweenSections);
}

document.querySelectorAll('a[href="#about"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const aboutSection = document.querySelector("#about");
        const homeSection = document.querySelector("#home");
        const fromHome = homeSection.getBoundingClientRect().top < window.innerHeight &&
            homeSection.getBoundingClientRect().bottom > 0;
        const targetTop = aboutSection.getBoundingClientRect().top + window.scrollY;

        event.preventDefault();
        if (aboutTransitionRunning) return;
        if (Math.abs(window.scrollY - targetTop) < 2) return;

        if (!fromHome || reducedMotion || window.innerWidth <= 800) {
            window.scrollTo({ top: targetTop, behavior: reducedMotion ? "instant" : "smooth" });
            history.replaceState(null, "", "#about");
            closeMenu();
            return;
        }

        animateSharedSectionTransition({
            targetSection: aboutSection,
            sourcePortrait: document.querySelector(".hero-portrait"),
            targetPortrait: document.querySelector(".about-photo"),
            sourceAccent: document.querySelector(".hero-accent"),
            targetAccent: document.querySelector(".about-accent"),
            targetHash: "#about"
        });
    });
});

document.querySelectorAll('a[href="#home"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const aboutSection = document.querySelector("#about");
        const homeSection = document.querySelector("#home");
        const fromAbout = aboutSection.getBoundingClientRect().top < window.innerHeight &&
            aboutSection.getBoundingClientRect().bottom > 0;

        if (!fromAbout) return;

        event.preventDefault();
        if (aboutTransitionRunning) return;

        const targetTop = homeSection.getBoundingClientRect().top + window.scrollY;
        if (Math.abs(window.scrollY - targetTop) < 2) return;

        if (reducedMotion || window.innerWidth <= 800) {
            window.scrollTo({ top: targetTop, behavior: reducedMotion ? "instant" : "smooth" });
            history.replaceState(null, "", "#home");
            closeMenu();
            return;
        }

        animateSharedSectionTransition({
            targetSection: homeSection,
            sourcePortrait: document.querySelector(".about-photo"),
            targetPortrait: document.querySelector(".hero-portrait"),
            sourceAccent: document.querySelector(".about-accent"),
            targetAccent: document.querySelector(".hero-accent"),
            targetHash: "#home"
        });
    });
});

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            if (entry.target.id === "about" && !aboutTransitionRunning) {
                entry.target.classList.add("is-content-visible");
            }
        });
        updateActiveNavigationFromScroll();
    }, { threshold: 0.35 });

    slides.forEach((slide) => sectionObserver.observe(slide));
} else {
    slides.forEach((slide) => slide.classList.add("is-visible"));
    document.querySelector("#about").classList.add("is-content-visible");
}

const projectCards = document.querySelectorAll(".project-card");
const projectAnimations = new WeakMap();

function slideProjectCard(card, index) {
    card.classList.add("is-visible");
    if (reducedMotion) return;
    projectAnimations.get(card)?.cancel();
    const offset = card.dataset.revealDirection === "left" ? -64 : 64;
    const animation = card.animate([
        { opacity: 0, transform: `translateX(${offset}px)` },
        { opacity: 1, transform: "translateX(0)" }
    ], {
        duration: 850,
        delay: index * 100,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "backwards"
    });
    projectAnimations.set(card, animation);
}

document.querySelectorAll('a[href="#projects"]').forEach((link) => {
    link.addEventListener("click", () => {
        projectCards.forEach((card, index) => {
            const bounds = card.getBoundingClientRect();
            if (bounds.top < window.innerHeight && bounds.bottom > 88) {
                slideProjectCard(card, index);
            }
        });
    });
});

if (reducedMotion || !("IntersectionObserver" in window)) {
    projectCards.forEach((card) => card.classList.add("is-visible"));
} else {
    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            slideProjectCard(entry.target, Array.from(projectCards).indexOf(entry.target));
        });
    }, { threshold: 0.15 });
    projectCards.forEach((card) => projectObserver.observe(card));
}

document.querySelector("#year").textContent = new Date().getFullYear();

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const recipient = document.querySelector(".contact-email").getAttribute("href").replace(/^mailto:/, "");
    const subject = encodeURIComponent(`Portfolio inquiry from ${formData.get("name")}`);
    const body = encodeURIComponent(
        `From: ${formData.get("name")} (${formData.get("email")})\n\n${formData.get("message")}`
    );

    formStatus.textContent = "Opening your email app…";
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});
