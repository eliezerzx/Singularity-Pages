'use strict';

/* ─────────────────────────────────────────
   NAV SCROLL
───────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ─────────────────────────────────────────
   HAMBURGER MENU
───────────────────────────────────────── */
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileMenu');
ham.addEventListener('click', () => {
  const open = mob.classList.toggle('open');
  ham.setAttribute('aria-expanded', open);
});
mob.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mob.classList.remove('open'))
);

/* ─────────────────────────────────────────
   SMOOTH ANCHORS
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────
   COUNTER ANIMATION
   Lê data-count (número alvo) e data-suffix
   Conta de 0 até o alvo com easing
───────────────────────────────────────── */
function animateCounter(el) {
  const target  = parseInt(el.dataset.count, 10);
  const suffix  = el.dataset.suffix || '';
  const duration = 1600; // ms
  const startTime = performance.now();

  // easeOutExpo
  function easeOut(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOut(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* Observer para os contadores — dispara quando entra na viewport */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* Hero stats: dispara 800ms após load (espera animação CSS terminar) */
document.querySelectorAll('.hstat-n[data-count]').forEach(el => {
  counterObserver.unobserve(el); // remove do observer genérico
  setTimeout(() => animateCounter(el), 800);
});

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
const reveals = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 0.08 + 's';
  revealObserver.observe(el);
});

/* ─────────────────────────────────────────
   SKILL BARS
───────────────────────────────────────── */
const fills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('animated'), 150);
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
fills.forEach(f => skillObserver.observe(f));

/* ─────────────────────────────────────────
   PROJECT FILTER (visual only)
───────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});