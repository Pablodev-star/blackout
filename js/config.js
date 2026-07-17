/* ══════════════════════════════════════════════════════════════
   BLACKOUT — configuración global
   ══════════════════════════════════════════════════════════════ */

const BLACKOUT_CONFIG = {
  version: '0.1.0',

  // ── Supabase (rellenar cuando se cree el proyecto) ──────────
  // TODO: poner la URL y la anon key del proyecto de Supabase.
  // La capa de sincronización (js/backend.js) ya está preparada:
  // en cuanto estos campos tengan valor, empezará a subir el perfil.
  supabase: {
    url: '',      // p.ej. 'https://xxxx.supabase.co'
    anonKey: '',  // clave pública (anon)
    tables: {
      players: 'players',        // perfil: nombre, device_id, ip, puerto, etc.
      leaderboards: 'leaderboards',
      rooms: 'rooms',            // futuro: salas reales con Realtime
    },
  },

  // ── Reglas del juego ────────────────────────────────────────
  maxSaveFiles: 3,
  maxRoomPlayers: 4,
  countdownSeconds: 5,
  roomCodeLength: 6,

  // ── Claves de localStorage ──────────────────────────────────
  storageKeys: {
    player: 'blackout.player',
    saves: 'blackout.saves',
  },
};
