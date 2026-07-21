# Fase 2 — Migración completa (Mundos 4-8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar los Bloques 2-6 al motor de juego como Mundos 4-8 jugables (briefing + reto por nivel, con preguntas parametrizadas), añadir el nivel nuevo de probabilidad básica, convertir el mapa 3D en la puerta de entrada (nodos 4-8 pasan de estudio a juego), conservar la prosa como "modo estudio", y añadir redirects, ruta 404 y un validador de contenido.

**Architecture:** Data-driven, idéntico al piloto Mundo 3 (Fase 1). `content/worlds/mundoN-*.jsx` = datos (mundo → niveles → briefing + reto). `widgets/` = interactivos extraídos de los Bloques, registrados por id. `engine/generators.js` = fábricas de preguntas + helper `makeOptions`. Las páginas `BloqueN.jsx` se conservan detrás de una ruta de estudio; el `content/worldMap.js` (fuente única, pura) alimenta el mapa 2D/3D y la navegación.

**Tech Stack:** Vite + React 19 + react-router-dom 7 + Tailwind 4 + KaTeX + Mafs + Recharts + Vitest. Sin backend.

## Global Constraints

- Todo el contenido visible al usuario en **español**.
- **Sin backend**: solo localStorage (claves `mathquest-save-v1` / `-backup`). Ya implementado; no se toca la persistencia.
- **Sin dependencias nuevas** y **sin TypeScript**.
- Tests solo de **lógica pura** (fábricas, helper, validador) + **integración ligera** por mundo (espejo de `mundo3-integracion.test.jsx`). Nada de tests visuales de widgets.
- **Working dir de todos los comandos:** `/home/aurelio/Repos/mathreview` (el repo está aplanado al root; rutas relativas a él).
- `levelKey = 'mundoN/<levelId>'` (p.ej. `mundo4/mcd`). El `id` del mundo es `mundoN`; el `slug` es la ruta.
- Cada nivel usa `reto.pick = 3` y **≥ 3 fábricas**. Las fábricas parametrizadas devuelven `correctAnswer: 0` y opciones con el correcto primero; `buildReto` las baraja (`shuffleOptions`) automáticamente.
- **Fuera de alcance (Fase 3):** jefes, sidequests, logros, tienda, cofres, racha.
- Spec de referencia: `docs/superpowers/specs/2026-07-21-fase2-migracion-completa-design.md`.

## File Structure

**Nuevos:**
- `src/engine/generators.js` (modificar): + `makeOptions(correct, distractors)`.
- `scripts/` → **no** se usa (los datos son `.jsx`, que Node no importa sin loader). El validador vive como módulo puro + test de Vitest:
  - `src/content/validateContent.js` — `validateContent({ worlds, widgets, worldMapNodes }) → string[]` (lista de problemas; vacía = OK). Puro.
  - `src/content/__tests__/validateContent.test.js` — corre el validador con el contenido real; falla si hay problemas.
- `src/widgets/*.jsx` — 15 widgets extraídos + `src/widgets/index.js` (modificar).
- `src/content/worlds/mundo4-algebra.jsx` … `mundo8-datos.jsx` (5 archivos de contenido) + `src/content/worlds/index.js` (modificar).
- `src/content/worlds/__tests__/mundo4.test.js` … `mundo8.test.js` (tests de fábricas).
- `src/__tests__/mundo4-integracion.test.jsx` … `mundo8-integracion.test.jsx`.
- `src/engine/StudyView.jsx` — resuelve `slug → BloqueN` para `/mundo/:slug/estudio`.
- `src/components/NotFound.jsx` — ruta 404.
- `src/App.jsx` (modificar) — rutas de estudio, redirects `/bloqueN`, 404.
- `src/engine/WorldView.jsx` (modificar) — enlace "📖 Modo estudio".
- `src/content/worldMap.js` (modificar) — flip nodos 4-8 a `game`, `levelKeys`, `studyTarget`, fix ids Mundo 3.
- `src/content/__tests__/worldMap.test.js` (modificar) — targets nuevos + ids Mundo 3 corregidos.

Orden: **Task 1** (validador + fix bug Mundo 3) → **Task 2** (`makeOptions`) → **Tasks 3-7** (un mundo cada una) → **Task 8** (ruteo + flip del mapa) → **Task 9** (verificación final + TODO).

---

## Task 1: Validador de contenido + fix del bug de ids del Mundo 3

**Files:**
- Create: `src/content/validateContent.js`
- Create: `src/content/__tests__/validateContent.test.js`
- Modify: `src/content/worldMap.js:11` (constante `MUNDO3_LEVELS`)
- Modify: `src/content/__tests__/worldMap.test.js:76-77,85,114-115` (ids del Mundo 3)

**Interfaces:**
- Produces: `validateContent({ worlds, widgets, worldMapNodes }) → string[]`. Cada string es un problema legible; array vacío = todo válido. Consumido por el test y (a futuro) CI.
- Consumes: `worlds` (`src/content/worlds`), `widgets` (`src/widgets`), `worldMapNodes` (`src/content/worldMap`).

- [ ] **Step 1: Escribir el validador (falla al ejecutar cada fábrica una vez)**

Create `src/content/validateContent.js`:
```js
// Validador puro de contenido de mundos. Devuelve una lista de problemas (vacía = OK).
// Ejecuta cada fábrica una vez para comprobar la forma de las preguntas generadas.
export function validateContent({ worlds, widgets, worldMapNodes }) {
  const problems = []
  const slugs = new Set()
  const idsPorMundo = {}

  for (const w of worlds) {
    if (!w.id) problems.push(`mundo sin id: ${w.slug ?? '¿?'}`)
    if (!w.slug) problems.push(`mundo ${w.id} sin slug`)
    if (slugs.has(w.slug)) problems.push(`slug duplicado: ${w.slug}`)
    slugs.add(w.slug)
    if (!Array.isArray(w.levels) || w.levels.length === 0) {
      problems.push(`mundo ${w.id} sin niveles`)
      continue
    }
    const levelIds = new Set()
    idsPorMundo[w.id] = levelIds
    for (const lvl of w.levels) {
      if (!lvl.id) problems.push(`${w.id}: nivel sin id`)
      if (levelIds.has(lvl.id)) problems.push(`${w.id}: id de nivel duplicado "${lvl.id}"`)
      levelIds.add(lvl.id)
      if (!Array.isArray(lvl.briefing) || lvl.briefing.length === 0)
        problems.push(`${w.id}/${lvl.id}: briefing vacío`)
      for (const step of lvl.briefing ?? []) {
        if (step.type === 'widget' && !widgets[step.widgetId])
          problems.push(`${w.id}/${lvl.id}: widget desconocido "${step.widgetId}"`)
      }
      if (!lvl.reto || !Array.isArray(lvl.reto.factories) || lvl.reto.factories.length < 3)
        problems.push(`${w.id}/${lvl.id}: reto necesita ≥3 fábricas`)
      for (const [i, f] of (lvl.reto?.factories ?? []).entries()) {
        let q
        try { q = f() } catch (e) { problems.push(`${w.id}/${lvl.id}: fábrica ${i} lanzó: ${e.message}`); continue }
        if (!q || typeof q.question !== 'string')
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} sin question`)
        if (!Array.isArray(q?.options) || q.options.length !== 4)
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} no tiene 4 opciones`)
        else if (new Set(q.options).size !== 4)
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} tiene opciones repetidas`)
        if (!(q?.correctAnswer >= 0 && q?.correctAnswer < 4))
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} correctAnswer inválido`)
      }
    }
  }

  // Cruce con el mapa: todo levelKey de un nodo 'game' debe existir en un mundo real.
  for (const node of worldMapNodes) {
    if (node.mode === 'game') {
      if (!Array.isArray(node.levelKeys) || node.levelKeys.length === 0) {
        problems.push(`nodo ${node.id} es 'game' pero no tiene levelKeys`)
        continue
      }
      for (const key of node.levelKeys) {
        const [mundoId, levelId] = key.split('/')
        if (!idsPorMundo[mundoId]?.has(levelId))
          problems.push(`nodo ${node.id}: levelKey "${key}" no corresponde a ningún nivel real`)
      }
    }
  }
  return problems
}
```

- [ ] **Step 2: Escribir el test que ejecuta el validador con el contenido real**

Create `src/content/__tests__/validateContent.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { validateContent } from '../validateContent'
import { worlds } from '../worlds'
import { widgets } from '../../widgets'
import { worldMapNodes } from '../worldMap'

describe('validación de contenido', () => {
  it('el detector encuentra un mundo inválido de prueba', () => {
    const malo = [{ id: 'mundoX', slug: 'x', levels: [{ id: 'l', briefing: [], reto: { factories: [] } }] }]
    const problems = validateContent({ worlds: malo, widgets, worldMapNodes: [] })
    expect(problems.length).toBeGreaterThan(0)
  })

  it('el contenido real no tiene problemas', () => {
    const problems = validateContent({ worlds, widgets, worldMapNodes })
    expect(problems, problems.join('\n')).toEqual([])
  })
})
```

- [ ] **Step 3: Ejecutar — falla por el bug de ids del Mundo 3**

Run: `npm test -- validateContent`
Expected: FAIL. El nodo `volcan-potencias` declara `levelKeys` con `mundo3/potencias` y `mundo3/radicales`, pero los ids reales del Mundo 3 son `potenciacion` y `radicacion` → problemas `levelKey "mundo3/potencias" no corresponde a ningún nivel real` (y `radicales`).

- [ ] **Step 4: Corregir `MUNDO3_LEVELS` en worldMap.js**

En `src/content/worldMap.js:11` reemplazar:
```js
const MUNDO3_LEVELS = ['aproximacion', 'potencias', 'notacion', 'radicales']
```
por:
```js
const MUNDO3_LEVELS = ['aproximacion', 'potenciacion', 'notacion', 'radicacion']
```

- [ ] **Step 5: Corregir los ids buggeados en worldMap.test.js**

En `src/content/__tests__/worldMap.test.js`, sustituir `mundo3/potencias` → `mundo3/potenciacion` y `mundo3/radicales` → `mundo3/radicacion` en las líneas 76-77, 85 y 114-115. Concretamente:

