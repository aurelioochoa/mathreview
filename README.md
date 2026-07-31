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
  engine/      generadores, LevelPlayer, BossArena, QuestPlayer, PortalTrial, WorldView, StudyView
  widgets/     calculadoras interactivas reutilizables (registro por id)
  content/     datos: mundos (niveles → briefing + reto + jefe), quests, mapa, tienda, logros, temporada
  three/       escena 3D del mapa, celebración y detección de device-tier
  components/  UI compartida (MathTex, HUD, MiniQuiz, glosario, etc.)
  pages/       WorldMap (home) + Bloques 1-6 (guía de estudio original, ya migrada a mundos)
docs/          análisis, investigación, specs de diseño y planes de implementación
TODO.md        hoja de ruta por fases
```

Rutas: `/` (mapa) · `/mundo/:slug` · `/mundo/:slug/nivel/:levelId` · `/mundo/:slug/estudio` · `/mundo/:slug/jefe` · `/mundo/:slug/quest/:questId` · `/mundo/:slug/portal` · `/tienda` · `/logros` · `/perfil`. Las rutas originales `/bloqueN` redirigen a su mundo. El modo estudio solo existe en los mundos migrados de un Bloque (3-8).

## Estado

- **Fases 0-4 completas.** Los **8 mundos** son jugables y cubren la escalera de 8 a 15 años: Isla Numérica 🏝️ y Reino de las Fracciones 🍕 para los pequeños, y los seis migrados de los Bloques originales para el repaso de 10mo. Cada mundo tiene niveles con briefing interactivo, jefe con barra de vida y sidequests narrativas.
- **Progresión:** desbloqueo secuencial (derrota al jefe para abrir el siguiente mundo) con **portal de teletransporte** para saltarse los que ya dominas. Encima, la capa de juego: XP y niveles, estrellas, vidas, cofres sorpresa, tienda de cosméticos, pistas, 18 logros, racha diaria y perfil.
- **Siguiente (Fase 5):** pulido — export/import de partida, celebraciones de logro y jefe, tests en CI y lazy loading por mundo. Ver [`TODO.md`](TODO.md) y [`docs/superpowers/specs`](docs/superpowers/specs).

## Despliegue

Se sirve en `kidtopiaplay.com` vía Cloudflare Tunnel (`make production`). El token del túnel se lee de `.env` (git-ignored) como `TUNNEL_TOKEN` — no se commitea.
