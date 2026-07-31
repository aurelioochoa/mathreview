# Fase 3 — Gamificación completa (→ MVP jugable) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar el bucle de juego añadiendo jefes, sidequests, logros, economía de monedas (cofres + tienda + pistas) y racha diaria + perfil sobre el motor data-driven existente, dejando Math Quest como un MVP jugable completo.

**Architecture:** Data-driven e incremental. El estado pasa a `version: 2` (con migración desde v1) y crece con campos para jefes, quests, logros, cosméticos, pistas y racha. Toda la lógica nueva vive en módulos **puros y testeables** (`state/achievements.js`, `state/streak.js`, `engine/chests.js`, `engine/generators.js`), y los componentes (`BossArena`, `QuestPlayer`, `Chest`, `Shop`, `Profile`, `Toast`) los consumen. El contenido nuevo (jefes, sidequests) son datos en `content/`. El plan se ejecuta en **6 capas por dependencias** (A→F): cada capa deja `npm test` + `npm run build` verdes y un commit.

**Tech Stack:** Vite + React 19 + react-router-dom 7 + Tailwind 4 + KaTeX + Mafs + Recharts + motion + Vitest. Sin backend.

## Global Constraints

- Todo el contenido visible al usuario en **español**.
- **Sin backend**: solo localStorage (claves físicas `mathquest-save-v1` / `-backup`; el `version` vive dentro del JSON y pasa a `2`).
- **Sin dependencias nuevas** y **sin TypeScript**.
- Tests solo de **lógica pura** (reducer, migración, `rollChest`, `evaluateAchievements`, `nextStreak`, fábricas, validador) + **integración ligera** (espejo de `mundo3-integracion.test.jsx`). **Nada de tests visuales de widgets/UI.**
- **Working dir de todos los comandos:** `/home/aurelio/Repos/mathreview`.
- `levelKey = 'mundoN/<levelId>'`; `questKey = 'mundoN/<questId>'`; el `id` del mundo es `mundoN`, el `slug` es la ruta.
- Fábricas de preguntas: `() => ({ question, options[4], correctAnswer, hint, reminder })`; las parametrizadas devuelven `correctAnswer: 0` con el correcto primero y `buildReto`/`shuffleOptions` barajan. Usar `makeOptions(correct, distractors)` para garantizar 4 opciones distintas.
- Spec de referencia: `docs/superpowers/specs/2026-07-22-fase3-gamificacion-design.md`.
- **Economía (regla acordada):** al completar un nivel, monedas = `(estrellas_nuevas − mejor_previa)×COINS_PER_STAR` si es positivo, más `BASE_FIRST_CLEAR` solo la primera vez. Rejugar sin mejorar la marca paga 0. Jefes/quests/cofres son las fuentes principales.

## Progreso (actualizado 2026-07-30)

**7 de 18 tasks completas.** Capas A y B cerradas; Capa C a mitad. Suite en verde: 26 archivos, 161 tests.

| Capa | Task | Estado | Commit |
|---|---|---|---|
| A | 1 · Estado v2 + economía por estrellas nuevas | ✅ | `555b31e` |
| A | 2 · Migración de guardado v1 → v2 | ✅ | `8d4a777` |
| B | 3 · `buildBossPool` + campo `boss` + validación | ✅ | `57be2dc` |
| B | 4 · `BossArena` + ruta + maestría en `WorldView` | ✅ | `8d46668` (+ fix `d479404`) |
| C | 5 · `QuestPlayer` + índice + sidequests Mundo 3 | ✅ | `feee1f9` (+ fix `fa0fe98`) |
| C | 6 · Sidequests Mundo 4 🏰 | ✅ | `6c96add` |
| C | 7 · Sidequests Mundo 5 🌀 | ✅ | `eb95248` |
| C | 8 · Sidequests Mundo 6 🚀 | ⬜ | — |
| C | 9 · Sidequests Mundo 7 ⛰️ | ⬜ | — |
| C | 10 · Sidequests Mundo 8 🎡 + validación de quests | ⬜ | — |
| D | 11 · Cofres (`rollChest` + `Chest` + `shop.js`) | ⬜ | — |
| D | 12 · Tienda `/tienda` | ⬜ | — |
| D | 13 · Pistas compradas en reto y jefe | ⬜ | — |
| E | 14 · Definiciones de logros + `evaluateAchievements` | ⬜ | — |
| E | 15 · Toast + wiring en `GameProvider` + `/logros` | ⬜ | — |
| F | 16 · Racha diaria + 🔥 en el HUD | ⬜ | — |
| F | 17 · Perfil `/perfil` + accesos en el HUD | ⬜ | — |
| — | 18 · Verificación final + cierre en `TODO.md` | ⬜ | — |

> **Siguiente:** Task 8 (Mundo 6 🚀). Alternativa si se quiere impacto jugable antes que contenido: saltar a la Capa D (Tasks 11-13) — no depende de las Tasks 8-10 salvo por el paso de validación de quests de la Task 10.

---

# CAPA A — Base de estado (v2 + migración + economía)

## Task 1: Estado v2, constantes, acciones del reducer y regla de monedas

**Files:**
- Modify: `src/state/gameStore.js` (reescritura del reducer + `defaultState` + constantes + `coinsForCompletion`)
- Modify: `src/engine/LevelPlayer.jsx:82-86,169` (usar `coinsForCompletion` para mostrar las monedas reales)
- Test: `src/state/__tests__/gameStore.test.js` (actualizar economía + tests de acciones nuevas)
- Modify (arreglar por cambio de economía): `src/__tests__/mundo{3,4,5,6,7,8}-integracion.test.jsx:74`

**Interfaces:**
- Produces:
  - `defaultState() → stateV2` — objeto de estado inicial v2 (fuente única de defaults, usada por `initialState` y por la migración).
  - `initialState` — `= defaultState()`.
  - Constantes: `XP_PER_CORRECT=10`, `XP_LEVEL_COMPLETE=50`, `COINS_PER_STAR=10`, `BASE_FIRST_CLEAR=15`, `COINS_BOSS=60`, `XP_BOSS=120`, `COINS_QUEST=25`, `XP_QUEST=40`.
  - `coinsForCompletion(previaRaw, nuevas) → number` — monedas otorgadas por un completado (regla de estrellas nuevas). `previaRaw` es `state.stars[levelKey]` (puede ser `undefined`).
  - `gameReducer(state, action)` con las acciones nuevas: `BOSS_DEFEATED`, `QUEST_COMPLETED`, `OPEN_CHEST`, `BUY_ITEM`, `EQUIP_COSMETIC`, `USE_HINT`, `TICK_STREAK`, `UNLOCK_ACHIEVEMENTS` (más `ANSWER_CORRECT`, `LEVEL_COMPLETED` existentes).
- Consumes: nada nuevo.

- [x] **Step 1: Escribir los tests que fallan (economía nueva + acciones nuevas)**

Reemplazar el contenido de `src/state/__tests__/gameStore.test.js` por:
```js
import { describe, it, expect } from 'vitest'
import { gameReducer, initialState, defaultState, coinsForCompletion } from '../gameStore'

describe('gameReducer — base', () => {
  it('ANSWER_CORRECT suma XP', () => {
    expect(gameReducer(initialState, { type: 'ANSWER_CORRECT', xp: 10 }).xp).toBe(10)
  })
  it('acción desconocida devuelve el mismo estado', () => {
    expect(gameReducer(initialState, { type: 'NOPE' })).toBe(initialState)
  })
  it('defaultState trae los campos v2 con sus valores por defecto', () => {
    const s = defaultState()
    expect(s.version).toBe(2)
    expect(s.bossDefeats).toEqual([])
    expect(s.questsCompleted).toEqual([])
    expect(s.achievements).toEqual([])
    expect(s.hints).toBe(0)
    expect(s.cosmetics).toEqual({ owned: ['avatar-default'], avatar: 'avatar-default', frame: null, title: null })
    expect(s.streak).toEqual({ count: 0, best: 0, lastDate: null })
  })
})

describe('economía por estrellas nuevas', () => {
  it('coinsForCompletion: primer clear paga base + estrellas', () => {
    // primera vez (previaRaw undefined) con 3★ → 3*10 + 15 = 45
    expect(coinsForCompletion(undefined, 3)).toBe(45)
    expect(coinsForCompletion(undefined, 1)).toBe(25) // 1*10 + 15
  })
  it('coinsForCompletion: mejorar la marca paga solo la diferencia (sin base)', () => {
    expect(coinsForCompletion(1, 3)).toBe(20) // (3-1)*10
  })
  it('coinsForCompletion: rejugar sin mejorar paga 0', () => {
    expect(coinsForCompletion(3, 1)).toBe(0)
    expect(coinsForCompletion(3, 3)).toBe(0)
  })
  it('LEVEL_COMPLETED aplica la regla y guarda la mejor marca', () => {
    let s = gameReducer(initialState, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 2, xp: 50 })
    expect(s.stars.k).toBe(2)
    expect(s.xp).toBe(50)
    expect(s.coins).toBe(35) // 2*10 + 15
    expect(s.completedLevels).toContain('k')
    // rejugar peor: 0 monedas, estrellas intactas, sin duplicar
    s = gameReducer(s, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 1, xp: 50 })
    expect(s.stars.k).toBe(2)
    expect(s.coins).toBe(35)
    expect(s.completedLevels.filter(x => x === 'k')).toHaveLength(1)
    // rejugar mejor (3★): paga la diferencia (3-2)*10 = 10
    s = gameReducer(s, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 3, xp: 50 })
    expect(s.stars.k).toBe(3)
    expect(s.coins).toBe(45)
  })
})

describe('acciones nuevas del reducer', () => {
  it('BOSS_DEFEATED registra el mundo (sin duplicar) y suma recompensas', () => {
    let s = gameReducer(initialState, { type: 'BOSS_DEFEATED', worldId: 'mundo3', coins: 60, xp: 120 })
    expect(s.bossDefeats).toEqual(['mundo3'])
    expect(s.coins).toBe(60); expect(s.xp).toBe(120)
    s = gameReducer(s, { type: 'BOSS_DEFEATED', worldId: 'mundo3', coins: 60, xp: 120 })
    expect(s.bossDefeats).toEqual(['mundo3']) // sin duplicar
    expect(s.coins).toBe(120) // pero vuelve a pagar (rejugar jefe no está bloqueado)
  })
  it('QUEST_COMPLETED paga una vez; rejugar no vuelve a pagar', () => {
    let s = gameReducer(initialState, { type: 'QUEST_COMPLETED', questKey: 'mundo3/q1', coins: 25, xp: 40 })
    expect(s.questsCompleted).toEqual(['mundo3/q1'])
    expect(s.coins).toBe(25)
    s = gameReducer(s, { type: 'QUEST_COMPLETED', questKey: 'mundo3/q1', coins: 25, xp: 40 })
    expect(s.coins).toBe(25) // idempotente
    expect(s.questsCompleted).toEqual(['mundo3/q1'])
  })
  it('OPEN_CHEST aplica coins/hint/cosmetic y no duplica cosméticos', () => {
    expect(gameReducer(initialState, { type: 'OPEN_CHEST', reward: { type: 'coins', amount: 30 } }).coins).toBe(30)
    expect(gameReducer(initialState, { type: 'OPEN_CHEST', reward: { type: 'hint', amount: 2 } }).hints).toBe(2)
    const s = gameReducer(initialState, { type: 'OPEN_CHEST', reward: { type: 'cosmetic', id: 'avatar-mago' } })
    expect(s.cosmetics.owned).toContain('avatar-mago')
    const s2 = gameReducer(s, { type: 'OPEN_CHEST', reward: { type: 'cosmetic', id: 'avatar-mago' } })
    expect(s2.cosmetics.owned.filter(x => x === 'avatar-mago')).toHaveLength(1)
  })
  it('BUY_ITEM descuenta y añade; falla sin monedas', () => {
    const rico = { ...defaultState(), coins: 100 }
    const s = gameReducer(rico, { type: 'BUY_ITEM', item: { id: 'avatar-mago', slot: 'avatar', price: 60 } })
    expect(s.coins).toBe(40); expect(s.cosmetics.owned).toContain('avatar-mago')
    const pobre = { ...defaultState(), coins: 10 }
    const s2 = gameReducer(pobre, { type: 'BUY_ITEM', item: { id: 'avatar-mago', slot: 'avatar', price: 60 } })
    expect(s2).toBe(pobre) // no-op sin monedas
    const hs = gameReducer(rico, { type: 'BUY_ITEM', item: { id: 'hint-pack', slot: 'hint', price: 20, amount: 1 } })
    expect(hs.coins).toBe(80); expect(hs.hints).toBe(1)
  })
  it('EQUIP_COSMETIC solo equipa lo poseído; null revierte a automático', () => {
    const owned = { ...defaultState(), cosmetics: { owned: ['avatar-default', 'avatar-mago'], avatar: 'avatar-default', frame: null, title: null } }
    expect(gameReducer(owned, { type: 'EQUIP_COSMETIC', slot: 'avatar', id: 'avatar-mago' }).cosmetics.avatar).toBe('avatar-mago')
    expect(gameReducer(owned, { type: 'EQUIP_COSMETIC', slot: 'avatar', id: 'no-poseido' })).toBe(owned)
    expect(gameReducer(owned, { type: 'EQUIP_COSMETIC', slot: 'title', id: null }).cosmetics.title).toBe(null)
  })
  it('USE_HINT no baja de 0', () => {
    expect(gameReducer(defaultState(), { type: 'USE_HINT' }).hints).toBe(0)
    expect(gameReducer({ ...defaultState(), hints: 2 }, { type: 'USE_HINT' }).hints).toBe(1)
  })
  it('TICK_STREAK aplica la racha calculada y suma el bono', () => {
    const s = gameReducer(defaultState(), { type: 'TICK_STREAK', streak: { count: 1, best: 1, lastDate: '2026-07-22' }, bonus: 7 })
    expect(s.streak).toEqual({ count: 1, best: 1, lastDate: '2026-07-22' })
    expect(s.coins).toBe(7)
  })
  it('UNLOCK_ACHIEVEMENTS une ids nuevos sin duplicar', () => {
    let s = gameReducer(defaultState(), { type: 'UNLOCK_ACHIEVEMENTS', ids: ['sin-dano'] })
    expect(s.achievements).toEqual(['sin-dano'])
    const s2 = gameReducer(s, { type: 'UNLOCK_ACHIEVEMENTS', ids: ['sin-dano', 'speedrunner'] })
    expect(s2.achievements).toEqual(['sin-dano', 'speedrunner'])
  })
})
```

