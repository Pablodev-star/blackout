/* ══════════════════════════════════════════════════════════════
   blackout · cutscene.js
   Cutscene inicial: habitación encantada, sueño y linterna moribunda.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PLAYER_NAMES = ['tú', 'alma azul', 'alma verde', 'alma amarilla'];
  const stops = [];
  let raf = 0;
  let startedAt = 0;
  let cast = [];

  function makeCast(players) {
    const list = Array.isArray(players) && players.length ? players : [{ name: PLAYER_NAMES[0] }];
    return list.slice(0, 4).map((p, i) => ({
      name: p.name || PLAYER_NAMES[i] || `alma ${i + 1}`,
      badge: i,
      color: PixelArt.BADGE_COLORS[i % PixelArt.BADGE_COLORS.length],
    }));
  }

  function drawSprite(ctx, sprite, frame, x, y, scale, opts = {}) {
    ctx.save();
    if (opts.rotate) {
      ctx.translate(x + (sprite.h * scale) / 2, y + (sprite.w * scale) / 2);
      ctx.rotate(opts.rotate);
      PixelArt.draw(ctx, sprite, frame, -(sprite.w * scale) / 2, -(sprite.h * scale) / 2, { scale, badge: opts.badge });
    } else {
      PixelArt.draw(ctx, sprite, frame, x, y, { scale, badge: opts.badge, flip: opts.flip });
    }
    ctx.restore();
  }

  function drawBed(ctx, x, y, w, h, badge) {
    const color = PixelArt.BADGE_COLORS[badge % PixelArt.BADGE_COLORS.length];
    ctx.fillStyle = '#1b1112';
    ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
    ctx.fillStyle = '#422817';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color.main;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x + 10, y + 20, w - 20, h - 30);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color.shine;
    ctx.fillRect(x + 10, y + 20, w - 20, 8);
    ctx.fillStyle = '#d8d2c4';
    ctx.fillRect(x + 15, y + 8, w - 30, 18);
    ctx.strokeStyle = '#0a0708';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
  }

  function drawRoom(ctx, time, W, H) {
    const floorY = Math.round(H * 0.34);
    ctx.fillStyle = '#10090b';
    ctx.fillRect(0, 0, W, floorY);
    ctx.fillStyle = '#1a1010';
    ctx.fillRect(0, floorY, W, H - floorY);

    const tile = 32;
    for (let y = floorY; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        const sprite = (x / tile + y / tile) % 3 === 0 ? TILES_HOUSE.sprites.floor_wood_broken : TILES_HOUSE.sprites.floor_wood_a;
        PixelArt.draw(ctx, sprite, 0, x, y, { scale: 2 });
      }
    }

    const deco = [
      ['wall_picture', W * 0.14, H * 0.12, 3], ['cobweb', W * 0.84, H * 0.08, 3],
      ['wardrobe', W * 0.78, H * 0.28, 3], ['plant_dead', W * 0.10, H * 0.63, 3],
      ['door_closed', W * 0.48, H * 0.16, 4], ['clock', W * 0.66, H * 0.12, 3],
    ];
    deco.forEach(([name, x, y, scale]) => PixelArt.draw(ctx, TILES_HOUSE.sprites[name], 0, x, y, { scale }));

    drawWindow(ctx, W * 0.22, H * 0.12, time);
    drawWindow(ctx, W * 0.64, H * 0.12, time + 300);
  }

  function drawWindow(ctx, x, y, time) {
    ctx.fillStyle = '#05070d';
    ctx.fillRect(x, y, 96, 72);
    ctx.strokeStyle = '#231617';
    ctx.lineWidth = 8;
    ctx.strokeRect(x, y, 96, 72);
    ctx.strokeStyle = '#3a2620';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 48, y + 4); ctx.lineTo(x + 48, y + 68);
    ctx.moveTo(x + 4, y + 36); ctx.lineTo(x + 92, y + 36);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150,190,230,.65)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 11; i++) {
      const rx = x + ((i * 17 + time / 18) % 120) - 16;
      ctx.beginPath();
      ctx.moveTo(rx, y + 4); ctx.lineTo(rx - 20, y + 68);
      ctx.stroke();
    }
    if (Math.sin(time / 190) > 0.92) {
      ctx.fillStyle = 'rgba(210,225,255,.45)';
      ctx.fillRect(x + 4, y + 4, 88, 64);
    }
  }

  function drawLamp(ctx, x, y, stage) {
    const on = stage < 0.72 && (stage < 0.42 || Math.sin(stage * 95) > -0.35);
    if (on) {
      ctx.fillStyle = `rgba(255,216,106,${0.16 + Math.max(0, 0.7 - stage) * 0.28})`;
      ctx.beginPath();
      ctx.ellipse(x - 20, y + 12, 98, 52, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    PixelArt.draw(ctx, ITEMS.sprites[on ? 'flashlight_on' : 'flashlight_off'], on && Math.sin(stage * 40) > 0 ? 1 : 0, x - 46, y, { scale: 3 });
    if (stage >= 0.72) {
      ctx.strokeStyle = `rgba(90,90,95,${Math.min(1, (stage - 0.72) * 5)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 5, y); ctx.bezierCurveTo(x - 30, y - 25, x + 18, y - 34, x - 2, y - 55);
      ctx.stroke();
    }
  }

  function render() {
    const canvas = document.getElementById('cutscene-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;
    const elapsed = performance.now() - startedAt;
    const stage = Math.min(1, elapsed / 9000);
    drawRoom(ctx, elapsed, W, H);

    const beds = cast.length;
    const bedW = Math.min(150, W / (beds + 0.8));
    const gap = (W - beds * bedW) / (beds + 1);
    cast.forEach((p, i) => {
      const x = gap + i * (bedW + gap);
      const y = H * 0.56 + (i % 2) * 18;
      drawBed(ctx, x, y, bedW, 96, p.badge);
      const sleepFrame = Math.floor(elapsed / 700) % PLAYER.sleep.frames.length;
      drawSprite(ctx, PLAYER.sleep, sleepFrame, x + bedW * 0.42, y + 16, 3, { badge: p.badge, rotate: Math.PI / 2 });
      ctx.fillStyle = p.color.shine;
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + bedW / 2, y + 122);
      ctx.fillStyle = '#2c1a14';
      ctx.fillRect(x + bedW - 8, y + 32, 42, 36);
      ctx.strokeStyle = '#0b0707';
      ctx.strokeRect(x + bedW - 8, y + 32, 42, 36);
      drawLamp(ctx, x + bedW + 34, y + 38, stage);
    });

    raf = requestAnimationFrame(render);
  }

  function start(options = {}) {
    stop();
    cast = makeCast(options.players);
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
  }

  window.Cutscene = { start, stop };
})();
