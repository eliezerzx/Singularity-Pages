/* ═══════════════════════════════════════════════════════
   SINGULARITYPAGES — main.js
   Cinematic Black Hole · GSAP Scroll · Dust Particles
═══════════════════════════════════════════════════════ */
'use strict';

/* ─── Boot ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  slowVideo();
  initDust();
  initCursor();
  initNavbar();
  initMobileMenu();
  animateHero();
  initFaq();
  initWaFloat();
  initSmoothAnchors();
  waitForGSAP(initGSAP);
});

/* Remove preloader on full page load */
window.addEventListener('load', () => {
  const loader = document.getElementById('preloader');
  if (!loader) return;
  loader.style.opacity = '0';
  setTimeout(() => loader.remove(), 700);
});

/* Poll until GSAP + ScrollTrigger are available */
function waitForGSAP(fn, attempts = 0) {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    return fn();
  }
  if (attempts > 50) return;
  setTimeout(() => waitForGSAP(fn, attempts + 1), 100);
}

/* ─── Video slow-motion ──────────────────────────────── */
function slowVideo() {
  const vid = document.getElementById('bhVideo');
  if (!vid) return;
  const applyRate = () => { vid.playbackRate = 0.25; };
  vid.addEventListener('loadedmetadata', applyRate);
  vid.addEventListener('play', applyRate);
  if (vid.readyState >= 1) applyRate();
}

/* ─── Dust canvas ────────────────────────────────────── */
function initDust() {
  const canvas = document.getElementById('dustCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  const COUNT = window.innerWidth < 768 ? 70 : 160;
  let pts = [];

  class Particle {
    constructor() { this.reset(true); }

    reset(init) {
      const angle = Math.random() * Math.PI * 2;
      const maxR  = Math.max(W, H) * 0.6;
      const r     = init
        ? Math.random() * maxR
        : maxR * 0.88 + Math.random() * maxR * 0.22;

      this.x  = cx + Math.cos(angle) * r;
      this.y  = cy + Math.sin(angle) * r * 0.6;
      this.vx = 0;
      this.vy = 0;
      this.sz = Math.random() * 1.4 + 0.2;
      this.flicker = Math.random() * Math.PI * 2;

      const roll = Math.random();
      this.col = roll < .45
        ? 'rgba(249,180,100,'   // warm amber
        : roll < .75
          ? 'rgba(251,146,60,'  // orange
          : 'rgba(255,220,150,'; // pale gold
    }

    update() {
      const dx = cx - this.x;
      const dy = cy * 0.95 - this.y;
      const d  = Math.hypot(dx, dy) || 1;
      const f  = 0.000013 * d;

      this.vx += (dx / d) * f;
      this.vy += (dy / d) * f;

      const spd = Math.hypot(this.vx, this.vy);
      if (spd > 0.55) {
        this.vx = (this.vx / spd) * 0.55;
        this.vy = (this.vy / spd) * 0.55;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.flicker += 0.02;
      this.alpha = 0.06 + Math.abs(Math.sin(this.flicker)) * 0.25;

      if (d < Math.min(W, H) * 0.04) this.reset(false);
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
      ctx.fillStyle = this.col + this.alpha + ')';
      ctx.fill();
    }
  }

  function resize() {
    W  = canvas.width  = window.innerWidth;
    H  = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H * 0.5;
    pts = Array.from({ length: COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 220);
  }, { passive: true });
}

/* ─── Custom cursor (disabled — using OS default) ────── */
function initCursor() { /* noop */ }

/* ─── Navbar scroll behavior ─────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─── Mobile menu ────────────────────────────────────── */
function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    nav.setAttribute('aria-hidden', !isOpen);
  });

  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    })
  );
}

