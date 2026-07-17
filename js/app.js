/* ══════════════════════════════════════════════════════════════
   BLACKOUT — controlador de interfaz
   ══════════════════════════════════════════════════════════════ */

(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  let player = Storage.getPlayer();
  let currentScreen = 'boot';
  let room = null; // sesión de sala activa (Net.RoomSession)

  // ══════════ NAVEGACIÓN ENTRE PANTALLAS ══════════

  const screens = {
    boot: $('#screen-boot'),
    name: $('#screen-name'),
    menu: $('#screen-menu'),
    solo: $('#screen-solo'),
    multi: $('#screen-multi'),
    create: $('#screen-create'),
    join: $('#screen-join'),
    lobby: $('#screen-lobby'),
    leaderboards: $('#screen-leaderboards'),
    gallery: $('#screen-gallery'),
  };

  function goto(name, { blackout = false } = {}) {
    if (name === currentScreen) return;
    if (currentScreen === 'gallery' && window.Gallery) Gallery.stop();
    const prev = screens[currentScreen];
    const next = screens[name];
    currentScreen = name;

    if (blackout) {
      $('#transition-layer').classList.remove('blackout');
      void $('#transition-layer').offsetWidth;
      $('#transition-layer').classList.add('blackout');
    }

    prev.classList.remove('active');
    prev.classList.add('leaving');
    setTimeout(() => prev.classList.remove('leaving'), 400);

    setTimeout(() => {
      next.classList.add('active');
      onScreenEnter(name);
    }, blackout ? 220 : 60);
  }

  function onScreenEnter(name) {
    if (name === 'menu') renderMenuFooter();
    if (name === 'solo') renderSaveFiles();
    if (name === 'leaderboards') renderLeaderboard(activeBoard);
    if (name === 'create') {
      $('#room-name-input').value = '';
      $('#create-error').textContent = '';
    }
    if (name === 'join') {
      $('#join-code-input').value = '';
      $('#join-error').textContent = '';
    }
  }

  // botones genéricos data-goto
  $$('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      GameAudio.uiClick();
      goto(btn.dataset.goto);
    });
  });

  // sonidos de hover en elementos interactivos
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button')) GameAudio.uiHover();
  });

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    GameAudio.uiError();
  }

  // ══════════ BOOT ══════════

  screens.boot.addEventListener('click', () => {
    GameAudio.startAmbient(); // el audio requiere un gesto del usuario
    GameAudio.uiClick();
    FX.lightning();
    goto(player ? 'menu' : 'name', { blackout: true });
  });

  // ══════════ ENTRADA DE NOMBRE ══════════

  function submitName() {
    const input = $('#name-input');
    const name = input.value.trim();
    if (name.length < 2) {
      showError($('#name-error'), 'la oscuridad necesita al menos 2 letras…');
      return;
    }
    player = Storage.savePlayerName(name);
    GameAudio.slam();
    FX.bloodPulse();
    goto('menu', { blackout: true });
  }

  $('#name-submit').addEventListener('click', submitName);
  $('#name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitName();
  });

  // ══════════ MENÚ PRINCIPAL ══════════

  function renderMenuFooter() {
    $('#menu-player-name').textContent = `☠ ${player.name}`;
  }

  $('#btn-change-name').addEventListener('click', () => {
    GameAudio.uiClick();
    $('#name-input').value = player?.name || '';
    goto('name');
  });

  // ══════════ SOLITARIO: SAVE FILES ══════════

  function renderSaveFiles() {
    const wrap = $('#save-files');
    wrap.innerHTML = '';
    Storage.getSaves().forEach((save, slot) => {
      const card = document.createElement('button');
      card.className = `save-file ${save ? '' : 'empty'}`;
      card.innerHTML = save
        ? `
          <span class="save-file-tag">FILE ${slot + 1}</span>
          <span class="save-file-candle">🕯️</span>
          <span class="save-file-name">CAPÍTULO ${save.chapter}</span>
          <div class="save-stats">
            <div class="save-stat"><span class="k">tiempo jugado</span><span class="v">${Storage.formatTime(save.timePlayedSec)}</span></div>
            <div class="save-stat"><span class="k">credits</span><span class="v">${save.credits.toLocaleString('es-ES')}</span></div>
            <div class="save-stat"><span class="k">muertes</span><span class="v">${save.deaths}</span></div>
            <div class="save-stat"><span class="k">última vez</span><span class="v">${new Date(save.lastPlayed).toLocaleDateString('es-ES')}</span></div>
          </div>
          <span class="save-file-cta">CONTINUAR ▸</span>
          <div class="delete-progress"></div>`
        : `
          <span class="save-file-tag">FILE ${slot + 1}</span>
          <span class="save-file-candle">🕯️</span>
          <span class="save-file-name">— vacío —</span>
          <div class="save-stats">
            <div class="save-stat"><span class="k">tiempo jugado</span><span class="v">--</span></div>
            <div class="save-stat"><span class="k">credits</span><span class="v">--</span></div>
          </div>
          <span class="save-file-cta">EMPEZAR ▸</span>
          <div class="delete-progress"></div>`;

      card.addEventListener('click', () => openSaveFile(slot, save));
      attachHoldToDelete(card, slot, Boolean(save));
      wrap.appendChild(card);
    });
  }

  // mantener pulsado para borrar un file
  function attachHoldToDelete(card, slot, hasSave) {
    if (!hasSave) return;
    let holdTimer = null;
    let held = false;

    const start = () => {
      card.classList.add('hold-deleting');
      holdTimer = setTimeout(() => {
        held = true;
        card.classList.remove('hold-deleting');
        card.classList.add('deleting');
        GameAudio.slam();
        FX.bloodPulse();
        setTimeout(() => {
          Storage.deleteSave(slot);
          renderSaveFiles();
        }, 800);
      }, 1200);
    };
    const cancel = () => {
      clearTimeout(holdTimer);
      card.classList.remove('hold-deleting');
    };

    card.addEventListener('pointerdown', start);
    card.addEventListener('pointerup', cancel);
    card.addEventListener('pointerleave', cancel);
    card.addEventListener('click', (e) => {
      if (held) { e.stopImmediatePropagation(); held = false; }
    }, true);
  }

  function openSaveFile(slot, save) {
    GameAudio.uiClick();
    if (!save) save = Storage.createSave(slot);
    else Storage.touchSave(slot);

    // ── animación de apertura ──
    const overlay = $('#file-open-overlay');
    const title = overlay.querySelector('.file-open-title');
    title.textContent = `FILE ${slot + 1}`;
    title.dataset.text = `FILE ${slot + 1}`;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    GameAudio.slam();
    FX.setEmberMode(0.6);
    setTimeout(() => FX.lightning(), 500);
    setTimeout(() => GameAudio.heartbeat(3), 1400);
    setTimeout(() => GameAudio.heartbeat(4), 2200);

    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      FX.setEmberMode(0);
      // De momento el file abre la galería de assets del juego;
      // aquí arrancará el juego real con este save.
      goto('gallery');
      try { Gallery.start(); } catch (e) { console.error('[gallery]', e); }
      renderSaveFiles();
    }, 3400);
  }

  // ══════════ CREAR SALA ══════════

  let selectedMax = BLACKOUT_CONFIG.maxRoomPlayers;

  $$('#max-players .pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      GameAudio.uiClick();
      $$('#max-players .pill').forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-checked', 'true');
      selectedMax = Number(pill.dataset.max);
    });
  });

  $('#create-room-btn').addEventListener('click', () => {
    const roomName = $('#room-name-input').value.trim();
    if (roomName.length < 2) {
      showError($('#create-error'), 'toda sala necesita un nombre…');
      return;
    }
    GameAudio.slam();
    room = Net.createRoom({
      roomName,
      maxPlayers: selectedMax,
      player,
      events: lobbyEvents(),
    });
    enterLobby();
  });

  // ══════════ UNIRSE A SALA ══════════

  $('#join-code-input').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  async function tryJoin() {
    const code = $('#join-code-input').value.trim();
    if (code.length !== BLACKOUT_CONFIG.roomCodeLength) {
      showError($('#join-error'), `el código tiene ${BLACKOUT_CONFIG.roomCodeLength} caracteres`);
      return;
    }
    const btn = $('#join-room-btn');
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'BUSCANDO…';
    try {
      room = await Net.joinRoom({ code, player, events: lobbyEvents() });
      GameAudio.slam();
      enterLobby();
    } catch (err) {
      showError($('#join-error'), err.message);
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-label').textContent = 'CRUZAR EL UMBRAL';
    }
  }

  $('#join-room-btn').addEventListener('click', tryJoin);
  $('#join-code-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryJoin();
  });

  // ══════════ LOBBY ══════════

  function lobbyEvents() {
    return {
      onState: (state) => renderLobby(state),
      onCountdownStart: () => startCountdownUI(),
      onCountdownCancel: (reason) => cancelCountdownUI(reason),
      onGameStart: () => onGameStart(),
      onClosed: (reason) => {
        stopCountdownUI();
        room = null;
        if (currentScreen === 'lobby') {
          goto('multi', { blackout: true });
          if (reason) setTimeout(() => showError($('#create-error'), ''), 0);
        }
      },
    };
  }

  function enterLobby() {
    goto('lobby', { blackout: true });
    if (room.state) renderLobby(room.state);
    $('#ready-btn').classList.remove('is-ready');
    $('#ready-btn .btn-label').textContent = 'LISTO';
  }

  function renderLobby(state) {
    if (!state) return;
    $('#lobby-room-name').textContent = state.name;
    $('#lobby-code-text').textContent = state.code;
    $('#lobby-count').textContent = `${state.players.length}/${state.maxPlayers}`;

    const wrap = $('#lobby-players');
    const prevIds = new Set(Array.from(wrap.querySelectorAll('.player-card')).map((c) => c.dataset.id));
    wrap.innerHTML = '';

    state.players.forEach((p) => {
      const card = document.createElement('div');
      card.className = `player-card ${p.ready ? 'ready' : ''}`;
      card.dataset.id = p.id;
      if (prevIds.size && !prevIds.has(p.id)) GameAudio.stinger(true);
      card.innerHTML = `
        <div class="player-face">${Avatars.faceSVG(p.name)}</div>
        <span class="player-name">${escapeHTML(p.name)}${p.id === room.selfId ? ' (tú)' : ''}</span>
        <span class="player-badge ${p.isHost ? 'host-badge' : ''}">
          ${p.ready ? '✓ LISTO' : p.isHost ? '♛ ANFITRIÓN' : 'esperando'}
        </span>`;
      wrap.appendChild(card);
    });

    for (let i = state.players.length; i < state.maxPlayers; i++) {
      const slot = document.createElement('div');
      slot.className = 'player-slot-empty';
      slot.textContent = '· · ·';
      wrap.appendChild(slot);
    }

    const readyCount = state.players.filter((p) => p.ready).length;
    const me = state.players.find((p) => p.id === room.selfId);
    if (me) {
      $('#ready-btn').classList.toggle('is-ready', me.ready);
      $('#ready-btn .btn-label').textContent = me.ready ? '✓ LISTO' : 'LISTO';
    }
    if (!countdownActive) {
      $('#lobby-status').textContent =
        state.players.length < 2
          ? 'comparte el código… la oscuridad espera'
          : `${readyCount}/${state.players.length} listos`;
    }
  }

  function escapeHTML(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  $('#ready-btn').addEventListener('click', () => {
    if (!room) return;
    GameAudio.uiClick();
    const me = room.state?.players.find((p) => p.id === room.selfId);
    room.setReady(!(me?.ready));
  });

  $('#lobby-leave-btn').addEventListener('click', () => {
    GameAudio.uiClick();
    stopCountdownUI();
    room?.leave();
    room = null;
    goto('multi', { blackout: true });
  });

  $('#lobby-code').addEventListener('click', async () => {
    const codeEl = $('#lobby-code');
    try {
      await navigator.clipboard.writeText($('#lobby-code-text').textContent);
      codeEl.classList.remove('copied');
      void codeEl.offsetWidth;
      codeEl.classList.add('copied');
      codeEl.querySelector('.copy-hint').textContent = '¡copiado!';
      setTimeout(() => (codeEl.querySelector('.copy-hint').textContent = 'copiar'), 1500);
    } catch { /* clipboard no disponible */ }
  });

  // ══════════ CUENTA ATRÁS ══════════

  let countdownActive = false;
  let countdownInterval = null;

  function startCountdownUI() {
    const overlay = $('#countdown-overlay');
    const numEl = $('#countdown-number');
    let n = BLACKOUT_CONFIG.countdownSeconds;

    stopCountdownUI();
    countdownActive = true;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    $('#lobby-status').textContent = 'TODOS LISTOS';

    const tick = () => {
      if (n <= 0) return; // el game-start llega por red
      const intensity = BLACKOUT_CONFIG.countdownSeconds - n + 1; // 1..5
      overlay.className = `overlay active intensity-${intensity}`;
      numEl.textContent = n;
      numEl.classList.remove('tick');
      void numEl.offsetWidth;
      numEl.classList.add('tick');
      GameAudio.heartbeat(intensity);
      FX.setEmberMode(intensity / 5);
      if (intensity >= 4) FX.bloodPulse();
      if (intensity >= 3) FX.lightning();
      n--;
    };
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function cancelCountdownUI(reason) {
    if (!countdownActive) return;
    const overlay = $('#countdown-overlay');
    overlay.classList.add('aborted');
    GameAudio.uiError();
    setTimeout(() => stopCountdownUI(), 450);
    $('#lobby-status').textContent = `⚠ cuenta atrás detenida: ${reason || 'algo ha cambiado'}`;
  }

  function stopCountdownUI() {
    countdownActive = false;
    clearInterval(countdownInterval);
    countdownInterval = null;
    const overlay = $('#countdown-overlay');
    overlay.className = 'overlay';
    overlay.setAttribute('aria-hidden', 'true');
    FX.setEmberMode(0);
  }

  function onGameStart() {
    stopCountdownUI();
    GameAudio.slam();
    FX.bloodPulse();
    $('#transition-layer').classList.remove('blackout');
    void $('#transition-layer').offsetWidth;
    $('#transition-layer').classList.add('blackout');
    // De momento la partida multijugador abre la galería de assets;
    // aquí arrancará la partida real.
    setTimeout(() => {
      goto('gallery');
      try { Gallery.start(); } catch (e) { console.error('[gallery]', e); }
    }, 700);
  }

  // ══════════ LEADERBOARDS ══════════

  let activeBoard = 'times';
  const BOARD_META = {
    times: { col: 'TIEMPO', label: 'MEJORES TIEMPOS' },
    survival: { col: 'NOCHES', label: 'SUPERVIVENCIA' },
    credits: { col: 'CREDITS', label: 'CRÉDITOS' },
  };

  $$('.lb-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      GameAudio.uiClick();
      $$('.lb-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeBoard = tab.dataset.board;
      renderLeaderboard(activeBoard);
    });
  });

  async function renderLeaderboard(board) {
    const rows = await Backend.fetchLeaderboard(board);
    const meta = BOARD_META[board];
    const wrap = $('#lb-table-wrap');
    wrap.innerHTML = `
      <table class="lb-table">
        <thead>
          <tr><th>#</th><th>ALMA</th><th style="text-align:right">${meta.col}</th></tr>
        </thead>
        <tbody>
          ${rows.map((r, i) => `
            <tr class="${r.name === player?.name ? 'lb-you' : ''}" style="animation-delay:${i * 0.05}s">
              <td class="lb-rank">${i + 1}</td>
              <td>${escapeHTML(r.name)}</td>
              <td class="lb-value">${escapeHTML(r.value)}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  // ══════════ ARRANQUE ══════════

  if (player) {
    // dispositivo conocido: re-sincroniza el perfil en segundo plano
    Backend.syncPlayerProfile(player);
  }
})();