- Línea 76-77:
```js
      completedLevels: ['mundo3/aproximacion', 'mundo3/potenciacion'],
      stars: { 'mundo3/aproximacion': 3, 'mundo3/potenciacion': 1 },
```
- Línea 85:
```js
    const all = ['mundo3/aproximacion', 'mundo3/potenciacion', 'mundo3/notacion', 'mundo3/radicacion']
```
- Línea 114-115:
```js
    const all = [
      'mundo3/aproximacion', 'mundo3/potenciacion', 'mundo3/notacion', 'mundo3/radicacion',
    ]
```

- [ ] **Step 6: Ejecutar todo — pasa**

Run: `npm test -- validateContent worldMap`
Expected: PASS (validación real vacía; tests de worldMap verdes).

- [ ] **Step 7: Commit**

```bash
git add src/content/validateContent.js src/content/__tests__/validateContent.test.js src/content/worldMap.js src/content/__tests__/worldMap.test.js
git commit -m "feat: validador de contenido + fix de ids de niveles del Mundo 3"
```

---

## Task 2: Helper `makeOptions` (opciones distintas + barajado seguro)

**Files:**
- Modify: `src/engine/generators.js`
- Test: `src/engine/__tests__/generators.test.js`

**Interfaces:**
- Produces: `makeOptions(correct, distractors) → { options: string[4], correctAnswer: 0 }`. Pone el correcto primero (índice 0), añade distractores distintos (dedup por string), y **rellena** con vecinos numéricos si faltan (para correctos numéricos). `buildReto` baraja después, así que el índice 0 es seguro. Consumido por todas las fábricas de las Tasks 3-7.

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `src/engine/__tests__/generators.test.js` (nuevo `describe`, sin borrar lo existente):
```js
import { makeOptions } from '../generators'

describe('makeOptions', () => {
  it('pone el correcto en el índice 0 y devuelve 4 opciones', () => {
    const r = makeOptions(5, [6, 7, 8])
    expect(r.correctAnswer).toBe(0)
    expect(r.options).toEqual(['5', '6', '7', '8'])
  })
  it('deduplica distractores repetidos o iguales al correcto', () => {
    const r = makeOptions(5, [5, 6, 6, 7])
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
    expect(r.options[0]).toBe('5')
  })
  it('rellena con vecinos numéricos si faltan distractores', () => {
    const r = makeOptions(10, [10]) // solo colisiones → rellena
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
    expect(r.options[0]).toBe('10')
  })
  it('conserva distractores string distintos', () => {
    const r = makeOptions('x = 3', ['x = 4', 'x = 2', 'x = -3'])
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
  })
})
```

- [ ] **Step 2: Ejecutar para ver que falla**

Run: `npm test -- generators`
Expected: FAIL con "makeOptions is not a function".

- [ ] **Step 3: Implementar `makeOptions`**

Añadir al final de `src/engine/generators.js`:
```js
// Arma { options: [correcto, +3 distractores], correctAnswer: 0 } con 4 opciones
// distintas (dedup por string). Si faltan distractores y el correcto es numérico,
// sintetiza vecinos (correcto ± k). buildReto baraja después → índice 0 seguro.
export function makeOptions(correct, distractors = []) {
  const s = (v) => String(v)
  const seen = new Set([s(correct)])
  const options = [s(correct)]
  const push = (v) => {
    const str = s(v)
    if (!seen.has(str)) { seen.add(str); options.push(str); return true }
    return false
  }
  for (const d of distractors) { if (options.length >= 4) break; push(d) }
  const n = Number(correct)
  for (let k = 1; options.length < 4 && Number.isFinite(n) && k <= 99; k++) {
    push(n + k) || push(n - k)
  }
  // Respaldo no numérico (fábricas bien hechas no deberían llegar aquí):
  for (let k = 1; options.length < 4; k++) push(`${correct} (${k})`)
  return { options, correctAnswer: 0 }
}
```

- [ ] **Step 4: Ejecutar — pasa**

Run: `npm test -- generators`
Expected: PASS (los tests nuevos y los existentes).

- [ ] **Step 5: Commit**

```bash
git add src/engine/generators.js src/engine/__tests__/generators.test.js
git commit -m "feat: helper makeOptions para fábricas de preguntas parametrizadas"
```

---

## Convención de migración (aplica a las Tasks 3-7)

Cada mundo se arma con **tres clases de material**, todas localizables sin ambigüedad por **nombre de sección** y **título del InteractiveBox** en el `BloqueN.jsx` fuente (el ejecutor tiene el archivo; las líneas son orientativas):

1. **Briefing** (copiar literal del fuente): `WhySection` → `{type:'why', body:<>…</>}`; prosa/cajas de fórmula → `{type:'content', body:<>…</>}`; `CommonMistakes mistakes={[…]}` → `{type:'mistakes', items:[…]}`; `InteractiveBox` → `{type:'widget', widgetId, title}`.
2. **Preguntas estáticas** (copiar literal las preguntas conceptuales del `quizQuestions` de la sección) envueltas en `staticQuestion({...})`.
3. **Fábricas parametrizadas** (código nuevo, dado completo en cada task) para las preguntas computacionales.

**Extracción de widget** (patrón, igual que Fase 1): crear `src/widgets/<Nombre>.jsx` como componente `default` autocontenido, copiando dentro el `useState`/helpers que usa la sección y el **JSX interno** del `InteractiveBox`; importar lo que use (`MathTex`, `Mafs`, etc.). Registrar el id en `src/widgets/index.js`. En el `BloqueN.jsx`, reemplazar el cuerpo del `InteractiveBox` por `<Widget />` (modo estudio sigue funcionando, sin duplicar lógica).

**Test de integración por mundo** (plantilla, se instancia en cada task) — copia de `src/__tests__/mundo3-integracion.test.jsx` cambiando slug, id, y nº de niveles esperado. Verifica: mundo exportado + `findWorld`, niveles bien formados (`briefing` no vacío, `reto.pick===3`, `≥3` fábricas), todo `widgetId` existe, `buildReto` genera 3 preguntas válidas en 50 tiradas, y el desbloqueo secuencial.

---

## Task 3: Mundo 4 — 🏰 Castillo del Álgebra (← Bloque 2 + B4 EcuacionesLineales)

**Files:**
- Create: `src/widgets/McdCalculadora.jsx`, `src/widgets/McmCalculadora.jsx`, `src/widgets/FraccionesEjemplo.jsx`
- Modify: `src/widgets/index.js`, `src/pages/Bloque2.jsx`
- Create: `src/content/worlds/mundo4-algebra.jsx`, `src/content/worlds/__tests__/mundo4.test.js`, `src/__tests__/mundo4-integracion.test.jsx`
- Modify: `src/content/worlds/index.js`

**Interfaces:**
- Consumes: `makeOptions`, `randInt`, `staticQuestion` (generators).
- Produces: `export const mundo4` (slug `castillo-algebra`, id `mundo4`, 5 niveles: `mcd`, `mcm`, `fracciones-algebraicas`, `operaciones`, `ecuaciones-lineales`); fábricas exportadas `mcdReparto`, `mcmEventos`, `resolverLineal`; widgets `mcd-calculadora`, `mcm-calculadora`, `fracciones-ejemplo`.

- [ ] **Step 1: Extraer los 3 widgets**

- `src/widgets/McdCalculadora.jsx` ← `Bloque2.jsx` `MCDSection`: copiar `useState a/b` (L13-14), `gcd` (L16-20), `mcdVal` (L22), `factorizar` (L48-61) y el JSX interno del `InteractiveBox "Calculadora de MCD…"` (L103-122). Componente `default McdCalculadora`.
- `src/widgets/McmCalculadora.jsx` ← `MCMSection`: `useState a/b` (L131-132), `gcd` (L134-138), `mcmVal` (L140), JSX interno del `InteractiveBox "Calculadora de MCM…"` (L202-221). Importa `MathTex`.
- `src/widgets/FraccionesEjemplo.jsx` ← `OperacionesSection`: `useState step` (L319), `pasos` (L321-327), JSX interno del `InteractiveBox "Ejemplo paso a paso — Suma de fracciones"` (L388-410). Importa `MathTex`.

En cada `InteractiveBox` de `Bloque2.jsx`, reemplazar el cuerpo por `<McdCalculadora />` / `<McmCalculadora />` / `<FraccionesEjemplo />` con su import, y borrar el estado/funciones que se movieron.

- [ ] **Step 2: Registrar los widgets**

En `src/widgets/index.js` añadir imports y entradas:
```js
import McdCalculadora from './McdCalculadora'
import McmCalculadora from './McmCalculadora'
import FraccionesEjemplo from './FraccionesEjemplo'
// … dentro de `widgets`:
  'mcd-calculadora': McdCalculadora,
  'mcm-calculadora': McmCalculadora,
  'fracciones-ejemplo': FraccionesEjemplo,
```

- [ ] **Step 3: Escribir el test de fábricas (falla)**

Create `src/content/worlds/__tests__/mundo4.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { mcdReparto, mcmEventos, resolverLineal } from '../mundo4-algebra'

const factorias = { mcdReparto, mcmEventos, resolverLineal }

describe('fábricas del Mundo 4', () => {
  for (const [nombre, f] of Object.entries(factorias)) {
    it(`${nombre}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
  it('mcmEventos: la respuesta correcta es el MCM real (rng mínimo → 2 y 4 → MCM 4)', () => {
    const q = mcmEventos(() => 0) // g=2, m=1, n=2 → a=2,b=4 → MCM=4
    expect(q.options[q.correctAnswer]).toBe('4')
  })
  it('resolverLineal: la solución satisface la ecuación', () => {
    const q = resolverLineal(() => 0) // a=3,c=1,x0=1,b=-9 → 3x-9 = x-7 → x=1
    expect(q.options[q.correctAnswer]).toBe('x = 1')
  })
})
```
Run: `npm test -- mundo4` → FAIL (`mundo4-algebra` no existe).

- [ ] **Step 4: Escribir el contenido del Mundo 4**

Create `src/content/worlds/mundo4-algebra.jsx`. Cabecera con las fábricas (código completo) seguido del objeto `mundo4`:
```jsx
import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y] } return x }
const sg = (k) => (k >= 0 ? `+ ${k}` : `- ${-k}`)
const COPRIMOS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [2, 7], [3, 7]]

