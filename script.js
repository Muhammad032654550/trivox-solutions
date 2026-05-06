const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const siteHeader = document.getElementById('siteHeader');
const cursor3d = document.getElementById('cursor3d');
const hero3dCard = document.getElementById('hero3dCard');
const preloader = document.getElementById('preloader');

let scrollProgress = document.getElementById('scrollProgress');
if (!scrollProgress) {
  scrollProgress = document.createElement('div');
  scrollProgress.id = 'scrollProgress';
  scrollProgress.className = 'scroll-progress';
  document.body.prepend(scrollProgress);
}

menuToggle?.addEventListener('click', () => nav?.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => nav?.classList.remove('open')));

window.addEventListener('load', () => {
  setTimeout(() => preloader?.classList.add('hide'), 120);
});

const onScrollUI = () => {
  if (siteHeader) {
    if (window.scrollY > 12) siteHeader.classList.add('scrolled');
    else siteHeader.classList.remove('scrolled');
  }
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? (window.scrollY / max) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
};
window.addEventListener('scroll', onScrollUI, { passive: true });
onScrollUI();

if (cursor3d && !window.matchMedia('(pointer: coarse)').matches) {
  window.addEventListener('mousemove', (event) => {
    cursor3d.style.left = `${event.clientX}px`;
    cursor3d.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('a, button, .tilt').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor3d.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor3d.classList.remove('active'));
  });
}

if (hero3dCard && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  hero3dCard.addEventListener('mousemove', (event) => {
    const bounds = hero3dCard.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const rotY = (x - 0.5) * 12;
    const rotX = (0.5 - y) * 12;
    hero3dCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  });
  hero3dCard.addEventListener('mouseleave', () => {
    hero3dCard.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const animateCounters = () => {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count || '0');
    if (el.dataset.done === '1' || Number.isNaN(target)) return;
    el.dataset.done = '1';
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * progress;
      if (target === 4.9) el.textContent = `${value.toFixed(1)}/5`;
      else if (target === 92 || target === 38 || target === 97 || target === 86) el.textContent = `${Math.round(value)}%`;
      else el.textContent = `${Math.round(value)}+`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

const kpi = document.querySelector('.kpi-strip');
if (kpi) {
  const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        kpiObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  kpiObserver.observe(kpi);
}

const testimonialRail = document.getElementById('testimonialsRail');
const reviewsPrev = document.getElementById('reviewsPrev');
const reviewsNext = document.getElementById('reviewsNext');
if (testimonialRail) {
  const step = () => Math.min(360, testimonialRail.clientWidth * 0.9);
  reviewsNext?.addEventListener('click', () => testimonialRail.scrollBy({ left: step(), behavior: 'smooth' }));
  reviewsPrev?.addEventListener('click', () => testimonialRail.scrollBy({ left: -step(), behavior: 'smooth' }));
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function initGsapAnimations() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 980px)').matches;
  if (reducedMotion || isMobile) return;

  try {
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.site-header', { y: -30, opacity: 0, duration: 0.7, ease: 'power2.out' });
    gsap.from('.hero-copy > *', { y: 28, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.1 });
    gsap.from('.hero-media', { x: 28, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });

    document.querySelectorAll('.section').forEach((section) => {
      gsap.from(section.querySelectorAll('h2, h3, p, article, img, .btn, li, video'), {
        scrollTrigger: { trigger: section, start: 'top 78%' },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power2.out'
      });
    });
  } catch (_) {
    // Ignore animation loading errors to keep UX fast.
  }
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(() => initGsapAnimations(), { timeout: 1600 });
} else {
  setTimeout(initGsapAnimations, 900);
}

const contactForm = document.getElementById('contactForm');
const contactEmail = document.getElementById('contactEmail');
const contactReplyTo = document.getElementById('contactReplyTo');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    if (contactEmail && contactReplyTo) {
      contactReplyTo.value = contactEmail.value.trim();
    }
    if (contactSubmitBtn) {
      contactSubmitBtn.textContent = 'Sending...';
      contactSubmitBtn.disabled = true;
    }
  });
}

