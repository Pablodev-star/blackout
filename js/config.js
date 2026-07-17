/* ══════════════════════════════════════════════════════════════
   BLACKOUT — configuración global
   ══════════════════════════════════════════════════════════════ */

const BLACKOUT_CONFIG = {
  version: '0.1.0',

  // ── Supabase ───────────────────────────────────────────────
  supabase: {
    url: 'https://fqcuhetsqwobuxuocwub.supabase.co',
    anonKey: 'sb_publishable_huHLzTEUVXBSEYMoipEqjw_kKeraPbB',
    tables: {
      players: 'players',        // perfil: nombre, device_id, ip, puerto, etc.
      leaderboards: 'leaderboards',
      rooms: 'rooms',
      roomPlayers: 'room_players',
      roomEvents: 'room_events'
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
