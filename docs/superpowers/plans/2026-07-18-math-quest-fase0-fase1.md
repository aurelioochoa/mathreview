# Math Quest — Plan de implementación Fases 0-1 (base segura + motor piloto)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Asegurar la base del repo (token, bugs, wart `Math`) y construir el motor de juego piloto con el Mundo 3 (🌋 Volcán de las Potencias ← Bloque 1) jugable con XP, vidas, estrellas y guardado en localStorage.

**Architecture:** SPA React existente; se añade un motor de juego data-driven (`content/` = datos, `engine/` = componentes genéricos, `widgets/` = interactivos extraídos, `state/` = store + persistencia). Las rutas viejas `/bloqueN` siguen vivas durante la migración; el mundo piloto convive en `/mundo/volcan-potencias`.

**Tech Stack:** Vite 8, React 19, react-router-dom 7, Tailwind 4, KaTeX, Vitest (nuevo, solo lógica).

## Global Constraints

- Todo el contenido visible al usuario en **español**.
- **Sin backend**: persistencia solo en localStorage, clave `mathquest-save-v1`, backup en `mathquest-save-v1-backup`.
- Working dir de todos los comandos: `/home/aurelio/Repos/repasomatematicaskids/math-review` (los commits se hacen desde ahí; rutas git relativas al repo raíz).
- El token de Cloudflare **nunca** puede aparecer en un archivo trackeado por git (ni en este plan ni en commits).
- No introducir TypeScript ni dependencias nuevas salvo `vitest` (dev).
- Tests solo de lógica pura (reducer, persistencia, curva XP, generadores) — nada de tests de componentes.
- Spec de referencia: `docs/superpowers/specs/2026-07-18-math-quest-design.md`.

---

## FASE 0 — Base segura

### Task 1: Sacar el token del túnel de Cloudflare a `.env`

**Files:**
- Modify: `math-review/docker-compose.yml:27-33` (servicio `tunnel`)
- Modify: `math-review/.gitignore`
- Create: `math-review/.env` (NO se commitea)

**Interfaces:**
- Consumes: token actual visible en `math-review/docker-compose.yml:29` (string que empieza con `eyJhIjoi…`)
- Produces: compose interpola `${TUNNEL_TOKEN}`; `.env` ignorado por git

- [ ] **Step 1: Crear `.env` con el token real**

Copia el valor del token que está hoy en `docker-compose.yml` línea 29 (todo el string después de `--token `) y crea `math-review/.env` (no escribas el token en ningún otro archivo):

```bash
# En math-review/ — sustituye <TOKEN> por el string eyJhIjoi… de docker-compose.yml:29
cat > .env <<'EOF'
TUNNEL_TOKEN=<TOKEN>
EOF
```

- [ ] **Step 2: Referenciar la variable en docker-compose.yml**

Reemplazar el servicio `tunnel` (líneas 27-33) por:

```yaml
  tunnel:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${TUNNEL_TOKEN}
    restart: unless-stopped
    network_mode: host
    depends_on:
      - app
```

(`cloudflared` lee `TUNNEL_TOKEN` del entorno de forma nativa; compose carga `.env` automáticamente.)

- [ ] **Step 3: Ignorar `.env` en git**

Añadir al final de `math-review/.gitignore`:

```
# Secretos locales
.env
```

- [ ] **Step 4: Verificar**

```bash
docker compose config | grep -A2 TUNNEL_TOKEN   # debe mostrar el token interpolado desde .env
git check-ignore -v .env                         # debe indicar la regla de .gitignore
grep -c "eyJhIjoi" docker-compose.yml            # debe dar 0
```

- [ ] **Step 5: Commit (solo compose y .gitignore)**

```bash
git add math-review/docker-compose.yml math-review/.gitignore
git commit -m "fix: mover token de Cloudflare Tunnel a .env"
```

Nota: el token nunca llegó a un commit, así que no hace falta reescribir historia. Aun así, considera rotarlo en el dashboard de Cloudflare (Zero Trust → Tunnels) por haber vivido en texto plano.

### Task 2: Commitear el trabajo pedagógico pendiente

**Files:**
- Add: `math-review/src/components/{MiniQuiz,WhySection,CommonMistakes,ExpressSummary,GlossaryTerm,BlockProgress}.jsx`, `math-review/cloudflare-config.yml`
- Add (modificados): `math-review/src/pages/*.jsx`, `math-review/Makefile`

**Interfaces:**
- Produces: working tree limpio; las Fases siguientes parten de aquí.

- [ ] **Step 1: Verificar que no hay secretos en lo que se va a commitear**

```bash
git diff HEAD -- math-review/ | grep -c "eyJhIjoi"        # 0
grep -c "eyJhIjoi" math-review/cloudflare-config.yml       # 0 (el UUID del túnel no es secreto)
```

- [ ] **Step 2: Verificar que la app compila**

```bash
npm run build
```
Expected: `vite build` termina sin errores (`✓ built in …`).

- [ ] **Step 3: Commit**

```bash
git add math-review/
git commit -m "feat: componentes pedagógicos (quizzes, resúmenes, glosario) y deploy por Cloudflare Tunnel"
git status --short   # sin cambios pendientes (salvo .env sin trackear... que no debe aparecer por gitignore)
```

### Task 3: Bug de contenido — MCM en horas, no minutos (Bloque 2)

**Files:**
- Modify: `math-review/src/pages/Bloque2.jsx:171`

- [ ] **Step 1: Corregir la unidad**

En la línea 171, el problema habla de eventos "cada 12 horas / cada 18 horas" pero la respuesta dice minutos. Cambiar:

```jsx
<strong>MCM(12, 18) = 36 minutos</strong>.
```
por:
```jsx
<strong>MCM(12, 18) = 36 horas</strong>.
```

(La línea 187 NO se toca: ese ejemplo del bus sí está en minutos y es consistente.)

- [ ] **Step 2: Verificar y commitear**

```bash
grep -n "36 horas\|36 minutos" src/pages/Bloque2.jsx   # línea 171 en horas; 187 en minutos
git add math-review/src/pages/Bloque2.jsx
git commit -m "fix: MCM de eventos en horas, no minutos (Bloque 2)"
```

### Task 4: Bug de contenido — pregunta de Cramer inconsistente (Bloque 3)

**Files:**
- Modify: `math-review/src/pages/Bloque3.jsx:270-284`

