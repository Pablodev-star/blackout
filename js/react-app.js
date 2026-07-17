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

  const rootEl = document.getElementById('root');
  if (window.React && window.ReactDOM?.createRoot) {
    const root = ReactDOM.createRoot(rootEl);
    if (ReactDOM.flushSync) ReactDOM.flushSync(() => root.render(React.createElement(BlackoutApp)));
    else root.render(React.createElement(BlackoutApp));
  } else {
    rootEl.innerHTML = APP_MARKUP;
  }
})();
