/* ═══════════════════════════════════════════════════════════
   SINGULARITY FX — singularity-fx.js
   Buraco negro (disco de acreção) · estrelas com parallax ·
   contadores · botões magnéticos · barra horizonte de eventos
   Performance: pausa fora do viewport, respeita reduced-motion
   ═══════════════════════════════════════════════════════════ */
'use strict';

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ════════════════════════════════════════════
     1. BARRA DE PROGRESSO — HORIZONTE DE EVENTOS
     ════════════════════════════════════════════ */
  const bar = document.createElement('div');
  bar.id = 'eventHorizonBar';
  document.body.appendChild(bar);
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  /* ════════════════════════════════════════════
     2. CAMPO DE ESTRELAS — página inteira
     ════════════════════════════════════════════ */
  const starsCv = document.getElementById('starsCanvas');
  if (starsCv) {
    const sctx = starsCv.getContext('2d');
    let stars = [];
    let mx = 0, my = 0;          // parallax alvo
    let cmx = 0, cmy = 0;        // parallax suavizado
    let starsVisible = true;

    const buildStars = () => {
      starsCv.width  = window.innerWidth  * DPR;
      starsCv.height = window.innerHeight * DPR;
      const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      stars = Array.from({ length: Math.min(count, 220) }, () => ({
        x: Math.random() * starsCv.width,
        y: Math.random() * starsCv.height,
        r: (Math.random() * 1.1 + 0.3) * DPR,
        depth: Math.random() * 0.7 + 0.3,            // 0.3–1: profundidade p/ parallax
        tw: Math.random() * Math.PI * 2,             // fase do twinkle
        ts: Math.random() * 0.015 + 0.004,           // velocidade do twinkle
        warm: Math.random() < 0.18                   // 18% das estrelas âmbar
      }));
    };

    const drawStars = () => {
      sctx.clearRect(0, 0, starsCv.width, starsCv.height);
      cmx += (mx - cmx) * 0.04;
      cmy += (my - cmy) * 0.04;
      for (const s of stars) {
        s.tw += s.ts;
        const alpha = 0.25 + Math.abs(Math.sin(s.tw)) * 0.6;
        const px = s.x + cmx * s.depth * 18 * DPR;
        const py = s.y + cmy * s.depth * 18 * DPR;
        sctx.beginPath();
        sctx.arc(px, py, s.r, 0, Math.PI * 2);
        sctx.fillStyle = s.warm
          ? 'rgba(251,191,36,' + (alpha * 0.85).toFixed(3) + ')'
          : 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
        sctx.fill();
      }
    };

    buildStars();
    window.addEventListener('resize', buildStars);

    if (!isTouch) {
      window.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
      starsVisible = !document.hidden;
    });

    if (reduceMotion) {
      drawStars(); // um frame estático
    } else {
      const loopStars = () => {
        if (starsVisible) drawStars();
        requestAnimationFrame(loopStars);
      };
      requestAnimationFrame(loopStars);
    }
  }

  /* ════════════════════════════════════════════
     3. BURACO NEGRO — disco de acreção no hero
     ════════════════════════════════════════════ */
  const bhCv = document.getElementById('bhCanvas');
  if (bhCv) {
    const ctx = bhCv.getContext('2d');
    let W = 0, H = 0, CX = 0, CY = 0;
    let horizon = 0;      // raio do horizonte de eventos
    let maxR = 0;         // raio externo do disco
    let particles = [];
    let bhActive = true;  // pausa quando hero sai da tela

    const PARTICLE_COUNT = isTouch ? 90 : 170;

    const sizeBH = () => {
      const rect = bhCv.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      bhCv.width  = W * DPR;
      bhCv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      CX = W / 2;
      CY = H / 2;
      horizon = Math.min(W, H) * 0.085;
      maxR    = Math.min(W, H) * 0.52;
    };

    const spawn = (p, outer) => {
      p.angle  = Math.random() * Math.PI * 2;
      p.radius = outer
        ? maxR * (0.85 + Math.random() * 0.3)
        : horizon + Math.random() * (maxR - horizon);
      p.speed  = 0.004 + Math.random() * 0.009;   // velocidade angular
      p.fall   = 0.05 + Math.random() * 0.16;     // taxa de queda
      p.size   = 0.5 + Math.random() * 1.5;
      p.hue    = 22 + Math.random() * 26;          // 22–48: laranja → âmbar
      return p;
    };

    const buildParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => spawn({}, false));
    };

    const drawBH = () => {
      ctx.clearRect(0, 0, W, H);

      // brilho do disco (fundo)
      const glow = ctx.createRadialGradient(CX, CY, horizon * 0.6, CX, CY, maxR);
      glow.addColorStop(0,   'rgba(249,115,22,.10)');
      glow.addColorStop(0.4, 'rgba(180,83,9,.05)');
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // partículas do disco de acreção
      for (const p of particles) {
        // quanto mais perto do horizonte, mais rápido orbita e cai
        const pull = 1 + (1 - (p.radius - horizon) / (maxR - horizon)) * 2.2;
        p.angle  += p.speed * pull;
        p.radius -= p.fall * pull * 0.55;

        if (p.radius <= horizon) { spawn(p, true); continue; }

        // achatamento elíptico para dar perspectiva de disco
        const x = CX + Math.cos(p.angle) * p.radius;
        const y = CY + Math.sin(p.angle) * p.radius * 0.42;

        const closeness = 1 - (p.radius - horizon) / (maxR - horizon);
        const alpha = 0.18 + closeness * 0.72;
        const light = 52 + closeness * 16;

        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.7 + closeness * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ',95%,' + light + '%,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }

      // sombra do buraco negro (por cima das partículas que "passam atrás")
      const shadow = ctx.createRadialGradient(CX, CY, 0, CX, CY, horizon * 1.5);
      shadow.addColorStop(0,    'rgba(0,0,0,1)');
      shadow.addColorStop(0.62, 'rgba(0,0,0,1)');
      shadow.addColorStop(0.78, 'rgba(249,115,22,.30)');
      shadow.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(CX, CY, horizon * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = shadow;
      ctx.fill();

      // anel de fótons
      ctx.beginPath();
      ctx.arc(CX, CY, horizon * 1.02, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251,191,36,.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    sizeBH();
    buildParticles();
    window.addEventListener('resize', () => { sizeBH(); buildParticles(); });

    // pausa quando o hero não está visível
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        entries => { bhActive = entries[0].isIntersecting; },
        { threshold: 0.05 }
      ).observe(bhCv.parentElement);
    }

    if (reduceMotion) {
      drawBH(); // frame estático
    } else {
      const loopBH = () => {
        if (bhActive && !document.hidden) drawBH();
        requestAnimationFrame(loopBH);
      };
      requestAnimationFrame(loopBH);
    }
  }

  /* ════════════════════════════════════════════
     4. CONTADORES ANIMADOS — estatísticas do hero
     ════════════════════════════════════════════ */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    const animateCount = el => {
      const target  = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const prefix  = el.dataset.prefix || '';
      const suffix  = el.dataset.suffix || '';
      const dur = 1400;
      const t0 = performance.now();
      const tick = now => {
        const t = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4); // expo-out
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => obs.observe(c));
  }

  /* ════════════════════════════════════════════
     5. BOTÕES MAGNÉTICOS — atração gravitacional
     ════════════════════════════════════════════ */
  if (!isTouch && !reduceMotion) {
    const magnets = document.querySelectorAll('.btn-primary, .ment-pkg-btn, .nav-cta, .btn-ghost');
    magnets.forEach(el => {
      el.classList.add('sp-magnetic');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.22 + 'px,' + dy * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
      });
    });
  }
})();