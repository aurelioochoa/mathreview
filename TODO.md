# TODO — Math Quest

Hoja de ruta por fases. Lo pendiente va arriba; el historial, al final.

**Specs:** [base](docs/superpowers/specs/2026-07-18-math-quest-design.md) · [worldmap 3D](docs/superpowers/specs/2026-07-19-rediseno-worldmap-3d-design.md) · [Fase 2](docs/superpowers/specs/2026-07-21-fase2-migracion-completa-design.md) · [Fase 3](docs/superpowers/specs/2026-07-22-fase3-gamificacion-design.md)
**Planes:** [Fases 0-1](docs/superpowers/plans/2026-07-18-math-quest-fase0-fase1.md) · [worldmap 3D](docs/superpowers/plans/2026-07-19-rediseno-worldmap-3d.md) · [Fase 2](docs/superpowers/plans/2026-07-21-fase2-migracion-completa.md) · [**Fase 3 (en curso)**](docs/superpowers/plans/2026-07-22-fase3-gamificacion.md)

## Estado — 2026-07-30

- **Rama:** `feat/fase3-gamificacion`.
- **Suite:** `npm test` → 29 archivos, 173 tests en verde; `build` y `lint` limpios.
- **Jugable hoy:** 6 mundos (3-8) con niveles + modo estudio, jefe y sidequests en cada uno, mapa 3D con fallback 2D, HUD, guardado v2 con migración.
- **Fase en curso:** Fase 3 — **10 de 18 tasks completas** (Capas A, B y C cerradas).
- **Siguiente paso:** Capa D — Task 11 (cofres), 12 (tienda) y 13 (pistas compradas).

---

# 🔴 En curso — Fase 3: Gamificación completa (→ MVP jugable)

## Capa D — Economía visible

- [ ] **Task 11** — Cofres: `engine/chests.js` (`rollChest`) + `Chest.jsx` + catálogo `content/shop.js`; enganche en primer completado de nivel y en victoria de jefe
- [ ] **Task 12** — Tienda `/tienda` (comprar cosméticos y packs de pistas con `BUY_ITEM`)
- [ ] **Task 13** — Pistas compradas: botón "💡 Pedir pista" en `LevelPlayer` y `BossArena` (gasta `USE_HINT`)

## Capa E — Logros

- [ ] **Task 14** — `content/achievements.js` (definiciones) + `state/achievements.js` (`evaluateAchievements`, puro y testeado)
- [ ] **Task 15** — `Toast.jsx` + wiring en `GameProvider` (evaluar tras cada dispatch + cola de avisos) + página `/logros` + cronómetro para el logro "Speedrunner"

## Capa F — Racha + Perfil

- [ ] **Task 16** — Racha diaria: `state/streak.js` (`nextStreak`/`dailyBonus`/`todayStr`), disparo diario en `GameProvider`, indicador 🔥 en el HUD
- [ ] **Task 17** — Perfil `/perfil` (equipar avatar/marco/título, stats) + accesos a perfil/tienda/logros en el HUD
- [ ] **Task 18** — Verificación final (`npm test` + `build` + `lint`) y cierre de Fase 3 en este archivo

## ✅ Ya cerrado en Fase 3

- [x] **Capa A** — estado v2 (jefes, quests, logros, cosméticos, pistas, racha) + migración de guardado v1 → v2 + economía por estrellas nuevas (`coinsForCompletion`)
- [x] **Capa B** — `buildBossPool`, campo `boss` en los 6 mundos + validación, `BossArena` con barra de vida, acceso al jefe y ⭐ de maestría en `WorldView`
- [x] **Capa C** — `QuestPlayer` + esquema/índice de quests + sidequests bespoke en los seis mundos (13 misiones) + `validateContent` exige ≥1 sidequest por mundo

---

# ⬜ Fase 4 — Contenido nuevo

- [ ] Mundo 1 🏝️ Isla Numérica (operaciones básicas, orden, múltiplos) — tono 8-11 años. Ya existe como teaser bloqueado en `worldMap.js`.
- [ ] Mundo 2 🍕 Reino de las Fracciones (fracciones, decimales, porcentajes) — ídem.
- [ ] Portal de teletransporte (prueba de dominio para saltar mundos)
- [ ] `content/season.js` con referencias pop de temporada (julio 2026)

# ⬜ Fase 5 — Pulido

- [ ] Celebración de logro desbloqueado y de jefe derrotado (la de nivel ya existe)
- [ ] Export/import de partida (base64 + checksum)
- [ ] Validación de contenido + suite de tests en CI
- [ ] Revisar rendimiento: lazy loading por mundo

---

# Deuda y cabos sueltos

- [ ] **Verificación e2e interactiva en navegador** (arrastrada desde Fase 1: la extensión de Chrome no estaba conectada). Checklist en el plan de Fases 0-1, Task 14 · Step 4. Cubierta parcialmente por los tests de integración.
- [x] ~~README desactualizado~~ — actualizado el 2026-07-30 (estructura, rutas y estado real).
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
