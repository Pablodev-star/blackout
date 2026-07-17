# blackout

Juego de terror. Interfaz web sin dependencias ni build step.

## Ejecutar

Sirve la carpeta con cualquier servidor estático y abre `index.html`:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Qué hay hecho

- **Intro + nombre**: al entrar se pide tu nombre y queda ligado al dispositivo
  (`localStorage` con un `deviceId` persistente).
- **Menú principal** estilo terror: niebla, ruido, scanlines, parpadeos, glitch,
  partículas de ceniza y relámpagos (canvas), audio ambiental procedural (WebAudio, sin assets).
- **Solitario**: 3 files de partida con estadísticas (tiempo jugado, credits,
  muertes, última sesión). Animación de apertura al entrar en un file.
  Mantén pulsado un file para borrarlo.
- **Multijugador**:
  - Crear sala con nombre y máximo de jugadores (2–4).
  - Código de 6 caracteres para compartir (click para copiar).
  - Lobby con la cara procedural de cada jugador y su nombre.
  - Botón **Listo** y salida libre en cualquier momento.
  - Cuando todos están listos: cuenta atrás de 5 s que se intensifica
    (latidos, temblores, pulsos de sangre). Si alguien quita el listo,
    sale o entra alguien nuevo, se aborta y se reinicia más tarde.
  - Transporte actual: Supabase Realtime para salas reales entre dispositivos.
  - Las tablas sincronizan lobby, eventos de sala y estado de jugador (`x/y`,
    orientación, caminar, escondido, inventario y acciones).
- **Leaderboards**: mejores tiempos, supervivencia y credits desde Supabase
  con fallback local si la red no está disponible.

## Supabase

El proyecto está vinculado en `js/config.js` al Project ID
`fqcuhetsqwobuxuocwub` usando la publishable key pública. La clave secreta
no se guarda en el frontend.

Aplica `supabase/migrations/20260717000000_blackout_backend.sql` en Supabase
para crear:

- `players` y `player_devices`: nombre único por dispositivo y telemetría útil
  accesible desde navegador. IP, puerto y cabeceras se capturan en la función
  SQL `claim_player_name()` desde la petición que recibe Supabase.
- `leaderboards`: rankings por `times`, `survival` y `credits`.
- `rooms`, `room_players`, `player_states` y `room_events`: lobby, presencia,
  acciones y sincronización Realtime del multijugador.

La regla de nombres es: si el nombre existe y el `deviceId` coincide, el
jugador vuelve a entrar; si el mismo nombre viene de otro dispositivo, se
rechaza.

## Estructura

```
index.html        pantallas y overlays
css/style.css     estilo + animaciones
js/config.js      configuración (Supabase, reglas del juego)
js/storage.js     jugador y save files en localStorage
js/backend.js     capa Supabase (stub preparado)
js/audio.js       audio procedural WebAudio
js/fx.js          partículas, relámpagos, glitches
js/avatars.js     caras procedurales SVG por nombre
js/net.js         salas multijugador con Supabase Realtime
js/app.js         controlador de la interfaz
```