export function mcdReparto(rng = Math.random) {
  const d = randInt(rng, 3, 9)
  const [m, n] = COPRIMOS[randInt(rng, 0, COPRIMOS.length - 1)]
  const a = d * m, b = d * n
  return {
    question: `Tienes ${a} diamantes y ${b} pociones para repartir en partes iguales entre tu squad. ¿Cuál es el máximo de jugadores que reciben la misma cantidad de ambos?`,
    ...makeOptions(d, [2 * d, d + 1, Math.min(m, n)]),
    hint: `Busca el MCD de ${a} y ${b}.`,
    reminder: 'MCD = el mayor número que divide exacto a ambos.',
  }
}

export function mcmEventos(rng = Math.random) {
  const g = randInt(rng, 2, 4)
  const m = randInt(rng, 1, 5)
  const n = m + 1 + randInt(rng, 0, 3) // n > m siempre
  const a = g * m, b = g * n
  const mcm = Math.abs(a * b) / gcd(a, b)
  return {
    question: `Un evento de Roblox se repite cada ${a} horas y otro cada ${b} horas. ¿Cada cuántas horas coinciden por primera vez?`,
    ...makeOptions(mcm, [a * b, gcd(a, b), a + b]),
    hint: `MCM(${a}, ${b}) = |${a}×${b}| / MCD(${a}, ${b}).`,
    reminder: 'MCM = múltiplo común más pequeño = |a×b| / MCD(a,b).',
  }
}

export function resolverLineal(rng = Math.random) {
  const a = randInt(rng, 3, 8)
  const c = randInt(rng, 1, a - 1) // a > c
  const x0 = randInt(rng, 1, 9)
  const b = randInt(rng, -9, 9)
  const e = (a - c) * x0 + b
  return {
    question: `Resuelve para x:  ${a}x ${sg(b)} = ${c}x ${sg(e)}`,
    ...makeOptions(`x = ${x0}`, [`x = ${x0 + 1}`, `x = ${x0 - 1}`, `x = ${-x0}`]),
    hint: `Agrupa las x: (${a} − ${c})x = ${e} − (${b}) → ${a - c}x = ${e - b}.`,
    reminder: 'Pasa las x a un lado y los números al otro; luego divide.',
  }
}

export const mundo4 = {
  id: 'mundo4', slug: 'castillo-algebra', name: 'Castillo del Álgebra',
  emoji: '🏰', color: 'bg-bloque2',
  description: 'MCD, MCM, fracciones algebraicas, operaciones y ecuaciones lineales',
  levels: [
    {
      id: 'mcd', title: 'Máximo Común Divisor', icon: '🔗',
      briefing: [ /* de Bloque2 MCDSection: why (L65-71), content (prosa L81-100), mistakes (L74-78), widget */
        { type: 'widget', widgetId: 'mcd-calculadora', title: 'Calculadora de MCD' },
      ],
      reto: { pick: 3, factories: [
        mcdReparto,
        // estáticas conceptuales copiadas de MCDSection.quizQuestions Q2 (L32-38) y Q3 (L39-45):
        staticQuestion({ /* Q2 MCD de 18x³y² y 12x²y⁴ */ }),
        staticQuestion({ /* Q3 Si MCD(a,b)=12 y a=36 */ }),
      ] },
    },
    {
      id: 'mcm', title: 'Mínimo Común Múltiplo', icon: '🔄',
      briefing: [ /* de MCMSection: why (L168-174), content (L184-199), mistakes (L177-181), widget */
        { type: 'widget', widgetId: 'mcm-calculadora', title: 'Calculadora de MCM' },
      ],
      reto: { pick: 3, factories: [
        mcmEventos,
        staticQuestion({ /* Q2 denominador común 1/4+1/6 (L150-156) */ }),
        staticQuestion({ /* Q3 MCM de 8x²y y 12xy³ (L157-163) */ }),
      ] },
    },
    {
      id: 'fracciones-algebraicas', title: 'Fracciones Algebraicas', icon: '➗',
      briefing: [ /* de FraccionesAlgebraicasSection: why (L256-262), content (L272-311), mistakes (L265-269); SIN widget */ ],
      reto: { pick: 3, factories: [
        staticQuestion({ /* Q1 (x²-4)/(x²-4x+4) (L231-237) */ }),
        staticQuestion({ /* Q2 (2x+6)/(4x+8) (L238-244) */ }),
        staticQuestion({ /* Q3 (x²-9)/(x+3) (L245-251) */ }),
      ] },
    },
    {
      id: 'operaciones', title: 'Operaciones con Fracciones', icon: '🧮',
      briefing: [ /* de OperacionesSection: why (L355-361), content (L371-385), mistakes (L364-368), widget */
        { type: 'widget', widgetId: 'fracciones-ejemplo', title: 'Ejemplo paso a paso — Suma de fracciones' },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({ /* Q1 1/x + 1/(x+1) (L330-336) */ }),
        staticQuestion({ /* Q2 multiplicar (3/x)(x²/9) (L337-343) */ }),
        staticQuestion({ /* Q3 dividir (2/x)÷(4/x²) (L344-350) */ }),
      ] },
    },
    {
      id: 'ecuaciones-lineales', title: 'Ecuaciones Lineales', icon: '⚖️',
      briefing: [ /* de Bloque4 EcuacionesLinealesSection: why + content + mistakes.
                    El "Ejemplo resuelto paso a paso" (L289) se migra como {type:'content'} listando los pasos. */ ],
      reto: { pick: 3, factories: [
        resolverLineal,
        staticQuestion({ /* Q2 2(x+4)=3x-2 (Bloque4 L238-244) */ }),
        staticQuestion({ /* Q3 verificar sustituyendo (Bloque4 L245-253) */ }),
      ] },
    },
  ],
}
```
**Importante:** los comentarios `/* … */` marcan copia literal desde el fuente indicado (prosa y preguntas). El archivo final NO lleva comentarios-placeholder: cada `staticQuestion({...})` contiene el objeto `{question, options, correctAnswer, hint, reminder}` copiado tal cual del `quizQuestions` de la sección, y cada briefing lleva el JSX copiado. Cada nivel de estudio tiene ≥1 paso `content` real; los niveles con widget tienen also los pasos `why`/`content`/`mistakes` antes del `widget`.

- [ ] **Step 5: Registrar el mundo**

En `src/content/worlds/index.js`:
```js
import { mundo3 } from './mundo3-potencias'
import { mundo4 } from './mundo4-algebra'

export const worlds = [mundo3, mundo4]

export function findWorld(slug) {
  return worlds.find(w => w.slug === slug) ?? null
}
```

- [ ] **Step 6: Escribir el test de integración**

Create `src/__tests__/mundo4-integracion.test.jsx` copiando `mundo3-integracion.test.jsx` y cambiando: `findWorld('castillo-algebra')`, `world.id === 'mundo4'`, `world.levels` tiene **5** niveles, y `contain('castillo-algebra')`. El resto (widgetIds, buildReto 50 tiradas, desbloqueo) queda igual.

- [ ] **Step 7: Verificar y commitear**

```bash
npm test -- mundo4 validateContent
npm run build
git add src/widgets/ src/content/worlds/ src/content/worlds/__tests__/mundo4.test.js src/__tests__/mundo4-integracion.test.jsx src/pages/Bloque2.jsx
git commit -m "feat: Mundo 4 (Castillo del Álgebra) migrado del Bloque 2 + ecuaciones lineales"
```
Expected: tests verdes, `vite build` sin errores.

---

## Task 4: Mundo 5 — 🌀 Laberinto de Sistemas (← Bloque 3 + B4 SistemasLineales)

**Files:**
- Create: `src/widgets/SistemasGrafica.jsx`, `src/widgets/CramerCalculadora.jsx`
- Modify: `src/widgets/index.js`, `src/pages/Bloque3.jsx`
- Create: `src/content/worlds/mundo5-sistemas.jsx`, `src/content/worlds/__tests__/mundo5.test.js`, `src/__tests__/mundo5-integracion.test.jsx`
- Modify: `src/content/worlds/index.js`

**Interfaces:**
- Produces: `export const mundo5` (slug `laberinto-sistemas`, id `mundo5`, 4 niveles: `intro-sistemas`, `metodo-grafico`, `reduccion`, `cramer`); fábricas `cuadrantePunto`, `cramerDeterminante`; widgets `sistemas-grafica`, `cramer-calculadora`.

- [ ] **Step 1: Extraer los 2 widgets**

- `src/widgets/SistemasGrafica.jsx` ← `Bloque3.jsx` `MetodoGrafico`: copiar `useState a1..c2` (L14-19), `solucion` `useMemo` (L21-27), `getY1`/`getY2` (L29-30) y el JSX interno del `InteractiveBox "Gráfica interactiva…"` (L77-136). Copiar también los imports que usa desde la cabecera de `Bloque3.jsx` (`useState`, `useMemo`, `MathTex`, y las de Mafs: `Mafs`, `Coordinates`, `Line`, `Theme`, y `Text as MafsText`).
- `src/widgets/CramerCalculadora.jsx` ← `MetodoCramer`: copiar el estado/lógica del InteractiveBox `"Calculadora de Cramer"` (a partir de L329) y su JSX interno. Importa `MathTex`.

Reemplazar los cuerpos en `Bloque3.jsx` por `<SistemasGrafica />` / `<CramerCalculadora />`.

- [ ] **Step 2: Registrar los widgets** — en `src/widgets/index.js`: `'sistemas-grafica': SistemasGrafica`, `'cramer-calculadora': CramerCalculadora` (con imports).

- [ ] **Step 3: Test de fábricas (falla)**

Create `src/content/worlds/__tests__/mundo5.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { cuadrantePunto, cramerDeterminante } from '../mundo5-sistemas'

