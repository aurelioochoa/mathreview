# TODO — Math Quest

Hoja de ruta por fases. Lo pendiente va arriba; el historial, al final.

**Specs:** [base](docs/superpowers/specs/2026-07-18-math-quest-design.md) · [worldmap 3D](docs/superpowers/specs/2026-07-19-rediseno-worldmap-3d-design.md) · [Fase 2](docs/superpowers/specs/2026-07-21-fase2-migracion-completa-design.md) · [Fase 3](docs/superpowers/specs/2026-07-22-fase3-gamificacion-design.md) · [Fase 4](docs/superpowers/specs/2026-07-31-fase4-contenido-nuevo-design.md) · [Fase 5](docs/superpowers/specs/2026-07-31-fase5-pulido-design.md)
**Planes:** [Fases 0-1](docs/superpowers/plans/2026-07-18-math-quest-fase0-fase1.md) · [worldmap 3D](docs/superpowers/plans/2026-07-19-rediseno-worldmap-3d.md) · [Fase 2](docs/superpowers/plans/2026-07-21-fase2-migracion-completa.md) · [Fase 3](docs/superpowers/plans/2026-07-22-fase3-gamificacion.md) · [Fase 4](docs/superpowers/plans/2026-07-31-fase4-contenido-nuevo.md) · [Fase 5](docs/superpowers/plans/2026-07-31-fase5-pulido.md)

## Estado — 2026-07-31

- **Rama:** `feat/fase5-pulido` (Fase 4 ya mergeada en `main` y publicada).
- **Suite:** `npm test` → 47 archivos, 337 tests en verde; `build` y `lint` limpios.
- **🎮 Escalera 8-15 años completa.** Los 8 mundos son jugables, con desbloqueo secuencial por jefe y portal de teletransporte para saltárselo. Cada mundo: niveles, jefe y sidequests; más cofres, tienda, pistas, logros, racha y perfil, sobre mapa 3D con fallback 2D y guardado v3 con migración.
- **Pulido de Fase 5:** celebración propia por tipo de victoria (nivel, jefe, logro), traspaso de partida entre dispositivos por código, fichero `.mathquest` o QR —con instantánea previa y «deshacer» de 24 h, porque importar reemplaza la partida entera—, y CI en GitHub Actions (lint + tests + build) en cada push y PR.
- **Fase 5 completa** (9/9 tasks). Sin fase siguiente definida todavía — ver «Deuda y cabos sueltos» e «Ideas futuras».

---

# Deuda y cabos sueltos

- [ ] Lazy loading por mundo/funciones 3D — aplazado en Fase 5 (era el cuarto punto del plan). Al medirlo, el peso no estaba en los mundos sino en `StudyView`, que importa los seis `Bloque*.jsx` y con ellos `mafs` y `recharts`. Se hará cuando entren más funciones 3D y el arranque importe de verdad. Línea base: `index.js` 1 321 KB (385 KB gzip) antes de Fase 5, con `react-three-fiber` (860 KB) ya fuera. Al cerrar la fase, `gzip -c dist/assets/index-*.js | wc -c` dio 397 716 bytes (388,4 KiB), pero el propio reportero de build de Vite/rolldown marca ~402 KB gzip para ese mismo fichero — discrepan en torno al 1% y el presupuesto de 400 KB cae justo entre las dos cifras. Importa poco: el crecimiento real de la fase son unos 3,4 KiB (el códec, `SaveTransfer` y la red de seguridad del import), y `qrcode`/`jsQR` quedaron fuera del arranque en sus propios chunks. Si algún día se pone un presupuesto de bundle en la CI, antes habrá que decidir qué herramienta de medición manda.
- [ ] Verificación e2e interactiva en navegador de las funciones nuevas de Fase 5 — no se pudo comprobar a mano en esta sesión (sin navegador disponible). Pendiente: código/QR/fichero en `/perfil` (copiar, descargar, escanear, resumen de confirmación, código corrupto), corona al derrotar a un jefe y medalla en el aviso de logro.
- [x] ~~Verificación e2e interactiva en navegador de Fase 4~~ — hecha el 2026-07-31 al cerrar Fase 4, arrastrada desde Fase 1. Destapó tres bugs que ningún test veía: el bono de racha cobrado dos veces con StrictMode, el gate entre mundos ausente en el mapa 3D, y un logro mal nombrado. Incluyó cargar un guardado v2 real: migra a v3 sin perder nada y el grandfathering deja abiertos justo los mundos que ya se jugaban.
- [x] ~~README desactualizado~~ — actualizado el 2026-07-30 y el 2026-07-31.
- [ ] ⚠️ **Rotar el token del túnel de Cloudflare** en el dashboard — vivió en texto plano en `docker-compose.yml` antes de moverse a `.env`.