- [x] **Step 2: Ejecutar para ver que falla**

Run: `npm test -- gameStore`
Expected: FAIL (`defaultState`/`coinsForCompletion` no existen; economía nueva no implementada).

- [x] **Step 3: Reescribir `src/state/gameStore.js`**

```js
import { createContext, useContext } from 'react'

export const XP_PER_CORRECT = 10
export const XP_LEVEL_COMPLETE = 50
export const COINS_PER_STAR = 10
export const BASE_FIRST_CLEAR = 15
export const COINS_BOSS = 60
export const XP_BOSS = 120
export const COINS_QUEST = 25
export const XP_QUEST = 40

// Fuente única de defaults del estado v2. La migración de persistencia reusa esto.
export function defaultState() {
  return {
    version: 2,
    xp: 0,
    coins: 0,
    stars: {},            // levelKey -> 1..3 (mejor marca)
    completedLevels: [],  // levelKey[]
    bossDefeats: [],      // worldId[]
    questsCompleted: [],  // questKey[]
    achievements: [],     // achievementId[]
    hints: 0,             // tokens de pista
    cosmetics: { owned: ['avatar-default'], avatar: 'avatar-default', frame: null, title: null },
    streak: { count: 0, best: 0, lastDate: null },
  }
}

export const initialState = defaultState()

// Regla de monedas por estrellas nuevas. previaRaw = state.stars[levelKey] (puede ser undefined).
export function coinsForCompletion(previaRaw, nuevas) {
  const primeraVez = previaRaw === undefined
  const previa = previaRaw ?? 0
  const delta = Math.max(0, nuevas - previa)
  return delta * COINS_PER_STAR + (primeraVez ? BASE_FIRST_CLEAR : 0)
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT':
      return { ...state, xp: state.xp + action.xp }

    case 'LEVEL_COMPLETED': {
      const previaRaw = state.stars[action.levelKey]
      const previa = previaRaw ?? 0
      return {
        ...state,
        xp: state.xp + action.xp,
        coins: state.coins + coinsForCompletion(previaRaw, action.stars),
        stars: { ...state.stars, [action.levelKey]: Math.max(previa, action.stars) },
        completedLevels: state.completedLevels.includes(action.levelKey)
          ? state.completedLevels
          : [...state.completedLevels, action.levelKey],
      }
    }

    case 'BOSS_DEFEATED':
      return {
        ...state,
        xp: state.xp + (action.xp ?? 0),
        coins: state.coins + (action.coins ?? 0),
        bossDefeats: state.bossDefeats.includes(action.worldId)
          ? state.bossDefeats
          : [...state.bossDefeats, action.worldId],
      }

    case 'QUEST_COMPLETED':
      if (state.questsCompleted.includes(action.questKey)) return state
      return {
        ...state,
        xp: state.xp + (action.xp ?? 0),
        coins: state.coins + (action.coins ?? 0),
        questsCompleted: [...state.questsCompleted, action.questKey],
      }

    case 'OPEN_CHEST': {
      const r = action.reward
      if (!r) return state
      if (r.type === 'coins') return { ...state, coins: state.coins + (r.amount ?? 0) }
      if (r.type === 'hint') return { ...state, hints: state.hints + (r.amount ?? 1) }
      if (r.type === 'cosmetic') {
        if (state.cosmetics.owned.includes(r.id)) return state
        return { ...state, cosmetics: { ...state.cosmetics, owned: [...state.cosmetics.owned, r.id] } }
      }
      return state
    }

    case 'BUY_ITEM': {
      const { item } = action
      if (!item || state.coins < item.price) return state
      if (item.slot === 'hint')
        return { ...state, coins: state.coins - item.price, hints: state.hints + (item.amount ?? 1) }
      if (state.cosmetics.owned.includes(item.id)) return state
      return {
        ...state,
        coins: state.coins - item.price,
        cosmetics: { ...state.cosmetics, owned: [...state.cosmetics.owned, item.id] },
      }
    }

    case 'EQUIP_COSMETIC': {
      const { slot, id } = action
      if (slot !== 'avatar' && slot !== 'frame' && slot !== 'title') return state
      if (id !== null && !state.cosmetics.owned.includes(id)) return state
      return { ...state, cosmetics: { ...state.cosmetics, [slot]: id } }
    }

    case 'USE_HINT':
      return { ...state, hints: Math.max(0, state.hints - 1) }

    case 'TICK_STREAK':
      return { ...state, streak: action.streak, coins: state.coins + (action.bonus ?? 0) }

    case 'UNLOCK_ACHIEVEMENTS': {
      const nuevos = action.ids.filter(id => !state.achievements.includes(id))
      if (nuevos.length === 0) return state
      return { ...state, achievements: [...state.achievements, ...nuevos] }
    }

    default:
      return state
  }
}

export const GameContext = createContext(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>')
  return ctx
}
```

- [x] **Step 4: Actualizar `LevelPlayer.jsx` para mostrar las monedas reales**

En `src/engine/LevelPlayer.jsx`, importar el helper y usarlo para el display (el reducer recalcula lo mismo; se pasa `previa` desde el estado actual). Reemplazar el bloque `nextQuestion` (L76-89) por:
```jsx
  const nextQuestion = () => {
    setSelected(null)
    setFailedThis(false)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      const ratio = firstTryHits / questions.length
      const stars = ratio >= 1 ? 3 : ratio >= 0.66 ? 2 : 1
      const coins = coinsForCompletion(state.stars[levelKey], stars)
      dispatch({ type: 'LEVEL_COMPLETED', levelKey, stars, xp: XP_LEVEL_COMPLETE })
      setResult({ stars, coins })
      setPhase('completado')
    }
  }
```
Y actualizar el import (L6) para traer `coinsForCompletion` y `state`:
```jsx
import { useGame, XP_PER_CORRECT, XP_LEVEL_COMPLETE, coinsForCompletion } from '../state/gameStore'
```
Y en `LevelPlayerView` obtener `state` del hook (L34):
```jsx
  const { state, dispatch } = useGame()
```
(La línea 169 que muestra `+{result?.coins ?? 0} 🪙` ya funciona con el nuevo `result.coins`. `COINS_PER_STAR` deja de importarse si no se usa en otro sitio del archivo — quitarlo del import si ESLint marca no-usado.)

- [x] **Step 5: Arreglar la aserción de monedas en los 6 tests de integración**

En cada `src/__tests__/mundo{3,4,5,6,7,8}-integracion.test.jsx`, línea 74, reemplazar:
```js
    expect(state.coins).toBe(30)
```
por:
```js
    expect(state.coins).toBe(45) // 3★ primer clear = 3*COINS_PER_STAR + BASE_FIRST_CLEAR
```
(Las líneas 67/81/84 que pasan `coins: 30/10` son ahora ignoradas por el reducer; se pueden dejar. El test de "rejugar peor" sigue verde porque no asertaba monedas.)

- [x] **Step 6: Ejecutar toda la suite — pasa**

Run: `npm test`
Expected: PASS (gameStore nuevos + integración con 45 + resto sin cambios).

- [x] **Step 7: Commit**
```bash
git add src/state/gameStore.js src/state/__tests__/gameStore.test.js src/engine/LevelPlayer.jsx src/__tests__/mundo*-integracion.test.jsx
git commit -m "feat: estado v2 del juego + regla de monedas por estrellas nuevas"
```

---

## Task 2: Migración de persistencia v1 → v2

**Files:**
- Modify: `src/state/persistence.js`
- Test: `src/state/__tests__/persistence.test.js` (añadir describe de migración; conservar los existentes)

**Interfaces:**
- Consumes: `defaultState` (gameStore).
- Produces: `loadSave()` acepta saves v1 (migrando a v2) y v2 (completando defaults ausentes); `persistSave` sin cambios de contrato. Migración interna `migrate(data) → stateV2 | null`.

- [x] **Step 1: Escribir los tests de migración (fallan)**

Añadir a `src/state/__tests__/persistence.test.js` (nuevo `describe`, sin borrar lo existente). Importar lo necesario arriba: `import { defaultState } from '../gameStore'`.
```js
describe('migración v1 → v2', () => {
  beforeEach(() => localStorage.clear())

  it('un save v1 se migra a v2 conservando xp/coins/stars/completedLevels', () => {
    const v1 = { version: 1, xp: 120, coins: 30, stars: { 'mundo3/aproximacion': 2 }, completedLevels: ['mundo3/aproximacion'] }
    localStorage.setItem('mathquest-save-v1', JSON.stringify(v1))
    const s = loadSave()
    expect(s.version).toBe(2)
    expect(s.xp).toBe(120)
    expect(s.coins).toBe(30)
    expect(s.stars).toEqual({ 'mundo3/aproximacion': 2 })
    expect(s.completedLevels).toEqual(['mundo3/aproximacion'])
    // campos nuevos con defaults:
    expect(s.bossDefeats).toEqual([])
    expect(s.cosmetics.avatar).toBe('avatar-default')
    expect(s.streak).toEqual({ count: 0, best: 0, lastDate: null })
  })

  it('un save v2 parcial (sin cosmetics) se completa con defaults', () => {
    const v2 = { ...defaultState(), coins: 5 }
    delete v2.cosmetics
    localStorage.setItem('mathquest-save-v1', JSON.stringify(v2))
    const s = loadSave()
    expect(s.coins).toBe(5)
    expect(s.cosmetics).toEqual(defaultState().cosmetics)
  })

  it('JSON inválido cae al backup; sin backup → null', () => {
    localStorage.setItem('mathquest-save-v1', '{no-json')
    expect(loadSave()).toBe(null)
    localStorage.setItem('mathquest-save-v1-backup', JSON.stringify({ version: 1, xp: 7, coins: 0, stars: {}, completedLevels: [] }))
    expect(loadSave().xp).toBe(7)
  })
})
```
(Asegurar que `loadSave`, `persistSave` ya están importados en el archivo; si no, añadir `beforeEach` import de vitest.)

- [x] **Step 2: Ejecutar — falla**

Run: `npm test -- persistence`
Expected: FAIL (v1 devuelve version 1, sin campos nuevos).

- [x] **Step 3: Reescribir `src/state/persistence.js`**
```js
import { defaultState } from './gameStore'

export const SAVE_KEY = 'mathquest-save-v1'
export const BACKUP_KEY = 'mathquest-save-v1-backup'

// Lleva cualquier save reconocido (v1 o v2) al estado v2 completo, rellenando
// defaults. Devuelve null si no es un objeto reconocible.
function migrate(data) {
  if (!data || typeof data !== 'object') return null
  const base = defaultState()
  if (data.version === 2) {
    return {
      ...base,
      ...data,
      cosmetics: { ...base.cosmetics, ...(data.cosmetics ?? {}) },
      streak: { ...base.streak, ...(data.streak ?? {}) },
      version: 2,
    }
  }
  if (data.version === 1) {
    return {
      ...base,
      xp: data.xp ?? 0,
      coins: data.coins ?? 0,
      stars: data.stars ?? {},
      completedLevels: data.completedLevels ?? [],
      version: 2,
    }
  }
  return null
}

function tryParse(raw) {
  if (!raw) return null
  try {
    return migrate(JSON.parse(raw))
  } catch {
    return null
  }
}

export function loadSave() {
  return tryParse(localStorage.getItem(SAVE_KEY)) ?? tryParse(localStorage.getItem(BACKUP_KEY))
}

export function persistSave(data) {
  try {
    const current = localStorage.getItem(SAVE_KEY)
    if (current !== null) localStorage.setItem(BACKUP_KEY, current)
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // localStorage lleno (QuotaExceededError) o no disponible (modo privado):
    // la partida sigue viva en memoria.
  }
}
```

