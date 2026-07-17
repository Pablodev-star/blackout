/* ══════════════════════════════════════════════════════════════
   BLACKOUT — aplicación React
   React monta toda la interfaz; el controlador de juego se enlaza
   después sobre los nodos renderizados para conservar los sistemas
   existentes de red, audio, píxel art y almacenamiento.
   ══════════════════════════════════════════════════════════════ */

(() => {
  const APP_MARKUP = `
  <!-- ══════════ CAPAS DE AMBIENTE GLOBAL ══════════ -->
  <canvas id="fx-canvas" aria-hidden="true"></canvas>
  <div class="fog fog-a" aria-hidden="true"></div>
  <div class="fog fog-b" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>
  <div class="scanlines" aria-hidden="true"></div>
  <div class="noise" aria-hidden="true"></div>
  <div id="flash-layer" aria-hidden="true"></div>

  <!-- ══════════ BOOT / INTRO ══════════ -->
  <section id="screen-boot" class="screen active">
    <div class="boot-inner">
      <h1 class="boot-title glitchable" data-text="BLACKOUT">BLACKOUT</h1>
      <p class="boot-hint blink">— pulsa para entrar en la oscuridad —</p>
    </div>
  </section>

  <!-- ══════════ ENTRADA DE NOMBRE ══════════ -->
  <section id="screen-name" class="screen">
    <div class="panel panel-name">
      <h2 class="panel-title">¿QUIÉN ERES?</h2>
      <p class="panel-sub">La oscuridad quiere conocerte. Escribe tu nombre.</p>
      <div class="name-input-wrap">
        <input
          id="name-input"
          type="text"
          maxlength="16"
          autocomplete="off"
          spellcheck="false"
          placeholder="tu nombre…"
        />
        <div class="input-underline"></div>
      </div>
      <p id="name-error" class="form-error" role="alert"></p>
      <button id="name-submit" class="btn btn-primary">
        <span class="btn-label">FIRMAR EL PACTO</span>
      </button>
      <p class="tiny-note">Tu nombre queda ligado a este dispositivo.</p>
    </div>
  </section>

  <!-- ══════════ MENÚ PRINCIPAL ══════════ -->
  <section id="screen-menu" class="screen">
    <header class="menu-header">
      <h1 class="game-title glitchable" data-text="BLACKOUT">BLACKOUT</h1>
      <p class="game-subtitle">no apagues la luz</p>
    </header>

    <nav class="menu-nav" aria-label="Menú principal">
      <button class="menu-btn" data-goto="solo">
        <span class="menu-btn-icon">🕯️</span>
        <span class="menu-btn-text">
          <span class="menu-btn-title">SOLITARIO</span>
          <span class="menu-btn-desc">sobrevive tú solo… si puedes</span>
        </span>
      </button>
      <button class="menu-btn" data-goto="multi">
        <span class="menu-btn-icon">👥</span>
        <span class="menu-btn-text">
          <span class="menu-btn-title">MULTIJUGADOR</span>
          <span class="menu-btn-desc">nadie os oirá gritar</span>
        </span>
      </button>
      <button class="menu-btn" data-goto="leaderboards">
        <span class="menu-btn-icon">🏆</span>
        <span class="menu-btn-text">
          <span class="menu-btn-title">LEADERBOARDS</span>
          <span class="menu-btn-desc">los que aguantaron más</span>
        </span>
      </button>
    </nav>

    <footer class="menu-footer">
      <span id="menu-player-name" class="player-chip"></span>
      <button id="btn-change-name" class="link-btn">cambiar nombre</button>
    </footer>
  </section>

  <!-- ══════════ SOLITARIO: FILES ══════════ -->
  <section id="screen-solo" class="screen">
    <header class="screen-header">
      <button class="back-btn" data-goto="menu">‹ volver</button>
      <h2 class="screen-title">ARCHIVOS DEL SUPERVIVIENTE</h2>
    </header>
    <div id="save-files" class="save-files">
      <!-- generado por JS: 3 slots -->
    </div>
    <p class="screen-hint">mantén pulsado un archivo para borrarlo</p>
  </section>

  <!-- ══════════ MULTIJUGADOR: HUB ══════════ -->
  <section id="screen-multi" class="screen">
    <header class="screen-header">
      <button class="back-btn" data-goto="menu">‹ volver</button>
      <h2 class="screen-title">MULTIJUGADOR</h2>
    </header>
    <div class="multi-options">
      <button class="big-card" data-goto="create">
        <span class="big-card-icon">🔑</span>
        <span class="big-card-title">CREAR SALA</span>
        <span class="big-card-desc">abre una puerta y comparte la llave</span>
      </button>
      <button class="big-card" data-goto="join">
        <span class="big-card-icon">🚪</span>
        <span class="big-card-title">UNIRSE</span>
        <span class="big-card-desc">entra con un código… bajo tu responsabilidad</span>
      </button>
    </div>
  </section>

  <!-- ══════════ CREAR SALA ══════════ -->
  <section id="screen-create" class="screen">
    <header class="screen-header">
      <button class="back-btn" data-goto="multi">‹ volver</button>
      <h2 class="screen-title">CREAR SALA</h2>
    </header>
    <div class="panel panel-create">
      <label class="field-label" for="room-name-input">NOMBRE DE LA SALA</label>
      <div class="name-input-wrap">
        <input
          id="room-name-input"
          type="text"
          maxlength="20"
          autocomplete="off"
          spellcheck="false"
          placeholder="la sala sin nombre…"
        />
        <div class="input-underline"></div>
      </div>

      <label class="field-label">MÁXIMO DE JUGADORES</label>
      <div id="max-players" class="max-players" role="radiogroup" aria-label="Máximo de jugadores">
        <button class="pill" data-max="2" role="radio" aria-checked="false">2</button>
        <button class="pill" data-max="3" role="radio" aria-checked="false">3</button>
        <button class="pill active" data-max="4" role="radio" aria-checked="true">4</button>
      </div>

      <p id="create-error" class="form-error" role="alert"></p>
      <button id="create-room-btn" class="btn btn-primary">
        <span class="btn-label">ABRIR LA PUERTA</span>
      </button>
    </div>
  </section>

  <!-- ══════════ UNIRSE A SALA ══════════ -->
  <section id="screen-join" class="screen">
    <header class="screen-header">
      <button class="back-btn" data-goto="multi">‹ volver</button>
      <h2 class="screen-title">UNIRSE A SALA</h2>
    </header>
    <div class="panel panel-join">
      <label class="field-label" for="join-code-input">CÓDIGO DE LA SALA</label>
      <div class="name-input-wrap code-input-wrap">
        <input
          id="join-code-input"
          type="text"
          maxlength="6"
          autocomplete="off"
          spellcheck="false"
          placeholder="······"
        />
        <div class="input-underline"></div>
      </div>
      <p id="join-error" class="form-error" role="alert"></p>
      <button id="join-room-btn" class="btn btn-primary">
        <span class="btn-label">CRUZAR EL UMBRAL</span>
      </button>
    </div>
  </section>

  <!-- ══════════ LOBBY ══════════ -->
  <section id="screen-lobby" class="screen">
    <header class="screen-header lobby-header">
      <button id="lobby-leave-btn" class="back-btn danger">‹ salir de la sala</button>
      <div class="lobby-titles">
        <h2 id="lobby-room-name" class="screen-title"></h2>
        <button id="lobby-code" class="room-code" title="copiar código">
          <span id="lobby-code-text">------</span>
          <span class="copy-hint">copiar</span>
        </button>
      </div>
      <span id="lobby-count" class="lobby-count">0/4</span>
    </header>

    <div id="lobby-players" class="lobby-players">
      <!-- tarjetas de jugador generadas por JS -->
    </div>

    <div class="lobby-actions">
      <p id="lobby-status" class="lobby-status">esperando almas…</p>
      <button id="ready-btn" class="btn btn-primary btn-ready">
        <span class="btn-label">LISTO</span>
      </button>
    </div>
  </section>

  <!-- ══════════ LEADERBOARDS ══════════ -->
  <section id="screen-leaderboards" class="screen">
    <header class="screen-header">
      <button class="back-btn" data-goto="menu">‹ volver</button>
      <h2 class="screen-title">LEADERBOARDS</h2>
    </header>
    <div class="lb-tabs" role="tablist">
      <button class="lb-tab active" data-board="times" role="tab">MEJORES TIEMPOS</button>
      <button class="lb-tab" data-board="survival" role="tab">SUPERVIVENCIA</button>
      <button class="lb-tab" data-board="credits" role="tab">CRÉDITOS</button>
    </div>
    <div id="lb-table-wrap" class="lb-table-wrap">
      <!-- tabla generada por JS -->
    </div>
    <p class="screen-hint">datos sincronizados con Supabase cuando haya conexión</p>
  </section>

  <!-- ══════════ CUTSCENE INICIAL ══════════ -->
  <section id="screen-cutscene" class="screen cutscene-screen">
    <div id="cutscene-black" class="cutscene-black" aria-hidden="true"></div>
    <canvas id="cutscene-canvas" class="cutscene-canvas" aria-label="Habitación inicial de la casa encantada"></canvas>
    <div class="cutscene-rain" aria-hidden="true"></div>
    <p class="cutscene-caption">La linterna parpadea… pero la oscuridad no responde.</p>
  </section>

  <!-- ══════════ JUEGO REAL ══════════ -->
  <section id="screen-game" class="screen game-screen">
    <canvas id="game-canvas" class="game-canvas" aria-label="Dormitorio jugable"></canvas>
    <div id="mobile-controls" class="mobile-controls" aria-label="Controles móviles">
      <button class="mobile-arrow up" data-dir="up" aria-label="Arriba">▲</button>
      <button class="mobile-arrow left" data-dir="left" aria-label="Izquierda">◀</button>
      <button class="mobile-arrow down" data-dir="down" aria-label="Abajo">▼</button>
      <button class="mobile-arrow right" data-dir="right" aria-label="Derecha">▶</button>
    </div>
    <p class="game-hint">WASD / flechas — levántate y no atravieses a nadie</p>
  </section>

  <!-- ══════════ GALERÍA DE ASSETS (preview tras abrir un file) ══════════ -->
  <section id="screen-gallery" class="screen">
    <header class="screen-header">
      <button id="gallery-back" class="back-btn" data-goto="solo">‹ volver</button>
      <h2 class="screen-title">LO QUE HABITA DENTRO</h2>
    </header>
    <div class="gallery-scroll">
      <h3 class="gallery-section-title">LOS SUPERVIVIENTES</h3>
      <p class="gallery-section-sub">el mismo rostro, cuatro chapas — solo el color os distingue</p>
      <div id="gallery-players" class="asset-grid asset-grid-chars"></div>

      <h3 class="gallery-section-title danger-title">EL AUSENTE</h3>
      <p class="gallery-section-sub">a veces patrulla · a veces se esconde · a veces ya es tarde</p>
      <div id="gallery-monster" class="asset-grid asset-grid-chars"></div>

      <h3 class="gallery-section-title">LOS OBJETOS</h3>
      <p class="gallery-section-sub">lo que cabe en un bolsillo cuando corres a oscuras</p>
      <div id="gallery-items" class="asset-grid asset-grid-tiles"></div>

      <h3 class="gallery-section-title">LA CASA ENCANTADA</h3>
      <p class="gallery-section-sub">bloques de 16×16 — coloca cada uno en la rejilla y listo</p>
      <div id="gallery-tiles" class="asset-grid asset-grid-tiles"></div>

      <h3 class="gallery-section-title">LA ENFERMERÍA</h3>
      <p class="gallery-section-sub">el azulejo fue blanco · alguien sigue en la camilla</p>
      <div id="gallery-tiles-infirmary" class="asset-grid asset-grid-tiles"></div>

      <h3 class="gallery-section-title">EL COLEGIO</h3>
      <p class="gallery-section-sub">la tiza aún escribe sola en la pizarra</p>
      <div id="gallery-tiles-school" class="asset-grid asset-grid-tiles"></div>
    </div>
  </section>

  <!-- ══════════ OVERLAYS ══════════ -->
  <div id="file-open-overlay" class="overlay" aria-hidden="true">
    <div class="file-open-inner">
      <div class="crack crack-1"></div>
      <div class="crack crack-2"></div>
      <div class="crack crack-3"></div>
      <div class="file-open-title glitchable" data-text="">FILE</div>
      <div class="file-open-sub">abriendo el archivo…</div>
      <div class="blood-pool"></div>
    </div>
  </div>

  <div id="countdown-overlay" class="overlay" aria-hidden="true">
    <div class="countdown-ring"></div>
    <div id="countdown-number" class="countdown-number">5</div>
    <div class="countdown-sub">que empiece la pesadilla</div>
  </div>

  <div id="transition-layer" aria-hidden="true"></div>
  `;

  function BlackoutApp() {
    return React.createElement('div', {
      id: 'blackout-app',
      dangerouslySetInnerHTML: { __html: APP_MARKUP },
    });
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  if (ReactDOM.flushSync) ReactDOM.flushSync(() => root.render(React.createElement(BlackoutApp)));
  else root.render(React.createElement(BlackoutApp));
})();

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
    cutscene: $('#screen-cutscene'),
    game: $('#screen-game'),
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

  async function submitName() {
    const input = $('#name-input');
    const name = input.value.trim();
    if (name.length < 2) {
      showError($('#name-error'), 'la oscuridad necesita al menos 2 letras…');
      return;
    }
    const btn = $('#name-submit');
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'COMPROBANDO…';
    try {
      player = await Storage.savePlayerName(name);
      GameAudio.slam();
      FX.bloodPulse();
      goto('menu', { blackout: true });
    } catch (err) {
      showError($('#name-error'), err.message || 'no se pudo reservar ese nombre');
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-label').textContent = 'FIRMAR EL PACTO';
    }
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
      startInitialCutscene([{ name: player?.name || 'tú' }]);
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

  $('#create-room-btn').addEventListener('click', async () => {
    const roomName = $('#room-name-input').value.trim();
    if (roomName.length < 2) {
      showError($('#create-error'), 'toda sala necesita un nombre…');
      return;
    }
    GameAudio.slam();
    try {
      room = await Net.createRoom({
        roomName,
        maxPlayers: selectedMax,
        player,
        events: lobbyEvents(),
      });
      enterLobby();
    } catch (err) {
      showError($('#create-error'), err.message || 'no se pudo crear la sala');
    }
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
      onPlayerState: (id, state) => updateRemotePlayer(id, state),
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
    const currentIds = new Set(state.players.map((p) => p.id));
    wrap.querySelectorAll('.player-slot-empty').forEach((slot) => slot.remove());
    wrap.querySelectorAll('.player-card').forEach((card) => {
      if (!currentIds.has(card.dataset.id)) card.remove();
    });

    const selfId = state.selfId || room?.selfId;
    state.players.forEach((p) => {
      let card = Array.from(wrap.querySelectorAll('.player-card')).find((el) => el.dataset.id === p.id);
      const isNew = !card;
      if (!card) {
        card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.id = p.id;
        if (prevIds.size) GameAudio.stinger(true);
        wrap.appendChild(card);
      } else {
        card.classList.add('no-join-anim');
      }
      card.classList.toggle('ready', p.ready);
      card.classList.toggle('no-join-anim', !isNew);
      card.innerHTML = `
        <div class="player-face">${Avatars.faceSVG(p.name)}</div>
        <span class="player-name">${escapeHTML(p.name)}${p.id === selfId ? ' (tú)' : ''}</span>
        <span class="player-badge ${p.isHost ? 'host-badge' : ''}">
          ${p.ready ? '✓ LISTO' : p.isHost ? '♛ ANFITRIÓN' : 'esperando'}
        </span>`;
    });

    for (let i = state.players.length; i < state.maxPlayers; i++) {
      const slot = document.createElement('div');
      slot.className = 'player-slot-empty';
      slot.textContent = '· · ·';
      wrap.appendChild(slot);
    }

    const readyCount = state.players.filter((p) => p.ready).length;
    const me = state.players.find((p) => p.id === selfId);
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
    const players = room?.state?.players || [{ name: player?.name || 'tú' }];
    setTimeout(() => {
      startInitialCutscene(players);
    }, 700);
  }

  function startInitialCutscene(players) {
    goto('cutscene', { blackout: true });
    setTimeout(() => {
      try { Cutscene.start({ players, onDone: () => startPlayableGame(players) }); } catch (e) { console.error('[cutscene]', e); startPlayableGame(players); }
    }, 260);
  }


  // ══════════ JUEGO REAL: dormitorio jugable ══════════

  const GameWorld = (() => {
    const W = 352, H = 224, WALL_H = 64, SPEED = 76, R = 8, WAKE_MS = 1400;
    let raf = 0, last = 0, ctx = null, canvas = null, local = null, remotes = new Map(), keys = new Set(), lastSent = 0, wakeStarted = 0;
    const beds = [{ x: 62, y: 128, w: 32, h: 64 }, { x: 160, y: 134, w: 32, h: 64 }, { x: 258, y: 128, w: 32, h: 64 }];
    const solids = [{ x: 0, y: 0, w: W, h: WALL_H - 8 }, { x: 312, y: 2, w: 32, h: 64 }, ...beds];

    function playerList(players) {
      const base = players?.length ? players : (room?.state?.players || [{ id: room?.selfId || 'solo', name: player?.name || 'tú' }]);
      return base.map((p, i) => ({ ...p, id: p.id || (i === 0 ? room?.selfId : `solo-${i}`) || `solo-${i}`, badge: i }));
    }

    function start(players) {
      stop();
      goto('game', { blackout: true });
      canvas = $('#game-canvas'); ctx = canvas.getContext('2d');
      const list = playerList(players);
      const selfId = room?.selfId || list[0]?.id || 'solo';
      local = { id: selfId, name: player?.name || list[0]?.name || 'tú', x: 78, y: 150, bedX: 62, bedY: 128, dir: 'down', moving: false, waking: true, badge: Math.max(0, list.findIndex((p) => p.id === selfId)) };
      wakeStarted = performance.now();
      remotes = new Map(list.filter((p) => p.id !== selfId).map((p, i) => [p.id, { id: p.id, name: p.name, x: 94 + i * 18, y: 150, dir: 'down', moving: false, badge: p.badge ?? i + 1 }]));
      bindControls(); last = performance.now(); loop(last);
    }
    function stop() { cancelAnimationFrame(raf); }
    function setRemote(id, st) { if (!local || id === local.id || !st) return; remotes.set(id, { ...(remotes.get(id) || { id, name: 'alma', badge: remotes.size + 1 }), ...st }); }
    function bindControls() {
      if (bindControls.done) return; bindControls.done = true;
      window.addEventListener('keydown', (e) => { const d = keyDir(e.key); if (d) { keys.add(d); e.preventDefault(); } });
      window.addEventListener('keyup', (e) => { const d = keyDir(e.key); if (d) keys.delete(d); });
      $$('.mobile-arrow').forEach((btn) => {
        const dir = btn.dataset.dir;
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
        btn.addEventListener('pointerdown', (e) => { btn.setPointerCapture(e.pointerId); keys.add(dir); e.preventDefault(); });
        const up = (e) => { keys.delete(dir); try { btn.releasePointerCapture(e.pointerId); } catch {} e.preventDefault(); };
        btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', () => keys.delete(dir));
      });
    }
    function keyDir(k) { return ({ w: 'up', W: 'up', ArrowUp: 'up', s: 'down', S: 'down', ArrowDown: 'down', a: 'left', A: 'left', ArrowLeft: 'left', d: 'right', D: 'right', ArrowRight: 'right' })[k]; }
    function blocked(nx, ny) {
      const box = { x: nx - R, y: ny - 4, w: R * 2, h: 12 };
      return solids.some((o) => hit(box, o)) || [...remotes.values()].some((p) => Math.hypot(p.x - nx, p.y - ny) < R * 2);
    }
    function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
    function update(dt, now) {
      const wake = Math.min(1, (now - wakeStarted) / WAKE_MS);
      local.waking = wake < 1;
      let dx = 0, dy = 0;
      if (!local.waking && keys.has('left')) dx--; if (!local.waking && keys.has('right')) dx++; if (!local.waking && keys.has('up')) dy--; if (!local.waking && keys.has('down')) dy++;
      if (dx || dy) { const l = Math.hypot(dx, dy); dx /= l; dy /= l; local.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); }
      local.moving = Boolean(dx || dy);
      const nx = Math.max(12, Math.min(W - 12, local.x + dx * SPEED * dt));
      const ny = Math.max(WALL_H + 10, Math.min(H - 10, local.y + dy * SPEED * dt));
      if (!blocked(nx, local.y)) local.x = nx; if (!blocked(local.x, ny)) local.y = ny;
      if (room?.emit && now - lastSent > 90) { lastSent = now; room.emit('player-state', { x: local.x, y: local.y, dir: local.dir, moving: local.moving, name: local.name, badge: local.badge }); }
    }
    function draw(now) {
      const dpr = window.devicePixelRatio || 1, r = canvas.getBoundingClientRect();
      canvas.width = Math.floor(r.width * dpr); canvas.height = Math.floor(r.height * dpr);
      const scale = Math.max(1, Math.floor(Math.min(canvas.width / W, canvas.height / H))), ox = Math.floor((canvas.width - W * scale) / 2), oy = Math.floor((canvas.height - H * scale) / 2);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale); ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) PixelArt.draw(ctx, TILES_HOUSE.sprites[y < WALL_H ? 'wall_panel' : (x + y) % 48 ? 'floor_wood_a' : 'floor_wood_b'], 0, x, y, { scale: 1 });
      beds.forEach((b) => PixelArt.draw(ctx, TILES_HOUSE.sprites.bed, 0, b.x, b.y, { scale: 2 }));
      const all = [local, ...remotes.values()].sort((a, b) => a.y - b.y);
      all.forEach((p) => drawPlayer(p, now));
      ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    function drawPlayer(p, now) {
      if (p.waking) {
        const wake = Math.min(1, (now - wakeStarted) / WAKE_MS);
        if (wake < 0.45) {
          PixelArt.draw(ctx, PLAYER.sleep, Math.floor(now / 260) % 2, p.bedX, p.bedY + 8, { scale: 2, badge: p.badge || 0 });
          return;
        }
        const rise = (wake - 0.45) / 0.55;
        const y = p.y - 22 - Math.round((1 - rise) * 18);
        PixelArt.draw(ctx, PLAYER.down, 0, Math.round(p.x - 8), y, { scale: 1, badge: p.badge || 0 });
        return;
      }
      const side = p.dir === 'left' || p.dir === 'right'; const sprite = side ? PLAYER.side : PLAYER[p.dir || 'down'];
      const seq = p.moving ? PLAYER.WALK_SEQ : PLAYER.IDLE_SEQ; const step = seq[Math.floor(now / 130) % seq.length];
      PixelArt.draw(ctx, sprite, step.f, Math.round(p.x - 8), Math.round(p.y - 22 + step.dy), { scale: 1, flip: p.dir === 'right', badge: p.badge || 0 });
    }
    function loop(now) { update(Math.min(0.05, (now - last) / 1000), now); draw(now); last = now; raf = requestAnimationFrame(loop); }
    return { start, stop, setRemote };
  })();

  function startPlayableGame(players) { Cutscene.stop?.(); GameWorld.start(players); }
  function updateRemotePlayer(id, state) { GameWorld.setRemote(id, state); }

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