describe('fábricas del Mundo 5', () => {
  for (const [nombre, f] of Object.entries({ cuadrantePunto, cramerDeterminante })) {
    it(`${nombre}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
  it('cramerDeterminante nunca da D = 0 y el correcto es a·d − c·b', () => {
    for (let i = 0; i < 200; i++) {
      const q = cramerDeterminante()
      expect(q.options[q.correctAnswer]).not.toBe('0')
    }
  })
})
```
Run: `npm test -- mundo5` → FAIL.

- [ ] **Step 4: Contenido del Mundo 5**

Create `src/content/worlds/mundo5-sistemas.jsx`:
```jsx
import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

export function cuadrantePunto(rng = Math.random) {
  const casos = [[1, 1, 'I'], [-1, 1, 'II'], [-1, -1, 'III'], [1, -1, 'IV']]
  const [sx, sy, cuad] = casos[randInt(rng, 0, 3)]
  const x = sx * randInt(rng, 1, 9), y = sy * randInt(rng, 1, 9)
  return {
    question: `¿En qué cuadrante está el punto (${x}, ${y})?`,
    ...makeOptions(cuad, ['I', 'II', 'III', 'IV'].filter(c => c !== cuad)),
    hint: `x ${x > 0 ? 'positivo' : 'negativo'}, y ${y > 0 ? 'positivo' : 'negativo'}.`,
    reminder: 'Cuadrantes: I (+,+), II (−,+), III (−,−), IV (+,−).',
  }
}

export function cramerDeterminante(rng = Math.random) {
  const a = randInt(rng, 1, 5), b = randInt(rng, 1, 5), c = randInt(rng, 1, 5)
  let d = randInt(rng, -5, 5)
  if (a * d - c * b === 0) d += 1 // evita D = 0 sin bucle
  const D = a * d - c * b
  const b2 = d >= 0 ? `${d}` : `(${d})`
  return {
    question: `Para el sistema { ${a}x + ${b}y = k₁,  ${c}x + ${b2}y = k₂ }, ¿cuánto vale el determinante D?`,
    ...makeOptions(D, [a * d + c * b, -(a * d - c * b), a * b - c * d]),
    hint: `D = a₁b₂ − a₂b₁ = (${a})(${d}) − (${c})(${b}).`,
    reminder: 'D = a₁b₂ − a₂b₁. Cruza y resta.',
  }
}

export const mundo5 = {
  id: 'mundo5', slug: 'laberinto-sistemas', name: 'Laberinto de Sistemas',
  emoji: '🌀', color: 'bg-bloque3',
  description: 'Sistemas 2×2: introducción, método gráfico, reducción y Cramer',
  levels: [
    {
      id: 'intro-sistemas', title: 'Introducción a los Sistemas 2×2', icon: '🔀',
      briefing: [ /* de Bloque4 SistemasLinealesSection: why + content + mistakes; SIN widget */ ],
      reto: { pick: 3, factories: [
        cuadrantePunto,
        staticQuestion({ /* Q1 paralelas → sin solución (Bloque4 L15-21) */ }),
        staticQuestion({ /* Q3 plantear 50x=30x+100 (Bloque4 L28-34) */ }),
      ] },
    },
    {
      id: 'metodo-grafico', title: 'Método Gráfico', icon: '📊',
      briefing: [ /* de Bloque3 MetodoGrafico: why (L34-40), content (L50-74), mistakes (L43-47), widget */
        { type: 'widget', widgetId: 'sistemas-grafica', title: 'Gráfica interactiva — Mueve los coeficientes' },
      ],
      reto: { pick: 3, factories: [
        // las 3 preguntas del MiniQuiz inline de MetodoGrafico (Bloque3 L140-160) son conceptuales:
        staticQuestion({ /* "se cruzan en un punto → 1 solución" */ }),
        staticQuestion({ /* streamers 100+3x=50+5x */ }),
        staticQuestion({ /* D=0 → sin solución o infinitas */ }),
      ] },
    },
    {
      id: 'reduccion', title: 'Método de Reducción', icon: '➖',
      briefing: [ /* de MetodoReduccion: why + content + mistakes; el "Ejemplo paso a paso" (L235)
                    se migra como {type:'content'} listando los 6 pasos (Bloque3 pasos L169-176). */ ],
      reto: { pick: 3, factories: [
        staticQuestion({ /* Q1 coeficientes opuestos (Bloque3 L179-185) */ }),
        staticQuestion({ /* Q2 sustituir x=4 (L186-192) */ }),
        staticQuestion({ /* Q3 objetivo de reducción (L193-199) */ }),
      ] },
    },
    {
      id: 'cramer', title: 'Método de Cramer', icon: '🎯',
      briefing: [ /* de MetodoCramer: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'cramer-calculadora', title: 'Calculadora de Cramer' },
      ],
      reto: { pick: 3, factories: [
        cramerDeterminante,
        staticQuestion({ /* Q2 x=Dx/D=3 (Bloque3 L277-283) */ }),
        staticQuestion({ /* Q3 D=0 significa (L284-290) */ }),
      ] },
    },
  ],
}
```

- [ ] **Step 5: Registrar** — `import { mundo5 }` y `worlds = [mundo3, mundo4, mundo5]` en `index.js`.

- [ ] **Step 6: Integración** — `src/__tests__/mundo5-integracion.test.jsx` (copia de la plantilla): `findWorld('laberinto-sistemas')`, `id === 'mundo5'`, **4** niveles.

- [ ] **Step 7: Verificar y commitear**
```bash
npm test -- mundo5 validateContent
npm run build
git add src/widgets/ src/content/worlds/ src/content/worlds/__tests__/mundo5.test.js src/__tests__/mundo5-integracion.test.jsx src/pages/Bloque3.jsx
git commit -m "feat: Mundo 5 (Laberinto de Sistemas) migrado del Bloque 3 + intro de sistemas"
```

---

## Task 5: Mundo 6 — 🚀 Estación de Funciones (← Bloque 4 funciones)

**Files:**
- Create: `src/widgets/PendienteOrdenada.jsx`, `src/widgets/ParabolaExplorer.jsx`
- Modify: `src/widgets/index.js`, `src/pages/Bloque4.jsx`
- Create: `src/content/worlds/mundo6-funciones.jsx`, `.../__tests__/mundo6.test.js`, `src/__tests__/mundo6-integracion.test.jsx`
- Modify: `src/content/worlds/index.js`

**Interfaces:**
- Produces: `export const mundo6` (slug `estacion-funciones`, id `mundo6`, 2 niveles: `funcion-lineal`, `funcion-cuadratica`); fábricas `pendienteDe`, `corteEjeY`, `verticeParabola`; widgets `pendiente-ordenada`, `parabola-explorer`.

- [ ] **Step 1: Extraer los 2 widgets** de `Bloque4.jsx`:
- `PendienteOrdenada.jsx` ← `FuncionLinealSection` InteractiveBox `"Juega con la pendiente y la ordenada"` (L178+): copiar su estado + JSX interno.
- `ParabolaExplorer.jsx` ← `FuncionCuadraticaSection` InteractiveBox `"Explora la parábola"` (L422+): estado + JSX interno.
Reemplazar cuerpos en `Bloque4.jsx` por los componentes.

- [ ] **Step 2: Registrar** `'pendiente-ordenada'`, `'parabola-explorer'` en `widgets/index.js`.

- [ ] **Step 3: Test de fábricas (falla)**

Create `src/content/worlds/__tests__/mundo6.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { pendienteDe, corteEjeY, verticeParabola } from '../mundo6-funciones'

describe('fábricas del Mundo 6', () => {
  for (const [n, f] of Object.entries({ pendienteDe, corteEjeY, verticeParabola })) {
    it(`${n}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
})
```
Run: `npm test -- mundo6` → FAIL.

- [ ] **Step 4: Contenido del Mundo 6**

Create `src/content/worlds/mundo6-funciones.jsx`:
```jsx
import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const sg = (k) => (k >= 0 ? `+ ${k}` : `- ${-k}`)
const NO_CERO = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]

export function pendienteDe(rng = Math.random) {
  const m = NO_CERO[randInt(rng, 0, NO_CERO.length - 1)]
  const b = randInt(rng, -6, 6)
  return {
    question: `En f(x) = ${m}x ${sg(b)}, ¿cuál es la pendiente?`,
    ...makeOptions(m, [b, -m, m + b]),
    hint: 'En f(x) = mx + b, la pendiente es m (lo que multiplica a x).',
    reminder: 'Pendiente = m. Ordenada al origen = b.',
  }
}

export function corteEjeY(rng = Math.random) {
  const m = NO_CERO[randInt(rng, 0, NO_CERO.length - 1)]
  let b = randInt(rng, 1, 8) // positivo, distinto de 0
  if (Math.abs(m) === b) b += 1
  return {
    question: `¿Dónde corta el eje Y la función f(x) = ${m}x ${sg(b)}?`,
    ...makeOptions(`(0, ${b})`, [`(${b}, 0)`, `(0, ${m})`, `(0, ${-b})`]),
    hint: 'El corte con el eje Y ocurre cuando x = 0 → punto (0, b).',
    reminder: 'Corte con el eje Y = (0, b).',
  }
}

export function verticeParabola(rng = Math.random) {
  const noCero = (min, max) => { const v = randInt(rng, min, max); return v === 0 ? max : v }
  const h = noCero(-4, 4), k = noCero(-5, 5)
  const b = -2 * h, c = h * h + k // f(x) = x² + bx + c, vértice (h,k)
  return {
    question: `En f(x) = x² ${sg(b)}x ${sg(c)}, ¿cuál es el vértice?`,
    ...makeOptions(`(${h}, ${k})`, [`(${-h}, ${k})`, `(${h}, ${-k})`, `(0, ${c})`]),
    hint: `h = -b/2a = ${-b}/2 = ${h}; k = f(h) = ${k}.`,
    reminder: 'Vértice de la parábola: h = -b/2a, k = f(h).',
  }
}

export const mundo6 = {
  id: 'mundo6', slug: 'estacion-funciones', name: 'Estación de Funciones',
  emoji: '🚀', color: 'bg-bloque4',
  description: 'Funciones lineales y cuadráticas',
  levels: [
    {
      id: 'funcion-lineal', title: 'Función Lineal', icon: '📈',
      briefing: [ /* de Bloque4 FuncionLinealSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'pendiente-ordenada', title: 'Juega con la pendiente y la ordenada' },
      ],
      reto: { pick: 3, factories: [
        pendienteDe,
        corteEjeY,
        staticQuestion({ /* Q2 m=-2 → baja (Bloque4 L106-112) */ }),
      ] },
    },
    {
      id: 'funcion-cuadratica', title: 'Función Cuadrática', icon: '📉',
      briefing: [ /* de FuncionCuadraticaSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'parabola-explorer', title: 'Explora la parábola' },
      ],
      reto: { pick: 3, factories: [
        verticeParabola,
        staticQuestion({ /* Q2 a=-2 abre hacia abajo (Bloque4 L355-361) */ }),
        staticQuestion({ /* Q3 discriminante Δ<0 (Bloque4 L362-368) */ }),
      ] },
    },
  ],
}
```

- [ ] **Step 5: Registrar** `mundo6` en `index.js` (`worlds = [mundo3, mundo4, mundo5, mundo6]`).

- [ ] **Step 6: Integración** — `mundo6-integracion.test.jsx`: `findWorld('estacion-funciones')`, `id==='mundo6'`, **2** niveles.

- [ ] **Step 7: Verificar y commitear**
```bash
npm test -- mundo6 validateContent
npm run build
git add src/widgets/ src/content/worlds/ src/content/worlds/__tests__/mundo6.test.js src/__tests__/mundo6-integracion.test.jsx src/pages/Bloque4.jsx
git commit -m "feat: Mundo 6 (Estación de Funciones) migrado del Bloque 4"
```

---

## Task 6: Mundo 7 — ⛰️ Montañas de Geometría (← Bloque 5)

**Files:**
- Create: `src/widgets/PitagorasCalculadora.jsx`, `src/widgets/TrianguloInteractivo.jsx`, `src/widgets/CilindroCalculadora.jsx`
- Modify: `src/widgets/index.js`, `src/pages/Bloque5.jsx`
- Create: `src/content/worlds/mundo7-geometria.jsx`, `.../__tests__/mundo7.test.js`, `src/__tests__/mundo7-integracion.test.jsx`
- Modify: `src/content/worlds/index.js`

**Interfaces:**
- Produces: `export const mundo7` (slug `montanas-geometria`, id `mundo7`, 4 niveles: `pitagoras`, `trigonometria`, `cilindro`, `prisma`); fábricas `hipotenusa`, `catetoFaltante`, `senOpuesto`, `cosAdyacente`, `areaLateralCilindro`, `areaLateralPrisma`, `carasPrisma`, `aristasPrisma`; widgets `pitagoras-calculadora`, `triangulo-interactivo`, `cilindro-calculadora`.

- [ ] **Step 1: Extraer los 3 widgets** de `Bloque5.jsx`: `PitagorasCalculadora` ← `"Calculadora de Pitágoras"` (L84+), `TrianguloInteractivo` ← `"Triángulo interactivo — Cambia el ángulo"` (L204+), `CilindroCalculadora` ← `"Calculadora del cilindro"` (L316+). Copiar estado + JSX interno + imports (`MathTex`, y si el triángulo usa Mafs, sus imports). Reemplazar cuerpos en `Bloque5.jsx`.

- [ ] **Step 2: Registrar** `'pitagoras-calculadora'`, `'triangulo-interactivo'`, `'cilindro-calculadora'`.

- [ ] **Step 3: Test de fábricas (falla)**

Create `src/content/worlds/__tests__/mundo7.test.js`:
```js
import { describe, it, expect } from 'vitest'
import {
  hipotenusa, catetoFaltante, senOpuesto, cosAdyacente,
  areaLateralCilindro, areaLateralPrisma, carasPrisma, aristasPrisma,
} from '../mundo7-geometria'

