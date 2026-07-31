# Fase 4 — Contenido nuevo (Mundos 1-2, portal y temporada) Implementation Plan

> Spec: [`2026-07-31-fase4-contenido-nuevo-design.md`](../specs/2026-07-31-fase4-contenido-nuevo-design.md).
> Ejecutar task a task; cada una deja `npm test` + `npm run build` + `npm run lint` en verde y su commit.

**Goal:** Completar la escalera 8→15 años: dos mundos nuevos con jefe y sidequests, desbloqueo secuencial entre mundos con portal de teletransporte como vía de escape, y `season.js` como único punto de referencias de temporada.

**Architecture:** Data-driven, igual que las fases anteriores. El contenido nuevo son datos en `content/`; la lógica nueva (regla de desbloqueo, estado v3) va en módulos puros y testeables; los componentes los consumen. Cinco capas por dependencias (A→E).

**Rama:** `feat/fase4-contenido-nuevo` (desde `main`, con Fase 3 ya mergeada).

## Global Constraints

- Todo el contenido visible en **español**; Mundos 1-2 con **tono 8-11 años** (spec §3).
- **Sin backend, sin dependencias nuevas, sin TypeScript.**
- Tests de **lógica pura** + **integración ligera**. **Nada de tests visuales de widgets.**
- `levelKey = 'mundoN/<levelId>'`; `questKey = 'mundoN/<questId>'`.
- Fábricas: `() => ({ question, options[4], correctAnswer, hint, reminder })`, usando `makeOptions(correcto, distractores)` de `engine/generators.js` para garantizar 4 opciones distintas. **Los rangos se eligen para que los distractores nunca colisionen con la respuesta** (lección de Fase 3).
- Working dir: `/home/aurelio/Repos/mathreview`.

## Progreso

**0 de 12 tasks.** Punto de partida: 35 archivos de test, 209 tests.

| Capa | Task | Estado |
|---|---|---|
| A | 1 · `content/season.js` + test | ✅ |
| B | 2 · Widgets del Mundo 1 (`recta-numerica`, `divisores-explorer`, `jerarquia-pasos`) | ✅ |
| B | 3 · Contenido del Mundo 1 🏝️ (4 niveles + jefe) | ⬜ |
| B | 4 · Sidequests del Mundo 1 (2) | ⬜ |
| B | 5 · Activar `isla-numerica` en el mapa + ocultar modo estudio | ⬜ |
| C | 6 · Widgets del Mundo 2 (`pizza-fracciones`, `porcentaje-barra`) | ⬜ |
| C | 7 · Contenido del Mundo 2 🍕 (4 niveles + jefe) | ⬜ |
| C | 8 · Sidequests del Mundo 2 (2) | ⬜ |
| C | 9 · Activar `reino-fracciones` en el mapa | ⬜ |
| D | 10 · Estado v3 + regla de desbloqueo (pura) | ⬜ |
| D | 11 · `PortalTrial` + ruta + UI de bloqueo en el mapa | ⬜ |
| E | 12 · Verificación final + cierre en `TODO.md` / `README.md` | ⬜ |

---

# CAPA A — Temporada

## Task 1: `src/content/season.js`

**Files:** Create `src/content/season.js`, `src/content/__tests__/season.test.js`.

**Interfaces:**
- `SEASON` — `{ etiqueta, juegos[], criaturas[], snacks[], deportes[] }`, listas de nombres genéricos evergreen.
- `pickSeason(rng, lista) → elemento` — determinista dado `rng`.

**Steps:**
- [ ] Test primero: listas no vacías, sin cifras con fecha, `pickSeason` determinista y siempre dentro de la lista.
- [ ] Implementar. Comentario de cabecera dejando claro que **este es el único sitio con referencias fechables**.
- [ ] `npm test -- season` verde. Commit: `feat: content/season.js (referencias pop de temporada)`.

---

# CAPA B — Mundo 1 🏝️ Isla Numérica

## Task 2: Widgets del Mundo 1

**Files:** Create `src/widgets/RectaNumerica.jsx`, `DivisoresExplorer.jsx`, `JerarquiaPasos.jsx`; modify `src/widgets/index.js`.

Widgets interactivos autocontenidos, al estilo de los existentes (`McdCalculadora`, `AproximacionExplorer`): estado local, sin acceso al game state, controles simples.

