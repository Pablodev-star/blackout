/* ══════════════════════════════════════════════════════════════
   BLACKOUT — almacenamiento local (jugador + save files)
   ══════════════════════════════════════════════════════════════ */

const Storage = (() => {
  const KEYS = BLACKOUT_CONFIG.storageKeys;

  function read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Jugador ───────────────────────────────────────────────
  // El nombre queda "inculpado" al dispositivo mediante un
  // deviceId aleatorio persistente que luego se subirá a Supabase.

  function getPlayer() {
    return read(KEYS.player);
  }

  async function savePlayerName(name) {
    const existing = getPlayer();
    const claimed = await Backend.claimPlayerName(name, existing?.deviceId);
    const now = new Date().toISOString();
    const player = {
      name: claimed.player.name,
      deviceId: claimed.player.deviceId,
      createdAt: claimed.player.createdAt || existing?.createdAt || now,
      updatedAt: claimed.player.updatedAt || now,
    };
    write(KEYS.player, player);
    return player;
  }

  // ── Save files (modo solitario) ───────────────────────────

  function emptySaves() {
    return new Array(BLACKOUT_CONFIG.maxSaveFiles).fill(null);
  }

  function getSaves() {
    const saves = read(KEYS.saves, emptySaves());
    while (saves.length < BLACKOUT_CONFIG.maxSaveFiles) saves.push(null);
    return saves.slice(0, BLACKOUT_CONFIG.maxSaveFiles);
  }

  function createSave(slot) {
    const saves = getSaves();
    saves[slot] = {
      slot,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      timePlayedSec: 0,
      credits: 0,
      chapter: 1,
      deaths: 0,
    };
    write(KEYS.saves, saves);
    return saves[slot];
  }

  function touchSave(slot) {
    const saves = getSaves();
    if (saves[slot]) {
      saves[slot].lastPlayed = new Date().toISOString();
      write(KEYS.saves, saves);
    }
    return saves[slot];
  }

  function deleteSave(slot) {
    const saves = getSaves();
    saves[slot] = null;
    write(KEYS.saves, saves);
  }

  // ── Utilidades de formato ─────────────────────────────────

  function formatTime(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  }

  return {
    getPlayer,
    savePlayerName,
    getSaves,
    createSave,
    touchSave,
    deleteSave,
    formatTime,
  };
})();