Para el sistema {2x+3y=12, 4x−3y=6}: D = a₁b₂ − a₂b₁ = (2)(−3) − (4)(3) = **−18**. Las opciones actuales no incluyen −18 y el hint se contradice. Además la pregunta 2 usa valores hipotéticos que no corresponden al sistema (los reales: Dx = (12)(−3) − (6)(3) = −54, Dy = (2)(6) − (4)(12) = −36, x = 3, y = 2 — coincide con el walkthrough de reducción del mismo archivo).

- [ ] **Step 1: Reemplazar las preguntas 1 y 2 del array `quizQuestions` de `MetodoCramer` (líneas 271-284)**

```jsx
    {
      question: "Para el sistema {2x + 3y = 12, 4x - 3y = 6}, ¿cuánto vale D?",
      options: ["6", "-18", "18", "-12"],
      correctAnswer: 1,
      hint: "D = a₁b₂ - a₂b₁ = (2)(-3) - (4)(3) = -6 - 12 = -18",
      reminder: "D = a₁b₂ - a₂b₁. Cruza y resta."
    },
    {
      question: "Para ese mismo sistema, D = -18 y Dx = -54. ¿Cuánto vale x?",
      options: ["2", "-2", "3", "-3"],
      correctAnswer: 2,
      hint: "x = Dx/D = -54/-18 = 3",
      reminder: "x = Dx/D, y = Dy/D. Divide los determinantes."
    },
```

(La pregunta 3 sobre D = 0 no se toca.)

- [ ] **Step 2: Verificar y commitear**

```bash
grep -n '"-18"' src/pages/Bloque3.jsx    # debe aparecer en las opciones
npm run build                             # sin errores
git add math-review/src/pages/Bloque3.jsx
git commit -m "fix: pregunta de Cramer con D=-18 correcto y x=3 coherente (Bloque 3)"
```

### Task 5: Renombrar `Math` → `MathTex` y eliminar `window.Math`

**Files:**
- Rename: `math-review/src/components/Math.jsx` → `math-review/src/components/MathTex.jsx`
- Modify: `math-review/src/pages/Bloque{1..6}.jsx` (imports, JSX, `window.Math`)

**Interfaces:**
- Produces: componente `MathTex` (`import MathTex from '../components/MathTex'`, uso `<MathTex expr={...} display />`). El global `Math` de JS vuelve a estar disponible — las tareas de Fase 1 dependen de esto.

- [ ] **Step 1: Renombrar el archivo y la función**

```bash
git mv src/components/Math.jsx src/components/MathTex.jsx
sed -i 's/export default function Math(/export default function MathTex(/' src/components/MathTex.jsx
```

- [ ] **Step 2: Actualizar los 6 Bloques (import, JSX y window.Math)**

```bash
sed -i "s|import Math from '../components/Math'|import MathTex from '../components/MathTex'|" src/pages/Bloque*.jsx
sed -i 's/<Math /<MathTex /g' src/pages/Bloque*.jsx
sed -i 's/window\.Math\./Math./g' src/pages/Bloque*.jsx
```

- [ ] **Step 3: Verificar que no queda nada**

```bash
grep -rn "window\.Math\|components/Math'\|<Math " src/   # sin resultados
npm run build                                             # sin errores
```

- [ ] **Step 4: Prueba visual rápida**

```bash
npm run dev
```
Abrir `http://localhost:5173/bloque1`: las fórmulas KaTeX se ven, la calculadora de potencias calcula (p.ej. base 2, exp 3 → 8).

- [ ] **Step 5: Commit**

```bash
git add -A math-review/src/
git commit -m "refactor: renombrar componente Math a MathTex y recuperar el global Math"
```

---

## FASE 1 — Motor piloto

### Task 6: Harness de tests (Vitest)

**Files:**
- Modify: `math-review/package.json` (script `test`)

- [ ] **Step 1: Instalar y configurar**

```bash
npm install -D vitest
```

Añadir a `"scripts"` en `package.json`:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 2: Smoke test**

Create `math-review/src/state/__tests__/smoke.test.js`:
```js
import { describe, it, expect } from 'vitest'

describe('harness', () => {
  it('runs', () => { expect(1 + 1).toBe(2) })
})
```

```bash
npm test
```
Expected: `1 passed`.

- [ ] **Step 3: Commit (y borrar el smoke test en el siguiente task al llegar tests reales)**

```bash
git add math-review/package.json math-review/package-lock.json math-review/src/state/__tests__/smoke.test.js
git commit -m "chore: añadir Vitest para tests de lógica"
```

### Task 7: Curva de XP y niveles de jugador

**Files:**
- Create: `math-review/src/state/xpCurve.js`
- Test: `math-review/src/state/__tests__/xpCurve.test.js` (reemplaza `smoke.test.js`)

**Interfaces:**
- Produces: `xpForLevel(level) → number` (XP total para alcanzar el nivel), `levelForXp(xp) → number`, `titleForLevel(level) → string`. Consumidas por gameStore (Task 9) y UI (Tasks 13-14).

- [ ] **Step 1: Escribir tests que fallan**

Create `math-review/src/state/__tests__/xpCurve.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { xpForLevel, levelForXp, titleForLevel } from '../xpCurve'

describe('xpCurve', () => {
  it('nivel 1 empieza en 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(levelForXp(0)).toBe(1)
  })
  it('umbrales triangulares: L2=100, L3=300, L4=600', () => {
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(300)
    expect(xpForLevel(4)).toBe(600)
  })
  it('levelForXp es inversa de xpForLevel', () => {
    expect(levelForXp(99)).toBe(1)
    expect(levelForXp(100)).toBe(2)
    expect(levelForXp(299)).toBe(2)
    expect(levelForXp(300)).toBe(3)
  })
  it('títulos: primero, intermedio y tope estable', () => {
    expect(titleForLevel(1)).toBe('Aprendiz')
    expect(titleForLevel(5)).toBe('Mago Numérico')
    expect(titleForLevel(8)).toBe('Gran Maestro Matemático')
    expect(titleForLevel(99)).toBe('Gran Maestro Matemático')
  })
})
```

```bash
rm src/state/__tests__/smoke.test.js
npm test
```
Expected: FAIL (`xpCurve` no existe).

- [ ] **Step 2: Implementar**

Create `math-review/src/state/xpCurve.js`:
```js
// XP total necesario para ALCANZAR un nivel: triangular * 100
// L1=0, L2=100, L3=300, L4=600, L5=1000, ...
export function xpForLevel(level) {
  return 100 * ((level - 1) * level) / 2
}

export function levelForXp(xp) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

const TITLES = [
  'Aprendiz',
  'Explorador',
  'Aventurero',
  'Cazador de Números',
  'Mago Numérico',
  'Héroe Algebraico',
  'Leyenda del Álgebra',
  'Gran Maestro Matemático',
]

export function titleForLevel(level) {
  return TITLES[Math.min(level, TITLES.length) - 1]
}
```

