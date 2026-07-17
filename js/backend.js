/* ══════════════════════════════════════════════════════════════
   BLACKOUT — capa de backend (Supabase, preparada pero inactiva)

   Este módulo centraliza TODO lo que en el futuro hablará con
   Supabase. Mientras `BLACKOUT_CONFIG.supabase.url` esté vacío,
   las funciones se quedan en modo "pendiente" y sólo registran
   en consola lo que habrían enviado.
   ══════════════════════════════════════════════════════════════ */

const Backend = (() => {
  const cfg = BLACKOUT_CONFIG.supabase;

  function isConfigured() {
    return Boolean(cfg.url && cfg.anonKey);
  }

  // Datos de dispositivo/red que acompañarán al perfil.
  // La IP y el puerto reales NO se pueden leer de forma fiable
  // desde el navegador: se capturarán en el servidor (Edge
  // Function de Supabase) cuando llegue la petición. Aquí se
  // reserva su hueco y se recopila lo que sí es accesible.
  function collectDeviceInfo() {
    return {
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.userAgentData?.platform || navigator.platform || 'unknown',
      screen_w: window.screen.width,
      screen_h: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Rellenados por el servidor al recibir la petición:
      ip: null,   // TODO (server-side): request.headers['x-forwarded-for']
      port: null, // TODO (server-side): puerto de origen de la conexión
      // TODO: más datos que añadiremos más adelante.
    };
  }

  /**
   * Sube (upsert) el perfil del jugador a la tabla `players`.
   * Clave natural: device_id — un nombre por dispositivo.
   */
  async function syncPlayerProfile(player) {
    const payload = {
      device_id: player.deviceId,
      name: player.name,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
      ...collectDeviceInfo(),
    };

    if (!isConfigured()) {
      console.info('[Backend] Supabase sin configurar. Perfil pendiente de sync:', payload);
      return { pending: true, payload };
    }

    // TODO: cuando exista el proyecto, sustituir por el SDK oficial
    // (supabase-js) o por una Edge Function que además capture ip/puerto.
    try {
      const res = await fetch(`${cfg.url}/rest/v1/${cfg.tables.players}`, {
        method: 'POST',
        headers: {
          apikey: cfg.anonKey,
          Authorization: `Bearer ${cfg.anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok };
    } catch (err) {
      console.warn('[Backend] Falló el sync del perfil (se reintentará):', err);
      return { ok: false, error: err };
    }
  }

  /**
   * Leaderboards. De momento devuelve datos de ejemplo; cuando
   * Supabase esté listo, leerá de la tabla `leaderboards`.
   */
  async function fetchLeaderboard(board) {
    if (isConfigured()) {
      // TODO: select real: /rest/v1/leaderboards?board=eq.<board>&order=...
    }
    return SAMPLE_LEADERBOARDS[board] || [];
  }

  // Datos de ejemplo hasta la vinculación real.
  const SAMPLE_LEADERBOARDS = {
    times: [
      { name: 'V3sper', value: '12:04' },
      { name: 'Morgue', value: '13:31' },
      { name: 'Anoia', value: '14:58' },
      { name: 'Sombra', value: '16:12' },
      { name: 'Larva', value: '18:47' },
      { name: 'Requiem', value: '21:03' },
      { name: 'Hollow', value: '23:40' },
      { name: 'Nadir', value: '25:19' },
    ],
    survival: [
      { name: 'Morgue', value: '9 noches' },
      { name: 'V3sper', value: '8 noches' },
      { name: 'Hollow', value: '7 noches' },
      { name: 'Anoia', value: '6 noches' },
      { name: 'Requiem', value: '5 noches' },
      { name: 'Sombra', value: '4 noches' },
      { name: 'Larva', value: '3 noches' },
      { name: 'Nadir', value: '2 noches' },
    ],
    credits: [
      { name: 'Anoia', value: '14 250' },
      { name: 'Requiem', value: '12 980' },
      { name: 'V3sper', value: '11 400' },
      { name: 'Nadir', value: '9 875' },
      { name: 'Morgue', value: '8 640' },
      { name: 'Sombra', value: '7 210' },
      { name: 'Hollow', value: '5 990' },
      { name: 'Larva', value: '4 425' },
    ],
  };

  return { isConfigured, syncPlayerProfile, fetchLeaderboard, collectDeviceInfo };
})();
