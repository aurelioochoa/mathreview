# Math Quest

Juego de repaso matemático gamificado (en español) para [kidtopiaplay](https://kidtopiaplay.com). Nació como una guía de estudio del examen remedial de 10mo y se está convirtiendo en un juego general y gamificado: mundos, niveles, vidas, XP, logros y ejercicios de repaso enmascarados como retos, con problemas tematizados con videojuegos y cultura pop.

## Stack

Vite + React 19 + React Router + Tailwind CSS 4 + KaTeX (fórmulas) + Mafs (gráficas) + Recharts. Vitest para los tests de lógica. Sin backend: el progreso se guarda en `localStorage`.

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
  state/       curva de XP, persistencia (localStorage + respaldo), gameStore
  engine/      generadores de preguntas, LevelPlayer, WorldView
  widgets/     calculadoras interactivas reutilizables (registro por id)
  content/     datos de los mundos (mundo → niveles → briefing + reto)
  components/  UI compartida (MathTex, MiniQuiz, glosario, etc.)
  pages/       Home + Bloques 1-6 (guía de estudio original, en migración a mundos)
docs/          análisis, investigación, spec de diseño y planes de implementación
TODO.md        hoja de ruta por fases
```

## Estado

- **Fase 0-1 (completas):** base saneada + motor de juego piloto. El Mundo 3 🌋 "Volcán de las Potencias" es jugable en `/mundo/volcan-potencias` (accesible desde la tarjeta beta en Home), conviviendo con las rutas originales `/bloqueN`.
- **Siguiente:** migrar los Bloques 2-6 a los mundos 4-8, y añadir jefes, sidequests, logros y economía. Ver [`TODO.md`](TODO.md) y [`docs/superpowers/specs`](docs/superpowers/specs).

## Despliegue

Se sirve en `kidtopiaplay.com` vía Cloudflare Tunnel (`make production`). El token del túnel se lee de `.env` (git-ignored) como `TUNNEL_TOKEN` — no se commitea.