- [ ] **Step 3: Verificar y commitear**

```bash
npm test   # todos pasan
git add -A math-review/src/state/
git commit -m "feat: curva de XP y títulos de nivel de jugador"
```

### Task 8: Persistencia en localStorage con respaldo

**Files:**
- Create: `math-review/src/state/persistence.js`
- Test: `math-review/src/state/__tests__/persistence.test.js`

**Interfaces:**
- Produces: `SAVE_KEY = 'mathquest-save-v1'`, `BACKUP_KEY = 'mathquest-save-v1-backup'`, `loadSave() → object|null`, `persistSave(data) → void`. Consumidas por gameStore (Task 9).

- [ ] **Step 1: Tests que fallan**

Create `math-review/src/state/__tests__/persistence.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { loadSave, persistSave, SAVE_KEY, BACKUP_KEY } from '../persistence'

// Fake localStorage (Vitest corre en Node, sin DOM)
function fakeStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(() => { globalThis.localStorage = fakeStorage() })

describe('persistence', () => {
  it('devuelve null sin partida guardada', () => {
    expect(loadSave()).toBeNull()
  })
  it('guarda y carga ida y vuelta', () => {
    persistSave({ version: 1, xp: 50 })
    expect(loadSave()).toEqual({ version: 1, xp: 50 })
  })
  it('al guardar, la versión anterior pasa a backup', () => {
    persistSave({ version: 1, xp: 10 })
    persistSave({ version: 1, xp: 20 })
    expect(JSON.parse(localStorage.getItem(BACKUP_KEY)).xp).toBe(10)
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).xp).toBe(20)
  })
  it('si el guardado principal está corrupto, restaura el backup', () => {
    persistSave({ version: 1, xp: 10 })
    persistSave({ version: 1, xp: 20 })
    localStorage.setItem(SAVE_KEY, '{corrupto!!!')
    expect(loadSave()).toEqual({ version: 1, xp: 10 })
  })
  it('si todo está corrupto, devuelve null', () => {
    localStorage.setItem(SAVE_KEY, '{x')
    localStorage.setItem(BACKUP_KEY, '{y')
    expect(loadSave()).toBeNull()
  })
})
```

```bash
npm test
```
Expected: FAIL (`persistence` no existe).

- [ ] **Step 2: Implementar**

Create `math-review/src/state/persistence.js`:
```js
export const SAVE_KEY = 'mathquest-save-v1'
export const BACKUP_KEY = 'mathquest-save-v1-backup'

function tryParse(raw) {
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && data.version === 1 ? data : null
  } catch {
    return null
  }
}

export function loadSave() {
  const main = tryParse(localStorage.getItem(SAVE_KEY))
  if (main) return main
  return tryParse(localStorage.getItem(BACKUP_KEY))
}

export function persistSave(data) {
  const current = localStorage.getItem(SAVE_KEY)
  if (current !== null) localStorage.setItem(BACKUP_KEY, current)
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}
```

- [ ] **Step 3: Verificar y commitear**

```bash
npm test
git add -A math-review/src/state/
git commit -m "feat: persistencia de partida en localStorage con respaldo"
```

### Task 9: gameStore (reducer + provider)

**Files:**
- Create: `math-review/src/state/gameStore.jsx`
- Test: `math-review/src/state/__tests__/gameStore.test.js`

**Interfaces:**
- Consumes: `loadSave`/`persistSave` (Task 8), `levelForXp` (Task 7).
- Produces:
  - `initialState = { version: 1, xp: 0, coins: 0, stars: {}, completedLevels: [] }` (stars: objeto `levelKey → 1..3`; levelKey con forma `'mundo3/aproximacion'`)
  - `gameReducer(state, action)` con acciones: `{type:'ANSWER_CORRECT', xp}`, `{type:'LEVEL_COMPLETED', levelKey, stars, xp, coins}`
  - `<GameProvider>` y hook `useGame() → { state, dispatch }`
  - Constantes: `XP_PER_CORRECT = 10`, `XP_LEVEL_COMPLETE = 50`, `COINS_PER_STAR = 10`

- [ ] **Step 1: Tests del reducer que fallan**

Create `math-review/src/state/__tests__/gameStore.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../gameStore'

describe('gameReducer', () => {
  it('ANSWER_CORRECT suma XP', () => {
    const s = gameReducer(initialState, { type: 'ANSWER_CORRECT', xp: 10 })
    expect(s.xp).toBe(10)
  })
  it('LEVEL_COMPLETED registra nivel, estrellas, XP y monedas', () => {
    const s = gameReducer(initialState, {
      type: 'LEVEL_COMPLETED', levelKey: 'mundo3/aproximacion', stars: 2, xp: 50, coins: 20,
    })
    expect(s.completedLevels).toContain('mundo3/aproximacion')
    expect(s.stars['mundo3/aproximacion']).toBe(2)
    expect(s.xp).toBe(50)
    expect(s.coins).toBe(20)
  })
  it('rejugar nunca baja estrellas y no duplica completedLevels', () => {
    let s = gameReducer(initialState, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 3, xp: 0, coins: 0 })
    s = gameReducer(s, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 1, xp: 0, coins: 0 })
    expect(s.stars.k).toBe(3)
    expect(s.completedLevels.filter(x => x === 'k')).toHaveLength(1)
  })
  it('acción desconocida devuelve el mismo estado', () => {
    expect(gameReducer(initialState, { type: 'NOPE' })).toBe(initialState)
  })
})
```

```bash
npm test
```
Expected: FAIL.

- [ ] **Step 2: Implementar**

Create `math-review/src/state/gameStore.jsx`:
```jsx
import { createContext, useContext, useEffect, useReducer } from 'react'
import { loadSave, persistSave } from './persistence'

export const XP_PER_CORRECT = 10
export const XP_LEVEL_COMPLETE = 50
export const COINS_PER_STAR = 10

export const initialState = {
  version: 1,
  xp: 0,
  coins: 0,
  stars: {},            // levelKey -> 1..3
  completedLevels: [],  // levelKey[]
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT':
      return { ...state, xp: state.xp + action.xp }
    case 'LEVEL_COMPLETED': {
      const prev = state.stars[action.levelKey] ?? 0
      return {
        ...state,
        xp: state.xp + action.xp,
        coins: state.coins + action.coins,
        stars: { ...state.stars, [action.levelKey]: Math.max(prev, action.stars) },
        completedLevels: state.completedLevels.includes(action.levelKey)
          ? state.completedLevels
          : [...state.completedLevels, action.levelKey],
      }
    }
    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadSave() ?? initialState)
  useEffect(() => { persistSave(state) }, [state])
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>')
  return ctx
}
```