# Ideas futuras (fuera de alcance actual)

- Batallas RPG como tipo de nivel adicional (estilo Prodigy)
- Integración de perfil compartido cuando exista el portal kidtopiaplay
- Modo profesor/padre (ver progreso)

---

# Historial — fases completas

## Fase 0 — Base segura ✅ (2026-07-18)

Token del túnel movido a `.env` (git-ignored), trabajo pendiente commiteado, bug de MCM "36 minutos" vs horas (Bloque 2), pregunta inconsistente de Cramer (Bloque 3, D=−18 vs opciones), `Math` → `MathTex` (fuera los `window.Math`), y creación de `docs/` + este TODO.

## Fase 1 — Motor piloto ✅ (2026-07-18, 28 tests)

`state/` (gameStore + GameProvider + persistencia versionada con respaldo + curva de XP), schema de contenido (mundo → niveles → briefing + reto), widgets del Bloque 1 extraídos con registro por id, `engine/LevelPlayer.jsx` (briefing por pasos, vidas, estrellas), `engine/generators.js` (plantillas parametrizadas + barajado), y Mundo 3 🌋 migrado como piloto conviviendo con las rutas `/bloqueN`.

**Follow-ups de la revisión final** — todos cerrados: `key={levelId}` en `LevelPlayer`, preguntas duplicadas Bloque1/mundo3 retiradas al migrar, `try/catch` en `persistence.setItem` (QuotaExceededError / modo privado), render-test de `GameProvider`/`useGame`. La duda de economía ("XP/monedas en cada completado") quedó **resuelta en Fase 3 · Task 1**: se paga por estrellas nuevas, rejugar sin mejorar da 0.

## Rediseño visual (Spec 1) ✅ (2026-07-19/21)

Mapa de mundos 3D con react-three-fiber (lazy, offline, bloom) y fallback 2D accesible, tokens glossy + fuente display auto-hospedada, HUD de juego (nivel, barra de XP, monedas), transiciones de página con motion y celebración 3D al completar nivel. Todo respetando `prefers-reduced-motion` y el device-tier (WebGL + núcleos).

## Fase 2 — Migración completa de contenido ✅ (2026-07-21/22)

Widgets de los Bloques 2-6 extraídos, Mundos 4 🏰 / 5 🌀 / 6 🚀 / 7 ⛰️ / 8 🎡 migrados, nivel de probabilidad básica añadido al Mundo 8, `WorldMap` reemplaza Home, redirects `/bloqueN` → mundo, ruta 404, modo estudio y script de validación de contenido.

## Fase 3 — Gamificación completa ✅ (2026-07-22/30) — MVP jugable

18 tasks en seis capas. **A:** estado v2 (jefes, quests, logros, cosméticos, pistas, racha) con migración desde v1 y economía por estrellas nuevas — rejugar sin mejorar la marca paga 0. **B:** `buildBossPool` y un jefe con barra de vida en cada mundo, con ⭐ de maestría. **C:** `QuestPlayer` y 13 sidequests narrativas bespoke repartidas por los seis mundos, más validación de quests. **D:** cofres sorpresa ponderados en el primer completado de cada nivel y la primera victoria de cada jefe, tienda `/tienda` y pistas compradas. **E:** 18 logros con motor puro, aviso efímero y página `/logros`. **F:** racha diaria con bono y 🔥 en el HUD, y perfil `/perfil` para equipar cosméticos.

Desviaciones conscientes del plan, todas anotadas en sus commits: el cofre del jefe cae solo en la primera victoria (si no, rejugar era una fuente infinita de cosméticos); los logros se evalúan en un efecto sobre el estado ya aplicado en vez de recalcular el reducer con el `state` del render; y `validateContent` solo valida sidequests cuando recibe `questsByWorld`, para seguir sirviendo con mundos sueltos.

## Fase 4 — Contenido nuevo ✅ (2026-07-31) — escalera 8-15 años completa