- `recta-numerica` — un número se coloca en una recta; compara dos números y muestra `<` / `>` / `=`.
- `divisores-explorer` — introduces un número y muestra sus divisores, marcando si es primo.
- `jerarquia-pasos` — una expresión con paréntesis y × ÷ + −, resuelta paso a paso destacando qué se opera primero.

**Steps:**
- [ ] Implementar los tres y registrarlos por id en `widgets/index.js`.
- [ ] `npm run build` + `npm run lint` verdes (sin test visual, por convención).
- [ ] Commit: `feat: widgets de la Isla Numérica (recta, divisores, jerarquía)`.

## Task 3: Contenido del Mundo 1

**Files:** Create `src/content/worlds/mundo1-numeros.jsx`, `src/content/worlds/__tests__/mundo1.test.js`; modify `src/content/worlds/index.js`.

**Interfaces:** exporta `mundo1` (`id: 'mundo1'`, `slug: 'isla-numerica'`, `emoji: '🏝️'`, `boss`, `levels[4]`) y las fábricas parametrizadas, para que las sidequests puedan reusarlas si encajan.

Niveles y temas, según spec §4: `operaciones`, `orden`, `multiplos-divisores`, `jerarquia`. Cada uno: `briefing[]` (`why` → `content` → `mistakes` → `widget`) + `reto: { pick: 3, factories: [≥3] }`.

**Steps:**
- [ ] Test primero (espejo de `mundo3.test.js`): 4 niveles bien formados, briefing no vacío, `pick` y ≥3 fábricas, widgets existentes en el registro, y 300 tiradas por fábrica.
- [ ] Escribir el contenido con el tono del §3: frases cortas, sin álgebra, resultados ≤ 1000, divisiones exactas. Referencias vía `pickSeason`.
- [ ] Registrar `mundo1` **al principio** del array `worlds`.
- [ ] `npm test -- mundo1 validateContent` verde. Commit.

## Task 4: Sidequests del Mundo 1

**Files:** Create `src/content/quests/mundo1-quests.jsx` + test; modify `src/content/quests/index.js`.

Dos quests con NPC y narrativa (spec §4): `isla-quest-1` "El tesoro repartido" (Pirata Coco) e `isla-quest-2` "El faro de la isla" (Farera Luna). Cada una 3 fábricas.

**Steps:**
- [ ] Test primero: 2 quests, 3-5 fábricas cada una, 300 tiradas.
- [ ] Escribir el contenido; registrar en `questsByWorld`.
- [ ] `npm test -- mundo1-quests validateContent` verde. Commit.

## Task 5: Activar el Mundo 1 en el mapa + modo estudio condicional

**Files:** Modify `src/content/worldMap.js`, `src/engine/WorldView.jsx`, `src/content/__tests__/worldMap.test.js`.

**Steps:**
- [ ] Nodo `isla-numerica`: `mode: 'game'`, `status: 'active'`, `target: '/mundo/isla-numerica'`, `levelKeys` de los 4 niveles. **Sin `studyTarget`** (no hay página de estudio).
- [ ] Añadirlo al principio de `pathOrder`.
- [ ] `WorldView.jsx:32` — el enlace "📖 Modo estudio" hoy es incondicional y llevaría a un "Modo estudio no encontrado". Renderizarlo solo si el mundo tiene página de estudio (derivarlo del nodo del mapa o de un flag en el mundo).
- [ ] Actualizar `worldMap.test.js`: hoy afirma `pathOrder` de 6 y que `teaserBranch` acaba en 2 teasers.
- [ ] Suite completa verde. Commit.

---

# CAPA C — Mundo 2 🍕 Reino de las Fracciones

Mismo patrón que la Capa B, ya rodado.

## Task 6: Widgets del Mundo 2
`pizza-fracciones` (visual de fracciones y sumas sobre una pizza) y `porcentaje-barra` (barra con el porcentaje de una cantidad). `fracciones-ejemplo` ya existe y se reutiliza. Registrar en `widgets/index.js`. Commit.

## Task 7: Contenido del Mundo 2
`mundo2-fracciones.jsx` con `fracciones`, `operar-fracciones`, `decimales`, `porcentajes` (spec §5) + jefe *El Chef Mitades*. Test espejo. Registrar en `worlds/index.js` tras `mundo1`. Commit.