- [x] **Step 4: Ejecutar — pasa**

Run: `npm test -- persistence`
Expected: PASS (migración + tests existentes).

- [x] **Step 5: Commit**
```bash
git add src/state/persistence.js src/state/__tests__/persistence.test.js
git commit -m "feat: migración de guardado v1 → v2 (rellena campos de gamificación)"
```

---

# CAPA B — Jefes

## Task 3: `buildBossPool` + campo `boss` en los 6 mundos + validación

**Files:**
- Modify: `src/engine/generators.js` (+ `buildBossPool`)
- Modify: `src/content/worlds/mundo{3,4,5,6,7,8}-*.jsx` (+ campo `boss`)
- Modify: `src/content/validateContent.js` (exigir `boss` bien formado)
- Test: `src/engine/__tests__/generators.test.js` (+ `buildBossPool`)
- Test: `src/content/__tests__/validateContent.test.js` (ya corre el contenido real; seguirá verde tras añadir bosses)

**Interfaces:**
- Consumes: `buildReto` (generators), `worlds`.
- Produces: `buildBossPool(world, pick, rng=Math.random) → question[]` (aplana `reto.factories` de todos los niveles del mundo y baraja `pick`). Cada `world.boss = { name, emoji, intro }`.

- [x] **Step 1: Escribir el test de `buildBossPool` (falla)**

Añadir a `src/engine/__tests__/generators.test.js`:
```js
import { buildBossPool } from '../generators'

describe('buildBossPool', () => {
  const world = {
    levels: [
      { reto: { factories: [() => ({ question: 'a', options: ['1','2','3','4'], correctAnswer: 0 })] } },
      { reto: { factories: [() => ({ question: 'b', options: ['5','6','7','8'], correctAnswer: 0 })] } },
    ],
  }
  it('agrega fábricas de todos los niveles y devuelve pick preguntas válidas', () => {
    const qs = buildBossPool(world, 2)
    expect(qs).toHaveLength(2)
    for (const q of qs) {
      expect(q.options).toHaveLength(4)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.correctAnswer).toBeLessThan(4)
    }
  })
  it('si pick excede el pool, devuelve todas las disponibles', () => {
    expect(buildBossPool(world, 10)).toHaveLength(2)
  })
})
```

- [x] **Step 2: Ejecutar — falla**

Run: `npm test -- generators`
Expected: FAIL (`buildBossPool` no existe).

- [x] **Step 3: Implementar `buildBossPool`**

Añadir al final de `src/engine/generators.js`:
```js
// Pila de preguntas del jefe: todas las fábricas de todos los niveles del mundo,
// barajadas. Reutiliza buildReto (que a su vez baraja opciones con shuffleOptions).
export function buildBossPool(world, pick, rng = Math.random) {
  const factories = world.levels.flatMap(l => l.reto.factories)
  return buildReto(factories, pick, rng)
}
```

- [x] **Step 4: Añadir el campo `boss` a cada mundo**

En cada archivo de mundo, añadir la propiedad `boss` al objeto exportado (junto a `description`, antes de `levels`). Valores (español, tono acorde a cada mundo):
- `mundo3-potencias.jsx`: `boss: { name: 'Ígneo, Señor del Magma', emoji: '🐲', intro: 'El volcán ruge: Ígneo pondrá a prueba todo lo que aprendiste sobre potencias y raíces.' },`
- `mundo4-algebra.jsx`: `boss: { name: 'El Guardián del Castillo', emoji: '🛡️', intro: 'Las puertas del castillo solo se abren para quien domine el álgebra.' },`
- `mundo5-sistemas.jsx`: `boss: { name: 'El Minotauro del Laberinto', emoji: '🐂', intro: 'Sin resolver sus sistemas, no hay salida del laberinto.' },`
- `mundo6-funciones.jsx`: `boss: { name: 'La IA de la Estación', emoji: '🛰️', intro: 'La estación exige trazar cada función sin error para autorizar el despegue.' },`
- `mundo7-geometria.jsx`: `boss: { name: 'El Coloso de la Cima', emoji: '🗿', intro: 'En la cumbre, el Coloso mide cada ángulo y cada lado de tu conocimiento.' },`
- `mundo8-datos.jsx`: `boss: { name: 'El Croupier del Azar', emoji: '🎩', intro: 'En la feria, el Croupier apuesta a que fallas una probabilidad. Demuéstrale que no.' },`

- [x] **Step 5: Extender `validateContent` para exigir `boss`**

En `src/content/validateContent.js`, dentro del bucle `for (const w of worlds)`, tras validar `w.slug` (antes del bucle de niveles), añadir:
```js
    if (!w.boss || typeof w.boss.name !== 'string' || typeof w.boss.emoji !== 'string')
      problems.push(`mundo ${w.id}: falta boss bien formado { name, emoji, intro }`)
```

- [x] **Step 6: Ejecutar — pasa**

Run: `npm test -- generators validateContent`
Expected: PASS (buildBossPool verde; validación real vacía con los 6 bosses).

- [x] **Step 7: Commit**
```bash
git add src/engine/generators.js src/engine/__tests__/generators.test.js src/content/worlds/ src/content/validateContent.js
git commit -m "feat: jefes en los 6 mundos (campo boss) + buildBossPool + validación"
```

---

## Task 4: `BossArena.jsx` + ruta + acceso en `WorldView` + estrella de maestría

**Files:**
- Create: `src/engine/BossArena.jsx`
- Modify: `src/App.jsx` (ruta `/mundo/:slug/jefe`)
- Modify: `src/engine/WorldView.jsx` (tarjeta de jefe desbloqueada al completar todos los niveles + ⭐ de maestría)
- Test: `src/__tests__/bossArena-integracion.test.jsx`

**Interfaces:**
- Consumes: `findWorld`, `buildBossPool`, `useGame`, constantes `COINS_BOSS`/`XP_BOSS`, `useDeviceTier`, `Celebration` (lazy).
- Produces: componente `BossArena` (ruta `/mundo/:slug/jefe`). Al ganar: `dispatch({ type: 'BOSS_DEFEATED', worldId, coins: COINS_BOSS, xp: XP_BOSS })` y (Capa D) un cofre.

- [x] **Step 1: Escribir el test de integración (falla)**

Create `src/__tests__/bossArena-integracion.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import BossArena from '../engine/BossArena'
import { findWorld } from '../content/worlds'

function renderBoss(slug) {
  return render(
    <GameProvider>
      <MemoryRouter initialEntries={[`/mundo/${slug}/jefe`]}>
        <Routes><Route path="/mundo/:slug/jefe" element={<BossArena />} /></Routes>
      </MemoryRouter>
    </GameProvider>,
  )
}

describe('integración: BossArena', () => {
  it('muestra el nombre del jefe del mundo', () => {
    renderBoss('volcan-potencias')
    expect(screen.getByText(new RegExp(findWorld('volcan-potencias').boss.name))).toBeTruthy()
  })
  it('mundo inexistente muestra fallback', () => {
    renderBoss('no-existe')
    expect(screen.getByText(/no encontrado/i)).toBeTruthy()
  })
})
```

- [x] **Step 2: Ejecutar — falla**

Run: `npm test -- bossArena`
Expected: FAIL (`BossArena` no existe).

- [x] **Step 3: Implementar `src/engine/BossArena.jsx`**
```jsx
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { buildBossPool } from './generators'
import { useGame, XP_PER_CORRECT, COINS_BOSS, XP_BOSS } from '../state/gameStore'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))
const BOSS_QUESTIONS = 8
const BOSS_LIVES = 5

export default function BossArena() {
  const { slug } = useParams()
  return <BossArenaView key={slug} />
}

function BossArenaView() {
  const { slug } = useParams()
  const { state, dispatch } = useGame()
  const world = findWorld(slug)

  const [phase, setPhase] = useState('intro')   // intro | pelea | derrota | victoria
  const [attempt, setAttempt] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [lives, setLives] = useState(BOSS_LIVES)
  const [hits, setHits] = useState(0)           // golpes acertados (vida del jefe)
  const [selected, setSelected] = useState(null)
  const { use3D } = useDeviceTier()

  const questions = useMemo(
    () => (world ? buildBossPool(world, BOSS_QUESTIONS) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, attempt],
  )

  if (!world) return <p className="text-center py-12">Jefe no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const allDone = world.levels.every(l => state.completedLevels.includes(`${world.id}/${l.id}`))
  const q = questions[qIndex]
  const bossHpPct = Math.round(((questions.length - hits) / questions.length) * 100)

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) {
      dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
      setHits(h => h + 1)
    } else {
      const remaining = lives - 1
      setLives(remaining)
      if (remaining <= 0) setPhase('derrota')
    }
  }

  const next = () => {
    setSelected(null)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      dispatch({ type: 'BOSS_DEFEATED', worldId: world.id, coins: COINS_BOSS, xp: XP_BOSS })
      setPhase('victoria')
    }
  }

  const retry = () => {
    setAttempt(a => a + 1)
    setQIndex(0); setLives(BOSS_LIVES); setHits(0); setSelected(null); setPhase('pelea')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <span className={`inline-block px-3 py-1 ${world.color} text-white rounded-full text-sm font-semibold mb-2`}>{world.emoji} {world.name}</span>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">{world.boss.emoji} {world.boss.name}</h1>
      </div>

      {phase === 'intro' && (
        <div className="glass rounded-[1.75rem] shadow-lg p-8 text-center">
          <p className="text-6xl mb-3">{world.boss.emoji}</p>
          <p className="text-gray-600 mb-6">{world.boss.intro}</p>
          {allDone ? (
            <button onClick={() => setPhase('pelea')} className="px-6 py-3 rounded-xl font-display bg-red-500 text-white font-bold">⚔️ ¡Enfrentar al jefe!</button>
          ) : (
            <div>
              <p className="text-sm text-amber-600 mb-3">Completa todos los niveles del mundo para desafiar al jefe.</p>
              <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
            </div>
          )}
        </div>
      )}

      {phase === 'pelea' && q && (
        <div className="glass rounded-[1.75rem] shadow-lg p-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>{world.boss.emoji} Vida del jefe</span>
            <span>{'❤️'.repeat(lives)}{'🖤'.repeat(BOSS_LIVES - lives)}</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
            <div className="h-full bg-red-500 transition-all" style={{ width: `${bossHpPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mb-2">Golpe {qIndex + 1} / {questions.length}</p>
          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = selected !== null && i === q.correctAnswer
              const isWrong = selected === i && i !== q.correctAnswer
              return (
                <button key={i} disabled={selected !== null} onClick={() => answer(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${isCorrect ? 'bg-green-100 border-green-400' : isWrong ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200 hover:bg-indigo-50'}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)})</span>{opt}
                </button>
              )
            })}
          </div>
          {selected !== null && selected !== q.correctAnswer && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
              💡 {q.hint}
              <p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={next} className="mt-2 px-3 py-1.5 rounded bg-yellow-400 text-white text-xs font-bold">Continuar</button>
            </div>
          )}
          {selected === q.correctAnswer && (
            <button onClick={next} className="mt-4 px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">🗡️ ¡Golpe! Continuar</button>
          )}
        </div>
      )}

      {phase === 'derrota' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-5xl mb-2">💥</p>
          <h2 className="font-display text-xl font-bold mb-2">El jefe te venció</h2>
          <p className="text-gray-500 mb-4 text-sm">El XP que ganaste se queda contigo. Inténtalo otra vez con preguntas nuevas.</p>
          <button onClick={retry} className="px-6 py-3 rounded-xl font-display bg-primary text-white font-bold">🔄 Reintentar</button>
        </div>
      )}

      {phase === 'victoria' && (
        <div className="relative text-center glass rounded-[1.75rem] shadow-lg p-8 overflow-hidden">
          {use3D && <div className="absolute inset-0 pointer-events-none" aria-hidden="true"><Suspense fallback={null}><Celebration /></Suspense></div>}
          <div className="relative">
            <p className="text-5xl mb-2">🏆</p>
            <h2 className="font-display text-xl font-bold mb-1">¡{world.boss.name} derrotado!</h2>
            <p className="text-sm text-gray-500 mb-4">+{XP_BOSS} XP · +{COINS_BOSS} 🪙 · ⭐ Maestría del mundo</p>
            <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
          </div>
        </div>
      )}
    </div>
  )
}
```
> Nota: el cofre por derrotar al jefe se engancha en la **Capa D** (Task 11). Aquí basta con `BOSS_DEFEATED`.

- [x] **Step 4: Añadir la ruta en `App.jsx`**

En `src/App.jsx`, importar `import BossArena from './engine/BossArena'` y añadir dentro de `<Route element={<Layout />}>`:
```jsx
        <Route path="/mundo/:slug/jefe" element={<BossArena />} />
