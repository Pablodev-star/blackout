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

### Crear las tablas

1. Abre **Supabase Dashboard > SQL Editor** en el proyecto
   `fqcuhetsqwobuxuocwub`.
2. Copia todo el contenido de `supabase/blackout_schema.sql`.
3. Pégalo en una consulta nueva y pulsa **Run**.
4. Al final debe aparecer una consulta de verificación con estas 7 tablas:
   `leaderboards`, `player_devices`, `player_states`, `players`,
   `room_events`, `room_players` y `rooms`, además de la función
   `claim_player_name`.

`supabase/blackout_schema.sql` y
`supabase/migrations/20260717000000_blackout_backend.sql` son idempotentes:
puedes ejecutarlos otra vez si el proyecto quedó a medias o si Supabase no
mostraba las tablas.

### Si quieres automatizarlo con clave secreta

No pongas la `service_role key` ni un token personal en `js/config.js`, en el
frontend, ni en archivos del repo. Para automatizarlo, guarda el token como
secreto cifrado del proveedor donde lo ejecutes, por ejemplo
`SUPABASE_ACCESS_TOKEN` en GitHub Actions/Netlify/Vercel, y lanza:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-supabase-schema.mjs
```

También puedes definir `SUPABASE_PROJECT_REF` si quieres usar otro proyecto; si
no, el script usa `fqcuhetsqwobuxuocwub`.

### Objetos creados

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
