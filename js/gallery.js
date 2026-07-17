/* ══════════════════════════════════════════════════════════════
   blackout · gallery.js
   Vista previa de assets tras abrir un file: los 4 supervivientes
   en loop de animación (rotando dirección), El Ausente en sus
   estados, y el tileset de la casa encantada.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const stops = [];
  const timers = [];

  function card(parent, label, cls = '') {
    const el = document.createElement('div');
    el.className = `asset-card ${cls}`;
    const canvas = document.createElement('canvas');
    canvas.className = 'pixel-canvas';
    const tag = document.createElement('span');
    tag.className = 'asset-label';
    tag.textContent = label;
    el.appendChild(canvas);
    el.appendChild(tag);
    parent.appendChild(el);
    return { el, canvas, tag };
  }

  function startPlayers() {
    const wrap = document.getElementById('gallery-players');
    if (!wrap) return;
    wrap.innerHTML = '';
    const dirs = [
      { sprite: () => PLAYER.down, flip: false },
      { sprite: () => PLAYER.side, flip: false },
      { sprite: () => PLAYER.up, flip: false },
      { sprite: () => PLAYER.side, flip: true },
    ];
    for (let i = 0; i < 4; i++) {
      const c = card(wrap, `JUGADOR ${i + 1}`, 'char-card');
      c.tag.style.color = PixelArt.BADGE_COLORS[i].shine;
      let d = i % dirs.length;
      let stop = PixelArt.animate(c.canvas, {
        sprite: dirs[d].sprite(), sequence: PLAYER.WALK_SEQ,
        fps: 6, scale: 5, badge: i, flip: dirs[d].flip,
      });
      stops.push(() => stop());
      // rota de dirección cada pocos segundos, como pasando revista
      const t = setInterval(() => {
        stop();
        d = (d + 1) % dirs.length;
        stop = PixelArt.animate(c.canvas, {
          sprite: dirs[d].sprite(), sequence: PLAYER.WALK_SEQ,
          fps: 6, scale: 5, badge: i, flip: dirs[d].flip,
        });
      }, 2600);
      timers.push(t);
    }
  }

  function startMonster() {
    const wrap = document.getElementById('gallery-monster');
    if (!wrap) return;
    wrap.innerHTML = '';
    const states = [
      { label: 'PATRULLA', sprite: MONSTER.patrol, seq: MONSTER.PATROL_SEQ, fps: 3 },
      { label: 'ESCONDIDO', sprite: MONSTER.lurk, seq: MONSTER.LURK_SEQ, fps: 3 },
      { label: 'TE HA VISTO', sprite: MONSTER.chase, seq: MONSTER.CHASE_SEQ, fps: 8 },
      { label: 'DEMASIADO TARDE', sprite: MONSTER.scare, seq: MONSTER.SCARE_SEQ, fps: 10 },
    ];
    for (const st of states) {
      const c = card(wrap, st.label, 'monster-card');
      stops.push(PixelArt.animate(c.canvas, {
        sprite: st.sprite, sequence: st.seq, fps: st.fps, scale: 5,
      }));
    }
  }

  function startTiles(containerId, tileset) {
    const wrap = document.getElementById(containerId);
    if (!wrap || !tileset) return;
    wrap.innerHTML = '';
    for (const [name, sprite] of Object.entries(tileset.sprites)) {
      const c = card(wrap, name.replace(/_/g, ' '), 'tile-card');
      const cv = PixelArt.toCanvas(sprite, 0, { scale: 4 });
      cv.className = 'pixel-canvas';
      c.el.replaceChild(cv, c.canvas);
    }
  }

  function startItems() {
    const wrap = document.getElementById('gallery-items');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (const [name, sprite] of Object.entries(ITEMS.sprites)) {
      const c = card(wrap, name.replace(/_/g, ' '), 'tile-card');
      if (name === 'flashlight_on') {
        stops.push(PixelArt.animate(c.canvas, {
          sprite, sequence: ITEMS.FLASHLIGHT_SEQ, fps: 9, scale: 4,
        }));
      } else if (name === 'coin') {
        stops.push(PixelArt.animate(c.canvas, {
          sprite, sequence: ITEMS.COIN_SEQ, fps: 7, scale: 4,
        }));
      } else {
        const cv = PixelArt.toCanvas(sprite, 0, { scale: 4 });
        cv.className = 'pixel-canvas';
        c.el.replaceChild(cv, c.canvas);
      }
    }
  }

  // cada sección se pinta de forma independiente: si una falla
  // (p. ej. HTML viejo en caché sin su contenedor), las demás salen
  function safely(fn) {
    try { fn(); } catch (e) { console.error('[gallery]', e); }
  }

  function start() {
    stop();
    safely(startPlayers);
    safely(startMonster);
    safely(startItems);
    safely(() => startTiles('gallery-tiles', window.TILES_HOUSE));
    safely(() => startTiles('gallery-tiles-infirmary', window.TILES_INFIRMARY));
    safely(() => startTiles('gallery-tiles-school', window.TILES_SCHOOL));
  }

  function stop() {
    stops.splice(0).forEach((s) => s());
    timers.splice(0).forEach(clearInterval);
  }

  window.Gallery = { start, stop };
})();