```

- [x] **Step 5: Acceso al jefe + estrella de maestría en `WorldView`**

En `src/engine/WorldView.jsx`, tras el `<div className="space-y-3">…</div>` de niveles (antes del cierre del contenedor), añadir la sección de jefe. Calcular `allDone` y `mastered` con el estado:
```jsx
  const allLevelsDone = world.levels.every(l => state.completedLevels.includes(`${world.id}/${l.id}`))
  const mastered = state.bossDefeats.includes(world.id)
```
(colócalo junto a `playerLevel`, arriba). Y el bloque JSX tras la lista de niveles:
```jsx
      <div className="mt-4">
        {allLevelsDone ? (
          <Link to={`/mundo/${world.slug}/jefe`}
            className={`flex items-center gap-4 rounded-[1.5rem] p-4 shadow-md transition-all ${mastered ? 'bg-amber-50 border-2 border-amber-300' : 'glass hover:shadow-xl hover:-translate-y-0.5'}`}>
            <span className="text-3xl">{world.boss.emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Jefe: {world.boss.name}</p>
              <p className="text-sm text-amber-500">{mastered ? '⭐ Mundo dominado' : 'Derrota al jefe para dominar el mundo'}</p>
            </div>
            <span className="text-red-500 font-semibold text-sm">{mastered ? 'Rejugar →' : '¡Pelear! →'}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl border-2 border-gray-100 p-4 opacity-60">
            <span className="text-3xl">🔒</span>
            <p className="font-bold text-gray-400">Jefe: completa todos los niveles para desafiarlo</p>
          </div>
        )}
      </div>
```
Y en la cabecera de estrellas del mundo (opcional pero recomendado), mostrar la ⭐ de maestría junto al título si `mastered`.

- [x] **Step 6: Ejecutar — pasa**

Run: `npm test -- bossArena`
Expected: PASS. Luego `npm run build` sin errores.

- [x] **Step 7: Commit**
```bash
git add src/engine/BossArena.jsx src/App.jsx src/engine/WorldView.jsx src/__tests__/bossArena-integracion.test.jsx
git commit -m "feat: BossArena (jefes con barra de vida) + acceso y maestría en WorldView"
```

---

# CAPA C — Sidequests

## Task 5: `QuestPlayer` + esquema + índice + sidequests del Mundo 3

**Files:**
- Create: `src/content/quests/mundo3-quests.jsx`, `src/content/quests/index.js`
- Create: `src/engine/QuestPlayer.jsx`
- Modify: `src/App.jsx` (ruta `/mundo/:slug/quest/:questId`)
- Modify: `src/engine/WorldView.jsx` (lista de sidequests)
- Test: `src/content/quests/__tests__/mundo3-quests.test.js`, `src/__tests__/questPlayer-integracion.test.jsx`

**Interfaces:**
- Consumes: `staticQuestion`, `randInt`, `makeOptions` (generators); `useGame`, `COINS_QUEST`, `XP_QUEST`.
- Produces:
  - Esquema de quest: `{ id, title, emoji, npc, intro, outro, questions: factory[] }` (3-5 fábricas).
  - `questsForWorld(worldId) → quest[]`, `findQuest(worldId, questId) → quest | null` (quests/index.js).
  - `QuestPlayer` (ruta `/mundo/:slug/quest/:questId`). Al terminar: `dispatch({ type: 'QUEST_COMPLETED', questKey: 'mundoN/<id>', coins: COINS_QUEST, xp: XP_QUEST })`.

- [x] **Step 1: Escribir los tests de fábricas y de integración (fallan)**

Create `src/content/quests/__tests__/mundo3-quests.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { mundo3Quests } from '../mundo3-quests'

describe('sidequests del Mundo 3', () => {
  it('hay 2 quests bien formadas', () => {
    expect(mundo3Quests).toHaveLength(2)
    for (const q of mundo3Quests) {
      expect(q.id).toBeTruthy()
      expect(q.title).toBeTruthy()
      expect(q.intro).toBeTruthy()
      expect(q.questions.length).toBeGreaterThanOrEqual(3)
      expect(q.questions.length).toBeLessThanOrEqual(5)
    }
  })
  it('cada fábrica produce 4 opciones distintas y correctAnswer válido (300 tiradas)', () => {
    for (const quest of mundo3Quests) {
      for (const f of quest.questions) {
        for (let i = 0; i < 300; i++) {
          const q = f()
          expect(q.options).toHaveLength(4)
          expect(new Set(q.options).size).toBe(4)
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
          expect(q.correctAnswer).toBeLessThan(4)
        }
      }
    }
  })
})
```

Create `src/__tests__/questPlayer-integracion.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import QuestPlayer from '../engine/QuestPlayer'
import { findQuest } from '../content/quests'

describe('integración: QuestPlayer', () => {
  it('muestra la intro de una sidequest real del Mundo 3', () => {
    const quest = findQuest('mundo3', 'volcan-quest-1')
    render(
      <GameProvider>
        <MemoryRouter initialEntries={['/mundo/volcan-potencias/quest/volcan-quest-1']}>
          <Routes><Route path="/mundo/:slug/quest/:questId" element={<QuestPlayer />} /></Routes>
        </MemoryRouter>
      </GameProvider>,
    )
    expect(screen.getByText(new RegExp(quest.title))).toBeTruthy()
  })
})
```

- [x] **Step 2: Ejecutar — falla**

Run: `npm test -- mundo3-quests questPlayer`
Expected: FAIL (módulos no existen).

- [x] **Step 3: Escribir las sidequests del Mundo 3 (bespoke)**

Create `src/content/quests/mundo3-quests.jsx`. Fábricas bespoke con narrativa gamer (temas del Volcán: aproximación, potencias, notación científica, radicales). **Contenido completo:**
```jsx
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

// Quest 1 — el streamer que perdió sus stats (aproximación + potencias)
function viewsAproximadas(rng = Math.random) {
  const millones = randInt(rng, 2, 9)
  const miles = randInt(rng, 1, 9)
  const reales = millones * 1_000_000 + miles * 100_000 + randInt(rng, 0, 99_999)
  const aprox = `${millones}.${miles} millones`
  return {
    question: `El stream de RayoGamer marcó ${reales.toLocaleString('es')} visitas. ¿Cuál es la aproximación correcta a 1 decimal en millones?`,
    ...makeOptions(aprox, [`${millones}.${(miles + 1) % 10} millones`, `${millones + 1}.0 millones`, `${millones}.0 millones`]),
    hint: `Mira el dígito de las centenas de mil: ${miles} → primer decimal de millones.`,
    reminder: 'Para aproximar a millones con 1 decimal, el dígito de las centenas de mil es el decimal.',
  }
}
function danioPotenciado(rng = Math.random) {
  const base = randInt(rng, 2, 5)
  const exp = randInt(rng, 2, 3)
  const res = Math.pow(base, exp)
  return {
    question: `RayoGamer recupera un buff que multiplica su daño por ${base}^${exp}. ¿Por cuánto queda multiplicado?`,
    ...makeOptions(res, [base * exp, res + base, Math.pow(base, exp + 1)]),
    hint: `${base}^${exp} = ${base} multiplicado ${exp} veces.`,
    reminder: 'Potencia = multiplicación repetida.',
  }
}

// Quest 2 — reparar el servidor del clan (notación científica + radicales)
function usuariosNotacion(rng = Math.random) {
  const mant = randInt(rng, 2, 9)
  const exp = randInt(rng, 4, 7)
  const real = mant * Math.pow(10, exp)
  return {
    question: `El servidor del clan tiene ${real.toLocaleString('es')} cuentas. ¿Cómo se escribe en notación científica?`,
    ...makeOptions(`${mant} × 10^${exp}`, [`${mant} × 10^${exp + 1}`, `${mant}0 × 10^${exp - 1}`, `${mant} × 10^${exp - 1}`]),
    hint: 'La mantisa debe cumplir 1 ≤ a < 10; cuenta los ceros para el exponente.',
    reminder: 'a × 10^n con 1 ≤ a < 10.',
  }
}
function ladoBaseCuadrada(rng = Math.random) {
  const lado = randInt(rng, 4, 15)
  const area = lado * lado
  return {
    question: `La base cuadrada del servidor ocupa ${area} bloques². ¿Cuánto mide cada lado?`,
    ...makeOptions(lado, [area / 2, lado + 2, area]),
    hint: `√${area} = ? Busca el número que al cuadrado da ${area}.`,
    reminder: '√(lado²) = lado.',
  }
}

export const mundo3Quests = [
  {
    id: 'volcan-quest-1',
    title: 'Los stats perdidos de RayoGamer',
    emoji: '🎥',
    npc: 'RayoGamer',
    intro: 'RayoGamer perdió el panel de stats en pleno directo. ¡Ayúdalo a recalcularlos antes de que caiga el hype!',
    outro: '¡GG! RayoGamer recuperó sus stats y te manda un saludo en el próximo stream.',
    questions: [viewsAproximadas, danioPotenciado, staticQuestion({
      question: '¿Cuánto vale 7^0 (el multiplicador base cuando no hay buff)?',
      options: ['0', '1', '7', 'No existe'], correctAnswer: 1,
      hint: 'Cualquier número (≠0) elevado a la 0 es 1.', reminder: 'a^0 = 1 siempre.',
    })],
  },
  {
    id: 'volcan-quest-2',
    title: 'Reparar el servidor del clan',
    emoji: '🖥️',
    npc: 'Admin del clan',
    intro: 'El servidor del clan se cayó. El admin necesita tus cálculos de capacidad y dimensiones para levantarlo.',
    outro: '¡Servidor en línea! El clan te nombra ingeniero honorario.',
    questions: [usuariosNotacion, ladoBaseCuadrada, staticQuestion({
      question: 'Un cubo de almacenamiento tiene 27 unidades³ de volumen. ¿Cuánto mide su arista?',
      options: ['3', '9', '6', '27'], correctAnswer: 0,
      hint: '³√27 = ? Busca el número que multiplicado 3 veces da 27.', reminder: '³√a = b ⇔ b³ = a.',
    })],
  },
]
```

- [x] **Step 4: Crear el índice de quests**

Create `src/content/quests/index.js`:
```js
import { mundo3Quests } from './mundo3-quests'

// worldId ('mundoN') -> quest[]. Se irá ampliando en las Tasks 6-10.
export const questsByWorld = {
  mundo3: mundo3Quests,
}

export function questsForWorld(worldId) {
  return questsByWorld[worldId] ?? []
}

export function findQuest(worldId, questId) {
  return questsForWorld(worldId).find(q => q.id === questId) ?? null
}
```

- [x] **Step 5: Implementar `src/engine/QuestPlayer.jsx`**
```jsx
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { findQuest } from '../content/quests'
import { shuffleOptions } from './generators'
import { useGame, XP_PER_CORRECT, COINS_QUEST, XP_QUEST } from '../state/gameStore'

export default function QuestPlayer() {
  const { questId } = useParams()
  return <QuestPlayerView key={questId} />
}

function QuestPlayerView() {
  const { slug, questId } = useParams()
  const { state, dispatch } = useGame()
  const world = findWorld(slug)
  const quest = world ? findQuest(world.id, questId) : null

  const [phase, setPhase] = useState('intro')  // intro | preguntas | fin
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)

  const questions = useMemo(
    () => (quest ? quest.questions.map(f => shuffleOptions(f())) : []),
    [quest],
  )

  if (!world || !quest) return <p className="text-center py-12">Misión no encontrada. <Link className="text-primary underline" to="/">Volver</Link></p>

  const questKey = `${world.id}/${quest.id}`
  const yaCompletada = state.questsCompleted.includes(questKey)
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
  }
  const next = () => {
    setSelected(null)
    if (qIndex + 1 < questions.length) setQIndex(qIndex + 1)
    else {
      dispatch({ type: 'QUEST_COMPLETED', questKey, coins: COINS_QUEST, xp: XP_QUEST })
      setPhase('fin')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 ${world.color} text-white rounded-full text-sm font-semibold mb-2`}>{world.emoji} {world.name} · Sidequest</span>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">{quest.emoji} {quest.title}</h1>
      </div>

      {phase === 'intro' && (
        <div className="glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-gray-600 mb-6">{quest.intro}</p>
          {yaCompletada && <p className="text-xs text-amber-600 mb-3">Ya completaste esta misión: puedes rejugarla por práctica (sin monedas nuevas).</p>}
          <button onClick={() => setPhase('preguntas')} className="px-6 py-3 rounded-xl font-display bg-primary text-white font-bold">📋 Aceptar misión</button>
        </div>
      )}

      {phase === 'preguntas' && q && (
        <div className="glass rounded-[1.75rem] shadow-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Pregunta {qIndex + 1} / {questions.length} · sin vidas</p>
          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = selected !== null && i === q.correctAnswer
              const isWrong = selected === i && i !== q.correctAnswer
              return (
                <button key={i} disabled={selected !== null} onClick={() => answer(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${isCorrect ? 'bg-green-100 border-green-400' : isWrong ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200 hover:bg-indigo-50'}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)})</span>{opt}
                </button>
              )
            })}
          </div>
          {selected !== null && selected !== q.correctAnswer && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
              💡 {q.hint}<p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={() => setSelected(null)} className="mt-2 px-3 py-1.5 rounded bg-yellow-400 text-white text-xs font-bold">Intentar de nuevo</button>
            </div>
          )}
          {selected === q.correctAnswer && (
            <button onClick={next} className="mt-4 px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">✅ Continuar</button>
          )}
        </div>
      )}

      {phase === 'fin' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-4xl mb-2">🎁</p>
          <h2 className="font-display text-xl font-bold mb-1">¡Misión cumplida!</h2>
          <p className="text-gray-500 text-sm mb-2">{quest.outro}</p>
          {!yaCompletada && <p className="text-sm text-gray-500 mb-4">+{XP_QUEST} XP · +{COINS_QUEST} 🪙</p>}
          <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
        </div>
      )}
    </div>
  )
}
```

- [x] **Step 6: Ruta + acceso en `WorldView`**

En `src/App.jsx`: `import QuestPlayer from './engine/QuestPlayer'` y
```jsx
        <Route path="/mundo/:slug/quest/:questId" element={<QuestPlayer />} />
```
En `src/engine/WorldView.jsx`, importar `import { questsForWorld } from '../content/quests'`, calcular `const quests = questsForWorld(world.id)` y, tras la sección de jefe, añadir la lista (solo si hay quests):
```jsx
      {quests.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display font-bold text-gray-700 mb-2">📋 Sidequests</h2>
          <div className="space-y-2">
            {quests.map(quest => {
              const done = state.questsCompleted.includes(`${world.id}/${quest.id}`)
              return (
                <Link key={quest.id} to={`/mundo/${world.slug}/quest/${quest.id}`}
                  className="flex items-center gap-3 glass rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                  <span className="text-2xl">{quest.emoji}</span>
                  <span className="flex-1 font-semibold text-gray-800">{quest.title}</span>
                  <span className="text-sm">{done ? '✅' : '➕ XP'}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
```

- [x] **Step 7: Ejecutar — pasa; build**

Run: `npm test -- mundo3-quests questPlayer` → PASS. Luego `npm run build`.

- [x] **Step 8: Commit**
```bash
git add src/content/quests/ src/engine/QuestPlayer.jsx src/App.jsx src/engine/WorldView.jsx src/__tests__/questPlayer-integracion.test.jsx
git commit -m "feat: QuestPlayer + sidequests del Mundo 3 (bespoke) + acceso en WorldView"
```

---

## Tasks 6-10: Sidequests bespoke de los Mundos 4-8

> **Patrón común (aplica a cada task):** crear `src/content/quests/mundoN-quests.jsx` con **2 quests** (Mundo 8: 3 quests) siguiendo el esquema y estilo del Mundo 3; registrar el array en `src/content/quests/index.js` (`questsByWorld`); crear el test de fábricas `src/content/quests/__tests__/mundoN-quests.test.js` (copia del de Mundo 3 cambiando el import y el número de quests). Cada quest: `{ id, title, emoji, npc, intro, outro, questions: [3-5 fábricas] }`. Cada fábrica computacional usa `randInt` + `makeOptions` (correcto primero, distractores distintos); las conceptuales usan `staticQuestion`. **Criterio de aceptación:** el test de 300 tiradas pasa (4 opciones distintas, correctAnswer 0..3) y `npm run build` compila.

### Task 6: Mundo 4 — 🏰 Castillo del Álgebra (2 quests)
- [x] **Task 6 completa** — commit `6c96add`
**Files:** Create `src/content/quests/mundo4-quests.jsx`, `.../__tests__/mundo4-quests.test.js`; Modify `src/content/quests/index.js`.
**Contenido a redactar** (temas: MCD/MCM, fracciones algebraicas, ecuaciones lineales):
- `castillo-quest-1` — "El reparto del botín" (NPC: Maestro del gremio). Fábricas: (a) **MCD reparto** — repartir N espadas y M escudos en partes iguales → máximo de aventureros = MCD; (b) **MCM eventos** — dos hechizos que se recargan cada `a` y `b` turnos, ¿cuándo coinciden? = MCM; (c) estática: simplificar `(x²−9)/(x+3) = x−3`.
- `castillo-quest-2` — "La cuenta del herrero" (NPC: Herrero). Fábricas: (a) **ecuación lineal** — `a·x + b = c·x + d` → x (reusa el patrón `resolverLineal` del contenido del mundo); (b) estática: `2(x+4) = 3x − 2 → x = 10`; (c) estática de fracciones algebraicas `(2x+6)/(4x+8)`.

Ejemplo de una fábrica (MCD reparto) — patrón a seguir:
```jsx
const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y] } return x }
const COPRIMOS = [[2,3],[3,4],[2,5],[3,5],[4,5],[5,6]]
function repartoBotin(rng = Math.random) {
  const d = randInt(rng, 3, 9)
  const [m, n] = COPRIMOS[randInt(rng, 0, COPRIMOS.length - 1)]
  const a = d * m, b = d * n
  return {
    question: `El gremio reparte ${a} espadas y ${b} escudos en lotes iguales, sin que sobre nada. ¿Cuál es el máximo de aventureros que reciben lo mismo?`,
    ...makeOptions(d, [2 * d, d + 1, Math.min(m, n)]),
    hint: `Es el MCD de ${a} y ${b}.`, reminder: 'MCD = mayor divisor común de ambos.',
  }
}
```

### Task 7: Mundo 5 — 🌀 Laberinto de Sistemas (2 quests)
- [x] **Task 7 completa** — commit `eb95248`
**Files:** Create `src/content/quests/mundo5-quests.jsx`, test; Modify `index.js`.
**Contenido** (temas: cuadrantes, sistemas 2×2, Cramer/determinante):
- `laberinto-quest-1` — "El cruce de caminos" (NPC: Guía del laberinto). Fábricas: (a) **cuadrante de un punto** (I/II/III/IV según signos); (b) estática: dos rutas `100+3x` y `50+5x` se igualan en `x=25`; (c) estática: rectas paralelas → sistema sin solución.
- `laberinto-quest-2` — "La cerradura de Cramer" (NPC: Cerrajero). Fábricas: (a) **determinante** `D = a₁b₂ − a₂b₁` (garantizar `D ≠ 0` como en el contenido del mundo); (b) estática: `x = Dx/D`; (c) estática: `D = 0` significa sin solución única.

### Task 8: Mundo 6 — 🚀 Estación de Funciones (2 quests)
- [ ] **Task 8 completa** (contenido + test de 300 tiradas + `index.js` + build)
**Files:** Create `src/content/quests/mundo6-quests.jsx`, test; Modify `index.js`.
**Contenido** (temas: pendiente/ordenada, corte con ejes, vértice de parábola):
- `estacion-quest-1` — "Trayectoria de la nave" (NPC: Piloto). Fábricas: (a) **pendiente de** `f(x)=mx+b`; (b) **corte eje Y** `(0,b)`; (c) estática: `m<0 → la recta baja`.
- `estacion-quest-2` — "El salto del cohete" (NPC: Ingeniera). Fábricas: (a) **vértice de parábola** `f(x)=x²+bx+c → (h,k)` con `h=−b/2`, `k=f(h)`; (b) estática: `a<0 → abre hacia abajo`; (c) estática: discriminante `Δ<0 → sin raíces reales`.

### Task 9: Mundo 7 — ⛰️ Montañas de Geometría (2 quests)
- [ ] **Task 9 completa** (contenido + test de 300 tiradas + `index.js` + build)
**Files:** Create `src/content/quests/mundo7-quests.jsx`, test; Modify `index.js`.
**Contenido** (temas: Pitágoras, trigonometría 30/60, cilindro/prisma):
- `montanas-quest-1` — "La escalada segura" (NPC: Sherpa). Fábricas: (a) **hipotenusa** con tripletas pitagóricas `[3,4,5]…`; (b) **cateto faltante** `b=√(c²−a²)`; (c) estática: `√(9+16)=5` (no 7).
- `montanas-quest-2` — "El refugio cilíndrico" (NPC: Arquitecta). Fábricas: (a) **seno de 30°** → opuesto = hip/2 (usar hipotenusa par); (b) estática: área lateral del cilindro `2πrh` con valores fijos; (c) estática: caras de un prisma = `n+2`.

### Task 10: Mundo 8 — 🎡 Feria de Datos (3 quests) + validación de quests
- [ ] **Task 10 completa** (contenido + test + `index.js` + los 2 pasos de validación de abajo)
**Files:** Create `src/content/quests/mundo8-quests.jsx`, test; Modify `index.js`, `src/content/validateContent.js`, `src/content/__tests__/validateContent.test.js`.
**Contenido** (temas: media/mediana, conteo, permutaciones/combinaciones, probabilidad):
- `feria-quest-1` — "El promedio del squad" (NPC: Capitán). Fábricas: (a) **media** de un set generado (K/D del squad); (b) estática: mediana de una lista impar; (c) estática: rango = máx − mín.
- `feria-quest-2` — "Las combinaciones del cofre" (NPC: Mercader). Fábricas: (a) **permutaciones** `nPr` de valores pequeños; (b) **combinaciones** `nCr`; (c) estática: principio multiplicativo (menú de atuendos).
- `feria-quest-3` — "La ruleta de la feria" (NPC: Croupier). Fábricas: (a) **probabilidad básica** `casos favorables / casos totales` (fracción simplificada — cuidar 4 opciones distintas); (b) estática: probabilidad complementaria; (c) estática: evento seguro = 1.

**Además**, extender `validateContent` para exigir ≥1 quest por mundo (ahora que todos los mundos las tienen):
- [ ] En `src/content/validateContent.js`, añadir un parámetro opcional `questsByWorld` y, dentro del bucle de mundos, validar:
```js
    const qs = questsByWorld?.[w.id] ?? []
    if (qs.length === 0) problems.push(`mundo ${w.id}: sin sidequests (≥1 requerida)`)
    for (const quest of qs) {
      if (!Array.isArray(quest.questions) || quest.questions.length < 3 || quest.questions.length > 5)
        problems.push(`${w.id}/${quest.id ?? '¿?'}: la quest necesita 3-5 fábricas`)
      for (const [i, f] of (quest.questions ?? []).entries()) {
        let q; try { q = f() } catch (e) { problems.push(`${w.id}/${quest.id}: fábrica ${i} lanzó: ${e.message}`); continue }
        if (!Array.isArray(q?.options) || q.options.length !== 4 || new Set(q.options).size !== 4)
          problems.push(`${w.id}/${quest.id}: fábrica ${i} no tiene 4 opciones distintas`)
        if (!(q?.correctAnswer >= 0 && q?.correctAnswer < 4))
          problems.push(`${w.id}/${quest.id}: fábrica ${i} correctAnswer inválido`)
      }
    }
```
- [ ] En `src/content/__tests__/validateContent.test.js`, pasar el nuevo argumento en la llamada real:
```js
import { questsByWorld } from '../quests'
// …
const problems = validateContent({ worlds, widgets, worldMapNodes, questsByWorld })
```

**Commit de cada task 6-10:**
```bash
git add src/content/quests/ src/content/validateContent.js src/content/__tests__/validateContent.test.js
git commit -m "feat: sidequests bespoke del Mundo N (…)"
```
Cada una: `npm test -- mundoN-quests validateContent && npm run build` en verde antes del commit.

---

# CAPA D — Economía visible (cofres, tienda, pistas)

## Task 11: Cofres — `rollChest` + `Chest.jsx` + enganche en niveles y jefes

**Files:**
- Create: `src/engine/chests.js`, `src/engine/Chest.jsx`
- Modify: `src/engine/LevelPlayer.jsx` (cofre en primer completado), `src/engine/BossArena.jsx` (cofre al derrotar)
- Create: `src/content/shop.js` (catálogo compartido — cosméticos que el cofre puede soltar)
- Test: `src/engine/__tests__/chests.test.js`

**Interfaces:**
- Consumes: `SHOP_ITEMS` (catálogo, ver Task 12 — se crea aquí porque el cofre necesita la lista de cosméticos posibles), `state.cosmetics.owned`.
- Produces: `rollChest(state, rng=Math.random) → { type:'coins'|'hint'|'cosmetic', amount?, id? }` puro. `Chest.jsx` (componente con animación de apertura y `onCollect`).

- [ ] **Step 1: Crear el catálogo mínimo `content/shop.js`** (lo amplía la Task 12)
```js
// Catálogo de la tienda. Cada ítem: { id, slot, label, emoji, price }.
// slot: 'avatar' | 'frame' | 'title' | 'hint'.
export const SHOP_ITEMS = [
  { id: 'avatar-mago', slot: 'avatar', label: 'Mago', emoji: '🧙', price: 60 },
  { id: 'avatar-astro', slot: 'avatar', label: 'Astronauta', emoji: '🧑‍🚀', price: 60 },
  { id: 'avatar-dragon', slot: 'avatar', label: 'Dragón', emoji: '🐲', price: 90 },
  { id: 'avatar-robot', slot: 'avatar', label: 'Robot', emoji: '🤖', price: 90 },
  { id: 'avatar-ninja', slot: 'avatar', label: 'Ninja', emoji: '🥷', price: 120 },
  { id: 'avatar-corona', slot: 'avatar', label: 'Realeza', emoji: '👑', price: 150 },
  { id: 'frame-fuego', slot: 'frame', label: 'Marco de fuego', emoji: '🔥', price: 80 },
  { id: 'frame-hielo', slot: 'frame', label: 'Marco de hielo', emoji: '❄️', price: 80 },
  { id: 'frame-oro', slot: 'frame', label: 'Marco de oro', emoji: '🟡', price: 130 },
  { id: 'title-speedrunner', slot: 'title', label: 'Speedrunner', emoji: '⚡', price: 100 },
  { id: 'title-cazajefes', slot: 'title', label: 'Cazajefes', emoji: '🗡️', price: 100 },
  { id: 'title-leyenda', slot: 'title', label: 'Leyenda', emoji: '🌟', price: 150 },
  { id: 'hint-pack', slot: 'hint', label: 'Token de pista', emoji: '💡', price: 20, amount: 1 },
]

export const COSMETIC_ITEMS = SHOP_ITEMS.filter(i => i.slot !== 'hint')
```

- [ ] **Step 2: Escribir los tests de `rollChest` (fallan)**

Create `src/engine/__tests__/chests.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { rollChest } from '../chests'
import { defaultState } from '../../state/gameStore'
import { COSMETIC_ITEMS } from '../../content/shop'

describe('rollChest', () => {
  it('siempre devuelve una recompensa con forma válida', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(defaultState(), Math.random)
      expect(['coins', 'hint', 'cosmetic']).toContain(r.type)
      if (r.type === 'coins') expect(r.amount).toBeGreaterThan(0)
      if (r.type === 'hint') expect(r.amount).toBeGreaterThan(0)
      if (r.type === 'cosmetic') expect(COSMETIC_ITEMS.map(c => c.id)).toContain(r.id)
    }
  })
  it('nunca entrega un cosmético ya poseído', () => {
    const allOwned = { ...defaultState(), cosmetics: { ...defaultState().cosmetics, owned: COSMETIC_ITEMS.map(c => c.id) } }
    for (let i = 0; i < 500; i++) {
      const r = rollChest(allOwned, Math.random)
      expect(r.type).not.toBe('cosmetic') // sin cosméticos disponibles → cae a coins/hint
    }
  })
  it('con rng=0 cae en la primera franja (coins)', () => {
    expect(rollChest(defaultState(), () => 0).type).toBe('coins')
  })
})
```

- [ ] **Step 3: Ejecutar — falla**

Run: `npm test -- chests`
Expected: FAIL (`rollChest` no existe).

- [ ] **Step 4: Implementar `src/engine/chests.js`**
```js
import { COSMETIC_ITEMS } from '../content/shop'

// Tabla ponderada de cofre. Devuelve una recompensa aplicable por OPEN_CHEST.
// Franjas por defecto (rng en [0,1)): [0,0.55) coins, [0.55,0.8) hint, [0.8,1) cosmético
// (si no hay cosmético disponible, cae a coins). Puro y determinista dado rng.
export function rollChest(state, rng = Math.random) {
  const r = rng()
  if (r < 0.55) {
    const amount = 15 + Math.floor(rng() * 26) // 15..40
    return { type: 'coins', amount }
  }
  if (r < 0.8) {
    return { type: 'hint', amount: 1 }
  }
  const owned = new Set(state?.cosmetics?.owned ?? [])
  const disponibles = COSMETIC_ITEMS.filter(c => !owned.has(c.id))
  if (disponibles.length === 0) {
    return { type: 'coins', amount: 25 } // todo poseído → monedas de consolación
  }
  const pick = disponibles[Math.floor(rng() * disponibles.length)]
  return { type: 'cosmetic', id: pick.id }
}
```

- [ ] **Step 5: Implementar `src/engine/Chest.jsx`**
```jsx
import { useState } from 'react'
import { useGame } from '../state/gameStore'
import { rollChest } from './chests'
import { SHOP_ITEMS } from '../content/shop'

function describir(reward) {
  if (reward.type === 'coins') return `+${reward.amount} 🪙`
  if (reward.type === 'hint') return `+${reward.amount} 💡 token de pista`
  const item = SHOP_ITEMS.find(i => i.id === reward.id)
  return `¡Cosmético nuevo! ${item?.emoji ?? '🎁'} ${item?.label ?? reward.id}`
}

// Cofre sorpresa. Calcula la recompensa una vez al abrir y la despacha.
export default function Chest({ onDone }) {
  const { state, dispatch } = useGame()
  const [reward, setReward] = useState(null)

  const abrir = () => {
    const r = rollChest(state)
    dispatch({ type: 'OPEN_CHEST', reward: r })
    setReward(r)
  }

  return (
    <div className="text-center my-4">
      {reward === null ? (
        <button onClick={abrir} className="text-5xl hover:scale-110 transition-transform" aria-label="Abrir cofre sorpresa">📦</button>
      ) : (
        <div>
          <p className="text-4xl mb-1">🎁</p>
          <p className="font-display font-bold text-amber-600">{describir(reward)}</p>
          {onDone && <button onClick={onDone} className="mt-2 text-sm text-primary underline">Continuar</button>}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Enganchar el cofre en `LevelPlayer` (primer completado) y `BossArena` (victoria)**

En `LevelPlayer.jsx`, en la fase `completado`, mostrar `<Chest />` **solo si fue primer completado** — calcularlo antes de despachar: en `nextQuestion`, `const primeraVez = state.stars[levelKey] === undefined` y guardarlo en `setResult({ stars, coins, primeraVez })`. Importar `Chest` y renderizar dentro del bloque `phase === 'completado'`:
```jsx
{result?.primeraVez && <Chest />}
```
En `BossArena.jsx`, en la fase `victoria`, renderizar `<Chest />` (importado) bajo el texto de recompensas.

- [ ] **Step 7: Ejecutar — pasa; build**

Run: `npm test -- chests` → PASS. `npm run build`.

- [ ] **Step 8: Commit**
```bash
git add src/engine/chests.js src/engine/Chest.jsx src/content/shop.js src/engine/LevelPlayer.jsx src/engine/BossArena.jsx src/engine/__tests__/chests.test.js
git commit -m "feat: cofres sorpresa (rollChest + Chest) en niveles y jefes"
```

---

## Task 12: Tienda `/tienda`

**Files:**
- Create: `src/pages/Shop.jsx`
- Modify: `src/App.jsx` (ruta `/tienda`)
- (Catálogo `content/shop.js` ya creado en Task 11.)
- Test: `src/__tests__/shop-integracion.test.jsx`

**Interfaces:**
- Consumes: `SHOP_ITEMS` (shop), `useGame`, acción `BUY_ITEM`.
- Produces: página `Shop` (ruta `/tienda`).

- [ ] **Step 1: Test de integración (falla)**

Create `src/__tests__/shop-integracion.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Shop from '../pages/Shop'

describe('integración: Shop', () => {
  it('lista los ítems del catálogo con sus precios', () => {
    render(<GameProvider><MemoryRouter><Shop /></MemoryRouter></GameProvider>)
    expect(screen.getByText(/Tienda/i)).toBeTruthy()
    expect(screen.getAllByText(/🪙/).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Ejecutar — falla.** Run: `npm test -- shop-integracion` → FAIL.

- [ ] **Step 3: Implementar `src/pages/Shop.jsx`**
```jsx
import { Link } from 'react-router-dom'
import { useGame } from '../state/gameStore'
import { SHOP_ITEMS } from '../content/shop'

const SLOT_LABEL = { avatar: 'Avatares', frame: 'Marcos', title: 'Títulos', hint: 'Pistas' }

export default function Shop() {
  const { state, dispatch } = useGame()
  const grupos = ['avatar', 'frame', 'title', 'hint']

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-800">🛒 Tienda</h1>
        <span className="glass rounded-full px-4 py-2 font-display font-bold text-amber-600">{state.coins} 🪙</span>
      </div>
      {grupos.map(slot => (
        <div key={slot} className="mb-6">
          <h2 className="font-display font-bold text-gray-700 mb-2">{SLOT_LABEL[slot]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SHOP_ITEMS.filter(i => i.slot === slot).map(item => {
              const owned = slot !== 'hint' && state.cosmetics.owned.includes(item.id)
              const afford = state.coins >= item.price
              return (
                <div key={item.id} className="glass rounded-2xl p-3 text-center shadow-sm">
                  <p className="text-3xl mb-1">{item.emoji}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  {owned ? (
                    <p className="text-xs text-green-600 font-bold mt-1">✅ En tu colección</p>
                  ) : (
                    <button disabled={!afford} onClick={() => dispatch({ type: 'BUY_ITEM', item })}
                      className={`mt-2 w-full px-2 py-1.5 rounded-lg text-xs font-bold ${afford ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {item.price} 🪙
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <Link to="/perfil" className="text-sm text-primary underline">Equipar lo comprado en tu perfil →</Link>
    </div>
  )
}
```

- [ ] **Step 4: Ruta.** En `src/App.jsx`: `import Shop from './pages/Shop'` y `<Route path="/tienda" element={<Shop />} />`.

- [ ] **Step 5: Ejecutar — pasa; build.** `npm test -- shop-integracion` → PASS. `npm run build`.

- [ ] **Step 6: Commit**
```bash
git add src/pages/Shop.jsx src/App.jsx src/__tests__/shop-integracion.test.jsx
git commit -m "feat: tienda /tienda (compra de cosméticos y tokens de pista)"
```

---

## Task 13: Pistas compradas en reto y jefe

**Files:**
- Modify: `src/engine/LevelPlayer.jsx`, `src/engine/BossArena.jsx`

**Interfaces:**
- Consumes: `state.hints`, acción `USE_HINT`.
- Produces: botón "💡 Pedir pista (1 token)" antes de responder que revela `q.hint` gastando un token.

- [ ] **Step 1: Añadir estado local y botón en `LevelPlayer` (fase reto)**

En `LevelPlayerView`, añadir `const [hintShown, setHintShown] = useState(false)` y resetearlo en `nextQuestion`/`retry` (`setHintShown(false)`). En el bloque `phase === 'reto'`, encima de la lista de opciones, añadir:
```jsx
          {state.hints > 0 && !hintShown && selected === null && (
            <button onClick={() => { dispatch({ type: 'USE_HINT' }); setHintShown(true) }}
              className="mb-3 px-3 py-1.5 rounded-lg bg-yellow-100 border border-yellow-300 text-xs font-bold text-yellow-700">
              💡 Pedir pista ({state.hints} tokens)
            </button>
          )}
          {hintShown && selected === null && (
            <div className="mb-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">💡 {q.hint}</div>
          )}
```
Enlazar a la tienda cuando no hay tokens (texto pequeño): `{state.hints === 0 && <Link to="/tienda" className="text-xs text-primary underline">Consigue pistas en la tienda</Link>}` (importar `Link` si no está).

- [ ] **Step 2: Repetir el patrón en `BossArena` (fase pelea)** con el mismo bloque (usa el mismo `state.hints` / `USE_HINT` / `hintShown`).

- [ ] **Step 3: Verificar y build**

Run: `npm test` (nada debe romperse; no hay test nuevo — es UI). `npm run build`.

- [ ] **Step 4: Commit**
```bash
git add src/engine/LevelPlayer.jsx src/engine/BossArena.jsx
git commit -m "feat: pistas compradas (token) en retos y jefes"
```

---

# CAPA E — Logros

## Task 14: Definiciones de logros + motor `evaluateAchievements`

**Files:**
- Create: `src/content/achievements.js`, `src/state/achievements.js`
- Test: `src/state/__tests__/achievements.test.js`

**Interfaces:**
- Consumes: estado del juego, `worlds` (para logros por mundo), `questsByWorld`.
- Produces:
  - `ACHIEVEMENTS` — array de `{ id, name, emoji, description, secret?, check(state, event) }`.
  - `evaluateAchievements(state, event) → string[]` (ids recién desbloqueados, excluyendo los ya presentes en `state.achievements`).

- [ ] **Step 1: Escribir los tests (fallan)**

Create `src/state/__tests__/achievements.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { evaluateAchievements } from '../achievements'
import { defaultState } from '../gameStore'

describe('evaluateAchievements', () => {
  it('desbloquea "sin-dano" con el evento de reto sin fallos', () => {
    const ids = evaluateAchievements(defaultState(), { type: 'LEVEL_DONE', perfectLives: true })
    expect(ids).toContain('sin-dano')
  })
  it('desbloquea "cazajefes" tras el primer jefe', () => {
    const s = { ...defaultState(), bossDefeats: ['mundo3'] }
    expect(evaluateAchievements(s, { type: 'BOSS_DEFEATED' })).toContain('cazajefes')
  })
  it('no re-desbloquea lo que ya está en state.achievements', () => {
    const s = { ...defaultState(), bossDefeats: ['mundo3'], achievements: ['cazajefes'] }
    expect(evaluateAchievements(s, { type: 'BOSS_DEFEATED' })).not.toContain('cazajefes')
  })
  it('desbloquea hitos de racha por umbral', () => {
    const s = { ...defaultState(), streak: { count: 7, best: 7, lastDate: '2026-07-22' } }
    const ids = evaluateAchievements(s, { type: 'STREAK' })
    expect(ids).toContain('racha-3')
    expect(ids).toContain('racha-7')
  })
})
```

- [ ] **Step 2: Ejecutar — falla.** Run: `npm test -- achievements` → FAIL.

- [ ] **Step 3: Definir `src/content/achievements.js`**

Lista de ~18 logros. Cada `check(state, event)` devuelve boolean. Los dependientes de un suceso puntual usan `event`. **Contenido completo:**
```js
import { worlds } from './worlds'
import { questsByWorld } from './quests'
import { levelForXp } from '../state/xpCurve'

const worldLevelKeys = (w) => w.levels.map(l => `${w.id}/${l.id}`)
const allThreeStars = (state, w) => worldLevelKeys(w).every(k => (state.stars[k] ?? 0) === 3)
const allLevelsDone = (state, w) => worldLevelKeys(w).every(k => state.completedLevels.includes(k))
const allQuestsDone = (state, w) => (questsByWorld[w.id] ?? []).every(q => state.questsCompleted.includes(`${w.id}/${q.id}`))

export const ACHIEVEMENTS = [
  // Por nivel (dependen de event)
  { id: 'sin-dano', name: 'Sin daño', emoji: '🛡️', description: 'Completa un reto sin perder vidas.', check: (_s, e) => e?.type === 'LEVEL_DONE' && e.perfectLives },
  { id: 'speedrunner', name: 'Speedrunner', emoji: '⚡', description: 'Completa un reto en menos de 2 minutos.', check: (_s, e) => e?.type === 'LEVEL_DONE' && e.seconds != null && e.seconds < 120 },
  { id: 'perfeccionista', name: 'Perfeccionista', emoji: '💯', description: 'Consigue 3★ en un nivel.', check: (s) => Object.values(s.stars).some(v => v === 3) },
  // Por mundo
  { id: 'cazajefes', name: 'Cazajefes', emoji: '🗡️', description: 'Derrota a tu primer jefe.', check: (s) => s.bossDefeats.length >= 1 },
  { id: 'completionista', name: 'Completionista', emoji: '📋', description: 'Termina todas las sidequests de un mundo.', check: (s) => worlds.some(w => (questsByWorld[w.id]?.length ?? 0) > 0 && allQuestsDone(s, w)) },
  { id: 'new-game-plus', name: 'New Game+', emoji: '🌟', description: 'Consigue 3★ en todos los niveles de un mundo.', check: (s) => worlds.some(w => allThreeStars(s, w)) },
  { id: 'maestro-mundo', name: 'Maestro del Mundo', emoji: '👑', description: 'Domina un mundo: jefe + 3★ + todas sus quests.', check: (s) => worlds.some(w => s.bossDefeats.includes(w.id) && allThreeStars(s, w) && allQuestsDone(s, w)) },
  { id: 'todos-mundos', name: 'Conquistador', emoji: '🗺️', description: 'Derrota a los jefes de todos los mundos.', check: (s) => worlds.every(w => s.bossDefeats.includes(w.id)) },
  // Globales
  { id: 'racha-3', name: 'Racha de 3', emoji: '🔥', description: 'Juega 3 días seguidos.', check: (s) => s.streak.best >= 3 },
  { id: 'racha-7', name: 'Racha de 7', emoji: '🔥', description: 'Juega 7 días seguidos.', check: (s) => s.streak.best >= 7 },
  { id: 'racha-30', name: 'Racha de 30', emoji: '🔥', description: 'Juega 30 días seguidos.', check: (s) => s.streak.best >= 30 },
  { id: 'primera-compra', name: 'Primera compra', emoji: '🛍️', description: 'Compra tu primer artículo en la tienda.', check: (s) => s.cosmetics.owned.length > 1 },
  { id: 'coleccionista', name: 'Coleccionista', emoji: '🎨', description: 'Posee 5 cosméticos.', check: (s) => s.cosmetics.owned.length >= 5 },
  { id: 'nivel-5', name: 'Explorador experto', emoji: '🧭', description: 'Alcanza el nivel 5 de jugador.', check: (s) => levelForXp(s.xp) >= 5 },
  { id: 'nivel-10', name: 'Veterano', emoji: '🎖️', description: 'Alcanza el nivel 10 de jugador.', check: (s) => levelForXp(s.xp) >= 10 },
  // Secretos
  { id: 'fenix', name: 'Fénix', emoji: '🔥🐦', description: '???', secret: true, check: (_s, e) => e?.type === 'BOSS_DEFEATED' && e.livesLeft === 1 },
  { id: 'ahorrador', name: 'Ahorrador', emoji: '🐷', description: '???', secret: true, check: (s) => s.coins >= 500 },
  { id: 'madrugador', name: 'Búho nocturno', emoji: '🦉', description: '???', secret: true, check: (_s, e) => e?.type === 'STREAK' && e.hour != null && (e.hour < 6 || e.hour >= 23) },
]
```

- [ ] **Step 4: Motor `src/state/achievements.js`**
```js
import { ACHIEVEMENTS } from '../content/achievements'

// Devuelve los ids de logros que se cumplen ahora y no estaban ya desbloqueados.
export function evaluateAchievements(state, event) {
  const ya = new Set(state.achievements ?? [])
  const nuevos = []
  for (const a of ACHIEVEMENTS) {
    if (ya.has(a.id)) continue
    let ok = false
    try { ok = a.check(state, event) } catch { ok = false }
    if (ok) nuevos.push(a.id)
  }
  return nuevos
}
```

- [ ] **Step 5: Ejecutar — pasa.** Run: `npm test -- achievements` → PASS.

- [ ] **Step 6: Commit**
```bash
git add src/content/achievements.js src/state/achievements.js src/state/__tests__/achievements.test.js
git commit -m "feat: definición de logros + motor evaluateAchievements"
```

---

## Task 15: Toast de logro + wiring en `GameProvider` + página `/logros`

**Files:**
- Create: `src/components/Toast.jsx`, `src/pages/Achievements.jsx`
- Modify: `src/state/GameProvider.jsx` (evaluar logros tras cada dispatch relevante + cola de toasts)
- Modify: `src/App.jsx` (ruta `/logros`)
- Test: `src/__tests__/achievements-page.test.jsx`

**Interfaces:**
- Consumes: `evaluateAchievements`, `ACHIEVEMENTS`, `useGame`.
- Produces: `GameProvider` expone también `notify` opcional; los toasts de logro aparecen al desbloquear. Página `/logros` lista todos.

- [ ] **Step 1: Test de la página (falla)**

Create `src/__tests__/achievements-page.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Achievements from '../pages/Achievements'

describe('página /logros', () => {
  it('muestra el título y al menos un logro', () => {
    render(<GameProvider><MemoryRouter><Achievements /></MemoryRouter></GameProvider>)
    expect(screen.getByText(/Logros/i)).toBeTruthy()
    expect(screen.getByText(/Cazajefes/)).toBeTruthy()
  })
  it('los secretos bloqueados se muestran como ???', () => {
    render(<GameProvider><MemoryRouter><Achievements /></MemoryRouter></GameProvider>)
    expect(screen.getAllByText('???').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Ejecutar — falla.** Run: `npm test -- achievements-page` → FAIL.

- [ ] **Step 3: `src/pages/Achievements.jsx`**
```jsx
import { useGame } from '../state/gameStore'
import { ACHIEVEMENTS } from '../content/achievements'

export default function Achievements() {
  const { state } = useGame()
  const unlocked = new Set(state.achievements)
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-extrabold text-gray-800 mb-1">🎖️ Logros</h1>
      <p className="text-gray-500 mb-6">{unlocked.size} / {ACHIEVEMENTS.length} desbloqueados</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const got = unlocked.has(a.id)
          const oculto = a.secret && !got
          return (
            <div key={a.id} className={`flex items-center gap-3 rounded-2xl p-3 shadow-sm ${got ? 'glass' : 'bg-gray-50 border border-gray-100 opacity-70'}`}>
              <span className="text-3xl">{oculto ? '❓' : a.emoji}</span>
              <div>
                <p className="font-bold text-gray-800">{oculto ? 'Logro secreto' : a.name}</p>
                <p className="text-xs text-gray-500">{oculto ? '???' : a.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `src/components/Toast.jsx`** (aviso efímero, sin dependencias nuevas)
```jsx
import { useEffect } from 'react'

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])
  if (!toast) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 animate-[fadeIn_0.2s_ease]">
      <span className="text-2xl">{toast.emoji}</span>
      <div>
        <p className="text-xs text-gray-500">¡Logro desbloqueado!</p>
        <p className="font-display font-bold text-gray-800">{toast.name}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wiring en `GameProvider.jsx`** — envolver `dispatch` para evaluar logros y encolar toasts. Reescribir:
```jsx
import { useCallback, useEffect, useReducer, useState } from 'react'
import { loadSave, persistSave } from './persistence'
import { GameContext, gameReducer, initialState } from './gameStore'
import { evaluateAchievements } from './achievements'
import { ACHIEVEMENTS } from '../content/achievements'
import Toast from '../components/Toast'

export function GameProvider({ children }) {
  const [state, baseDispatch] = useReducer(gameReducer, undefined, () => loadSave() ?? initialState)
  const [toast, setToast] = useState(null)

  useEffect(() => { persistSave(state) }, [state])

  // dispatch envuelto: aplica la acción y, para acciones relevantes, evalúa logros
  // sobre el estado resultante y encola el primer logro nuevo como toast.
  const dispatch = useCallback((action) => {
    baseDispatch(action)
    const next = gameReducer(state, action)          // mismo cálculo puro para evaluar
    const event = achievementEvent(action)
    const nuevos = evaluateAchievements(next, event)
    if (nuevos.length > 0) {
      baseDispatch({ type: 'UNLOCK_ACHIEVEMENTS', ids: nuevos })
      const first = ACHIEVEMENTS.find(a => a.id === nuevos[0])
      if (first) setToast({ emoji: first.emoji, name: first.name })
    }
  }, [state])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </GameContext.Provider>
  )
}

// Traduce acciones del reducer al 'event' que consumen algunos checks de logros.
function achievementEvent(action) {
  if (action.type === 'BOSS_DEFEATED') return { type: 'BOSS_DEFEATED', livesLeft: action.livesLeft }
  if (action.type === 'TICK_STREAK') return { type: 'STREAK', hour: action.hour }
  if (action.type === 'LEVEL_COMPLETED') return { type: 'LEVEL_DONE', perfectLives: action.perfectLives, seconds: action.seconds }
  return { type: action.type }
}
```
> **Consumidores que deben enriquecer sus dispatch** (para los logros de evento):
> - `LevelPlayer` `LEVEL_COMPLETED`: añadir `perfectLives: lives === 3` y `seconds` (cronómetro, ver abajo).
> - `BossArena` `BOSS_DEFEATED`: añadir `livesLeft: lives`.
> - `GameProvider` `TICK_STREAK` (Task 16): añadir `hour` (hora local).

- [ ] **Step 6: Cronómetro ligero para "Speedrunner" en `LevelPlayer`** — al entrar en fase `reto` por primera vez, guardar `const startRef = useRef(null)` y setear `startRef.current = Date.now()` cuando `phase` pasa a `reto` (en el botón "¡Al reto!" y en `retry`). En `nextQuestion`, calcular `const seconds = startRef.current ? (Date.now() - startRef.current) / 1000 : null` y pasarlo en el dispatch junto a `perfectLives: lives === 3`.

- [ ] **Step 7: Ruta `/logros`** en `App.jsx`: `import Achievements from './pages/Achievements'` + `<Route path="/logros" element={<Achievements />} />`.

- [ ] **Step 8: Ejecutar — pasa; build.** `npm test` (todo) → PASS. `npm run build`.

- [ ] **Step 9: Commit**
```bash
git add src/components/Toast.jsx src/pages/Achievements.jsx src/state/GameProvider.jsx src/engine/LevelPlayer.jsx src/engine/BossArena.jsx src/App.jsx src/__tests__/achievements-page.test.jsx
git commit -m "feat: logros en vivo (toast + /logros) enganchados al dispatch"
```

---

# CAPA F — Racha + Perfil

## Task 16: Racha diaria — `streak.js` + `TICK_STREAK` diario + HUD 🔥

**Files:**
- Create: `src/state/streak.js`
- Modify: `src/state/GameProvider.jsx` (disparo diario al montar)
- Modify: `src/components/Hud.jsx` (indicador 🔥)
- Test: `src/state/__tests__/streak.test.js`

**Interfaces:**
- Produces:
  - `nextStreak(streak, today) → { count, best, lastDate }` puro (mismo día = sin cambio; día siguiente = +1; hueco = reset a 1; `best` = máx).
  - `dailyBonus(count) → number` (5→20 escalado, topado).
  - `todayStr(date=new Date()) → 'YYYY-MM-DD'` (fecha local).

- [ ] **Step 1: Tests (fallan)**

Create `src/state/__tests__/streak.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { nextStreak, dailyBonus, todayStr } from '../streak'

describe('nextStreak', () => {
  const base = { count: 3, best: 5, lastDate: '2026-07-21' }
  it('mismo día no cambia nada', () => {
    expect(nextStreak(base, '2026-07-21')).toEqual(base)
  })
  it('día siguiente incrementa', () => {
    expect(nextStreak(base, '2026-07-22')).toEqual({ count: 4, best: 5, lastDate: '2026-07-22' })
  })
  it('hueco reinicia a 1 y conserva best', () => {
    expect(nextStreak(base, '2026-07-25')).toEqual({ count: 1, best: 5, lastDate: '2026-07-25' })
  })
  it('desde estado inicial (lastDate null) arranca en 1', () => {
    expect(nextStreak({ count: 0, best: 0, lastDate: null }, '2026-07-22')).toEqual({ count: 1, best: 1, lastDate: '2026-07-22' })
  })
  it('supera best cuando la racha crece', () => {
    expect(nextStreak({ count: 5, best: 5, lastDate: '2026-07-21' }, '2026-07-22').best).toBe(6)
  })
})

describe('dailyBonus', () => {
  it('escala con la racha y se topa en 20', () => {
    expect(dailyBonus(1)).toBe(7)   // 5 + 1*2
    expect(dailyBonus(10)).toBe(20) // topado
  })
})

describe('todayStr', () => {
  it('formatea una fecha a YYYY-MM-DD local', () => {
    expect(todayStr(new Date(2026, 6, 5))).toBe('2026-07-05')
  })
})
```

- [ ] **Step 2: Ejecutar — falla.** Run: `npm test -- streak` → FAIL.

- [ ] **Step 3: Implementar `src/state/streak.js`**
```js
// Fecha local en 'YYYY-MM-DD' (sin depender de UTC).
export function todayStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function diffDays(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

// Racha pura. today = 'YYYY-MM-DD'.
export function nextStreak(streak, today) {
  if (streak.lastDate === today) return streak
  let count
  if (streak.lastDate && diffDays(streak.lastDate, today) === 1) count = streak.count + 1
  else count = 1
  return { count, best: Math.max(streak.best, count), lastDate: today }
}

// Bono diario en monedas: 5 + count*2, topado a 20.
export function dailyBonus(count) {
  return Math.min(20, 5 + count * 2)
}
```

- [ ] **Step 4: Disparo diario en `GameProvider`** — añadir un `useEffect` de montaje que, si `today !== state.streak.lastDate`, calcula la racha y despacha `TICK_STREAK`. Añadir dentro de `GameProvider` (usa `dispatch` envuelto para que los logros de racha se evalúen):
```jsx
import { nextStreak, dailyBonus, todayStr } from './streak'
// … dentro del componente, tras definir dispatch:
  useEffect(() => {
    const today = todayStr()
    if (state.streak.lastDate !== today) {
      const streak = nextStreak(state.streak, today)
      dispatch({ type: 'TICK_STREAK', streak, bonus: dailyBonus(streak.count), hour: new Date().getHours() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```
> Idempotente por día: al aplicarse, `lastDate` pasa a `today`, así que reabrir no vuelve a sumar. El `hour` alimenta el logro secreto "Búho nocturno".

- [ ] **Step 5: Indicador 🔥 en `Hud.jsx`** — mostrar la racha junto a las monedas cuando `state.streak.count > 0`:
```jsx
      {state.streak?.count > 0 && (
        <div className="flex items-center gap-1 font-display font-bold text-orange-500 glass rounded-full px-3 py-1 shrink-0">
          🔥<span className="tabular-nums">{state.streak.count}</span>
        </div>
      )}
```
(colócalo antes del bloque de monedas; usar `state` de `useGame`, ya disponible en `Hud`).

- [ ] **Step 6: Ejecutar — pasa; build.** `npm test` → PASS. `npm run build`.

- [ ] **Step 7: Commit**
```bash
git add src/state/streak.js src/state/GameProvider.jsx src/components/Hud.jsx src/state/__tests__/streak.test.js
git commit -m "feat: racha diaria (streak + bono) con indicador 🔥 en el HUD"
```

---

## Task 17: Perfil `/perfil` (equipar cosméticos) + accesos en el HUD

**Files:**
- Create: `src/pages/Profile.jsx`
- Modify: `src/App.jsx` (ruta `/perfil`), `src/components/Hud.jsx` (enlaces a perfil/tienda/logros)
- Test: `src/__tests__/profile-integracion.test.jsx`

**Interfaces:**
- Consumes: `useGame`, `hudStats`, `SHOP_ITEMS`/`COSMETIC_ITEMS`, `ACHIEVEMENTS`, `worlds`, acción `EQUIP_COSMETIC`, `titleForLevel`/`levelForXp`.
- Produces: página `Profile` (ruta `/perfil`).

- [ ] **Step 1: Test de integración (falla)**

Create `src/__tests__/profile-integracion.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Profile from '../pages/Profile'

describe('integración: Profile', () => {
  it('muestra nivel de jugador y stats', () => {
    render(<GameProvider><MemoryRouter><Profile /></MemoryRouter></GameProvider>)
    expect(screen.getByText(/Perfil/i)).toBeTruthy()
    expect(screen.getByText(/XP/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Ejecutar — falla.** Run: `npm test -- profile` → FAIL.

- [ ] **Step 3: Implementar `src/pages/Profile.jsx`**
```jsx
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import { titleForLevel } from '../state/xpCurve'
import { COSMETIC_ITEMS, SHOP_ITEMS } from '../content/shop'
import { ACHIEVEMENTS } from '../content/achievements'
import { worlds } from '../content/worlds'

const emojiDe = (id) => SHOP_ITEMS.find(i => i.id === id)?.emoji ?? '🙂'

export default function Profile() {
  const { state, dispatch } = useGame()
  const s = hudStats(state)
  const owned = new Set(state.cosmetics.owned)
  const equippedTitle = state.cosmetics.title
    ? SHOP_ITEMS.find(i => i.id === state.cosmetics.title)?.label
    : titleForLevel(s.level)

  const bySlot = (slot) => COSMETIC_ITEMS.filter(i => i.slot === slot && owned.has(i.id))

  const Selector = ({ slot, label, allowAuto }) => (
    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-2">
        {allowAuto && (
          <button onClick={() => dispatch({ type: 'EQUIP_COSMETIC', slot, id: null })}
            className={`px-3 py-1.5 rounded-lg text-sm border ${state.cosmetics[slot] === null ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'}`}>Automático</button>
        )}
        {bySlot(slot).map(i => (
          <button key={i.id} onClick={() => dispatch({ type: 'EQUIP_COSMETIC', slot, id: i.id })}
            className={`px-3 py-1.5 rounded-lg text-sm border ${state.cosmetics[slot] === i.id ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'}`}>{i.emoji} {i.label}</button>
        ))}
        {bySlot(slot).length === 0 && <span className="text-xs text-gray-400 self-center">Consíguelos en la tienda</span>}
      </div>
    </div>
  )

  const stat = (label, value) => (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="font-display font-bold text-lg text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">{emojiDe(state.cosmetics.avatar)}</span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-gray-800">Perfil</h1>
          <p className="text-primary font-bold">Nv. {s.level} · {equippedTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stat('XP', s.xp)}
        {stat('Estrellas', s.totalStars)}
        {stat('Monedas', `${s.coins} 🪙`)}
        {stat('Racha', `🔥 ${state.streak.count} (máx ${state.streak.best})`)}
        {stat('Mundos dominados', `${state.bossDefeats.length} / ${worlds.length}`)}
        {stat('Logros', `${state.achievements.length} / ${ACHIEVEMENTS.length}`)}
        {stat('Sidequests', state.questsCompleted.length)}
        {stat('Pistas', `${state.hints} 💡`)}
      </div>

      <h2 className="font-display font-bold text-gray-700 mb-2">Personalizar</h2>
      <Selector slot="avatar" label="Avatar" />
      <Selector slot="frame" label="Marco" allowAuto />
      <Selector slot="title" label="Título" allowAuto />
    </div>
  )
}
```

- [ ] **Step 4: Ruta + accesos en el HUD**

En `App.jsx`: `import Profile from './pages/Profile'` + `<Route path="/perfil" element={<Profile />} />`.
En `src/components/Hud.jsx`, añadir enlaces con iconos (usar `lucide-react`, ya dependencia; p. ej. `User`, `ShoppingBag`, `Award`) a `/perfil`, `/tienda`, `/logros` en el extremo derecho del HUD, con `shrink-0`:
```jsx
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/logros" title="Logros" className="text-gray-500 hover:text-primary"><Award size={18} /></Link>
        <Link to="/tienda" title="Tienda" className="text-gray-500 hover:text-primary"><ShoppingBag size={18} /></Link>
        <Link to="/perfil" title="Perfil" className="text-gray-500 hover:text-primary"><User size={18} /></Link>
      </div>
```
(añadir los imports de iconos a la línea de `lucide-react` existente.)

- [ ] **Step 5: Ejecutar — pasa; build.** `npm test -- profile` → PASS. `npm run build`.

- [ ] **Step 6: Commit**
```bash
git add src/pages/Profile.jsx src/App.jsx src/components/Hud.jsx src/__tests__/profile-integracion.test.jsx
git commit -m "feat: perfil /perfil (equipar cosméticos + stats) y accesos en el HUD"
```

---

## Task 18: Verificación final + cierre de Fase 3 en TODO

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Suite completa + build + lint**

Run:
```bash
npm test
npm run build
npm run lint
```
Expected: todos verdes (tests, build sin errores, lint limpio). Si `lint` marca imports no usados (p. ej. `COINS_PER_STAR` en `LevelPlayer`), limpiarlos.

- [ ] **Step 2: Marcar la Fase 3 como completa en `TODO.md`**

En `TODO.md`, marcar los 5 ítems de "Fase 3 — Gamificación completa" como `[x]`, cambiar el encabezado a `## Fase 3 — Gamificación completa ✅ (→ MVP jugable)`, marcar el follow-up de economía (línea 26) como `[x]` con nota "resuelto: pago por estrellas nuevas", y actualizar el párrafo de estado del principio para reflejar el MVP jugable. Añadir referencia al spec/plan de Fase 3.

- [ ] **Step 3: Commit final**
```bash
git add TODO.md
git commit -m "docs: cerrar Fase 3 (MVP jugable) — jefes, sidequests, logros, economía, racha y perfil"
```

---

## Verificación de cobertura del spec (self-review del plan)

| Sección del spec | Task(s) |
|---|---|
| §3.1 Estado v2 + acciones + `defaultState`/`coinsForCompletion` | Task 1 |
| §3.2 Migración v1→v2 | Task 2 |
| §4 Jefes (`buildBossPool`, `boss`, `BossArena`, acceso, maestría) | Tasks 3, 4 |
| §5 Sidequests (`QuestPlayer`, esquema, índice, contenido bespoke) | Tasks 5-10 |
| §6.1 Monedas (regla) | Task 1 |
| §6.2 Cofres (`rollChest`, `Chest`) | Task 11 |
| §6.3 Tienda (`shop.js`, `/tienda`) | Tasks 11 (catálogo), 12 |
| §6.4 Pistas compradas | Task 13 |
| §7 Logros (`achievements.js`, motor, toast, `/logros`) | Tasks 14, 15 |
| §8.1 Racha (`streak.js`, `TICK_STREAK`, HUD 🔥) | Task 16 |
| §8.2 Perfil (`/perfil`, equipar) | Task 17 |
| §9.2 Rutas nuevas | Tasks 4, 5, 12, 15, 17 |
| §9.3 HUD (racha + accesos) | Tasks 16, 17 |
| §9.4 Testing (pura + integración ligera) | En cada task |
| §9.4 `validateContent` (boss + ≥1 quest) | Tasks 3, 10 |
| §10 Manejo de errores (migración, compra sin monedas, cofre sin cosméticos) | Tasks 1, 2, 11 |

**Notas de consistencia de tipos:** `coinsForCompletion(previaRaw, nuevas)`, `rollChest(state, rng)`, `evaluateAchievements(state, event)`, `nextStreak(streak, today)`, `buildBossPool(world, pick, rng)`, `questsForWorld(worldId)`/`findQuest(worldId, questId)`, esquema de quest `{ id, title, emoji, npc, intro, outro, questions }` y de ítem `{ id, slot, label, emoji, price, amount? }` se usan idénticos en todas las tasks que los consumen.
