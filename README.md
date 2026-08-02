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

Los comandos `lint`, `test` y `build` corren automáticamente en GitHub Actions cada vez que haces push a `main` o abres un pull request.

También hay un flujo con Docker en el `Makefile` (`make dev`, `make up`, `make production`) y un servicio de generación de PDF (`make pdf`).

## Estructura

```
src/
  state/       gameStore (estado v3 + reducer), persistencia con migración, códec de traspaso, curva de XP, tema
  engine/      generadores, LevelPlayer, BossArena, QuestPlayer, PortalTrial, WorldView, StudyView
  widgets/     calculadoras interactivas reutilizables (registro por id)
  content/     datos: mundos (niveles → briefing + reto + jefe), quests, mapa, tienda, logros, temporada
  three/       escena 3D del mapa, celebración, paleta de escena por tema y device-tier
  components/  UI compartida (MathTex, HUD, MiniQuiz, glosario, auras, estelas, tema, etc.)
  pages/       WorldMap (home) + Bloques 1-6 (guía de estudio original, ya migrada a mundos)
  index.css    tokens, variante `dark`, superficies de vidrio, aro del marco y animaciones de aura
  dark-palette.css  paleta del tema oscuro (generada; ver su cabecera antes de tocarla)
docs/          análisis, investigación, specs de diseño y planes de implementación
TODO.md        hoja de ruta por fases
```

Rutas: `/` (mapa) · `/mundo/:slug` · `/mundo/:slug/nivel/:levelId` · `/mundo/:slug/estudio` · `/mundo/:slug/jefe` · `/mundo/:slug/quest/:questId` · `/mundo/:slug/portal` · `/tienda` · `/logros` · `/perfil`. Las rutas originales `/bloqueN` redirigen a su mundo. El modo estudio solo existe en los mundos migrados de un Bloque (3-8).

## Estado

- **Fases 0-5 completas.** Los **8 mundos** son jugables y cubren la escalera de 8 a 15 años: Isla Numérica 🏝️ y Reino de las Fracciones 🍕 para los pequeños, y los seis migrados de los Bloques originales para el repaso de 10mo. Cada mundo tiene niveles con briefing interactivo, jefe con barra de vida y sidequests narrativas.
- **Progresión:** desbloqueo secuencial (derrota al jefe para abrir el siguiente mundo) con **portal de teletransporte** para saltarse los que ya dominas. Encima, la capa de juego: XP y niveles, estrellas, vidas, cofres sorpresa, tienda de cosméticos, pistas, 18 logros, racha diaria y perfil.
- **Fase 5 completa:** celebración propia por tipo de victoria (trofeo de nivel, corona de jefe, medalla de logro) y traspaso de partida entre dispositivos por código, fichero `.mathquest` o QR. Cargar una partida reemplaza la que había, así que pide confirmación con un resumen y guarda la anterior 24 h por si hay que deshacer.
- **Personalización y tema:** el perfil enseña «Personalizar» como una fila de columnas, una por slot: avatar, **marco**, título, **aura** (halo animado alrededor del avatar) y **estela del ratón**. Todos se compran en la tienda. El marco es el único que no se ve en el perfil: enciende el borde de la opción que señalas mientras respondes —con un degradado que da vueltas— en los cuatro modos de juego y en el mini-quiz de los estudios, así que su columna del perfil lleva una línea que cuenta dónde mirar. El aro es CSS puro (`.marco` en `index.css`, colores del catálogo por variable), sin estado de React que repinte cuatro botones cada vez que el puntero entra y sale de uno. Hay ocho estelas —chispas, burbujas, nieve, corazones, cometa, confeti, monedas y neón—, cada una un sistema de partículas propio: el cursor las suelta por el camino y cada partícula cae, flota, gira y se apaga por su cuenta. La física está en `components/trailEffects.js`, aparte del componente y con tests propios. La estela se apaga sola en pantallas táctiles y con `prefers-reduced-motion`. El avatar con su aura vive en la barra superior junto al nivel y al título, visible en todas las pantallas, y es el acceso al perfil.
- **Tema claro / oscuro / automático**, con botón en el HUD. Se guarda en su propia clave de `localStorage`, no dentro de la partida: es preferencia del aparato, y así traspasar la partida no cambia el tema del dispositivo que la recibe. El mapa 3D también tiene su versión de noche.
- **Siguiente:** sin fase definida todavía. Ver [`TODO.md`](TODO.md) para lo pendiente y las ideas futuras.

## Despliegue

Se sirve en `kidtopiaplay.com` vía Cloudflare Tunnel (`make production`). El token del túnel se lee de `.env` (git-ignored) como `TUNNEL_TOKEN` — no se commitea.
