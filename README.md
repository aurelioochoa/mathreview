# Math Quest

Juego de repaso matemático gamificado (en español) para [kidtopiaplay](https://kidtopiaplay.com). Nació como una guía de estudio del examen remedial de 10mo y se está convirtiendo en un juego general y gamificado: mundos, niveles, vidas, XP, logros y ejercicios de repaso enmascarados como retos, con problemas tematizados con videojuegos y cultura pop.

## Stack

Vite + React 19 + React Router + Tailwind CSS 4 + KaTeX (fórmulas) + Mafs (gráficas) + Recharts + three.js / react-three-fiber / drei / motion (mapa de mundos 3D, HUD y transiciones). Vitest para los tests de lógica. Sin backend: el progreso se guarda en `localStorage`.

## Desarrollo

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm test         # tests de lógica (Vitest)
npm run build    # build de producción a dist/
npm run lint     # ESLint
```

También hay un flujo con Docker en el `Makefile` (`make dev`, `make up`, `make production`) y un servicio de generación de PDF (`make pdf`).

## Estructura

```
src/
  state/       gameStore (estado v2 + reducer), persistencia con migración, curva de XP
  engine/      generadores de preguntas, LevelPlayer, BossArena, QuestPlayer, WorldView, StudyView
  widgets/     calculadoras interactivas reutilizables (registro por id)
  content/     datos: mundos (niveles → briefing + reto + jefe), quests, mapa, validador
  three/       escena 3D del mapa, celebración y detección de device-tier
  components/  UI compartida (MathTex, HUD, MiniQuiz, glosario, etc.)
  pages/       WorldMap (home) + Bloques 1-6 (guía de estudio original, ya migrada a mundos)
docs/          análisis, investigación, specs de diseño y planes de implementación
TODO.md        hoja de ruta por fases
```

Rutas: `/` (mapa) · `/mundo/:slug` · `/mundo/:slug/nivel/:levelId` · `/mundo/:slug/estudio` · `/mundo/:slug/jefe` · `/mundo/:slug/quest/:questId`. Las rutas originales `/bloqueN` redirigen a su mundo.

## Estado

- **Fases 0-1, rediseño visual y Fase 2: completas.** Base saneada, motor de juego data-driven, mapa de mundos 3D con fallback 2D accesible + HUD glossy + transiciones y celebración de nivel (lazy, offline, respetando `prefers-reduced-motion` y el device-tier), y los seis mundos 3-8 migrados desde los Bloques 1-6 con modo juego y modo estudio.
- **Fase 3 (en curso):** gamificación completa. Ya hay estado v2 con migración de guardado, economía por estrellas nuevas, jefe con barra de vida en los seis mundos y sidequests narrativas en los Mundos 3, 4 y 5.
- **Siguiente:** completar las sidequests de los Mundos 6-8 y añadir cofres, tienda, pistas, logros, racha diaria y perfil. Ver [`TODO.md`](TODO.md) y [`docs/superpowers/specs`](docs/superpowers/specs).

## Despliegue

Se sirve en `kidtopiaplay.com` vía Cloudflare Tunnel (`make production`). El token del túnel se lee de `.env` (git-ignored) como `TUNNEL_TOKEN` — no se commitea.
