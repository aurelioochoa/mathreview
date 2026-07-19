# TODO — Math Quest

Plan por fases. Spec: [docs/superpowers/specs/2026-07-18-math-quest-design.md](docs/superpowers/specs/2026-07-18-math-quest-design.md)

## Fase 0 — Base segura ✅ (rama feat/math-quest)
- [x] 🔴 Mover el token del túnel de Cloudflare de `docker-compose.yml` a `.env` (y añadir `.env` a `.gitignore`) — ⚠️ rotar el token en el dashboard de Cloudflare (vivió en texto plano)
- [x] Commitear el trabajo pendiente (6 componentes nuevos, bloques reescritos, deploy)
- [x] Corregir bug MCM "36 minutos" vs horas (Bloque 2)
- [x] Corregir pregunta inconsistente de Cramer (Bloque 3, D=−18 vs opciones)
- [x] Renombrar componente `Math` → `MathTex` y eliminar los `window.Math`
- [x] Crear `docs/` (análisis, research, spec) y `TODO.md`

## Fase 1 — Motor piloto ✅ (rama feat/math-quest, 28 tests, build OK)
- [x] `state/gameStore.jsx` (XP, estrellas, monedas + persistencia auto) + `state/persistence.js` (localStorage versionado + respaldo) + `state/xpCurve.js`
- [x] Definir schema de contenido (mundo → niveles → pasos de briefing + reto)
- [x] Extraer widgets de Bloque 1 a `src/widgets/` con registro por id
- [x] `engine/LevelPlayer.jsx` (briefing por pasos + reto con vidas y estrellas)
- [x] `engine/generators.js` (plantillas parametrizadas + barajado de opciones)
- [x] Migrar Mundo 3 🌋 (← Bloque 1) como piloto, conviviendo con rutas viejas (`WorldView` + rutas `/mundo/*`)
- [x] Tests Vitest: guardado/restauración, curva XP, generadores + test de integración del bucle jugable
- [ ] ⏳ Verificación e2e interactiva en navegador (pendiente: extensión Chrome no conectada; cubierto parcialmente por test de integración + dev server HTTP 200)

### Follow-ups de la revisión final (no bloqueantes, para Fase 2/3)
- [ ] Economía: XP/monedas se otorgan en cada completado (solo estrellas topadas con `Math.max`) — decidir la regla al añadir la tienda (Fase 3)
- [ ] `LevelPlayer`: añadir `key={levelId}` cuando exista navegación nivel→nivel (evita estado obsoleto)
- [ ] Retirar las preguntas duplicadas entre `Bloque1` y `mundo3` al migrar los Bloques
- [ ] `persistence`: `try/catch` en `setItem` (QuotaExceededError)
- [ ] Render-test de `GameProvider`/`useGame`

## Fase 2 — Migración completa
- [ ] Extraer el resto de widgets (Bloques 2-6)
- [ ] Migrar Mundo 4 🏰 (← Bloques 2+4 parte), Mundo 5 🌀 (← B3), Mundo 6 🚀 (← B4), Mundo 7 ⛰️ (← B5), Mundo 8 🎡 (← B6)
- [ ] Añadir nivel de probabilidad básica al Mundo 8
- [ ] `engine/WorldMap.jsx` reemplaza Home; redirects `/bloqueN` → mundo; ruta 404
- [ ] Script de validación de contenido (preguntas, widgets, estructura de mundos)

## Fase 3 — Gamificación completa (→ MVP jugable)
- [ ] `engine/BossArena.jsx` (jefe con barra de vida) para los mundos 3-8
- [ ] `engine/QuestPlayer.jsx` + 2-3 sidequests narrativas por mundo
- [ ] Logros (`content/achievements.js`) + pantalla `/logros`
- [ ] Monedas, cofres sorpresa, tienda de cosméticos, pistas compradas
- [ ] Racha diaria + perfil (`/perfil`: avatar, título, stats)

## Fase 4 — Contenido nuevo
- [ ] Mundo 1 🏝️ Isla Numérica (operaciones básicas, orden, múltiplos) — tono 8-11 años
- [ ] Mundo 2 🍕 Reino de las Fracciones (fracciones, decimales, porcentajes)
- [ ] Portal de teletransporte (prueba de dominio para saltar mundos)
- [ ] `content/season.js` con referencias pop de temporada (julio 2026)

## Fase 5 — Pulido
- [ ] Export/import de partida (base64 + checksum)
- [ ] Animaciones y celebraciones (subida de nivel, logro, jefe derrotado)
- [ ] Suite de tests completa + validación de contenido en CI
- [ ] README real del proyecto (reemplazar plantilla de Vite)
- [ ] Revisar rendimiento (lazy loading por mundo)

## Ideas futuras (fuera de alcance actual)
- Batallas RPG como tipo de nivel adicional (estilo Prodigy)
- Integración de perfil compartido cuando exista el portal kidtopiaplay
- Modo profesor/padre (ver progreso)