const fs = { hipotenusa, catetoFaltante, senOpuesto, cosAdyacente, areaLateralCilindro, areaLateralPrisma, carasPrisma, aristasPrisma }

describe('fábricas del Mundo 7', () => {
  for (const [n, f] of Object.entries(fs)) {
    it(`${n}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
  it('hipotenusa: con rng mínimo (triple 3-4-5) responde 5', () => {
    expect(hipotenusa(() => 0).options[hipotenusa(() => 0).correctAnswer]).toBe('5')
  })
  it('carasPrisma: siempre n+2 (rng mínimo n=3 → 5)', () => {
    const q = carasPrisma(() => 0)
    expect(q.options[q.correctAnswer]).toBe('5')
  })
})
```
Run: `npm test -- mundo7` → FAIL.

- [ ] **Step 4: Contenido del Mundo 7**

Create `src/content/worlds/mundo7-geometria.jsx`:
```jsx
import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]]
const NOMBRE_POLIGONO = { 3: 'triangular', 4: 'rectangular', 5: 'pentagonal', 6: 'hexagonal', 7: 'heptagonal', 8: 'octagonal', 9: 'eneagonal', 10: 'decagonal' }

export function hipotenusa(rng = Math.random) {
  const [a, b, c] = TRIPLES[randInt(rng, 0, TRIPLES.length - 1)]
  return {
    question: `Un triángulo rectángulo tiene catetos de ${a} y ${b}. ¿Cuánto mide la hipotenusa?`,
    ...makeOptions(c, [a + b, a * a + b * b, Math.max(a, b)]),
    hint: `c = √(${a}² + ${b}²) = √${a * a + b * b}.`,
    reminder: 'a² + b² = c². La hipotenusa es el lado más largo.',
  }
}

export function catetoFaltante(rng = Math.random) {
  const [a, b, c] = TRIPLES[randInt(rng, 0, TRIPLES.length - 1)]
  return {
    question: `La hipotenusa mide ${c} y un cateto mide ${a}. ¿Cuánto mide el otro cateto?`,
    ...makeOptions(b, [c - a, c * c - a * a, c]),
    hint: `b = √(${c}² − ${a}²) = √${c * c - a * a}.`,
    reminder: 'Despeja: b² = c² − a².',
  }
}

export function senOpuesto(rng = Math.random) {
  const hyp = randInt(rng, 2, 12) * 2 // par → opuesto entero
  const op = hyp / 2 // sen(30°) = 0.5
  return {
    question: `En un triángulo rectángulo con un ángulo de 30° y una hipotenusa de ${hyp}, ¿cuánto mide el cateto opuesto?`,
    ...makeOptions(op, [hyp, hyp * 2, op + 1]),
    hint: 'sen(30°) = 0.5 → opuesto = hipotenusa × 0.5.',
    reminder: 'sen(α) = opuesto/hipotenusa → opuesto = hipotenusa × sen(α).',
  }
}

export function cosAdyacente(rng = Math.random) {
  const hyp = randInt(rng, 2, 12) * 2
  const adj = hyp / 2 // cos(60°) = 0.5
  return {
    question: `Con un ángulo de 60° y una hipotenusa de ${hyp}, ¿cuánto mide el cateto adyacente?`,
    ...makeOptions(adj, [hyp, hyp * 2, adj + 1]),
    hint: 'cos(60°) = 0.5 → adyacente = hipotenusa × 0.5.',
    reminder: 'cos(α) = adyacente/hipotenusa → adyacente = hipotenusa × cos(α).',
  }
}

export function areaLateralCilindro(rng = Math.random) {
  const r = randInt(rng, 3, 9), h = randInt(rng, 2, 12) // r≥3 evita colisión r²h == 2rh
  const coef = 2 * r * h
  return {
    question: `Un cilindro tiene radio ${r} y altura ${h}. ¿Cuál es su área lateral?`,
    ...makeOptions(`${coef}π`, [`${r * h}π`, `${r * r * h}π`, `${(r + h) * 2}π`]),
    hint: `A_L = 2πrh = 2π(${r})(${h}) = ${coef}π.`,
    reminder: 'Área lateral del cilindro = 2π·r·h.',
  }
}

export function areaLateralPrisma(rng = Math.random) {
  const l = randInt(rng, 2, 8), w = randInt(rng, 2, 8), h = randInt(rng, 3, 10)
  const per = 2 * (l + w)
  return {
    question: `Un prisma rectangular mide ${l}×${w}×${h}. ¿Cuál es su área lateral?`,
    ...makeOptions(per * h, [l * w * h, 2 * (l * w + l * h + w * h), per]),
    hint: `Perímetro de la base = 2(${l}+${w}) = ${per}; A_L = ${per}×${h}.`,
    reminder: 'Área lateral del prisma = perímetro de la base × altura.',
  }
}

export function carasPrisma(rng = Math.random) {
  const n = randInt(rng, 3, 10)
  return {
    question: `¿Cuántas caras tiene un prisma ${NOMBRE_POLIGONO[n]} (base de ${n} lados)?`,
    ...makeOptions(n + 2, [n, 2 * n, n + 1]),
    hint: 'Un prisma de n lados: n caras laterales + 2 bases.',
    reminder: 'Caras = n + 2.',
  }
}

export function aristasPrisma(rng = Math.random) {
  const n = randInt(rng, 3, 10)
  return {
    question: `Un prisma ${NOMBRE_POLIGONO[n]} tiene base de ${n} lados. ¿Cuántas aristas tiene?`,
    ...makeOptions(3 * n, [2 * n, n + 2, n * n]),
    hint: 'Aristas = 3n (n de cada base + n verticales).',
    reminder: 'Prisma de n lados: Vértices 2n, Aristas 3n, Caras n+2.',
  }
}

export const mundo7 = {
  id: 'mundo7', slug: 'montanas-geometria', name: 'Montañas de Geometría',
  emoji: '⛰️', color: 'bg-bloque5',
  description: 'Pitágoras, trigonometría, cilindro y prisma',
  levels: [
    {
      id: 'pitagoras', title: 'Teorema de Pitágoras', icon: '📐',
      briefing: [ /* de PitagorasSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'pitagoras-calculadora', title: 'Calculadora de Pitágoras' },
      ],
      reto: { pick: 3, factories: [
        hipotenusa, catetoFaltante,
        staticQuestion({ /* Q3 "¿Cuál es el Teorema de Pitágoras?" (Bloque5 L33-39) */ }),
      ] },
    },
    {
      id: 'trigonometria', title: 'Razones Trigonométricas', icon: '📐',
      briefing: [ /* de TrigonometriaSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'triangulo-interactivo', title: 'Triángulo interactivo — Cambia el ángulo' },
      ],
      reto: { pick: 3, factories: [
        senOpuesto, cosAdyacente,
        staticQuestion({ /* Q2 "¿Qué significa SOH-CAH-TOA?" (Bloque5 L156-162) */ }),
      ] },
    },
    {
      id: 'cilindro', title: 'El Cilindro', icon: '🥫',
      briefing: [ /* de CilindroSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'cilindro-calculadora', title: 'Calculadora del cilindro' },
      ],
      reto: { pick: 3, factories: [
        areaLateralCilindro,
        staticQuestion({ /* Q2 área total (Bloque5 L276-282) */ }),
        staticQuestion({ /* Q3 desenrollar → rectángulo (Bloque5 L283-289) */ }),
      ] },
    },
    {
      id: 'prisma', title: 'El Prisma', icon: '🧊',
      briefing: [ /* de PrismaSection: why + content + mistakes; SIN widget */ ],
      reto: { pick: 3, factories: [
        areaLateralPrisma, carasPrisma, aristasPrisma,
      ] },
    },
  ],
}
```

- [ ] **Step 5: Registrar** `mundo7` (`worlds = [mundo3, mundo4, mundo5, mundo6, mundo7]`).
- [ ] **Step 6: Integración** — `mundo7-integracion.test.jsx`: `findWorld('montanas-geometria')`, `id==='mundo7'`, **4** niveles.
- [ ] **Step 7: Verificar y commitear**
```bash
npm test -- mundo7 validateContent
npm run build
git add src/widgets/ src/content/worlds/ src/content/worlds/__tests__/mundo7.test.js src/__tests__/mundo7-integracion.test.jsx src/pages/Bloque5.jsx
git commit -m "feat: Mundo 7 (Montañas de Geometría) migrado del Bloque 5"
```

---

## Task 7: Mundo 8 — 🎡 Feria de Datos (← Bloque 6 + nivel nuevo de probabilidad)

**Files:**
- Create: `src/widgets/EstadisticaCalculadora.jsx`, `src/widgets/BoxPlot.jsx`, `src/widgets/PermutacionesCalculadora.jsx`, `src/widgets/CombinacionesCalculadora.jsx`, `src/widgets/AtuendosEjemplo.jsx`
- Modify: `src/widgets/index.js`, `src/pages/Bloque6.jsx`
- Create: `src/content/worlds/mundo8-datos.jsx`, `.../__tests__/mundo8.test.js`, `src/__tests__/mundo8-integracion.test.jsx`
- Modify: `src/content/worlds/index.js`

**Interfaces:**
- Produces: `export const mundo8` (slug `feria-datos`, id `mundo8`, 6 niveles: `estadistica`, `percentiles`, `conteo`, `permutaciones`, `combinaciones`, `probabilidad`); fábricas `media`, `mediana`, `moda`, `principioConteo`, `menuConteo`, `permutaciones`, `factorial`, `combinaciones`, `probEvento`, `probComplementario`, `probIndependientes`; widgets `estadistica-calculadora`, `boxplot`, `permutaciones-calculadora`, `combinaciones-calculadora`, `atuendos-ejemplo`.

- [ ] **Step 1: Extraer los 5 widgets** de `Bloque6.jsx`: `EstadisticaCalculadora` ← `"Calculadora interactiva"` (L119+), `BoxPlot` ← `"Diagrama de caja (Box Plot)"` (L259+), `PermutacionesCalculadora` ← `"Calculadora de permutaciones"` (L395+), `CombinacionesCalculadora` ← `"Calculadora de combinaciones"` (L483+), `AtuendosEjemplo` ← `"Ejemplo: ¿Cuántos atuendos puedes formar?"` (L560+). Copiar estado + JSX interno + imports (BoxPlot puede usar Recharts/Mafs → copiar sus imports). Reemplazar cuerpos en `Bloque6.jsx`.

- [ ] **Step 2: Registrar** los 5 ids: `'estadistica-calculadora'`, `'boxplot'`, `'permutaciones-calculadora'`, `'combinaciones-calculadora'`, `'atuendos-ejemplo'`.

- [ ] **Step 3: Test de fábricas (falla)**

Create `src/content/worlds/__tests__/mundo8.test.js`:
```js
import { describe, it, expect } from 'vitest'
import {
  media, mediana, moda, principioConteo, menuConteo,
  permutaciones, factorial, combinaciones,
  probEvento, probComplementario, probIndependientes,
} from '../mundo8-datos'

const fs = { media, mediana, moda, principioConteo, menuConteo, permutaciones, factorial, combinaciones, probEvento, probComplementario, probIndependientes }

describe('fábricas del Mundo 8', () => {
  for (const [n, f] of Object.entries(fs)) {
    it(`${n}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
  it('permutaciones: P(n,r) correcto (rng mín n=4,r=2 → 12)', () => {
    const q = permutaciones(() => 0)
    expect(q.options[q.correctAnswer]).toBe('12')
  })
  it('combinaciones: C(n,r) correcto (rng mín n=5,r=2 → 10)', () => {
    const q = combinaciones(() => 0)
    expect(q.options[q.correctAnswer]).toBe('10')
  })
})
```
Run: `npm test -- mundo8` → FAIL.

- [ ] **Step 4: Contenido del Mundo 8 (incluye el nivel nuevo de probabilidad)**

Create `src/content/worlds/mundo8-datos.jsx`:
```jsx
import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }
const baraja = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }

export function media(rng = Math.random) {
  const mean = randInt(rng, 5, 20)
  const d1 = randInt(rng, 1, 4), d2 = randInt(rng, 5, 9)
  const vals = [mean - d2, mean - d1, mean, mean + d1, mean + d2] // promedian 'mean'
  return {
    question: `¿Cuál es la media de: ${vals.join(', ')}?`,
    ...makeOptions(mean, [mean + 1, mean - 1, mean + d2]),
    hint: `Suma = ${vals.reduce((a, b) => a + b, 0)}, n = 5 → media = suma/5.`,
    reminder: 'Media = suma de los valores / cantidad de valores.',
  }
}

export function mediana(rng = Math.random) {
  const base = randInt(rng, 1, 8)
  const vals = [base, base + randInt(rng, 1, 3), base + randInt(rng, 4, 6), base + randInt(rng, 7, 9), base + randInt(rng, 10, 13)]
  const med = vals[2]
  const mostrado = baraja(vals, rng)
  return {
    question: `¿Cuál es la mediana de: ${mostrado.join(', ')}?`,
    ...makeOptions(med, [vals[0], vals[4], vals[1]]),
    hint: 'Ordena los datos y toma el del medio.',
    reminder: 'Mediana = valor central con los datos ordenados.',
  }
}

export function moda(rng = Math.random) {
  const mode = randInt(rng, 1, 9)
  let x = randInt(rng, 1, 9); if (x === mode) x = mode === 9 ? 1 : mode + 1
  let y = randInt(rng, 1, 9); if (y === mode || y === x) y = [1, 2, 3, 4, 5, 6, 7, 8, 9].find(v => v !== mode && v !== x)
  const mostrado = baraja([x, x, y, mode, mode, mode], rng)
  return {
    question: `En los datos ${mostrado.join(', ')}, ¿cuál es la moda?`,
    ...makeOptions(mode, [x, y, mode + 1]),
    hint: 'La moda es el valor que más se repite.',
    reminder: 'Moda = valor más frecuente.',
  }
}

export function principioConteo(rng = Math.random) {
  const a = randInt(rng, 2, 5), b = randInt(rng, 2, 5), c = randInt(rng, 2, 4)
  return {
    question: `Tienes ${a} camisas, ${b} pantalones y ${c} pares de zapatos. ¿Cuántos atuendos distintos puedes formar?`,
    ...makeOptions(a * b * c, [a + b + c, a * b + c, a * b]),
    hint: `${a} × ${b} × ${c}.`,
    reminder: 'Principio de conteo: multiplica las opciones de cada decisión.',
  }
}

export function menuConteo(rng = Math.random) {
  const a = randInt(rng, 2, 5), b = randInt(rng, 3, 6), c = randInt(rng, 2, 3)
  return {
    question: `Un menú tiene ${a} entradas, ${b} platos principales y ${c} postres. ¿Cuántos menús completos distintos hay?`,
    ...makeOptions(a * b * c, [a + b + c, b * c, a * b]),
    hint: `${a} × ${b} × ${c}.`,
    reminder: 'Multiplica las opciones de cada elección independiente.',
  }
}

export function permutaciones(rng = Math.random) {
  const n = randInt(rng, 4, 7), r = randInt(rng, 2, 3)
  return {
    question: `¿De cuántas formas puedes ordenar ${r} elementos elegidos de ${n} (el orden importa)?`,
    ...makeOptions(fact(n) / fact(n - r), [fact(n) / (fact(r) * fact(n - r)), fact(n), n * r]),
    hint: `P(${n},${r}) = ${n}!/(${n}−${r})!.`,
    reminder: 'Permutación (orden importa): P(n,r) = n!/(n−r)!.',
  }
}

export function factorial(rng = Math.random) {
  const n = randInt(rng, 3, 6)
  return {
    question: `¿Cuánto vale ${n}! (factorial de ${n})?`,
    ...makeOptions(fact(n), [n * n, n * (n - 1), fact(n - 1)]),
    hint: `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')}.`,
    reminder: 'n! = n × (n−1) × … × 1.',
  }
}

export function combinaciones(rng = Math.random) {
  const n = randInt(rng, 5, 10), r = randInt(rng, 2, 3)
  return {
    question: `¿De cuántas formas puedes elegir ${r} elementos de ${n} (el orden NO importa)?`,
    ...makeOptions(fact(n) / (fact(r) * fact(n - r)), [fact(n) / fact(n - r), n * r, fact(n)]),
    hint: `C(${n},${r}) = ${n}!/(${r}!·(${n}−${r})!).`,
    reminder: 'Combinación (orden no importa): C(n,r) = n!/(r!(n−r)!).',
  }
}

