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
  - Transporte actual: `BroadcastChannel` → **funciona entre pestañas del
    mismo navegador** para probar. La interfaz de `js/net.js` está pensada
    para sustituirse por Supabase Realtime sin tocar la UI.
- **Leaderboards**: mejores tiempos, supervivencia y credits (datos de
  ejemplo hasta vincular Supabase).

## Supabase (pendiente)

`js/backend.js` centraliza toda la comunicación futura. Al rellenar
`js/config.js` (`supabase.url` + `supabase.anonKey`) empezará a hacer
upsert del perfil (`device_id`, nombre, user agent, idioma, pantalla,
zona horaria…). La **IP y el puerto** no son accesibles desde el navegador:
se capturarán server-side (Edge Function) cuando exista el proyecto —
el hueco ya está reservado en el payload.

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
js/net.js         salas multijugador (BroadcastChannel → Realtime)
js/app.js         controlador de la interfaz
```
