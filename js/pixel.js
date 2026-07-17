/* ══════════════════════════════════════════════════════════════
   blackout · pixel.js
   Motor de pixel art: cada sprite es una matriz de caracteres
   donde cada carácter es un color de la paleta. Un carácter = un
   píxel colocado a mano. '.' = transparente.
   Resolución del juego: bloque de 16×16 px. Personaje 16×24,
   monstruo 24×32, cara de susto 32×32. Piezas grandes = 16×32.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TILE = 16;

  // Colores de chapa por índice de jugador (1=rojo 2=azul 3=verde 4=amarillo)
  const BADGE_COLORS = [
    { main: '#c22a2a', shine: '#ff7a6e' },
    { main: '#2a55c2', shine: '#6ea3ff' },
    { main: '#2a9440', shine: '#6ee08a' },
    { main: '#c9a227', shine: '#ffe07a' },
  ];

  function validate(sprite) {
    const { name, w, h, palette } = sprite;
    const frames = sprite.frames || [sprite.pixels];
    frames.forEach((rows, fi) => {
      if (rows.length !== h) {
        throw new Error(`[pixel] ${name} frame ${fi}: ${rows.length} filas, esperaba ${h}`);
      }
      rows.forEach((row, ri) => {
        if (row.length !== w) {
          throw new Error(`[pixel] ${name} frame ${fi} fila ${ri}: ${row.length} px, esperaba ${w}`);
        }
        for (const ch of row) {
          if (ch !== '.' && !(ch in palette) && ch !== '%' && ch !== '=') {
            throw new Error(`[pixel] ${name} frame ${fi} fila ${ri}: carácter '${ch}' sin color`);
          }
        }
      });
    });
    return sprite;
  }

  /**
   * Dibuja un frame en un contexto 2D.
   * opts: { scale, flip, badge (0-3), dx, dy }
   */
  function draw(ctx, sprite, frameIndex, x, y, opts = {}) {
    const scale = opts.scale || 1;
    const frames = sprite.frames || [sprite.pixels];
    const rows = frames[frameIndex % frames.length];
    const badge = BADGE_COLORS[opts.badge ?? 0];
    ctx.imageSmoothingEnabled = false;
    for (let ry = 0; ry < rows.length; ry++) {
      const row = rows[ry];
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[opts.flip ? row.length - 1 - rx : rx];
        if (ch === '.') continue;
        let color;
        if (ch === '%') color = badge.main;
        else if (ch === '=') color = badge.shine;
        else color = sprite.palette[ch];
        ctx.fillStyle = color;
        ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
      }
    }
  }

  /** Crea un canvas propio con el sprite renderizado (para previews). */
  function toCanvas(sprite, frameIndex, opts = {}) {
    const scale = opts.scale || 4;
    const c = document.createElement('canvas');
    c.width = sprite.w * scale;
    c.height = sprite.h * scale;
    draw(c.getContext('2d'), sprite, frameIndex, 0, 0, { ...opts, scale });
    return c;
  }

  /**
   * Reproduce una animación en loop sobre un canvas fijo.
   * anim: { sprite, sequence: [{f, dy?}], fps, flip?, badge? }
   * Devuelve una función stop().
   */
  function animate(canvas, anim) {
    const ctx = canvas.getContext('2d');
    const scale = anim.scale || 4;
    canvas.width = anim.sprite.w * scale;
    canvas.height = (anim.sprite.h + 2) * scale;
    let i = 0;
    let alive = true;
    const step = () => {
      if (!alive || !canvas.isConnected) { alive = false; return; }
      const fr = anim.sequence[i % anim.sequence.length];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(ctx, anim.sprite, fr.f, (fr.dx || 0) * scale, ((fr.dy || 0) + 1) * scale, {
        scale, flip: anim.flip, badge: anim.badge,
      });
      i++;
      setTimeout(step, 1000 / (anim.fps || 6));
    };
    step();
    return () => { alive = false; };
  }

  window.PixelArt = { TILE, BADGE_COLORS, validate, draw, toCanvas, animate };
})();