/* ─── Hero entrance animation ────────────────────────── */
function animateHero() {
  const run = () => {
    if (typeof gsap === 'undefined') {
      // CSS fallback — make everything visible
      document.querySelectorAll('[data-gsap]').forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Hide words before GSAP takes over
    document.querySelectorAll('#heroTitle .ht-word').forEach(el => {
      el.style.opacity = '0';
    });

    const tl = gsap.timeline({ delay: 0.15 });

    tl.fromTo('#heroEyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('#heroTitle .ht-word',
      { opacity: 0, y: 80, skewY: 5 },
      { opacity: 1, y: 0, skewY: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' },
      '-=0.4'
    )
    .fromTo('#heroSub',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo('#heroCtas',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.55'
    )
    .fromTo('#heroStats',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo('#scrollHint',
      { opacity: 0 },
      { opacity: 0.55, duration: 1, ease: 'power2.out' },
      '-=0.2'
    );
  };

  waitForGSAP(run);
}

/* ─── GSAP scroll animations ─────────────────────────── */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  /* Generic scroll-trigger animations */
  const fromMap = {
    'fade-up':    { opacity: 0, y: 55 },
    'fade-down':  { opacity: 0, y: -55 },
    'slide-left': { opacity: 0, x: -80, rotation: -1.5 },
    'slide-right':{ opacity: 0, x:  80, rotation:  1.5 },
    'slide-up':   { opacity: 0, y: 75, skewY: 2 },
    'scale-in':   { opacity: 0, scale: 0.84, filter: 'blur(8px)' },
    'cta-reveal': { opacity: 0, y: 90, filter: 'blur(12px)' },
  };

  document.querySelectorAll('[data-gsap]').forEach(el => {
    const key   = el.dataset.gsap;
    const from  = { ...(fromMap[key] || fromMap['fade-up']) };
    const delay = parseFloat(el.dataset.gsapDelay || 0);
    const to    = {
      opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, skewY: 0, filter: 'blur(0px)',
      duration: key === 'cta-reveal' ? 1.5 : 0.95,
      delay,
      ease: key === 'cta-reveal' ? 'expo.out' : 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
    };
    gsap.fromTo(el, from, to);
  });

  /* Section title italic parallax */
  document.querySelectorAll('.s-title').forEach(el => {
    const italic = el.querySelector('.s-italic');
    if (!italic) return;
    gsap.to(italic, {
      x: 20, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
    });
  });

  /* Portfolio cards: alternating entry directions */
  const entryDirs = [
    { x: -90, opacity: 0, rotation: -2 },
    { x:  90, opacity: 0, rotation:  2 },
    { y:  90, opacity: 0, skewY: 2 },
  ];
  document.querySelectorAll('.pcard').forEach((card, i) => {
    gsap.fromTo(card, { ...entryDirs[i % 3] }, {
      x: 0, y: 0, opacity: 1, rotation: 0, skewY: 0,
      duration: 1, delay: i * 0.09, ease: 'power4.out',
      scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  /* 3D card tilt on desktop */
  if (!('ontouchstart' in window)) {
    document.querySelectorAll('.pcard, .proc-card').forEach(card => {
      const MAX = 9;
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
        card.style.transform  = `perspective(1000px) rotateX(${-dy * MAX}deg) rotateY(${dx * MAX}deg) translateY(-5px)`;
        card.style.transition = 'transform .07s ease';
        const glow = card.querySelector('.pcard-glow');
        if (glow) {
          const ang = Math.atan2(
            e.clientY - (r.top  + r.height / 2),
            e.clientX - (r.left + r.width  / 2)
          ) * 180 / Math.PI;
          glow.style.background = `linear-gradient(${ang}deg,rgba(34,211,238,0),rgba(34,211,238,.3),rgba(168,85,247,.2),rgba(34,211,238,0))`;
          glow.style.opacity    = '1';
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
        const glow = card.querySelector('.pcard-glow');
        if (glow) glow.style.opacity = '0';
      });
    });
  }

  /* Comparison table rows stagger */
  document.querySelectorAll('[data-comp]').forEach((row, i) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 90%',
      onEnter: () => setTimeout(() => row.classList.add('row-in'), i * 65),
    });
  });

  /* Process cards cascade */
  document.querySelectorAll('.proc-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 70, scale: .94 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: .9, delay: i * .12, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  /* Stats counter */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const obj    = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
    });
  });

  /* Hero parallax on scroll */
  gsap.to('#heroTitle', {
    y: -80, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
  });
  gsap.to('#heroSub', {
    y: -40, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: '30% top', end: 'bottom top', scrub: 1 },
  });

  /* Video scale on scroll */
  gsap.to('.video-bg video', {
    scale: 1.12, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 },
  });

  /* Section orbs parallax */
  document.querySelectorAll('.section-bg-glow').forEach((orb, i) => {
    gsap.to(orb, {
      y: i % 2 === 0 ? -90 : 90,
      x: i % 2 === 0 ?  35 : -35,
      ease: 'none',
      scrollTrigger: { trigger: orb.parentElement, start: 'top bottom', end: 'bottom top', scrub: 2.5 },
    });
  });
}

/* ─── FAQ accordion ──────────────────────────────────── */
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.faq-item');
      const panel   = item.querySelector('.faq-a');
      const isOpen  = btn.getAttribute('aria-expanded') === 'true';

      // Close all others in the same column
      const col = item.closest('.faq-col');
      col.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(other => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        other.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
      });

      // Toggle current
      btn.setAttribute('aria-expanded', !isOpen);
      panel.classList.toggle('open', !isOpen);
    });
  });
}

/* ─── WhatsApp float button ──────────────────────────── */
function initWaFloat() {
  const btn = document.getElementById('waFloat');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
}

/* ─── Smooth anchor scrolling ────────────────────────── */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id     = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth',
      });
    });
  });
}