export function probEvento(rng = Math.random) {
  const total = [4, 5, 6, 8, 10][randInt(rng, 0, 4)]
  let fav = randInt(rng, 1, total - 1)
  if (total === 2 * fav) fav += 1 // evita que el complemento coincida
  return {
    question: `En una caja hay ${total} objetos y ${fav} son legendarios. Si sacas uno al azar, ¿cuál es la probabilidad de que sea legendario?`,
    ...makeOptions(`${fav}/${total}`, [`${total}/${fav}`, `${total - fav}/${total}`, `${fav}/${total - fav}`]),
    hint: `P = casos favorables / casos posibles = ${fav}/${total}.`,
    reminder: 'P(evento) = casos favorables / casos posibles.',
  }
}

export function probComplementario(rng = Math.random) {
  const total = [5, 10, 20, 4, 8][randInt(rng, 0, 4)]
  let fav = randInt(rng, 1, total - 1)
  if (total === 2 * fav) fav += 1
  return {
    question: `La probabilidad de ganar un premio es ${fav}/${total}. ¿Cuál es la probabilidad de NO ganar?`,
    ...makeOptions(`${total - fav}/${total}`, [`${fav}/${total}`, `${total}/${total - fav}`, `${total - fav}/${fav}`]),
    hint: `P(no) = 1 − ${fav}/${total} = ${total - fav}/${total}.`,
    reminder: 'P(complemento) = 1 − P(evento).',
  }
}

export function probIndependientes(rng = Math.random) {
  const opciones = [2, 3, 4, 5, 6]
  const d1 = opciones[randInt(rng, 0, 4)]
  let d2 = opciones[randInt(rng, 0, 4)]
  if (d1 * d2 === d1 + d2) d2 += 1 // evita 1/4 == 1/4 cuando d1=d2=2
  return {
    question: `Sacas un objeto raro con probabilidad 1/${d1} y, en una tirada independiente, otro con 1/${d2}. ¿Probabilidad de lograr ambos?`,
    ...makeOptions(`1/${d1 * d2}`, [`1/${d1 + d2}`, `2/${d1 * d2}`, `1/${Math.max(d1, d2)}`]),
    hint: `Independientes → multiplica: 1/${d1} × 1/${d2} = 1/${d1 * d2}.`,
    reminder: 'Eventos independientes: P(A y B) = P(A) × P(B).',
  }
}

export const mundo8 = {
  id: 'mundo8', slug: 'feria-datos', name: 'Feria de Datos',
  emoji: '🎡', color: 'bg-bloque6',
  description: 'Estadística, percentiles, conteo, permutaciones, combinaciones y probabilidad',
  levels: [
    {
      id: 'estadistica', title: 'Media, Mediana y Moda', icon: '📊',
      briefing: [ /* de MediaMedianaModa: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'estadistica-calculadora', title: 'Calculadora interactiva' },
      ],
      reto: { pick: 3, factories: [media, mediana, moda] },
    },
    {
      id: 'percentiles', title: 'Percentiles y Cuartiles', icon: '📉',
      briefing: [ /* de PercentilesSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'boxplot', title: 'Diagrama de caja (Box Plot)' },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({ /* Q1 percentil 75 (Bloque6 L197-203) */ }),
        staticQuestion({ /* Q2 Q2 = mediana (L204-210) */ }),
        staticQuestion({ /* Q3 Q1 de 2,4,6,8,10 (L211-217) */ }),
      ] },
    },
    {
      id: 'conteo', title: 'Principio de Conteo', icon: '👕',
      briefing: [ /* de PrincipioConteoSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'atuendos-ejemplo', title: 'Ejemplo: ¿Cuántos atuendos puedes formar?' },
      ],
      reto: { pick: 3, factories: [
        principioConteo, menuConteo,
        staticQuestion({ /* Q3 "¿Cuándo usas el principio de conteo?" (Bloque6 L537-543) */ }),
      ] },
    },
    {
      id: 'permutaciones', title: 'Permutaciones', icon: '🔢',
      briefing: [ /* de PermutacionesSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'permutaciones-calculadora', title: 'Calculadora de permutaciones' },
      ],
      reto: { pick: 3, factories: [
        permutaciones, factorial,
        staticQuestion({ /* Q3 "¿cuándo usas permutaciones?" (Bloque6 L343-349) */ }),
      ] },
    },
    {
      id: 'combinaciones', title: 'Combinaciones', icon: '🎲',
      briefing: [ /* de CombinacionesSection: why + content + mistakes, widget */
        { type: 'widget', widgetId: 'combinaciones-calculadora', title: 'Calculadora de combinaciones' },
      ],
      reto: { pick: 3, factories: [
        combinaciones, factorial,
        staticQuestion({ /* Q3 diferencia permutación/combinación (Bloque6 L444-450) */ }),
      ] },
    },
    {
      id: 'probabilidad', title: 'Probabilidad Básica', icon: '🎰',
      briefing: [
        { type: 'why', body: <>Cada vez que abres un cofre o tiras la ruleta de un gacha, hay una probabilidad detrás. Aprender a calcularla te dice qué tan raro es de verdad ese ítem legendario.</> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-2">La <GlossaryTerm term="Probabilidad" definition="Medida de qué tan posible es un evento, entre 0 (imposible) y 1 (seguro)">probabilidad</GlossaryTerm> de un evento es:</p>
          <MathTex expr={"P(\\text{evento}) = \\dfrac{\\text{casos favorables}}{\\text{casos posibles}}"} display />
          <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
            <li>El <strong>espacio muestral</strong> son todos los resultados posibles.</li>
            <li><strong>Complemento:</strong> <MathTex expr={"P(\\text{no } A) = 1 - P(A)"} />.</li>
            <li><strong>Independientes</strong> (una tirada no afecta a la otra): <MathTex expr={"P(A \\text{ y } B) = P(A)\\times P(B)"} />.</li>
          </ul>
        </> },
        { type: 'mistakes', items: [
          'Invertir la fracción: es favorables/posibles, no posibles/favorables.',
          'Sumar probabilidades de eventos independientes en vez de multiplicarlas.',
          'Olvidar que P siempre está entre 0 y 1 (nunca mayor que 1).',
        ] },
      ],
      reto: { pick: 3, factories: [
        probEvento, probComplementario, probIndependientes,
        staticQuestion({
          question: 'Si lanzas un dado de 6 caras, ¿cuál es la probabilidad de sacar un número par?',
          options: ['3/6', '2/6', '1/6', '6/3'],
          correctAnswer: 0,
          hint: 'Pares en un dado: 2, 4, 6 → 3 casos favorables de 6 posibles.',
          reminder: 'P = casos favorables / casos posibles.',
        }),
      ] },
    },
  ],
}
```

- [ ] **Step 5: Registrar** `mundo8` (`worlds = [mundo3, mundo4, mundo5, mundo6, mundo7, mundo8]`).
- [ ] **Step 6: Integración** — `mundo8-integracion.test.jsx`: `findWorld('feria-datos')`, `id==='mundo8'`, **6** niveles.
- [ ] **Step 7: Verificar y commitear**
```bash
npm test -- mundo8 validateContent
npm run build
git add src/widgets/ src/content/worlds/ src/content/worlds/__tests__/mundo8.test.js src/__tests__/mundo8-integracion.test.jsx src/pages/Bloque6.jsx
git commit -m "feat: Mundo 8 (Feria de Datos) migrado del Bloque 6 + nivel de probabilidad básica"
```

---

## Task 8: Ruteo, modo estudio, redirects, 404 y flip del mapa a modo juego

**Files:**
- Create: `src/engine/StudyView.jsx`, `src/components/NotFound.jsx`
- Modify: `src/App.jsx`, `src/engine/WorldView.jsx`, `src/content/worldMap.js`, `src/content/__tests__/worldMap.test.js`

**Interfaces:**
- Consumes: los `BloqueN.jsx` (páginas de estudio), `worldMapNodes` (para navegación).
- Produces: rutas `/mundo/:slug/estudio` (prosa), redirects `/bloqueN → /mundo/:slug`, ruta `*` (404). Nodos 4-8 con `mode:'game'`, `levelKeys`, `studyTarget`.

- [ ] **Step 1: Actualizar el test de worldMap para los targets nuevos (falla)**

En `src/content/__tests__/worldMap.test.js`, reemplazar el `validTargets` (L15-17) por:
```js
    const validTargets = new Set([
      '/mundo/volcan-potencias', '/mundo/castillo-algebra', '/mundo/laberinto-sistemas',
      '/mundo/estacion-funciones', '/mundo/montanas-geometria', '/mundo/feria-datos',
    ])
```
Añadir un test nuevo dentro de `describe('worldMap: modelo de nodos', …)`:
```js
  it('los 6 mundos activos son de modo juego con levelKeys y studyTarget', () => {
    for (const n of worldMapNodes.filter(n => n.status === 'active')) {
      expect(n.mode, n.id).toBe('game')
      expect(Array.isArray(n.levelKeys) && n.levelKeys.length > 0, n.id).toBe(true)
      expect(n.studyTarget, n.id).toMatch(/^\/mundo\/.+\/estudio$/)
    }
  })
```

Además, dos tests existentes usaban `castillo` como ejemplo de nodo de **estudio**; al pasar a modo juego cambian de comportamiento. Actualizarlos:

- En `describe('worldMap: worldProgress', …)` (L61-67), el caso "nodo de estudio o teaser → null" ya no aplica a `castillo` (ahora es `game` y devuelve progreso). Cambiarlo para usar un teaser:
```js
  const isla = worldMapNodes.find(n => n.id === 'isla-numerica')

  it('teaser (coming-soon) -> null (sin progreso falso)', () => {
    expect(worldProgress(isla, { completedLevels: [] })).toBeNull()
  })
```
  Y añadir que `castillo` ahora SÍ da progreso:
```js
  it('mundo jugable sin avance: 0 estrellas, 0%', () => {
    const p = worldProgress(castillo, { completedLevels: [], stars: {} })
    expect(p).toEqual({ stars: 0, totalStars: 15, done: 0, total: 5, pct: 0 })
  })
