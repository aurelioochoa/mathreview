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

También hay un flujo con Docker en el `Makefile` (`make dev`, `make up`) y un servicio de generación de PDF (`make pdf`).

## Estructura

```
src/
  state/       gameStore (estado v3 + reducer), persistencia con migración, códec de traspaso, curva de XP, tema
  engine/      generadores, LevelPlayer, BossArena, QuestPlayer, PortalTrial, WorldView, StudyView
  widgets/     calculadoras y laboratorios interactivos (registro por id; lógica pura en widgets/logic/)
  content/     datos: mundos (niveles → briefing + reto + jefe), quests, mapa, tienda, logros, temporada
  three/       escena 3D del mapa explorable (barco, cámara, lógica y store), celebración, paleta por tema y device-tier
  components/  UI compartida (HUD, piezas de juego en game/, paneles del mapa en map/, MathTex, MiniQuiz, auras, estelas, tema…)
  pages/       WorldMap (home) + Bloques 1-6 (guía de estudio original, ya migrada a mundos)
  index.css    tokens, variante `dark`, superficies de vidrio, aro del marco y animaciones de aura
  dark-palette.css  paleta del tema oscuro (generada; ver su cabecera antes de tocarla)
docs/          análisis, investigación, specs de diseño y planes de implementación
TODO.md        hoja de ruta por fases
```

Rutas: `/` (mapa) · `/mundo/:slug` · `/mundo/:slug/explorar` (a pie) · `/mundo/:slug/nivel/:levelId` · `/mundo/:slug/estudio` · `/mundo/:slug/jefe` · `/mundo/:slug/quest/:questId` · `/mundo/:slug/portal` · `/tienda` · `/logros` · `/perfil`. Las rutas originales `/bloqueN` redirigen a su mundo. El modo estudio solo existe en los mundos migrados de un Bloque (3-8).

## Estado

