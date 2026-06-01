/* ═══════════════════════════════════════════════════════
   SINGULARITYPAGES — main.js v3
   Cinematic Black Hole · GSAP Scroll · Dust Particles
═══════════════════════════════════════════════════════ */
'use strict';

/* ── Boot ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  slowVideo();
  initDust();
  initCursor();
  initNavbar();
  initMobileMenu();
  animateHero();
  initWaFloat();
  initSmoothAnchors();
  waitForGSAP(initGSAP);
});

function waitForGSAP(fn, n = 0) {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') return fn();
  if (n > 50) return;
  setTimeout(() => waitForGSAP(fn, n + 1), 100);
}

/* ══════════════════════════════════════════════════════
   VIDEO SLOW-MOTION
   The clip is ~3s; we set playbackRate to 0.25 so it
   feels like ~12s, creating a slow hypnotic loop.
══════════════════════════════════════════════════════ */
function slowVideo() {
  const vid = document.getElementById('bhVideo');
  if (!vid) return;

  function applyRate() { }

  vid.addEventListener('loadedmetadata', applyRate);
  vid.addEventListener('play', applyRate);
  // Also try immediately in case already loaded
  if (vid.readyState >= 1) applyRate();
}

/* ══════════════════════════════════════════════════════
   DUST CANVAS
   Particles drift slowly toward center of screen
   (subtly visible over the video)
══════════════════════════════════════════════════════ */
function initDust() {
  const canvas = document.getElementById('dustCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  const COUNT = window.innerWidth < 768 ? 70 : 160;
  let pts = [];

  class P {
    constructor() { this.reset(true); }
    reset(init) {
      const a = Math.random() * Math.PI * 2;
      const maxR = Math.max(W, H) * 0.6;
      const r = init ? Math.random() * maxR : maxR * 0.88 + Math.random() * maxR * 0.22;
      this.x = cx + Math.cos(a) * r;
      this.y = cy + Math.sin(a) * r * 0.6; // flatten vertically toward disk
      this.vx = 0; this.vy = 0;
      this.sz = Math.random() * 1.4 + 0.2;
      this.flicker = Math.random() * Math.PI * 2;
      const roll = Math.random();
      this.col = roll < .5 ? 'rgba(240,220,200,' : roll < .75 ? 'rgba(255,200,120,' : 'rgba(200,160,255,';
    }
    update() {
      const dx = cx - this.x, dy = cy * 0.95 - this.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = 0.000013 * d;
      this.vx += dx / d * f; this.vy += dy / d * f;
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > 0.55) { this.vx = this.vx / spd * 0.55; this.vy = this.vy / spd * 0.55; }
      this.x += this.vx; this.y += this.vy;
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
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2; cy = H * 0.5;
    pts = Array.from({ length: COUNT }, () => new P());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) { p.update(); p.draw(); }
    requestAnimationFrame(loop);
  }

  resize();
  loop();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 220); }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════════════ */
function initCursor() {
  if (window.innerWidth < 768) return;
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  if (!ring || !dot) return;

  let mx = -200, my = -200, rx = -200, ry = -200;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a,button,.pcard,.proc-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
}