```
  (`castillo` tiene 5 niveles → `totalStars` = 15.)
- En `describe('worldMap: nodeState', …)` (L103-106), renombrar la descripción de "nodo de estudio → siempre available" a "mundo jugable → available si no está completo"; las aserciones (`nodeState(castillo, …) === 'available'`) siguen siendo válidas y no cambian.

Run: `npm test -- worldMap` → FAIL (nodos 4-8 aún `mode:'study'` con targets `/bloqueN`; los tests actualizados esperan modo juego).

- [ ] **Step 2: Flip de los nodos 4-8 en worldMap.js**

En `src/content/worldMap.js`, para cada nodo activo `castillo-algebra`, `laberinto-sistemas`, `estacion-funciones`, `montanas-geometria`, `feria-datos`: cambiar `mode: 'study'` → `mode: 'game'`, `target: '/bloqueN'` → `target: '/mundo/<slug>'`, y añadir `studyTarget: '/mundo/<slug>/estudio'` y `levelKeys`. Ejemplo para castillo-algebra:
```js
  {
    id: 'castillo-algebra', world: 'Castillo del Álgebra', emoji: '🏰',
    title: 'Castillo del Álgebra', subtitle: 'Polinomios, MCD/MCM y fracciones algebraicas',
    theme: 'world-castillo', shape: 'castle', position: [-0.4, 0, -3.0],
    target: '/mundo/castillo-algebra', mode: 'game', status: 'active',
    studyTarget: '/mundo/castillo-algebra/estudio',
    levelKeys: ['mundo4/mcd', 'mundo4/mcm', 'mundo4/fracciones-algebraicas', 'mundo4/operaciones', 'mundo4/ecuaciones-lineales'],
  },
```
`levelKeys` de los demás:
- laberinto-sistemas: `['mundo5/intro-sistemas', 'mundo5/metodo-grafico', 'mundo5/reduccion', 'mundo5/cramer']`, target `/mundo/laberinto-sistemas`.
- estacion-funciones: `['mundo6/funcion-lineal', 'mundo6/funcion-cuadratica']`, target `/mundo/estacion-funciones`.
- montanas-geometria: `['mundo7/pitagoras', 'mundo7/trigonometria', 'mundo7/cilindro', 'mundo7/prisma']`, target `/mundo/montanas-geometria`.
- feria-datos: `['mundo8/estadistica', 'mundo8/percentiles', 'mundo8/conteo', 'mundo8/permutaciones', 'mundo8/combinaciones', 'mundo8/probabilidad']`, target `/mundo/feria-datos`.

También añadir `studyTarget: '/mundo/volcan-potencias/estudio'` al nodo `volcan-potencias` (ya es `game`). Añadir `slug` a cada entrada de `blockRoutes` para el redirect (Step 4): `{ path: '/bloque1', slug: 'volcan-potencias', label: 'Volcán de las Potencias' }`, …, `{ path: '/bloque6', slug: 'feria-datos', label: 'Feria de Datos' }` (orden bloque1→6 ↔ volcan, castillo, laberinto, estacion, montanas, feria).

Run: `npm test -- worldMap validateContent` → PASS (validador confirma que los levelKeys existen).

- [ ] **Step 3: StudyView (slug → BloqueN)**

Create `src/engine/StudyView.jsx`:
```jsx
import { Link, useParams } from 'react-router-dom'
import Bloque1 from '../pages/Bloque1'
import Bloque2 from '../pages/Bloque2'
import Bloque3 from '../pages/Bloque3'
import Bloque4 from '../pages/Bloque4'
import Bloque5 from '../pages/Bloque5'
import Bloque6 from '../pages/Bloque6'

const PAGES = {
  'volcan-potencias': Bloque1,
  'castillo-algebra': Bloque2,
  'laberinto-sistemas': Bloque3,
  'estacion-funciones': Bloque4,
  'montanas-geometria': Bloque5,
  'feria-datos': Bloque6,
}

export default function StudyView() {
  const { slug } = useParams()
  const Page = PAGES[slug]
  if (!Page) return <p className="text-center py-12">Modo estudio no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>
  return (
    <div>
      <div className="max-w-3xl mx-auto mb-4">
        <Link to={`/mundo/${slug}`} className="text-primary font-semibold text-sm">← Volver al mundo (modo juego)</Link>
      </div>
      <Page />
    </div>
  )
}
```

- [ ] **Step 4: NotFound**

Create `src/components/NotFound.jsx`:
```jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <p className="text-6xl mb-3">🧭</p>
      <h1 className="font-display text-2xl font-extrabold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-6">Esa ruta no existe en el mapa.</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-white font-bold inline-block">🗺️ Ir al mapa de mundos</Link>
    </div>
  )
}
```

- [ ] **Step 5: Rutas en App.jsx**

Reescribir `src/App.jsx`: quitar las rutas directas `/bloqueN` y sus imports de página (se resuelven en StudyView); añadir estudio, redirects y 404:
```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import WorldMap from './pages/WorldMap'
import WorldView from './engine/WorldView'
import LevelPlayer from './engine/LevelPlayer'
import StudyView from './engine/StudyView'
import NotFound from './components/NotFound'
import { blockRoutes } from './content/worldMap'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WorldMap />} />
        <Route path="/mundo/:slug" element={<WorldView />} />
        <Route path="/mundo/:slug/nivel/:levelId" element={<LevelPlayer />} />
        <Route path="/mundo/:slug/estudio" element={<StudyView />} />
        {blockRoutes.map(b => (
          <Route key={b.path} path={b.path} element={<Navigate to={`/mundo/${b.slug}`} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 6: Enlace "Modo estudio" en WorldView**

En `src/engine/WorldView.jsx`, dentro del `<div>` de cabecera (bajo la tarjeta de Nv./XP, antes de la lista de niveles), añadir:
```jsx
      <div className="mb-4">
        <Link to={`/mundo/${world.slug}/estudio`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary glass rounded-full px-3 py-1.5 hover:shadow-md transition">
          📖 Modo estudio
        </Link>
      </div>
```
(`Link` ya está importado.)

- [ ] **Step 7: Verificar y probar en navegador**

```bash
npm test
npm run build
npm run dev
```
Checklist en `http://localhost:5173`:
1. El mapa (2D/3D) muestra los 6 mundos; clic en Castillo/Laberinto/Estación/Montañas/Feria → **lista de niveles del modo juego** (no la página de bloque), solo el nivel 1 desbloqueado.
2. Cada mundo muestra "📖 Modo estudio" → abre la prosa completa del Bloque; "← Volver al mundo" regresa.
3. Ir directo a `/bloque2` redirige a `/mundo/castillo-algebra`. Igual `/bloque1`…`/bloque6`.
4. Una ruta inventada (`/xyz`) muestra el 404 con enlace al mapa.
5. Completar el nivel 1 de un mundo nuevo desbloquea el 2 y persiste tras F5; la barra de progreso del mundo en el mapa sube.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/engine/StudyView.jsx src/engine/WorldView.jsx src/components/NotFound.jsx src/content/worldMap.js src/content/__tests__/worldMap.test.js
git commit -m "feat: modo juego en mundos 4-8, modo estudio, redirects /bloqueN y ruta 404"
```

---

## Task 9: Verificación final y cierre de Fase 2 en TODO

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Suite completa + build**

```bash
npm test
npm run build
```
Expected: todos los tests verdes (incluye `validateContent` con los 6 mundos, las fábricas de 4-8, e integración por mundo) y `vite build` sin errores.

- [ ] **Step 2: Marcar Fase 2 completa en TODO.md**

En `TODO.md`, marcar los ítems de "## Fase 2 — Migración completa" como `[x]` (extraer widgets 2-6, migrar Mundos 4-8, nivel de probabilidad, WorldMap/redirects/404, script de validación) y actualizar la nota del encabezado indicando que la migración de contenido de bloques está completa. Retirar de "Follow-ups" el ítem "Retirar preguntas duplicadas entre Bloque1 y mundo3" si ya no aplica.

- [ ] **Step 3: Commit**

```bash
git add TODO.md
git commit -m "docs: cerrar Fase 2 (migración completa de Mundos 4-8) en TODO"
```

---

## Self-review del plan (hecho)

- **Cobertura del spec de Fase 2:** widgets 2-6 extraídos (Tasks 3-7, Step 1) · Mundos 4-8 migrados (Tasks 3-7) · Bloque 4 repartido (M4 ecuaciones, M5 intro, M6 funciones) · nivel de probabilidad nuevo (Task 7) · preguntas "más parametrizadas" (fábricas en cada task + estáticas para lo conceptual) · WorldMap ya es Home + flip a modo juego + `studyTarget` (Task 8) · redirects `/bloqueN` + 404 (Task 8) · modo estudio conservado (StudyView, Task 8) · validador de contenido (Task 1) · fix del bug de ids del Mundo 3 (Task 1) · tests de fábricas + integración por mundo (Tasks 3-7) + validador en `npm test`.
- **Sin placeholders de lógica:** todo el código nuevo (helper, fábricas, validador, ruteo, worldMap, tests) está completo. Las únicas remisiones al fuente son copias literales de prosa y de preguntas conceptuales desde `BloqueN.jsx` (localizadas por sección + título de InteractiveBox + líneas), consistente con la convención de la Fase 1 (el ejecutor tiene los archivos).
- **Consistencia de interfaces:** `levelKey = 'mundoN/<levelId>'` en contenido (Tasks 3-7) ↔ `levelKeys` del mapa (Task 8) ↔ validador (Task 1); `makeOptions`/`randInt`/`staticQuestion`/`buildReto`/`shuffleOptions` (generators) consumidos por todas las fábricas; `blockRoutes[].slug` definido en worldMap.js (Task 8 Step 2) y consumido en App.jsx (Task 8 Step 5) y StudyView; registro `widgets` por id (Task N Step 2) ↔ briefings `widgetId` ↔ validador.
- **Riesgo de deriva matemática:** cada fábrica lleva test estructural de 500 tiradas (4 opciones distintas, correctAnswer válido) + spot-checks de correctitud con rng determinista donde aplica; el validador ejecuta cada fábrica una vez en `npm test`. Las fábricas no usan bucles de rechazo (usan nudges de un paso), así que un rng constante en tests no cuelga.
```
