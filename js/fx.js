/* ══════════════════════════════════════════════════════════════
   BLACKOUT — efectos ambientales de canvas
   Partículas de polvo/ceniza flotante + relámpagos ocasionales.
   ══════════════════════════════════════════════════════════════ */

const FX = (() => {
  const canvas = document.getElementById('fx-canvas');
  const c = canvas.getContext('2d');
  let particles = [];
  let w = 0;
  let h = 0;
  let emberMode = 0; // 0..1, sube durante la cuenta atrás

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function spawnParticle() {
    const ember = Math.random() < emberMode;
    return {
      x: Math.random() * w,
      y: h + 10,
      r: ember ? 1 + Math.random() * 2 : 0.5 + Math.random() * 1.6,
      vy: -(0.15 + Math.random() * (ember ? 0.9 : 0.35)),
      vx: (Math.random() - 0.5) * 0.25,
      life: 1,
      decay: 0.0008 + Math.random() * 0.002,
      ember,
      sway: Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    c.clearRect(0, 0, w, h);

    const target = Math.floor((w * h) / 22000) + (emberMode > 0 ? 40 : 0);
    while (particles.length < target) particles.push(spawnParticle());

    for (const p of particles) {
      p.sway += 0.01;
      p.x += p.vx + Math.sin(p.sway) * 0.2;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life > 0 && p.y > -10) {
        const alpha = Math.min(0.5, p.life * 0.5);
        if (p.ember) {
          c.fillStyle = `rgba(224, 70, 45, ${alpha})`;
          c.shadowColor = 'rgba(224, 43, 51, 0.8)';
          c.shadowBlur = 6;
        } else {
          c.fillStyle = `rgba(190, 190, 200, ${alpha * 0.55})`;
          c.shadowBlur = 0;
        }
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();
        c.shadowBlur = 0;
      }
    }
    particles = particles.filter((p) => p.life > 0 && p.y > -12);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ── Relámpagos aleatorios de ambiente ──────────────────────
  const flashLayer = document.getElementById('flash-layer');
  function lightning() {
    flashLayer.classList.remove('flash', 'blood-pulse');
    void flashLayer.offsetWidth; // reinicia la animación
    flashLayer.classList.add('flash');
  }
  function bloodPulse() {
    flashLayer.classList.remove('flash', 'blood-pulse');
    void flashLayer.offsetWidth;
    flashLayer.classList.add('blood-pulse');
  }
  (function scheduleLightning() {
    setTimeout(() => {
      if (Math.random() < 0.7) lightning();
      scheduleLightning();
    }, 9000 + Math.random() * 16000);
  })();

  // ── Glitch aleatorio de títulos ───────────────────────────
  (function scheduleGlitch() {
    setTimeout(() => {
      document.querySelectorAll('.screen.active .glitchable, .overlay.active .glitchable').forEach((el) => {
        el.classList.add('glitching');
        setTimeout(() => el.classList.remove('glitching'), 220 + Math.random() * 260);
      });
      scheduleGlitch();
    }, 3500 + Math.random() * 5000);
  })();

  function setEmberMode(v) { emberMode = Math.max(0, Math.min(1, v)); }

  return { lightning, bloodPulse, setEmberMode };
})();