/* ══════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let tick = false;
  window.addEventListener('scroll', () => {
    if (!tick) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        tick = false;
      });
      tick = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ══════════════════════════════════════════════════════
   HERO ENTRANCE ANIMATION
   Staggered reveal using GSAP-like CSS transitions
   (fires on load, before ScrollTrigger)
══════════════════════════════════════════════════════ */
function animateHero() {
  // We animate directly using GSAP if available, else CSS fallback
  const run = () => {
    if (typeof gsap === 'undefined') {
      // CSS fallback
      [
        ['#heroEyebrow',  0.2],
        ['#heroTitle',    0.45],
        ['#heroSub',      0.75],
        ['#heroCtas',     0.95],
        ['#heroStats',    1.15],
        ['#scrollHint',   1.5],
      ].forEach(([sel, delay]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        setTimeout(() => {
          el.style.transition = `opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)`;
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, delay * 1000);
      });
      return;
    }

    // GSAP hero timeline
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

    // Make sure hero title words are visible at start of GSAP
    document.querySelectorAll('#heroTitle .ht-word').forEach(el => {
      el.style.opacity = '0';
    });
  };

  // Try immediately, or wait for GSAP
  waitForGSAP(run);
}

/* ══════════════════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
══════════════════════════════════════════════════════ */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  /* ── utility ── */
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
    const from  = { ...fromMap[key] || fromMap['fade-up'] };
    const delay = parseFloat(el.dataset.gsapDelay || 0);
    const to    = { opacity:1, x:0, y:0, scale:1, rotation:0, skewY:0, filter:'blur(0px)',
                    duration: key === 'cta-reveal' ? 1.5 : 0.95,
                    delay, ease: key === 'cta-reveal' ? 'expo.out' : 'power4.out',
                    scrollTrigger:{ trigger:el, start:'top 87%', toggleActions:'play none none none' } };
    gsap.fromTo(el, from, to);
  });

  /* ── Section title italic italic parallax ── */
  document.querySelectorAll('.s-title').forEach(el => {
    const italic = el.querySelector('.s-italic');
    if (!italic) return;
    gsap.to(italic, {
      x: 20, ease: 'none',
      scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:1.5 }
    });
  });

  /* ── Portfolio cards: alternate entry directions ── */
  const dirs = [
    { x: -90, opacity: 0, rotation: -2 },
    { x:  90, opacity: 0, rotation:  2 },
    { y:  90, opacity: 0, skewY: 2 },
  ];
  document.querySelectorAll('.pcard').forEach((card, i) => {
    gsap.fromTo(card, { ...dirs[i % 3] }, {
      x: 0, y: 0, opacity: 1, rotation: 0, skewY: 0,
      duration: 1, delay: i * 0.09, ease: 'power4.out',
      scrollTrigger:{ trigger: card, start:'top 88%', toggleActions:'play none none none' }
    });
  });

  /* ── 3D card tilt ── */
  if (!('ontouchstart' in window)) {
    document.querySelectorAll('.pcard,.proc-card').forEach(card => {
      const MAX = 9;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        card.style.transform = `perspective(1000px) rotateX(${-dy*MAX}deg) rotateY(${dx*MAX}deg) translateY(-5px)`;
        card.style.transition = 'transform .07s ease';
        const gb = card.querySelector('.pcard-glow');
        if (gb) {
          const ang = Math.atan2(e.clientY - (r.top + r.height/2), e.clientX - (r.left + r.width/2)) * 180 / Math.PI;
          gb.style.background = `linear-gradient(${ang}deg,rgba(34,211,238,0),rgba(34,211,238,.3),rgba(168,85,247,.2),rgba(34,211,238,0))`;
          gb.style.opacity = '1';
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
        const gb = card.querySelector('.pcard-glow');
        if (gb) gb.style.opacity = '0';
      });
    });
  }

  /* ── Comparison table: rows stagger from left ── */
  document.querySelectorAll('[data-comp]').forEach((row, i) => {
    ScrollTrigger.create({
      trigger: row, start:'top 90%',
      onEnter: () => setTimeout(() => row.classList.add('row-in'), i * 65),
    });
  });

  /* ── Process cards cascade ── */
  document.querySelectorAll('.proc-card').forEach((c, i) => {
    gsap.fromTo(c,
      { opacity:0, y:70, scale:.94 },
      { opacity:1, y:0, scale:1, duration:.9, delay:i*.12, ease:'back.out(1.6)',
        scrollTrigger:{ trigger:c, start:'top 90%', toggleActions:'play none none none' } }
    );
  });

  /* ── Stats counter ── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2, ease: 'power2.out',
      scrollTrigger:{ trigger: el, start:'top 85%', once:true },
      onUpdate() { el.textContent = Math.round(obj.val) + suffix; }
    });
  });

  /* ── Hero parallax on scroll ── */
  gsap.to('#heroTitle', {
    y: -80, ease:'none',
    scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1.2 }
  });
  gsap.to('#heroSub', {
    y: -40, opacity:0, ease:'none',
    scrollTrigger:{ trigger:'#hero', start:'30% top', end:'bottom top', scrub:1 }
  });
  /* Video parallax — scale up slightly as user scrolls */
  gsap.to('.video-bg video', {
    scale: 1.12, ease:'none',
    scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:2 }
  });

  /* ── Section orbs parallax ── */
  document.querySelectorAll('.section-bg-glow').forEach((orb, i) => {
    gsap.to(orb, {
      y: i % 2 === 0 ? -90 : 90, x: i % 2 === 0 ? 35 : -35, ease:'none',
      scrollTrigger:{ trigger:orb.parentElement, start:'top bottom', end:'bottom top', scrub:2.5 }
    });
  });
}

/* ══════════════════════════════════════════════════════
   WHATSAPP FLOAT
══════════════════════════════════════════════════════ */
function initWaFloat() {
  const btn = document.getElementById('waFloat');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   SMOOTH ANCHORS
══════════════════════════════════════════════════════ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
    });
  });
}

// Dentro da sua função de inicialização do cursor customizado:
function initCustomCursor() {
  // SE FOR DISPOSITIVO TOUCH (Ponteiro grosso/coarse), ABORTA O CURSOR CUSTOMIZADO
  if (window.matchMedia('(pointer: coarse)').matches) {
    const cursor = document.querySelector('.custom-cursor'); // ajuste a classe se necessário
    if (cursor) cursor.style.display = 'none';
    return;
  }

  // Seu código atual do mousemove continua aqui embaixo...
  const cursor = document.querySelector('.custom-cursor');
  document.addEventListener('mousemove', (e) => {
    // gsap.to(cursor, { x: e.clientX, y: e.clientY }); ...
  });
}

function animateHero() {
  // Se o GSAP não carregou (CDN fora do ar, adblock agressivo, etc.)
  if (typeof gsap === 'undefined') {
    console.warn("GSAP não pôde ser carregado. Aplicando fallback de visibilidade.");
    
    // Força todos os elementos ocultos pelo CSS de animação a aparecerem
    document.querySelectorAll('[data-gsap]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return; // Encerra a função sem quebrar o script
  }

  // Seu código atual de animação do GSAP continua aqui embaixo...
  // gsap.from('[data-gsap="fade-up"]', { opacity: 0, y: 30 ... });
}