/* ══════════════════════════════════════════════════════════════
   BLACKOUT — capa de red del multijugador

   Implementación actual: BroadcastChannel — las salas funcionan
   de verdad entre pestañas/ventanas del mismo navegador, ideal
   para desarrollar y probar el lobby.

   La interfaz (createRoom / joinRoom / setReady / leave + eventos)
   está pensada para sustituir el transporte por Supabase Realtime
   sin tocar la UI: sólo habrá que reimplementar este módulo.
   ══════════════════════════════════════════════════════════════ */

const Net = (() => {
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos

  function generateCode() {
    let code = '';
    const rnd = new Uint32Array(BLACKOUT_CONFIG.roomCodeLength);
    crypto.getRandomValues(rnd);
    for (const n of rnd) code += CODE_CHARS[n % CODE_CHARS.length];
    return code;
  }

  /**
   * Sesión de sala compartida por host y clientes.
   * events: onState, onCountdownStart, onCountdownCancel,
   *         onGameStart, onClosed
   */
  class RoomSession {
    constructor({ code, player, isHost, roomName, maxPlayers, events }) {
      this.code = code;
      this.isHost = isHost;
      this.events = events || {};
      this.selfId = crypto.randomUUID(); // id por pestaña (permite probar en local)
      this.self = { id: this.selfId, deviceId: player.deviceId, name: player.name };
      this.closed = false;
      this.countdownTimer = null;

      this.state = isHost
        ? {
            code,
            name: roomName,
            maxPlayers,
            players: [{ ...this.self, ready: false, isHost: true }],
            countdown: null, // { startedAt } cuando está en marcha
          }
        : null;

      this.channel = new BroadcastChannel(`blackout-room-${code}`);
      this.channel.onmessage = (e) => this.onMessage(e.data);

      if (isHost) {
        this.heartbeat = setInterval(() => this.broadcastState(), 2000);
      } else {
        this.lastStateAt = Date.now();
        this.watchdog = setInterval(() => {
          if (Date.now() - this.lastStateAt > 6000) this.close('la sala se ha desvanecido');
        }, 1500);
      }

      window.addEventListener('beforeunload', () => this.leave());
    }

    // ── mensajería ─────────────────────────────────────────
    send(msg) {
      if (!this.closed) this.channel.postMessage({ ...msg, from: this.selfId });
    }

    onMessage(msg) {
      if (this.closed || msg.from === this.selfId) return;

      if (this.isHost) {
        switch (msg.type) {
          case 'join-request': this.hostHandleJoin(msg); break;
          case 'set-ready': this.hostSetReady(msg.playerId, msg.ready); break;
          case 'leave': this.hostRemovePlayer(msg.playerId); break;
          case 'ping-room': this.send({ type: 'room-info', reqId: msg.reqId, exists: true }); break;
        }
      } else {
        switch (msg.type) {
          case 'state': this.clientReceiveState(msg.state); break;
          case 'countdown-start': this.events.onCountdownStart?.(); break;
          case 'countdown-cancel': this.events.onCountdownCancel?.(msg.reason); break;
          case 'game-start': this.events.onGameStart?.(); break;
          case 'room-closed': this.close('el anfitrión cerró la sala'); break;
          case 'join-reject':
            if (msg.playerId === this.selfId) this.close(msg.reason);
            break;
        }
      }
    }

    // ── lógica del anfitrión ───────────────────────────────
    hostHandleJoin(msg) {
      if (this.state.players.some((p) => p.id === msg.player.id)) return;
      if (this.state.players.length >= this.state.maxPlayers) {
        this.send({ type: 'join-reject', playerId: msg.player.id, reason: 'la sala está llena' });
        return;
      }
      this.state.players.push({ ...msg.player, ready: false, isHost: false });
      // Alguien nuevo entra: cualquier cuenta atrás se aborta.
      this.hostCancelCountdown('alguien ha entrado en la sala');
      this.broadcastState();
    }

    hostSetReady(playerId, ready) {
      const p = this.state.players.find((x) => x.id === playerId);
      if (!p || p.ready === ready) return;
      p.ready = ready;
      if (!ready) this.hostCancelCountdown(`${p.name} ya no está listo`);
      this.broadcastState();
      this.hostCheckAllReady();
    }

    hostRemovePlayer(playerId) {
      const idx = this.state.players.findIndex((x) => x.id === playerId);
      if (idx === -1) return;
      const [gone] = this.state.players.splice(idx, 1);
      this.hostCancelCountdown(`${gone.name} ha abandonado la sala`);
      this.broadcastState();
      this.hostCheckAllReady();
    }

    hostCheckAllReady() {
      const ps = this.state.players;
      const allReady = ps.length >= 1 && ps.every((p) => p.ready);
      if (allReady && !this.state.countdown) {
        this.state.countdown = { startedAt: Date.now() };
        this.send({ type: 'countdown-start' });
        this.events.onCountdownStart?.();
        this.countdownTimer = setTimeout(() => {
          this.send({ type: 'game-start' });
          this.events.onGameStart?.();
        }, BLACKOUT_CONFIG.countdownSeconds * 1000);
        this.broadcastState();
      }
    }

    hostCancelCountdown(reason) {
      if (!this.state.countdown) return;
      this.state.countdown = null;
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
      this.send({ type: 'countdown-cancel', reason });
      this.events.onCountdownCancel?.(reason);
    }

    broadcastState() {
      this.send({ type: 'state', state: this.state });
      this.events.onState?.(this.state);
    }

    // ── lógica del cliente ─────────────────────────────────
    clientReceiveState(state) {
      this.lastStateAt = Date.now();
      if (!state.players.some((p) => p.id === this.selfId)) return; // aún no aceptado
      this.state = state;
      this.events.onState?.(state);
    }

    // ── acciones públicas ──────────────────────────────────
    setReady(ready) {
      if (this.isHost) {
        this.hostSetReady(this.selfId, ready);
      } else {
        this.send({ type: 'set-ready', playerId: this.selfId, ready });
      }
    }

    leave() {
      if (this.closed) return;
      if (this.isHost) {
        this.send({ type: 'room-closed' });
      } else {
        this.send({ type: 'leave', playerId: this.selfId });
      }
      this.close(null, true);
    }

    close(reason, silent = false) {
      if (this.closed) return;
      this.closed = true;
      clearInterval(this.heartbeat);
      clearInterval(this.watchdog);
      clearTimeout(this.countdownTimer);
      this.channel.close();
      if (!silent) this.events.onClosed?.(reason);
    }
  }

  // ── API pública ──────────────────────────────────────────

  function createRoom({ roomName, maxPlayers, player, events }) {
    const code = generateCode();
    const session = new RoomSession({ code, player, isHost: true, roomName, maxPlayers, events });
    // estado inicial inmediato
    queueMicrotask(() => session.broadcastState());
    return session;
  }

  /**
   * Se une a una sala existente. Devuelve una promesa que se
   * resuelve con la sesión, o se rechaza si nadie responde
   * (sala inexistente) o la sala está llena.
   */
  function joinRoom({ code, player, events }) {
    return new Promise((resolve, reject) => {
      const session = new RoomSession({ code, player, isHost: false, events });
      let settled = false;

      const origReceive = session.clientReceiveState.bind(session);
      session.clientReceiveState = (state) => {
        origReceive(state);
        if (!settled && state.players.some((p) => p.id === session.selfId)) {
          settled = true;
          clearTimeout(timeout);
          resolve(session);
        }
      };

      const origClose = session.close.bind(session);
      session.close = (reason, silent) => {
        origClose(reason, silent);
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error(reason || 'no se pudo entrar en la sala'));
        }
      };

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          session.close(null, true);
          reject(new Error('esa sala no existe… o ya no queda nadie vivo'));
        }
      }, 3000);

      session.send({
        type: 'join-request',
        player: { id: session.selfId, deviceId: player.deviceId, name: player.name },
      });
    });
  }

  return { createRoom, joinRoom, generateCode };
})();
