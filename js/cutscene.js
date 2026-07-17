/* ══════════════════════════════════════════════════════════════
   blackout · cutscene.js
   Cutscene inicial: el dormitorio de la casa encantada.
   La habitación es un mapa real de bloques 16×16 (352×224 lógicos)
   renderizado nítido y CENTRADO con bordes negros alrededor.
   La lluvia cae DETRÁS de los cristales (recortada a los paneles),
   las camas y los durmientes comparten orientación, y hay huecos
   oscuros donde podría esconderse algo: la puerta abierta al
   pasillo, la rendija tras el armario y la sombra bajo cada cama.
   Línea temporal (9 s): la linterna agoniza, parpadea y muere.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // resolución lógica del escenario (22×14 bloques de 16 px)
  const RW = 352;
  const RH = 224;
  const TILE = 16;
  const TIMELINE = 9000;

  const PLAYER_NAMES = ['tú', 'alma azul', 'alma verde', 'alma amarilla'];
  const stops = [];
  let raf = 0;
  let startedAt = 0;
  let cast = [];
  let staticLayer = null;   // canvas 352×224 con todo lo que no se mueve
  let logical = null;       // canvas 352×224 que se compone cada frame
  let lightningAt = -9999;  // último relámpago (ms de la escena)
  let lastFlickerBucket = -1;
  let didFadeSound = false;
  let finished = false;
  let onDone = null;

  // pseudo-azar determinista para que el suelo no cambie entre frames
  function det(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function makeCast(players) {
    const list = Array.isArray(players) && players.length ? players : [{ name: PLAYER_NAMES[0] }];
    return list.slice(0, 4).map((p, i) => ({
      name: p.name || PLAYER_NAMES[i] || `alma ${i + 1}`,
      badge: i,
      color: PixelArt.BADGE_COLORS[i % PixelArt.BADGE_COLORS.length],
    }));
  }

  // ── geometría de la habitación ────────────────────────────────
  const WALL_H = 64;                        // pared: bloques 16×16 a escala 4
  const WINDOWS = [
    { x: 46, y: 8, w: 64, h: 44 },
    { x: 242, y: 8, w: 64, h: 44 },
  ];
  const DOORWAY = { x: 160, y: 0, w: 32, h: 64 };   // puerta abierta: negrura
  const WARDROBE = { x: 312, y: 2, w: 32, h: 64 };  // armario con rendija
  const GAP = { x: 306, y: 14, w: 5, h: 50 };       // rendija armario-pared

  function bedLayout() {
    // camas verticales (cabecero arriba), alineadas con los durmientes
    const n = cast.length;
    const bw = 32, bh = 64;
    const span = RW - 64;
    const gap = (span - n * bw) / (n + 1);
    return cast.map((p, i) => ({
      x: Math.round(32 + gap + i * (bw + gap)),
      y: 128 + (i % 2) * 6,
      w: bw, h: bh, p,
    }));
  }

  // ── capa estática: se pinta una sola vez ──────────────────────
  function buildStatic() {
    staticLayer = document.createElement('canvas');
    staticLayer.width = RW; staticLayer.height = RH;
    const ctx = staticLayer.getContext('2d');
    const S = TILES_HOUSE.sprites;

    // pared: paneles a escala 4, con papel rasgado y una huella de sangre
    const wallSeq = ['wall_panel', 'wall_paper_torn', 'wall_panel', 'wall_blood_hand', 'wall_paper_torn', 'wall_panel'];
    wallSeq.forEach((name, i) => PixelArt.draw(ctx, S[name], 0, i * 64, 0, { scale: 4 }));

    // suelo: cobertura total, tablones con variantes deterministas
    for (let ty = WALL_H; ty < RH; ty += TILE) {
      for (let tx = 0; tx < RW; tx += TILE) {
        const r = det(tx * 31 + ty);
        let name = 'floor_wood_a';
        if (r > 0.72) name = 'floor_wood_b';
        if (r > 0.984) name = 'floor_wood_broken';
        PixelArt.draw(ctx, S[name], 0, tx, ty, { scale: 1 });
      }
    }
    // sangre reseca saliendo de la puerta del pasillo
    PixelArt.draw(ctx, S.floor_blood, 0, DOORWAY.x + 4, WALL_H, { scale: 1 });

    // alfombra vieja en el centro
    PixelArt.draw(ctx, S.rug_edge, 0, 144, 88, { scale: 2 });
    PixelArt.draw(ctx, S.rug_edge, 0, 176, 88, { scale: 2 });

    // puerta abierta al pasillo: un rectángulo de pura oscuridad
    PixelArt.draw(ctx, S.door_open_dark, 0, DOORWAY.x, DOORWAY.y, { scale: 2 });

    // armario pegado a la pared, con su rendija de sombra al lado
    PixelArt.draw(ctx, S.wardrobe, 0, WARDROBE.x, WARDROBE.y, { scale: 2 });
    ctx.fillStyle = '#030204';
    ctx.fillRect(GAP.x, GAP.y, GAP.w, GAP.h);

    // reloj de pie, cuadro torcido, espejo, planta muerta, telarañas
    PixelArt.draw(ctx, S.clock, 0, 6, 2, { scale: 2 });
    PixelArt.draw(ctx, S.wall_picture, 0, 128, 6, { scale: 1 });
    PixelArt.draw(ctx, S.mirror_cracked, 0, 214, 10, { scale: 1 });
    PixelArt.draw(ctx, S.plant_dead, 0, 40, 70, { scale: 1 });
    PixelArt.draw(ctx, S.cobweb, 0, 0, 0, { scale: 1 });
    ctx.save();
    ctx.translate(RW, 0); ctx.scale(-1, 1);
    PixelArt.draw(ctx, S.cobweb, 0, 0, 0, { scale: 1 });
    ctx.restore();

    // camas + mesillas
    const beds = bedLayout();
    beds.forEach((b, i) => {
      // sombra bajo la cama: el hueco clásico donde algo podría esperar
      ctx.fillStyle = 'rgba(2, 2, 5, 0.85)';
      ctx.fillRect(b.x - 3, b.y + b.h - 8, b.w + 6, 10);
      PixelArt.draw(ctx, TILES_HOUSE.sprites.bed, 0, b.x, b.y, { scale: 2 });
      // mesilla entre camas (no tras la última)
      if (i < beds.length - 1) {
        PixelArt.draw(ctx, TILES_HOUSE.sprites.table, 0, b.x + b.w + 6, b.y + 18, { scale: 1 });
      }
    });

    // vela apagada junto a la puerta
    PixelArt.draw(ctx, S.candle_stand, 0, DOORWAY.x - 24, 92, { scale: 1 });
  }

  // ── ventanas: noche + lluvia DETRÁS del cristal ───────────────
  function drawWindow(ctx, win, t) {
    const { x, y, w, h } = win;
    const panes = [
      [x + 3, y + 3, w / 2 - 5, h / 2 - 5], [x + w / 2 + 2, y + 3, w / 2 - 5, h / 2 - 5],
      [x + 3, y + h / 2 + 2, w / 2 - 5, h / 2 - 5], [x + w / 2 + 2, y + h / 2 + 2, w / 2 - 5, h / 2 - 5],
    ];
    const flash = t - lightningAt < 420;

    for (const [px, py, pw, ph] of panes) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();

      // cielo nocturno
      const sky = ctx.createLinearGradient(0, y, 0, y + h);
      sky.addColorStop(0, flash ? '#3a4a66' : '#0a0f1c');
      sky.addColorStop(1, flash ? '#222c42' : '#060a12');
      ctx.fillStyle = sky;
      ctx.fillRect(px, py, pw, ph);

      // luna velada (solo ventana izquierda)
      if (x < RW / 2) {
        ctx.fillStyle = 'rgba(184, 200, 216, 0.75)';
        ctx.beginPath();
        ctx.arc(x + 14, y + 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(10, 15, 28, 0.5)';
        ctx.beginPath();
        ctx.arc(x + 16, y + 11, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // silueta de árbol muerto meciéndose (ventana derecha)
      if (x > RW / 2) {
        const sway = Math.sin(t / 900) * 1.5;
        ctx.strokeStyle = 'rgba(4, 6, 10, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w - 12, y + h);
        ctx.quadraticCurveTo(x + w - 14 + sway, y + h - 14, x + w - 10 + sway * 2, y + 10);
        ctx.moveTo(x + w - 12 + sway, y + h - 16);
        ctx.lineTo(x + w - 20 + sway * 2, y + 12);
        ctx.stroke();
      }

      // lluvia: SOLO dentro del cristal
      ctx.strokeStyle = 'rgba(142, 178, 218, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 9; i++) {
        const seed = i * 53 + px;
        const rx = px + ((seed + t / (14 + (i % 3) * 4)) % (pw + 8)) - 4;
        const ry = py + ((seed * 7 + t / 6) % (ph + 10)) - 5;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 6);
        ctx.stroke();
      }
      // gotas resbalando por el cristal
      ctx.fillStyle = 'rgba(170, 200, 230, 0.3)';
      for (let i = 0; i < 3; i++) {
        const gx = px + (det(i + px) * pw);
        const gy = py + ((t / (30 + i * 17) + det(i * 3 + px) * ph) % ph);
        ctx.fillRect(gx, gy, 1, 3);
      }
      ctx.restore();
    }

    // el marco SIEMPRE por encima del cristal y la lluvia
    ctx.strokeStyle = '#241a10';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = '#3a2a1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 2); ctx.lineTo(x + w / 2, y + h - 2);
    ctx.moveTo(x + 2, y + h / 2); ctx.lineTo(x + w - 2, y + h / 2);
    ctx.stroke();
    // alféizar
    ctx.fillStyle = '#2c2014';
    ctx.fillRect(x - 2, y + h - 1, w + 4, 3);
  }

  // ── linterna moribunda en la mesilla de la primera cama ───────
  function flashlightState(stage) {
    if (stage >= 0.72) return { on: false, dying: true };
    const dying = stage > 0.42;
    const on = !dying || Math.sin(stage * 95) > -0.35;
    return { on, dying };
  }

  function drawFlashlight(ctx, beds, stage, t) {
    const b = beds[0];
    const fx = b.x + b.w + 8;
    const fy = b.y + 12;
    const st = flashlightState(stage);
    const bucket = Math.floor(t / 150);
    if (st.dying && st.on && bucket !== lastFlickerBucket) {
      lastFlickerBucket = bucket;
      GameAudio.flashlightFlicker?.();
    }
    if (stage >= 0.72 && !didFadeSound) {
      didFadeSound = true;
      GameAudio.fadeOutLight?.();
    }

    if (st.on) {
      // charco de luz cálida sobre el suelo
      const strength = st.dying ? 0.5 + Math.sin(t / 55) * 0.2 : 0.85;
      const g = ctx.createRadialGradient(fx + 6, fy + 10, 2, fx + 6, fy + 10, 52);
      g.addColorStop(0, `rgba(255, 216, 106, ${0.30 * strength})`);
      g.addColorStop(0.5, `rgba(255, 190, 80, ${0.12 * strength})`);
      g.addColorStop(1, 'rgba(255, 180, 70, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(fx - 50, fy - 42, 110, 104);
    }
    PixelArt.draw(ctx, ITEMS.sprites[st.on ? 'flashlight_on' : 'flashlight_off'],
      st.on && Math.sin(t / 90) > 0 ? 1 : 0, fx - 4, fy, { scale: 1 });

    // humo cuando muere
    if (stage >= 0.72) {
      const a = Math.min(0.7, (stage - 0.72) * 4);
      ctx.strokeStyle = `rgba(120, 120, 128, ${a * (0.5 + Math.sin(t / 300) * 0.2)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const wob = Math.sin(t / 260) * 3;
      ctx.moveTo(fx + 3, fy + 2);
      ctx.bezierCurveTo(fx - 4 + wob, fy - 8, fx + 8 + wob, fy - 14, fx + 1 + wob, fy - 24);
      ctx.stroke();
    }
  }

  // ── ojos en la oscuridad: los escondites respiran ─────────────
  function drawLurkers(ctx, t, stage) {
    // puerta del pasillo: dos brasas que se encienden un instante
    const doorBlink = Math.sin(t / 4300 + 1.4);
    const doorGlow = stage > 0.75 ? 0.65 : (doorBlink > 0.93 ? (doorBlink - 0.93) * 9 : 0);
    if (doorGlow > 0.02) {
      ctx.fillStyle = `rgba(255, 59, 43, ${Math.min(0.8, doorGlow)})`;
      ctx.fillRect(DOORWAY.x + 12, DOORWAY.y + 30, 2, 2);
      ctx.fillRect(DOORWAY.x + 19, DOORWAY.y + 30, 2, 2);
    }
    // rendija del armario: un único destello, más raro todavía
    const gapBlink = Math.sin(t / 6100);
    if (gapBlink > 0.965) {
      ctx.fillStyle = `rgba(200, 40, 30, ${(gapBlink - 0.965) * 18})`;
      ctx.fillRect(GAP.x + 1, GAP.y + 22, 2, 2);
    }
  }

  // ── composición por frame ─────────────────────────────────────
  function drawScene(t, stage) {
    const ctx = logical.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, RW, RH);
    ctx.drawImage(staticLayer, 0, 0);

    // relámpagos ocasionales
    if (t - lightningAt > 5200 && det(Math.floor(t / 130)) > 0.985) lightningAt = t;

    WINDOWS.forEach((w) => drawWindow(ctx, w, t));

    // resplandor del relámpago entrando por las ventanas
    if (t - lightningAt < 420) {
      const a = 0.16 * (1 - (t - lightningAt) / 420);
      for (const w of WINDOWS) {
        const g = ctx.createRadialGradient(w.x + w.w / 2, w.y + w.h, 8, w.x + w.w / 2, w.y + w.h, 120);
        g.addColorStop(0, `rgba(160, 185, 220, ${a})`);
        g.addColorStop(1, 'rgba(160, 185, 220, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(w.x - 90, w.y, w.w + 180, 190);
      }
    }

    // durmientes: misma orientación que las camas (cabeza en la almohada)
    const beds = bedLayout();
    beds.forEach((b) => {
      const frame = Math.floor((t + b.x * 7) / 800) % 2;
      PixelArt.draw(ctx, PLAYER.sleep, frame, b.x, b.y + 8, { scale: 2, badge: b.p.badge });
    });

    drawFlashlight(ctx, beds, stage, t);
    drawLurkers(ctx, t, stage);

    // oscuridad ambiental: esquinas y, tras morir la linterna, todo
    const dark = ctx.createRadialGradient(RW / 2, RH * 0.55, RH * 0.3, RW / 2, RH * 0.55, RW * 0.62);
    dark.addColorStop(0, 'rgba(0, 0, 0, 0)');
    dark.addColorStop(1, `rgba(0, 0, 0, ${0.42 + stage * 0.1})`);
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, RW, RH);
    if (stage >= 0.72) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.5, (stage - 0.72) * 1.9)})`;
      ctx.fillRect(0, 0, RW, RH);
    }

    // nombres bajo cada cama
    ctx.textAlign = 'center';
    ctx.font = '7px monospace';
    beds.forEach((b) => {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(b.p.name, b.x + b.w / 2 + 1, b.y + b.h + 11);
      ctx.fillStyle = b.p.color.shine;
      ctx.fillText(b.p.name, b.x + b.w / 2, b.y + b.h + 10);
    });
  }

  // ── blit centrado con bordes negros (letterbox real) ──────────
  function render() {
    const canvas = document.getElementById('cutscene-canvas');
    if (!canvas || !canvas.isConnected) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const pw = Math.max(1, Math.floor(rect.width * dpr));
    const ph = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }

    const t = performance.now() - startedAt;
    const stage = Math.min(1, t / TIMELINE);
    drawScene(t, stage);

    // escala entera para pixel art nítido; el resto queda en negro
    const scale = Math.max(1, Math.floor(Math.min(pw / RW, ph / RH)));
    const dx = Math.floor((pw - RW * scale) / 2);
    const dy = Math.floor((ph - RH * scale) / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, pw, ph);
    ctx.drawImage(logical, 0, 0, RW, RH, dx, dy, RW * scale, RH * scale);

    // marco sutil alrededor de la habitación
    ctx.strokeStyle = 'rgba(216, 210, 196, 0.10)';
    ctx.lineWidth = Math.max(1, dpr);
    ctx.strokeRect(dx - 1, dy - 1, RW * scale + 2, RH * scale + 2);

    if (stage >= 1 && !finished) {
      finished = true;
      stops.push(setTimeout(() => onDone?.(), 450));
    }
    raf = requestAnimationFrame(render);
  }

  function start(options = {}) {
    stop();
    cast = makeCast(options.players);
    onDone = typeof options.onDone === 'function' ? options.onDone : null;
    lastFlickerBucket = -1;
    didFadeSound = false;
    finished = false;
    logical = document.createElement('canvas');
    logical.width = RW; logical.height = RH;
    buildStatic();
    lightningAt = -9999;

    const screen = document.getElementById('screen-cutscene');
    const black = document.getElementById('cutscene-black');
    screen?.classList.add('cutscene-waiting');
    if (black) black.textContent = '';
    stops.push(setTimeout(() => {
      screen?.classList.remove('cutscene-waiting');
      startedAt = performance.now();
      render();
    }, 3000));
  }

  function stop() {
    cancelAnimationFrame(raf);
    stops.splice(0).forEach(clearTimeout);
    onDone = null;
  }

  window.Cutscene = { start, stop };
})();
