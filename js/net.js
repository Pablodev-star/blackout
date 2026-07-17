/* ══════════════════════════════════════════════════════════════
   BLACKOUT — capa de red del multijugador (Supabase Realtime)
   ══════════════════════════════════════════════════════════════ */

const Net = (() => {
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function generateCode() {
    let code = '';
    const rnd = new Uint32Array(BLACKOUT_CONFIG.roomCodeLength);
    crypto.getRandomValues(rnd);
    for (const n of rnd) code += CODE_CHARS[n % CODE_CHARS.length];
    return code;
  }

  const sb = () => Backend.getClient?.();
  const useSupabase = () => Boolean(sb());

  class RealtimeRoomSession {
    constructor({ roomRow, player, isHost, events }) {
      this.roomId = roomRow.id;
      this.code = roomRow.code;
      this.isHost = isHost;
      this.events = events || {};
      this.selfId = crypto.randomUUID();
      this.self = { id: this.selfId, deviceId: player.deviceId, name: player.name };
      this.state = null;
      this.closed = false;
      this.countdownTimer = null;
      this.channel = sb().channel(`blackout-room-${this.roomId}`);
      this.channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${this.roomId}` }, () => this.refreshState())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${this.roomId}` }, () => this.refreshState())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_events', filter: `room_id=eq.${this.roomId}` }, (p) => this.receiveEvent(p.new));
      window.addEventListener('beforeunload', () => this.leave());
    }

    async start() {
      await this.channel.subscribe();
      await this.refreshState();
      this.heartbeat = setInterval(() => this.touchPresence(), 5000);
      return this;
    }

    async touchPresence() {
      if (this.closed) return;
      await sb().from('room_players').update({ last_seen_at: new Date().toISOString() }).eq('session_id', this.selfId);
    }

    async refreshState() {
      if (this.closed) return;
      const { data: roomRow, error: roomErr } = await sb().from('rooms').select('*').eq('id', this.roomId).single();
      if (roomErr || !roomRow || roomRow.status === 'closed') return this.close('la sala se ha cerrado');
      const { data: players, error } = await sb()
        .from('room_players')
        .select('session_id,player_device_id,player_name,ready,is_host,last_seen_at')
        .eq('room_id', this.roomId)
        .order('joined_at', { ascending: true });
      if (error) return console.warn('[Net] estado sala:', error);
      this.state = {
        selfId: this.selfId,
        code: roomRow.code,
        name: roomRow.name,
        maxPlayers: roomRow.max_players,
        countdown: roomRow.countdown_started_at ? { startedAt: new Date(roomRow.countdown_started_at).getTime() } : null,
        players: players.map((p) => ({
          id: p.session_id,
          deviceId: p.player_device_id,
          name: p.player_name,
          ready: p.ready,
          isHost: p.is_host,
        })),
      };
      this.events.onState?.(this.state);
      if (this.isHost) this.hostCheckAllReady();
    }

    async emit(type, payload = {}) {
      await sb().from('room_events').insert({ room_id: this.roomId, actor_session_id: this.selfId, event_type: type, payload });
    }

    receiveEvent(row) {
      if (row.actor_session_id === this.selfId) return;
      if (row.event_type === 'countdown-start') this.events.onCountdownStart?.();
      if (row.event_type === 'countdown-cancel') this.events.onCountdownCancel?.(row.payload?.reason);
      if (row.event_type === 'game-start') this.events.onGameStart?.();
      if (row.event_type === 'room-closed') this.close('el anfitrión cerró la sala');
    }

    async setReady(ready) {
      await sb().from('room_players').update({ ready, last_seen_at: new Date().toISOString() }).eq('session_id', this.selfId);
      await this.refreshState();
    }

    async hostCheckAllReady() {
      const ps = this.state?.players || [];
      if (ps.length < 2 || !ps.every((p) => p.ready) || this.state.countdown) return;
      const started = new Date().toISOString();
      await sb().from('rooms').update({ countdown_started_at: started, status: 'countdown' }).eq('id', this.roomId);
      await this.emit('countdown-start');
      this.events.onCountdownStart?.();
      this.countdownTimer = setTimeout(async () => {
        await sb().from('rooms').update({ status: 'playing' }).eq('id', this.roomId);
        await this.emit('game-start');
        this.events.onGameStart?.();
      }, BLACKOUT_CONFIG.countdownSeconds * 1000);
    }

    async leave() {
      if (this.closed) return;
      if (this.isHost) {
        await sb().from('rooms').update({ status: 'closed' }).eq('id', this.roomId);
        await this.emit('room-closed');
      } else {
        await sb().from('room_players').delete().eq('session_id', this.selfId);
      }
      this.close(null, true);
    }

    close(reason, silent = false) {
      if (this.closed) return;
      this.closed = true;
      clearInterval(this.heartbeat);
      clearTimeout(this.countdownTimer);
      sb()?.removeChannel(this.channel);
      if (!silent) this.events.onClosed?.(reason);
    }
  }

  async function createRoom({ roomName, maxPlayers, player, events }) {
    if (!useSupabase()) return LocalNet.createRoom({ roomName, maxPlayers, player, events });
    const linkedPlayer = await Backend.requirePlayerProfile(player);
    const code = generateCode();
    const { data: roomRow, error } = await sb().from('rooms').insert({ code, name: roomName, max_players: maxPlayers, host_device_id: linkedPlayer.deviceId }).select().single();
    if (error) throw error;
    const session = new RealtimeRoomSession({ roomRow, player: linkedPlayer, isHost: true, events });
    const { error: joinErr } = await sb().from('room_players').insert({ room_id: roomRow.id, session_id: session.selfId, player_device_id: linkedPlayer.deviceId, player_name: linkedPlayer.name, is_host: true });
    if (joinErr) throw joinErr;
    return session.start();
  }

  async function joinRoom({ code, player, events }) {
    if (!useSupabase()) return LocalNet.joinRoom({ code, player, events });
    const linkedPlayer = await Backend.requirePlayerProfile(player);
    const normalized = code.trim().toUpperCase();
    const { data: roomRows, error } = await sb().from('rooms').select('*').eq('code', normalized).in('status', ['waiting', 'countdown']).limit(1);
    if (error) throw error;
    const roomRow = roomRows?.[0];
    if (!roomRow) throw new Error('esa sala no existe… o ya no queda nadie vivo');
    const { count } = await sb().from('room_players').select('session_id', { count: 'exact', head: true }).eq('room_id', roomRow.id);
    if ((count || 0) >= roomRow.max_players) throw new Error('la sala está llena');
    const session = new RealtimeRoomSession({ roomRow, player: linkedPlayer, isHost: false, events });
    const { error: joinErr } = await sb().from('room_players').insert({ room_id: roomRow.id, session_id: session.selfId, player_device_id: linkedPlayer.deviceId, player_name: linkedPlayer.name });
    if (joinErr) throw joinErr;
    return session.start();
  }

  // Fallback mínimo para desarrollo sin SDK/Supabase: conserva la API existente.
  const LocalNet = (() => {
    function createRoom({ roomName, maxPlayers, player, events }) {
      const code = generateCode();
      const state = { code, name: roomName, maxPlayers, countdown: null, players: [{ id: crypto.randomUUID(), deviceId: player.deviceId, name: player.name, ready: false, isHost: true }] };
      return { code, state, selfId: state.players[0].id, setReady(r) { state.players[0].ready = r; events?.onState?.(state); }, leave() {}, close() {} };
    }
    async function joinRoom() { throw new Error('Supabase Realtime no está disponible'); }
    return { createRoom, joinRoom };
  })();

  return { createRoom, joinRoom, generateCode };
})();
