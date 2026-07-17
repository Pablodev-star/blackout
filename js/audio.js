/* ══════════════════════════════════════════════════════════════
   BLACKOUT — audio procedural (WebAudio, sin assets)
   Drone ambiental, clicks, latidos y golpes de tensión.
   ══════════════════════════════════════════════════════════════ */

const GameAudio = (() => {
  let ctx = null;
  let master = null;
  let droneNodes = [];
  let started = false;

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Drone ambiental grave y siniestro ─────────────────────
  function startAmbient() {
    if (started) return;
    ensureCtx();
    started = true;

    const freqs = [38, 57.2, 76.5];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'sine';
      osc.frequency.value = f;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.035 : 0.05, ctx.currentTime + 4);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 220;

      // vibración lenta para que "respire"
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06 + i * 0.04;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain).connect(osc.frequency);

      osc.connect(filter).connect(gain).connect(master);
      osc.start();
      lfo.start();
      droneNodes.push(osc, lfo);
    });
  }

  // ── Utilidad: blip corto ───────────────────────────────────
  function blip({ freq = 220, type = 'square', dur = 0.08, vol = 0.12, slide = 0 }) {
    if (!started) return;
    ensureCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function uiHover() { blip({ freq: 140, type: 'triangle', dur: 0.05, vol: 0.05 }); }
  function uiClick() { blip({ freq: 90, type: 'square', dur: 0.09, vol: 0.1, slide: -40 }); }
  function uiError() { blip({ freq: 70, type: 'sawtooth', dur: 0.25, vol: 0.14, slide: -35 }); }

  // ── Latido (cuenta atrás) — se acelera con la intensidad ──
  function heartbeat(intensity = 1) {
    if (!started) return;
    ensureCtx();
    const t = ctx.currentTime;
    const vol = 0.16 + intensity * 0.05;
    [0, 0.16].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(52 - i * 8, t + offset);
      osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.14);
      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.exponentialRampToValueAtTime(vol * (i === 0 ? 1 : 0.7), t + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.16);
      osc.connect(gain).connect(master);
      osc.start(t + offset);
      osc.stop(t + offset + 0.25);
    });
  }

  // ── Golpe grave de impacto (apertura de file / inicio) ────
  function slam() {
    if (!started) return;
    ensureCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(24, t + 0.9);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 1.2);

    // ruido metálico corto por encima
    const noiseLen = 0.4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * noiseLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.08;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.value = 900;
    noise.connect(nFilter).connect(nGain).connect(master);
    noise.start(t);
  }

  // ── Susurro / stinger (jugador entra o sale) ──────────────
  function stinger(up = true) {
    blip({ freq: up ? 180 : 240, type: 'triangle', dur: 0.3, vol: 0.08, slide: up ? 120 : -140 });
  }

  function flashlightFlicker() {
    blip({ freq: 880, type: 'square', dur: 0.035, vol: 0.045, slide: -260 });
  }

  function fadeOutLight() {
    if (!started) return;
    ensureCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(96, t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 1.3);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.45);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 1.55);
  }

  return { startAmbient, uiHover, uiClick, uiError, heartbeat, slam, stinger, flashlightFlicker, fadeOutLight };
})();