12 tasks en cinco capas. **A:** `content/season.js`, único sitio con referencias caducables, con test que prohíbe cifras dentro de las entradas. **B:** Mundo 1 🏝️ Isla Numérica (operaciones, orden, múltiplos y divisores, jerarquía) con el Kraken Contador y 2 sidequests, más tres widgets nuevos. **C:** Mundo 2 🍕 Reino de las Fracciones (fracciones, sumas, decimales, porcentajes) con el Chef Mitades, 2 sidequests y dos widgets. **D:** desbloqueo secuencial entre mundos y portal de teletransporte, con estado v3 (`portalPasses`). **E:** verificación y cierre.

Tono 8-11 años, nuevo en el proyecto: frases cortas, sin incógnitas ni exponentes, divisiones exactas y referencias infantiles. Hay tests que lo vigilan, no solo la convención: ningún enunciado usa notación algebraica y las cantidades de porcentajes son siempre enteras (antes salía "9.6 cromos").

El gating fue la parte delicada, porque cambia las reglas con partidas ya en marcha. Se resolvió por regla y no migrando datos: un mundo también está abierto si el jugador ya tiene progreso en él, así que nadie se encontró una puerta nueva. Los mundos 1-2 no tienen modo estudio (no vienen de ningún Bloque) y el enlace se oculta.

## Fase 5 — Pulido ✅ (2026-07-31)

9 tasks. **Traspaso de partida:** `state/saveCode.js` codifica la partida en un código `MQ1.<base64url(gzip(JSON))>` con checksum FNV-1a de segunda red; `migrate` pasó a exportarse desde `persistence.js` para que un código de hoy siga entrando dentro de un año. Acción `IMPORT_SAVE` en el reducer, que sustituye el estado entero sin revalidar (de eso ya se encarga `decodeSave`). Sección «Partida» en `/perfil` (`SaveTransfer.jsx`): código copiable y fichero `.mathquest`, con pantalla de confirmación que resume la partida antes de reemplazarla. `QrPanel.jsx` pinta la partida como QR y `QrScanner.jsx` la lee con `BarcodeDetector` nativo (jsQR de reserva); ambos en su propio chunk, cargado bajo demanda. **Celebraciones:** `three/celebrationVariants.js` + prop `variant` en `Celebration` — `nivel` (trofeo, igual que antes), `jefe` (corona) y `logro` (medalla) — y el aviso de logro desbloqueado ya luce su celebración de fondo, bajo la verja `use3D`. **CI:** `.github/workflows/ci.yml` corre lint + tests + build en Node 20 en cada push a `main` y cada pull request, a juego con el `Dockerfile`.

**Lo que destapó la revisión final,** y que no estaba en el plan: el spec daba por hecha una red de seguridad que no existía. Afirmaba que `persistSave` dejaba copia de la partida anterior en `BACKUP_KEY`, pero el efecto de logros vuelve a guardar en la misma interacción (la partida importada desbloquea logros retroactivos) y pisaba el respaldo — un niño que pegara el código equivocado perdía su partida para siempre. Y `decodeSave` no validaba formas pese a que el reducer y el spec declaraban que sí, así que un código fabricado a mano dejaba el juego en pantalla blanca en cada arranque, sin salida. Ambas cosas vivían en la costura entre tasks, donde las revisiones una a una no llegan. De ahí salieron la instantánea previa con caducidad y confirmación (`PRE_IMPORT_KEY`), la validación de tipos del códec, el autoapagado de la cámara por inactividad y visibilidad, y los mensajes que distinguen «este navegador no puede» de «el código está mal copiado».

Desviaciones conscientes del plan: el lazy loading por mundo, cuarto punto del plan original de la fase, se aplazó — al medirlo, el peso no estaba en los mundos sino en `StudyView`, que importa los seis `Bloque*.jsx` y con ellos `mafs` y `recharts` (queda en «Deuda y cabos sueltos»). El tope de capacidad de un QR se corrigió de 2953 a 2331 bytes al escribir el plan: 2953 es el nivel de corrección de errores L, y `qrcode` usa M por defecto, que además aguanta mejor el escaneo desde una pantalla. Y el checksum FNV-1a no acabó siendo el detector primario que el spec pintaba — el gzip ya lleva CRC32, así que un código mal copiado revienta al descomprimir y nunca llega al checksum; por eso el fallo de descompresión se reporta como `corrupto` y no como `formato`, y el FNV quedó como segunda red.
