/* ══════════════════════════════════════════════════════════════
   BLACKOUT — capa de backend (Supabase)
   ══════════════════════════════════════════════════════════════ */

const Backend = (() => {
  const cfg = BLACKOUT_CONFIG.supabase;
  let client = null;

  function isConfigured() {
    return Boolean(cfg.url && cfg.anonKey);
  }

  function getClient() {
    if (!isConfigured() || !window.supabase?.createClient) return null;
    if (!client) {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        realtime: { params: { eventsPerSecond: 20 } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return client;
  }

  function safe(fn, fallback = null) {
    try { return fn(); } catch { return fallback; }
  }

  function getCookieSettings() {
    const before = document.cookie;
    const key = `blackout_cookie_probe_${Math.random().toString(36).slice(2)}`;
    document.cookie = `${key}=1; SameSite=Lax; max-age=60`;
    const enabled = document.cookie.includes(`${key}=1`);
    document.cookie = `${key}=; SameSite=Lax; max-age=0`;
    return {
      cookie_enabled: navigator.cookieEnabled,
      first_party_cookie_writeable: enabled,
      cookie_string_present: Boolean(before),
    };
  }

  // Sólo se recopilan datos disponibles legítimamente en navegador. IP,
  // puerto, país/región aproximados y cabeceras de red se capturan en la
  // función SQL claim_player_name() desde los headers que recibe Supabase.
  function collectDeviceInfo() {
    const nav = navigator;
    const scr = window.screen || {};
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
    const ua = nav.userAgentData || null;
    return {
      user_agent: nav.userAgent,
      user_agent_brands: ua?.brands || null,
      user_agent_mobile: ua?.mobile ?? /Mobi|Android/i.test(nav.userAgent),
      language: nav.language,
      languages: nav.languages || [],
      platform: ua?.platform || nav.platform || 'unknown',
      vendor: nav.vendor || null,
      hardware_concurrency: nav.hardwareConcurrency || null,
      device_memory_gb: nav.deviceMemory || null,
      max_touch_points: nav.maxTouchPoints || 0,
      screen_w: scr.width || null,
      screen_h: scr.height || null,
      avail_screen_w: scr.availWidth || null,
      avail_screen_h: scr.availHeight || null,
      color_depth: scr.colorDepth || null,
      pixel_depth: scr.pixelDepth || null,
      device_pixel_ratio: window.devicePixelRatio || 1,
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset_min: new Date().getTimezoneOffset(),
      do_not_track: nav.doNotTrack || window.doNotTrack || null,
      online: nav.onLine,
      connection_type: conn.type || null,
      effective_connection_type: conn.effectiveType || null,
      downlink_mbps: conn.downlink || null,
      rtt_ms: conn.rtt || null,
      save_data: conn.saveData || false,
      webdriver: nav.webdriver || false,
      referrer: document.referrer || null,
      page_url: location.href,
      browser_timezone_locale: safe(() => Intl.DateTimeFormat().resolvedOptions().locale),
      local_storage_enabled: safe(() => { localStorage.setItem('__bo_probe', '1'); localStorage.removeItem('__bo_probe'); return true; }, false),
      session_storage_enabled: safe(() => { sessionStorage.setItem('__bo_probe', '1'); sessionStorage.removeItem('__bo_probe'); return true; }, false),
      ...getCookieSettings(),
    };
  }

  async function claimPlayerName(name, existingDeviceId = null) {
    const deviceId = existingDeviceId || crypto.randomUUID();
    const payload = {
      p_name: name.trim(),
      p_device_id: deviceId,
      p_device_info: collectDeviceInfo(),
    };

    if (!isConfigured()) {
      console.info('[Backend] Supabase sin configurar. Alta local:', payload);
      return { ok: true, pending: true, player: { name: payload.p_name, deviceId } };
    }

    const sb = getClient();
    if (!sb) throw new Error('Supabase no está disponible en esta página');
    const { data, error } = await sb.rpc('claim_player_name', payload);
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.allowed) throw new Error(row?.reason || 'ese nombre ya está ligado a otro dispositivo');
    return { ok: true, player: { name: row.name, deviceId: row.device_id, createdAt: row.created_at, updatedAt: row.updated_at } };
  }

  async function syncPlayerProfile(player) {
    if (!player?.name || !player?.deviceId) return { ok: false };
    try {
      return await claimPlayerName(player.name, player.deviceId);
    } catch (err) {
      console.warn('[Backend] Falló el sync del perfil:', err);
      return { ok: false, error: err };
    }
  }

  async function requirePlayerProfile(player) {
    if (!player?.name || !player?.deviceId) {
      throw new Error('primero firma tu nombre antes de entrar al multijugador');
    }
    const synced = await syncPlayerProfile(player);
    if (!synced.ok) {
      const detail = synced.error?.message || 'no se pudo vincular tu perfil con Supabase';
      throw new Error(`no pude vincular tu nombre con este dispositivo: ${detail}`);
    }
    return synced.player || player;
  }

  async function fetchLeaderboard(board) {
    const sb = getClient();
    if (sb) {
      const { data, error } = await sb
        .from(cfg.tables.leaderboards)
        .select('player_name,display_value,score_value,recorded_at')
        .eq('board', board)
        .order('score_value', { ascending: board === 'times' })
        .limit(20);
      if (!error && data?.length) return data.map((r) => ({ name: r.player_name, value: r.display_value }));
      if (error) console.warn('[Backend] leaderboard fallback:', error);
    }
    return SAMPLE_LEADERBOARDS[board] || [];
  }

  async function submitLeaderboardScore(board, scoreValue, displayValue, player) {
    const sb = getClient();
    if (!sb || !player?.deviceId) return { pending: true };
    const linkedPlayer = await requirePlayerProfile(player);
    return sb.from(cfg.tables.leaderboards).insert({
      board,
      score_value: scoreValue,
      display_value: displayValue,
      player_device_id: linkedPlayer.deviceId,
      player_name: linkedPlayer.name,
    });
  }

  const SAMPLE_LEADERBOARDS = {
    times: [{ name: 'V3sper', value: '12:04' }, { name: 'Morgue', value: '13:31' }, { name: 'Anoia', value: '14:58' }],
    survival: [{ name: 'Morgue', value: '9 noches' }, { name: 'V3sper', value: '8 noches' }, { name: 'Hollow', value: '7 noches' }],
    credits: [{ name: 'Anoia', value: '14 250' }, { name: 'Requiem', value: '12 980' }, { name: 'V3sper', value: '11 400' }],
  };

  return { isConfigured, getClient, claimPlayerName, syncPlayerProfile, requirePlayerProfile, fetchLeaderboard, submitLeaderboardScore, collectDeviceInfo };
})();