- **Fases 0-5 completas.** Los **8 mundos** son jugables y cubren la escalera de 8 a 15 años: Isla Numérica 🏝️ y Reino de las Fracciones 🍕 para los pequeños, y los seis migrados de los Bloques originales para el repaso de 10mo. Cada mundo tiene niveles con briefing interactivo, jefe con barra de vida y sidequests narrativas.
- **Progresión:** desbloqueo secuencial (derrota al jefe para abrir el siguiente mundo) con **portal de teletransporte** para saltarse los que ya dominas. Encima, la capa de juego: XP y niveles, estrellas, vidas, cofres sorpresa, tienda de cosméticos, pistas, 18 logros, racha diaria y perfil.
- **Fase 5 completa:** celebración propia por tipo de victoria (trofeo de nivel, corona de jefe, medalla de logro) y traspaso de partida entre dispositivos por código, fichero `.mathquest` o QR. Cargar una partida reemplaza la que había, así que pide confirmación con un resumen y guarda la anterior 24 h por si hay que deshacer.
- **Personalización y tema:** el perfil enseña «Personalizar» como una fila de columnas, una por slot: avatar, **marco**, título, **aura** (halo animado alrededor del avatar) y **estela del ratón**. Todos se compran en la tienda. El marco es el único que no se ve en el perfil: enciende el borde de la opción que señalas mientras respondes —con un degradado que da vueltas— en los cuatro modos de juego y en el mini-quiz de los estudios, así que su columna del perfil lleva una línea que cuenta dónde mirar. El aro es CSS puro (`.marco` en `index.css`, colores del catálogo por variable), sin estado de React que repinte cuatro botones cada vez que el puntero entra y sale de uno. Hay ocho estelas —chispas, burbujas, nieve, corazones, cometa, confeti, monedas y neón—, cada una un sistema de partículas propio: el cursor las suelta por el camino y cada partícula cae, flota, gira y se apaga por su cuenta. La física está en `components/trailEffects.js`, aparte del componente y con tests propios. La estela se apaga sola en pantallas táctiles y con `prefers-reduced-motion`. El avatar con su aura vive en la barra superior junto al nivel y al título, visible en todas las pantallas, y es el acceso al perfil.
- **Tema claro / oscuro / automático**, con botón en el HUD. Se guarda en su propia clave de `localStorage`, no dentro de la partida: es preferencia del aparato, y así traspasar la partida no cambia el tema del dispositivo que la recibe. El mapa 3D también tiene su versión de noche.
- **Mapa 3D con dioramas.** Cada mundo dejó de ser una primitiva glossy girando (icosaedro, toro, cono) y pasó a ser una escena en miniatura construida con cajas y cilindros: el castillo tiene cuatro torres almenadas, aspilleras y estandarte; el cohete, ventanilla con marco y tres aletas; la feria, una noria con ocho cabinas; la pizza, ocho porciones marcadas y pepperoni. Las islas ganaron relieve —el cilindro de la base se deforma por ángulo con una semilla por mundo, así que ninguna repite silueta—, orilla de arena y más vegetación. El giro y el balanceo bajaron mucho (0,35 → 0,09 rad/s): a la velocidad de antes un diorama no se lee, se marea.
- **Sombras de verdad en el mapa.** Encuadrar la cámara de sombra a mano es obligatorio —el ortográfico por defecto es de ±5 y el mapa va de `x=-6.2` a `x=4.4`, así que las islas de los extremos quedaban fuera—, pero fijar `shadow-camera-*` como props no basta: three lee `projectionMatrix` y esa matriz no se recalcula al cambiar los límites. Sin un `updateProjectionMatrix()` explícito el encuadre queda incoherente y **no se dibuja ni una sombra en todo el mapa**, sin ningún error en consola. Se arregla desde `lighting.jsx` con un ref y un `useLayoutEffect`. El tipo de mapa de sombras es `percentage` (PCF) y no el `soft` de r3f: three 0.185 deprecó `PCFSoftShadowMap` y lo degrada a PCF avisando por consola en cada arranque.
- **Mapa explorable (2026-09-24).** El mapa dejó de ser una foto fija: ahora navegas en **barco** entre las islas con WASD/flechas, clic en el mar o en una isla (piloto automático), o joystick en pantallas táctiles. La cámara sigue al barco en tercera persona; se gira arrastrando y se acerca con la rueda, y la tecla **M** abre la vista general. Las islas se separaron (`SPREAD` en `three/explorerLogic.js`, sin tocar las posiciones de `worldMap.js`) y las tarjetas anchas que se pisaban pasaron a ser **placas pequeñas** que se desvanecen con la distancia: la ficha completa del mundo solo sale, en un panel DOM, al atracar en su isla (**E** para desembarcar). Alrededor: minimapa clicable, rastreador del **objetivo actual** (con un faro sobre la isla que toca jugar), banderín dorado en las islas completadas y ocho **botellas con mensaje** escondidas por el mar con curiosidades matemáticas (no dan XP ni monedas; se guardan en `localStorage`, fuera de la partida). La física del barco, la colisión con las islas y el piloto son funciones puras con tests (`explorerLogic.js`); el estado que cambia cada fotograma vive fuera de React (`explorerStore.js`).
- **Interfaz de juego.** Sistema visual propio en `index.css` (capa `components`): botones con relieve que se hunden al pulsar (`.btn`), paneles con sombra sólida (`.panel`), fichas de recursos (`.chip`) y barras de progreso. HUD de juego flotando sobre el mapa. Cada mundo es un **camino de niveles** en zigzag con el jefe al final. Los cuatro modos de juego comparten cabecera, corazones, progreso por segmentos, avisos de acierto/fallo y pantallas de resultado (`components/game/GameUI.jsx`), y se responden con el teclado (**1-4** o **A-D**, **Enter** para seguir). El briefing se navega por pestañas (Para qué · Teoría · Laboratorio · Trampas).
- **Laboratorios interactivos nuevos** (en diferido, uno por nivel que no tenía): conchas para las cuatro operaciones, cuadrícula de centésimas y comparador de decimales, simplificador de fracciones algebraicas (factorizar y tachar), **balanza** de ecuaciones, verificador de soluciones de un sistema (arrastrar un punto), reducción paso a paso, **simulador de probabilidad** con convergencia de la frecuencia, y un **laboratorio 3D** de prismas y cilindro que se gira y se despliega en su red. La lógica de cada uno está en `widgets/logic/` con tests.
- **Exploración a pie y 3D más realista (2026-09-24).** Al desembarcar en un mundo abierto se entra en su isla **caminando** (`/mundo/:slug/explorar`): personaje en tercera persona con la cara del avatar equipado, WASD para caminar, Shift para correr, Espacio para saltar (joystick y botón de salto en táctil). En el centro, el diorama del mundo en grande sobre un pedestal; alrededor, un camino de losas del embarcadero a cada nivel (pedestales con una gema que se enciende cuando está abierto) y hasta la **puerta del jefe** (rejas cerradas o velo de fuego con antorchas); las sidequests son personajes con una «!». Al acercarse a algo, un panel deja entrar con **E**; "Volver al mundo" en los modos de juego te devuelve a la isla si llegaste caminando (`state/vistaMundo.js`). La lista clásica de niveles sigue a un botón. Sin WebGL, la ruta cede a la lista. Toda la lógica (relieve, distribución, física, salto) está en `three/walk/walkLogic.js` con tests. Además, las dos escenas ganaron **texturas procedurales** pintadas en canvas y sin descargas (`three/textures.js`: hierba, arena, roca, madera, sillares, tierra, metal y normal map del agua), cielo con degradado, halo del sol y estrellas de noche (`SkyDome.jsx`), agua con dos normal maps en movimiento, islas con acantilado de roca, playa, pradera ondulada y vegetación variada (`Vegetation.jsx`: pinos, árboles de copa, palmeras, arbustos con flores y rocas irregulares), dioramas texturizados y viñeta + bloom de acabado.
- **Siguiente:** sin fase definida todavía. Ver [`TODO.md`](TODO.md) para lo pendiente y las ideas futuras.

## Despliegue

Sin despliegue propio. El Cloudflare Tunnel que servía la guía de estudio original en
`kidtopiaplay.com` se retiró: el sitio de kidtopiaplay se publica desde su propio repo en
Cloudflare Pages, y el plan es que Math Quest se sirva desde ahí como un juego más
(`/g/mathreview/`) en vez de por un túnel aparte.

En local, `make up` levanta el build de producción en `http://localhost:3000`.