- [ ] **Step 3: Montar el provider en `main.jsx`**

Modify `math-review/src/main.jsx` — envolver `<App />` con `<GameProvider>`:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GameProvider } from './state/gameStore'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </BrowserRouter>
  </StrictMode>,
)
```
(Ajustar a la estructura real del archivo si difiere; lo esencial: `GameProvider` dentro de `BrowserRouter`, envolviendo `App`.)

- [ ] **Step 4: Verificar y commitear**

```bash
npm test          # reducer pasa
npm run build     # compila
git add -A math-review/src/
git commit -m "feat: gameStore con XP, monedas, estrellas y persistencia automática"
```

### Task 10: Generadores de preguntas

**Files:**
- Create: `math-review/src/engine/generators.js`
- Test: `math-review/src/engine/__tests__/generators.test.js`

**Interfaces:**
- Produces:
  - `staticQuestion(q) → () => q` — envuelve una pregunta fija `{question, options[4], correctAnswer, hint, reminder}`
  - `randInt(rng, min, max) → number` (inclusive)
  - `buildReto(factories, pick, rng?) → question[]` — elige `pick` fábricas sin repetición y las ejecuta
  Consumidas por el contenido (Task 12) y LevelPlayer (Task 13).

- [ ] **Step 1: Tests que fallan**

Create `math-review/src/engine/__tests__/generators.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { staticQuestion, randInt, buildReto } from '../generators'

const q = { question: '¿2+2?', options: ['3', '4', '5', '6'], correctAnswer: 1, hint: 'h', reminder: 'r' }

describe('generators', () => {
  it('staticQuestion devuelve la misma pregunta', () => {
    expect(staticQuestion(q)()).toEqual(q)
  })
  it('randInt respeta límites inclusivos', () => {
    expect(randInt(() => 0, 3, 7)).toBe(3)
    expect(randInt(() => 0.999999, 3, 7)).toBe(7)
  })
  it('buildReto elige N sin repetir y ejecuta las fábricas', () => {
    const factories = [1, 2, 3, 4, 5].map(n =>
      staticQuestion({ ...q, question: `Q${n}` }))
    const reto = buildReto(factories, 3, () => 0.5)
    expect(reto).toHaveLength(3)
    const texts = reto.map(x => x.question)
    expect(new Set(texts).size).toBe(3)
    reto.forEach(x => {
      expect(x.options).toHaveLength(4)
      expect(x.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(x.correctAnswer).toBeLessThan(4)
    })
  })
  it('si pick >= fábricas, devuelve todas', () => {
    const factories = [q, q].map(staticQuestion)
    expect(buildReto(factories, 5)).toHaveLength(2)
  })
})
```

```bash
npm test
```
Expected: FAIL.

- [ ] **Step 2: Implementar**

Create `math-review/src/engine/generators.js`:
```js
// Una "fábrica de pregunta" es () => ({question, options[4], correctAnswer, hint, reminder}).
// Las preguntas parametrizadas son fábricas que generan valores nuevos en cada llamada;
// las fijas se envuelven con staticQuestion. Así rejugar un nivel = práctica real.

export function staticQuestion(q) {
  return () => q
}

export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

export function buildReto(factories, pick, rng = Math.random) {
  const pool = [...factories]
  // Fisher-Yates parcial
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(pick, pool.length)).map(f => f())
}
```

- [ ] **Step 3: Verificar y commitear**

```bash
npm test
git add -A math-review/src/engine/
git commit -m "feat: generadores de preguntas (fábricas, selección aleatoria de reto)"
```

### Task 11: Extraer los 4 widgets del Bloque 1 a `src/widgets/`

**Files:**
- Create: `math-review/src/widgets/AproximacionExplorer.jsx`, `PotenciaCalculadora.jsx`, `NotacionConversor.jsx`, `RaizCalculadora.jsx`, `index.js`
- Modify: `math-review/src/pages/Bloque1.jsx` (usa los widgets extraídos)

**Interfaces:**
- Produces: registro `widgets` en `src/widgets/index.js`: `{ 'aproximacion-explorer': …, 'potencia-calculadora': …, 'notacion-conversor': …, 'raiz-calculadora': … }`. Cada widget es un componente sin props obligatorias, autocontenido (estado propio). Consumido por LevelPlayer (Task 13) vía id.

- [ ] **Step 1: Crear los 4 widgets extrayendo el JSX de los `InteractiveBox` de Bloque1.jsx**

Cada widget = el contenido interno del `InteractiveBox` correspondiente de `Bloque1.jsx` (tras Task 5 ya usan `Math` global y `MathTex`), envuelto en su propio componente. Ejemplo completo del primero — los otros tres siguen exactamente el mismo patrón de extracción literal:

Create `math-review/src/widgets/AproximacionExplorer.jsx` — copiar de `Bloque1.jsx` el estado `numero`/`num`, las funciones `truncar`/`redondear` (líneas 13-23) y el JSX interno del `InteractiveBox` "Prueba la aproximación" (líneas 87-122):

```jsx
import { useState } from 'react'

