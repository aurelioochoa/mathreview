# TODO — Math Quest

Plan por fases. Spec: [docs/superpowers/specs/2026-07-18-math-quest-design.md](docs/superpowers/specs/2026-07-18-math-quest-design.md)

## Fase 0 — Base segura
- [ ] 🔴 Mover el token del túnel de Cloudflare de `docker-compose.yml` a `.env` (y añadir `.env` a `.gitignore`)
- [ ] Commitear el trabajo pendiente (6 componentes nuevos, bloques reescritos, deploy)
- [ ] Corregir bug MCM "36 minutos" vs horas (Bloque 2)
- [ ] Corregir pregunta inconsistente de Cramer (Bloque 3, D=−18 vs opciones)
- [ ] Renombrar componente `Math` → `MathTex` y eliminar los `window.Math`
- [x] Crear `docs/` (análisis, research, spec) y `TODO.md`

## Fase 1 — Motor piloto
- [ ] `state/gameStore.js` (XP, estrellas, vidas, monedas, logros, racha) + `state/persistence.js` (localStorage versionado + respaldo)
- [ ] Definir schema de contenido (mundo → niveles → pasos + reto + quests + jefe)
- [ ] Extraer widgets de Bloque 1 a `src/widgets/` con registro por id
- [ ] `engine/LevelPlayer.jsx` (briefing por pasos + reto con vidas y estrellas)
- [ ] `engine/generators.js` (plantillas de preguntas parametrizadas)
- [ ] Migrar Mundo 3 🌋 (← Bloque 1) como piloto, conviviendo con rutas viejas
- [ ] Tests Vitest: guardado/restauración, curva XP, generadores

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