> **Cuidado con las fábricas de fracciones:** las opciones son strings (`"3/4"`), y `makeOptions` no puede sintetizar vecinos numéricos para rellenar. Los distractores deben venir ya distintos por construcción — mismo problema que resolvió `areaLateralCilindro` en el Mundo 7 y `ruletaPremiada` en el Mundo 8.

## Task 8: Sidequests del Mundo 2
`reino-quest-1` "La pizzería del reino" y `reino-quest-2` "El mercado de rebajas". Test de 300 tiradas. Commit.

## Task 9: Activar el Mundo 2 en el mapa
Nodo `reino-fracciones` a jugable, sin `studyTarget`; entra en `pathOrder` tras `isla-numerica`. **`teaserBranch` queda sin nodos: eliminarla** y quitar su uso en `three/Paths.jsx` (dibuja el ramal bloqueado con `teaserDots`). Actualizar `worldMap.test.js`. Commit.

---

# CAPA D — Desbloqueo entre mundos + portal

## Task 10: Estado v3 + regla de desbloqueo

**Files:** Modify `src/state/gameStore.js`, `src/state/persistence.js`, `src/content/worldMap.js` y sus tests.

**Interfaces:**
- `defaultState()` gana `portalPasses: []`; `version: 3`.
- Acción `PORTAL_PASSED` (`{ worldId }`), idempotente.
- `isWorldUnlocked(nodeId, state) → boolean` — puro, con las cuatro cláusulas de la spec §7.2 (primero / jefe anterior / portal anterior / **progreso propio = grandfathering**).
- `nodeState` gana el valor `locked`.

**Steps:**
- [ ] Tests primero: las cuatro cláusulas, con un caso explícito de **save antiguo con progreso en Mundos 3-8 que sigue teniendo acceso**; migración v2 → v3 rellenando `portalPasses`.
- [ ] Implementar. `migrate()` en `persistence.js` ya trata v1 y v2 rellenando defaults: extender a v3 con la misma forma.
- [ ] Suite completa verde (ojo: `nodeState` cambia de valores y hay tests que lo asertan). Commit.

## Task 11: `PortalTrial` + ruta + UI de bloqueo

**Files:** Create `src/engine/PortalTrial.jsx`, `src/__tests__/portal-integracion.test.jsx`; modify `src/App.jsx`, `src/components/WorldMap2D.jsx`, `src/three/WorldMapCanvas.jsx` si aplica.

**Interfaces:** ruta `/mundo/:slug/portal`. 5 preguntas de `buildBossPool`, sin vidas, se aprueba con 4/5, reintentable con preguntas nuevas. Aprobar → `PORTAL_PASSED`.

**Steps:**
- [ ] Test de integración primero: aprobar marca `portalPasses`, **no** añade estrellas, y el siguiente mundo pasa a desbloqueado.
- [ ] Implementar el componente (patrón de `BossArena`: `key={slug}`, fases intro → prueba → resultado).
- [ ] `WorldMap2D`: `locked` muestra candado + "Derrota al jefe anterior" + enlace al portal; `coming-soon` conserva "Próximamente"; un mundo con `portalPasses` se muestra como **"Superado por portal"**, no como completado.
- [ ] Suite + build + lint verdes. Commit.

---

# CAPA E — Cierre

## Task 12: Verificación final y documentación

- [ ] `npm test` + `npm run build` + `npm run lint` verdes.
- [ ] `validateContent` cubriendo los 8 mundos con sus sidequests.
- [ ] **Repaso de tono** de los briefings de Mundos 1-2 (spec §3).
- [ ] Recorrido e2e en navegador si la extensión de Chrome está conectada — cierra además el pendiente arrastrado desde Fase 1: entrar al Mundo 1, completar nivel, cofre, jefe, comprobar que abre el Mundo 2; luego portal.
- [ ] Prueba con save v2 real: grandfathering y migración sin pérdida.
- [ ] `TODO.md` (Fase 4 al historial, Fase 5 arriba) y `README.md` (8 mundos, ruta del portal) al día. Marcar este plan como ejecutado.
- [ ] Commit de cierre.