export default function AproximacionExplorer() {
  const [numero, setNumero] = useState('3.14159265')
  const num = parseFloat(numero) || 0

  const truncar = (n, dec) => {
    const factor = Math.pow(10, dec)
    return (n >= 0 ? 1 : -1) * (Math.floor(Math.abs(n) * factor) / factor)
  }
  const redondear = (n, dec) => {
    const factor = Math.pow(10, dec)
    return Math.round(n * factor) / factor
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Escribe un número decimal:</label>
      <input
        type="text"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-lg font-mono focus:ring-2 focus:ring-amber-400 outline-none"
      />
      {!isNaN(num) && num !== 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-amber-100">
                <th className="px-3 py-2 text-left">Decimales</th>
                <th className="px-3 py-2 text-left">Truncado</th>
                <th className="px-3 py-2 text-left">Redondeado</th>
                <th className="px-3 py-2 text-left">Error (truncar)</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map(d => {
                const t = truncar(num, d)
                const r = redondear(num, d)
                const err = Math.abs(num - t)
                return (
                  <tr key={d} className="border-t border-amber-100">
                    <td className="px-3 py-2 font-mono">{d}</td>
                    <td className="px-3 py-2 font-mono">{t.toFixed(d)}</td>
                    <td className="px-3 py-2 font-mono">{r.toFixed(d)}</td>
                    <td className="px-3 py-2 font-mono text-red-600">{err.toFixed(d + 2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

Del mismo modo:
- `PotenciaCalculadora.jsx` ← estado `base`/`exp` + JSX del `InteractiveBox` "Calculadora de potencias…" (Bloque1.jsx líneas 131-134 y 196-227; incluye los `<MathTex …>` — importar `MathTex from '../components/MathTex'`).
- `NotacionConversor.jsx` ← `decimal` + `convertir` + JSX del `InteractiveBox` "Convertidor…" (líneas 235-245 y 308-327; importa `MathTex`).
- `RaizCalculadora.jsx` ← `radicando`/`indice`/`resultado` + JSX del `InteractiveBox` "Calculadora: áreas de bases en Minecraft" (líneas 335-338 y 400-437; importa `MathTex`).

- [ ] **Step 2: Registro**

Create `math-review/src/widgets/index.js`:
```js
import AproximacionExplorer from './AproximacionExplorer'
import PotenciaCalculadora from './PotenciaCalculadora'
import NotacionConversor from './NotacionConversor'
import RaizCalculadora from './RaizCalculadora'

export const widgets = {
  'aproximacion-explorer': AproximacionExplorer,
  'potencia-calculadora': PotenciaCalculadora,
  'notacion-conversor': NotacionConversor,
  'raiz-calculadora': RaizCalculadora,
}
```

- [ ] **Step 3: Bloque1.jsx usa los widgets extraídos (sin duplicar código)**

En cada sección de `Bloque1.jsx`, sustituir el contenido interno del `InteractiveBox` por el widget, y borrar el estado/funciones que se movieron. Ejemplo (AproximacionSection):

```jsx
<InteractiveBox title="Prueba la aproximación">
  <AproximacionExplorer />
</InteractiveBox>
```
con `import AproximacionExplorer from '../widgets/AproximacionExplorer'` (ídem los otros tres).

- [ ] **Step 4: Verificar y commitear**

```bash
npm run build
npm run dev   # /bloque1: los 4 interactivos funcionan igual que antes
git add -A math-review/src/
git commit -m "refactor: extraer widgets interactivos del Bloque 1 a src/widgets con registro"
```

### Task 12: Contenido del Mundo 3 (🌋 Volcán de las Potencias)

**Files:**
- Create: `math-review/src/content/worlds/mundo3-potencias.jsx`
- Create: `math-review/src/content/worlds/index.js`

**Interfaces:**
- Consumes: `staticQuestion`, `randInt` (Task 10); `MathTex`, `GlossaryTerm`, widgets ids (Task 11).
- Produces: `export const mundo3` con la forma:
  ```
  {
    id: 'mundo3', slug: 'volcan-potencias', name: 'Volcán de las Potencias',
    emoji: '🌋', color: 'bg-bloque1',
    levels: [{
      id, title, icon,
      briefing: [ {type:'why', body:<JSX>} | {type:'content', body:<JSX>}
                | {type:'mistakes', items:[string]} | {type:'widget', widgetId, title} ],
      reto: { factories: [() => question], pick: 3 },
    }],
  }
  ```
  y `export const worlds = [mundo3]` + `export function findWorld(slug)` en `index.js`. Consumido por Tasks 13-14.

- [ ] **Step 1: Crear el archivo de contenido con los 4 niveles**

El briefing de cada nivel se arma con el contenido pedagógico de la sección equivalente de `Bloque1.jsx` (WhySection → `type:'why'`, prosa y cajas de fórmulas → `type:'content'`, CommonMistakes → `type:'mistakes'`, InteractiveBox → `type:'widget'`). Las 12 preguntas del quiz se migran como `staticQuestion(...)` **copiadas literalmente de Bloque1.jsx** (líneas 25-47, 136-158, 247-269, 340-362), y se añaden 2 fábricas parametrizadas para probar el mecanismo. Esqueleto completo con el nivel 2 (Potenciación) desarrollado del todo; los niveles 1, 3 y 4 siguen el mismo patrón con su contenido correspondiente:

Create `math-review/src/content/worlds/mundo3-potencias.jsx`:
```jsx
import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt } from '../../engine/generators'

// ——— Fábricas parametrizadas (ejemplo del mecanismo; el resto son estáticas) ———
function potenciaDanio() {
  const base = randInt(Math.random, 2, 5)
  const exp = randInt(Math.random, 2, 3)
  const res = Math.pow(base, exp)
  const opts = [res, res + base, base * exp, Math.pow(base, exp + 1)]
    .map(String)
  return {
    question: `En tu juego favorito, un potenciador multiplica el daño por ${base} elevado a ${exp}. ¿Cuál es el multiplicador total?`,
    options: opts,
    correctAnswer: 0,
    hint: `${base}^${exp} = ${base} multiplicado por sí mismo ${exp} veces`,
    reminder: 'Potencia = multiplicación repetida. aⁿ = a multiplicado n veces.',
  }
}

function raizCuadradaMinecraft() {
  const lado = randInt(Math.random, 5, 15)
  const area = lado * lado
  const opts = [String(lado), String(lado + 2), String(Math.round(area / 2)), String(area)]
  return {
    question: `Tu base cuadrada en Minecraft mide ${area} bloques². ¿Cuántos bloques mide cada lado?`,
    options: opts,
    correctAnswer: 0,
    hint: `√${area} = ? Busca el número que multiplicado por sí mismo da ${area}`,
    reminder: 'La raíz cuadrada es la inversa del cuadrado: si x² = a, entonces √a = x',
  }
}

export const mundo3 = {
  id: 'mundo3',
  slug: 'volcan-potencias',
  name: 'Volcán de las Potencias',
  emoji: '🌋',
  color: 'bg-bloque1',
  description: 'Aproximación, potencias, notación científica y radicales',
  levels: [
    {
      id: 'aproximacion',
      title: 'Aproximación y Error',
      icon: '🎯',
      briefing: [
        { type: 'why', body: <>Cuando Spotify dice que una canción tiene "1.2 millones de plays", eso es una aproximación. Esta misión te enseña a redondear y truncar.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2"><strong>Aproximar</strong> es simplificar un número usando uno más fácil que esté "cerca" del real — como decir "me costó como $7" cuando fueron $6.99.</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><GlossaryTerm term="Truncar" definition="Eliminar los decimales sobrantes sin modificar el último dígito conservado">Truncar</GlossaryTerm>: cortas los decimales que no quieres.</li>
            <li><GlossaryTerm term="Redondear" definition="Aproximar al valor más cercano revisando el siguiente dígito. Si es 5 o más, subes; si es menor, dejas igual.">Redondear</GlossaryTerm>: miras el siguiente dígito; ≥5 sube, &lt;5 queda.</li>
          </ul>
          <p className="mt-2"><strong>Error absoluto</strong> = <MathTex expr={"|\\text{real} - \\text{aproximado}|"} /> · <strong>Error relativo</strong> = <MathTex expr={"\\frac{\\text{error absoluto}}{|\\text{real}|}"} /></p>
        </> },
        { type: 'mistakes', items: [
          'Confundir truncar con redondear: truncar simplemente corta, redondear revisa el siguiente dígito.',
          'Pensar que error absoluto y relativo son lo mismo.',
          'Olvidar que un error de $1 no pesa igual en una compra de $2 que en una de $500.',
        ] },
        { type: 'widget', widgetId: 'aproximacion-explorer', title: 'Prueba la aproximación' },
      ],
      reto: {
        pick: 3,
        factories: [
          // ⬇️ copiar literalmente las 3 preguntas de AproximacionSection (Bloque1.jsx:25-47)
          staticQuestion({ question: 'Spotify dice que tu canción favorita tiene 2,450,890 reproducciones. Si la aproximas a 2 decimales usando millones, ¿qué valor es correcto?', options: ['2.4 millones', '2.45 millones', '2.5 millones', '2.0 millones'], correctAnswer: 1, hint: 'Mira el tercer decimal después de convertir a millones', reminder: 'Para redondear a 2 decimales, revisas el tercero. Si es 5 o más, subes el anterior.' }),
          staticQuestion({ question: 'Tienes 899 Robux. Si truncas a centenas (no redondeas), ¿cuántos tienes?', options: ['900 Robux', '800 Robux', '899 Robux', '1000 Robux'], correctAnswer: 1, hint: 'Truncar es cortar sin redondear. Solo eliminas lo sobrante.', reminder: 'Truncar = cortar los dígitos sobrantes sin modificar el anterior.' }),
          staticQuestion({ question: 'Tu K/D ratio es 2.447. El juego lo muestra como 2.4. ¿Qué operación hizo?', options: ['Redondeó a 1 decimal', 'Truncó a 1 decimal', 'Redondeó a enteros', 'Truncó a enteros'], correctAnswer: 1, hint: 'Truncar corta sin mirar; aquí 2.447 → 2.4 cortando.', reminder: 'Truncar a 1 decimal de 2.447 da 2.4; truncar siempre corta.' }),
        ],
      },
    },
    {
      id: 'potenciacion',
      title: 'Potenciación',
      icon: '⚡',
      briefing: [
        { type: 'why', body: <>Cuando tu personaje sube de nivel, su daño se potencia. Las leyes de exponentes te permiten manejar cantidades enormes de Robux, diamantes o seguidores.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2">Una <GlossaryTerm term="Potenciación" definition="Multiplicar un número por sí mismo varias veces. aⁿ = a × a × ... × a (n veces)">potencia</GlossaryTerm> es una multiplicación repetida:</p>
          <MathTex expr={"3^4 = 3 \\times 3 \\times 3 \\times 3 = 81"} display />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
            <div className="bg-white rounded p-2"><MathTex expr={"a^m \\cdot a^n = a^{m+n}"} /></div>
            <div className="bg-white rounded p-2"><MathTex expr={"\\frac{a^m}{a^n} = a^{m-n}"} /></div>
            <div className="bg-white rounded p-2"><MathTex expr={"(a^m)^n = a^{m \\cdot n}"} /></div>
            <div className="bg-white rounded p-2"><MathTex expr={"a^0 = 1 \\text{ (siempre!)}"} /></div>
            <div className="bg-white rounded p-2"><MathTex expr={"a^{-n} = \\frac{1}{a^n}"} /></div>
            <div className="bg-white rounded p-2"><MathTex expr={"(a \\cdot b)^n = a^n \\cdot b^n"} /></div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Pensar que exponente negativo da resultado negativo: 2⁻³ = 1/8, NO -8.',
          'Confundir a⁰ con 0: cualquier número (excepto 0) a la 0 es 1.',
          'Olvidar que (aᵐ)ⁿ = a^(m×n), no a^(m+n).',
        ] },
        { type: 'widget', widgetId: 'potencia-calculadora', title: 'Calculadora de potencias' },
      ],
      reto: {
        pick: 3,
        factories: [
          potenciaDanio,   // ← parametrizada
          // ⬇️ copiar literalmente las 3 preguntas de PotenciacionSection (Bloque1.jsx:136-158)
          staticQuestion({ question: 'En Free Fire, tu arma hace 50 de daño base. Con un potenciador de nivel 3 (×2³), ¿cuánto daño haces ahora?', options: ['100', '150', '200', '400'], correctAnswer: 3, hint: '2³ = 2 × 2 × 2 = 8. Luego 50 × 8', reminder: 'Potencia = multiplicación repetida. aⁿ = a multiplicado n veces.' }),
          staticQuestion({ question: '¿Cuánto vale 5⁰?', options: ['0', '1', '5', 'No se puede'], correctAnswer: 1, hint: 'Cualquier número (excepto 0) elevado a la 0 es 1', reminder: 'a⁰ = 1 siempre, para cualquier a ≠ 0.' }),
          staticQuestion({ question: '¿Cuál es el resultado de 2⁻³?', options: ['-8', '-6', '1/8', '0.125'], correctAnswer: 2, hint: 'Exponente negativo = 1 dividido por la potencia positiva', reminder: 'a⁻ⁿ = 1/aⁿ. El exponente negativo NO hace negativo el resultado.' }),
        ],
      },
    },
    // Nivel 3 'notacion' (🔬 Notación Científica): mismo patrón —
    //   why/content/mistakes desde NotacionCientificaSection (Bloque1.jsx:271-306),
    //   widget 'notacion-conversor',
    //   3 staticQuestion copiadas de Bloque1.jsx:247-269, pick: 3.
    // Nivel 4 'radicacion' (√ Radicación): mismo patrón —
    //   why/content/mistakes desde RadicacionSection (Bloque1.jsx:364-398),
    //   widget 'raiz-calculadora',
    //   raizCuadradaMinecraft + 3 staticQuestion copiadas de Bloque1.jsx:340-362, pick: 3.
  ],
}
```

**Importante:** los comentarios de los niveles 3 y 4 del esqueleto NO son opcionales — el archivo final debe tener los 4 niveles completos siguiendo el patrón mostrado en los niveles 1 y 2, con las preguntas copiadas literalmente de las líneas indicadas.

- [ ] **Step 2: Índice de mundos**

Create `math-review/src/content/worlds/index.js`:
```js
import { mundo3 } from './mundo3-potencias'

export const worlds = [mundo3]

export function findWorld(slug) {
  return worlds.find(w => w.slug === slug) ?? null
}
```

- [ ] **Step 3: Verificar y commitear**

```bash
npm run build   # compila (el contenido JSX es válido)
git add -A math-review/src/content/
git commit -m "feat: contenido del Mundo 3 (Volcán de las Potencias) migrado del Bloque 1"
```

### Task 13: LevelPlayer (briefing + reto con vidas y estrellas)

**Files:**
- Create: `math-review/src/engine/LevelPlayer.jsx`

**Interfaces:**
- Consumes: `findWorld` (Task 12), `widgets` (Task 11), `buildReto` (Task 10), `useGame` + constantes XP/monedas (Task 9), `WhySection`, `CommonMistakes`, `InteractiveBox` existentes.
- Produces: componente de ruta para `/mundo/:slug/nivel/:levelId`. Reglas: briefing paso a paso sin vidas → reto de `pick` preguntas con 3 vidas; respuesta correcta = `ANSWER_CORRECT` (+`XP_PER_CORRECT`); quedarse sin vidas = pantalla "Reintentar" (regenera preguntas, vidas a 3, XP ganado se conserva); completar = estrellas (100% aciertos primer intento de cada pregunta → 3⭐, ≥66% → 2⭐, resto → 1⭐) y `LEVEL_COMPLETED` (+`XP_LEVEL_COMPLETE`, monedas = estrellas × `COINS_PER_STAR`).

- [ ] **Step 1: Implementar**

Create `math-review/src/engine/LevelPlayer.jsx`:
```jsx
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { widgets } from '../widgets'
import { buildReto } from './generators'
import { useGame, XP_PER_CORRECT, XP_LEVEL_COMPLETE, COINS_PER_STAR } from '../state/gameStore'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import InteractiveBox from '../components/InteractiveBox'

function BriefingStep({ step }) {
  if (step.type === 'why') return <WhySection>{step.body}</WhySection>
  if (step.type === 'mistakes') return <CommonMistakes mistakes={step.items} />
  if (step.type === 'widget') {
    const Widget = widgets[step.widgetId]
    return <InteractiveBox title={step.title}>{Widget ? <Widget /> : <p>Widget no encontrado: {step.widgetId}</p>}</InteractiveBox>
  }
  return <div>{step.body}</div>
}

export default function LevelPlayer() {
  const { slug, levelId } = useParams()
  const { state, dispatch } = useGame()
  const world = findWorld(slug)
  const level = world?.levels.find(l => l.id === levelId)

  const [phase, setPhase] = useState('briefing')   // briefing | reto | fallado | completado
  const [stepIndex, setStepIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [firstTryHits, setFirstTryHits] = useState(0)
  const [selected, setSelected] = useState(null)   // índice elegido en la pregunta actual
  const [failedThis, setFailedThis] = useState(false)

  const questions = useMemo(
    () => (level ? buildReto(level.reto.factories, level.reto.pick) : []),
    [level, attempt],
  )

  if (!world || !level) return <p className="text-center py-12">Nivel no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const levelKey = `${world.id}/${level.id}`
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) {
      dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
      if (!failedThis) setFirstTryHits(h => h + 1)
    } else {
      setFailedThis(true)
      const remaining = lives - 1
      setLives(remaining)
      if (remaining <= 0) setPhase('fallado')
    }
  }

  const nextQuestion = () => {
    setSelected(null)
    setFailedThis(false)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      const ratio = firstTryHits / questions.length
      const stars = ratio >= 1 ? 3 : ratio >= 0.66 ? 2 : 1
      dispatch({ type: 'LEVEL_COMPLETED', levelKey, stars, xp: XP_LEVEL_COMPLETE, coins: stars * COINS_PER_STAR })
      setPhase('completado')
    }
  }

  const retry = () => {
    setAttempt(a => a + 1)
    setQIndex(0); setLives(3); setFirstTryHits(0); setSelected(null); setFailedThis(false)
    setPhase('reto')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 ${world.color} text-white rounded-full text-sm font-semibold mb-2`}>{world.emoji} {world.name}</span>
        <h1 className="text-2xl font-extrabold text-gray-800">{level.icon} {level.title}</h1>
      </div>

      {phase === 'briefing' && (
        <div>
          <BriefingStep step={level.briefing[stepIndex]} />
          <div className="flex justify-between mt-4">
            <button disabled={stepIndex === 0} onClick={() => setStepIndex(i => i - 1)} className="px-4 py-2 rounded-lg bg-white border disabled:opacity-40">← Anterior</button>
            <span className="text-sm text-gray-400 self-center">{stepIndex + 1} / {level.briefing.length}</span>
            {stepIndex + 1 < level.briefing.length
              ? <button onClick={() => setStepIndex(i => i + 1)} className="px-4 py-2 rounded-lg bg-primary text-white">Siguiente →</button>
              : <button onClick={() => setPhase('reto')} className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold">⚔️ ¡Al reto!</button>}
          </div>
        </div>
      )}

      {phase === 'reto' && q && (
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between mb-4 text-sm">
            <span>Pregunta {qIndex + 1} / {questions.length}</span>
            <span>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
          </div>
          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = selected !== null && i === q.correctAnswer
              const isWrong = selected === i && i !== q.correctAnswer
              return (
                <button key={i} disabled={selected !== null && selected === q.correctAnswer} onClick={() => answer(i)}
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
              <button onClick={() => setSelected(null)} className="mt-2 px-3 py-1.5 rounded bg-yellow-400 text-white text-xs font-bold">Intentar de nuevo</button>
            </div>
          )}
          {selected === q.correctAnswer && (
            <button onClick={nextQuestion} className="mt-4 px-4 py-2 rounded-lg bg-green-500 text-white font-bold">✅ +{XP_PER_CORRECT} XP — Continuar</button>
          )}
        </div>
      )}

      {phase === 'fallado' && (
        <div className="text-center bg-white rounded-2xl shadow p-8">
          <p className="text-4xl mb-2">💀</p>
          <h2 className="text-xl font-bold mb-2">¡Sin vidas!</h2>
          <p className="text-gray-500 mb-4 text-sm">Tranquilo: el XP que ganaste se queda contigo. El reto se regenera con preguntas nuevas.</p>
          <button onClick={retry} className="px-6 py-3 rounded-xl bg-primary text-white font-bold">🔄 Reintentar</button>
        </div>
      )}

      {phase === 'completado' && (
        <div className="text-center bg-white rounded-2xl shadow p-8">
          <p className="text-4xl mb-2">🎉</p>
          <h2 className="text-xl font-bold mb-1">¡Nivel superado!</h2>
          <p className="text-2xl my-2">{'⭐'.repeat(state.stars[levelKey] ?? 1)}</p>
          <p className="text-sm text-gray-500 mb-4">+{XP_LEVEL_COMPLETE} XP · +{(state.stars[levelKey] ?? 1) * COINS_PER_STAR} 🪙</p>
          <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-bold inline-block">Volver al mundo</Link>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar compilación y commitear**

```bash
npm run build
git add math-review/src/engine/LevelPlayer.jsx
git commit -m "feat: LevelPlayer con briefing por pasos, reto con vidas y estrellas"
```

### Task 14: Vista de mundo, rutas y verificación end-to-end

**Files:**
- Create: `math-review/src/engine/WorldView.jsx`
- Modify: `math-review/src/App.jsx` (rutas nuevas)
- Modify: `math-review/src/pages/Home.jsx` (enlace al modo juego)

**Interfaces:**
- Consumes: `findWorld` (Task 12), `useGame` (Task 9), `levelForXp`/`titleForLevel` (Task 7), `LevelPlayer` (Task 13).
- Produces: rutas `/mundo/:slug` y `/mundo/:slug/nivel/:levelId`. Regla de desbloqueo: nivel `n` desbloqueado si `n === 0` o el nivel `n-1` está en `completedLevels`.

- [ ] **Step 1: Crear WorldView**

Create `math-review/src/engine/WorldView.jsx`:
```jsx
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { useGame } from '../state/gameStore'
import { levelForXp, titleForLevel } from '../state/xpCurve'

export default function WorldView() {
  const { slug } = useParams()
  const { state } = useGame()
  const world = findWorld(slug)
  if (!world) return <p className="text-center py-12">Mundo no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const playerLevel = levelForXp(state.xp)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">{world.emoji} {world.name}</h1>
          <p className="text-gray-500">{world.description}</p>
        </div>
        <div className="text-right text-sm bg-white rounded-xl border px-4 py-2 shadow-sm">
          <p className="font-bold text-primary">Nv. {playerLevel} — {titleForLevel(playerLevel)}</p>
          <p className="text-gray-500">{state.xp} XP · {state.coins} 🪙</p>
        </div>
      </div>

      <div className="space-y-3">
        {world.levels.map((level, i) => {
          const key = `${world.id}/${level.id}`
          const prevKey = i > 0 ? `${world.id}/${world.levels[i - 1].id}` : null
          const unlocked = i === 0 || state.completedLevels.includes(prevKey)
          const stars = state.stars[key] ?? 0
          return unlocked ? (
            <Link key={key} to={`/mundo/${world.slug}/nivel/${level.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className="text-3xl">{level.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Nivel {i + 1}: {level.title}</p>
                <p className="text-amber-500">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
              </div>
              <span className="text-primary font-semibold text-sm">Jugar →</span>
            </Link>
          ) : (
            <div key={key} className="flex items-center gap-4 bg-gray-50 rounded-2xl border-2 border-gray-100 p-4 opacity-60">
              <span className="text-3xl">🔒</span>
              <p className="font-bold text-gray-400">Nivel {i + 1}: {level.title}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rutas en App.jsx**

Añadir a `math-review/src/App.jsx` (dentro del `<Route element={<Layout />}>`, debajo de las rutas de bloques):

```jsx
import WorldView from './engine/WorldView'
import LevelPlayer from './engine/LevelPlayer'
// …
        <Route path="/mundo/:slug" element={<WorldView />} />
        <Route path="/mundo/:slug/nivel/:levelId" element={<LevelPlayer />} />
```

- [ ] **Step 3: Enlace beta en Home.jsx**

Añadir en `math-review/src/pages/Home.jsx`, justo encima del grid de bloques:

```jsx
      <Link to="/mundo/volcan-potencias"
        className="block max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
        <p className="text-lg font-extrabold">🌋 NUEVO: Modo Juego (beta)</p>
        <p className="text-sm opacity-90">Gana XP, estrellas y vidas en el Volcán de las Potencias</p>
      </Link>
```

- [ ] **Step 4: Verificación end-to-end manual**

```bash
npm run dev
```
Checklist en `http://localhost:5173`:
1. Home muestra la tarjeta "Modo Juego (beta)"; clic → lista de 4 niveles, solo el 1 desbloqueado.
2. Nivel 1: briefing navegable (Anterior/Siguiente, widget funciona) → "¡Al reto!".
3. Responder mal: pierde ❤️, aparece hint, "Intentar de nuevo" permite reintentar la misma pregunta.
4. Perder 3 vidas: pantalla 💀 y "Reintentar" regenera el reto.
5. Completar el reto: 🎉 estrellas + XP + monedas; volver al mundo → nivel 2 desbloqueado, estrellas visibles.
6. Recargar la página (F5): XP/estrellas/desbloqueo persisten (localStorage).
7. Rejugar nivel 1 con todo correcto a la primera: estrellas suben a 3⭐ y nunca bajan.
8. Las rutas viejas `/bloque1`…`/bloque6` siguen funcionando.

- [ ] **Step 5: Tests + build finales y commit**

```bash
npm test && npm run build
git add -A math-review/src/
git commit -m "feat: Mundo 3 jugable — WorldView, rutas del modo juego y enlace en Home"
```

---

## Self-review del plan (hecho)

- **Cobertura de spec (Fases 0-1):** token→`.env` (T1), commit pendiente (T2), bugs de contenido (T3-T4; el nivel de probabilidad del Mundo 8 es Fase 2 y no entra aquí), `Math`→`MathTex` (T5), store+persistencia (T8-T9), schema de contenido (T12), widgets extraídos (T11), LevelPlayer (T13), Mundo 3 piloto conviviendo con rutas viejas (T12-T14), tests de lógica (T6-T10).
- **Sin placeholders:** cada paso tiene código o comando concreto; la única remisión a otro archivo es la copia literal de preguntas/prosa desde `Bloque1.jsx` con líneas exactas (el ejecutor tiene el archivo fuente), y el token, que deliberadamente no puede estar escrito aquí.
- **Consistencia de interfaces:** `levelKey = 'mundo3/aproximacion'` (T9↔T13↔T14); `buildReto(factories, pick, rng?)` (T10↔T13); registro `widgets` por id (T11↔T12↔T13); constantes XP/monedas definidas una sola vez en gameStore (T9) y consumidas en T13-T14; `findWorld(slug)` (T12↔T13↔T14).
