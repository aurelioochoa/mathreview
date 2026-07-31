# Rediseño World Map 3D + sistema glossy — Plan de implementación

> **Estado: ejecutado y cerrado ✅ (2026-07-19/21)** — 58/58 pasos. Commits `926d745`…`83c56ce`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir Math Quest en un juego 3D moderno: home = mapa de mundos 3D glossy navegable, HUD de juego persistente, reskin unificado de bloques y modo juego, y celebración 3D al completar un nivel — sin tocar el contenido ni la lógica ya probados.

**Architecture:** Enfoque A del spec `2026-07-19-rediseno-worldmap-3d-design.md`: una escena react-three-fiber (lazy) para el mapa y las celebraciones; el resto es DOM con tokens Tailwind v4 glossy + animaciones `motion`. Una fuente de verdad única (`content/worldMap.js`) alimenta el mapa 3D, el fallback 2D accesible y la navegación. Toda la lógica derivable se extrae a funciones puras testeables; el render 3D se verifica con build + e2e manual.

**Tech Stack:** React 19.2 + Vite 8 + React Router 7 + Tailwind CSS v4 · three.js + @react-three/fiber v9 + @react-three/drei v10 + @react-three/postprocessing v3 · motion v12 · Vitest (entorno node, solo lógica pura).

## Global Constraints

Estas reglas aplican a **todas** las tareas (valores verificados el 2026-07-19 contra npm + docs):

- **React debe quedar `>=19 <19.3`** — es el peer range de `@react-three/fiber` v9. `react` y `react-dom` se pinean a `~19.2.4` (permite parches 19.2.x, bloquea 19.3). Instalado hoy: 19.2.4. ✅
- **Versiones exactas a pinear:** `three` `~0.185.1` (tilde: los minors 0.x rompen), `@react-three/fiber` `^9.6.1`, `@react-three/drei` `^10.7.7`, `@react-three/postprocessing` `^3.0.4`, `motion` `^12.42.2`. NO usar drei v10.0.0-alpha ni postprocessing 2.x (peer React 18).
- **100% offline / self-contained** (deploy por Cloudflare Tunnel). PROHIBIDO en runtime: drei `<Environment preset="…">` (baja HDR de un CDN), drei `<Text>` con fuente por defecto (baja fuente), `useTexture`/`useLoader`/`useGLTF` con URL remota, `@import url("https://fonts.googleapis…")`. Todo asset (fuente, HDR si lo hubiera) va local. Iluminación: `<Lightformer>` procedural + luces manuales. Labels 3D: drei `<Html>` (DOM), no `<Text>`.
- **Import de motion:** siempre desde `"motion/react"` (no `"framer-motion"`). No instalar ambos.
- **Todo el 3D es lazy:** `React.lazy(() => import(...))` + `<Suspense>`. El postprocessing (Bloom) va en su propio módulo con **default export** (los exports `EffectComposer`/`Bloom` son named y no se pueden `lazy()` directo).
- **`prefers-reduced-motion` se respeta siempre:** `useReducedMotion()` de motion en JS + `@media (prefers-reduced-motion: reduce)` en CSS. Reduced → sin auto-rotación/float/bloom/transiciones; poses estáticas.
- **La navegación no depende de WebGL:** siempre hay enlaces DOM reales y enfocables (fallback 2D visible, o lista `sr-only` cuando el canvas está activo).
- **Se conserva contenido, rutas y lógica.** Los 28 tests existentes deben seguir verdes tras cada tarea (`npm test`).
- **Tests solo de lógica pura en entorno node** (convención del repo — no hay `@testing-library/react` y no se añade). El render se verifica con `npm run build` + e2e manual en navegador.
- **Idioma UI: español.** Copy amigable para niños.

---

## Estructura de archivos

**Crear:**
- `src/content/worldMap.js` — fuente única de nodos del mapa + helpers puros (`worldMapNodes`, `nodeState`, `blockRoutes`, `adjacentBlock`).
- `src/content/__tests__/worldMap.test.js` — tests del modelo.
- `src/state/hudStats.js` — helper puro que deriva stats del HUD desde el estado del juego.
- `src/state/__tests__/hudStats.test.js` — tests del helper.
- `src/components/Hud.jsx` — HUD de juego (nivel, barra XP, monedas). Montado en Layout.
- `src/components/WorldMap2D.jsx` — mapa 2D accesible (fallback + capa de enlaces).
- `src/components/PageTransition.jsx` — `AnimatePresence` alrededor del `<Outlet>`.
- `src/three/useDeviceTier.js` — detección WebGL + reduced-motion + señal de rendimiento.
- `src/three/WorldMapCanvas.jsx` — escena react-three-fiber del mapa (lazy).
- `src/three/WorldObject.jsx` — un mundo: forma glossy + isla + label + hover + click + estado.
- `src/three/lighting.jsx` — luces manuales + Lightformer procedural (sin CDN).
- `src/three/Effects.jsx` — Bloom en módulo con default export (lazy chunk).
- `src/three/Celebration.jsx` — estallido 3D de nivel completado (lazy).
- `src/three/FloatingAccent.jsx` — acento 3D decorativo ligero para cabeceras (lazy).
- `src/pages/WorldMap.jsx` — nueva home: decide canvas vs 2D.
- `public/fonts/fredoka-variable.woff2` — fuente display auto-hospedada (asset de build).

**Modificar:**
- `src/index.css` — `@font-face` + tokens glossy en `@theme`.
- `src/App.jsx` — `/` → `WorldMap`; eliminar import de `Home`.
- `src/components/Layout.jsx` — montar `Hud` + `PageTransition`; nav prev/next desde `worldMap.js`.
- `src/engine/WorldView.jsx`, `src/engine/LevelPlayer.jsx`, `src/pages/Bloque1..6.jsx` — reskin glossy (sin cambios de contenido/lógica).

**Eliminar:**
- `src/pages/Home.jsx` — reemplazado por `WorldMap.jsx` (el "consejo de estudio" se reubica en WorldMap).

---

## Task 1: Instalar y pinear el stack 3D/animación (+ guard de React)

**Files:**
- Modify: `package.json` (dependencies)

**Interfaces:**
- Produces: las dependencias `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `motion` disponibles para importar en todas las tareas siguientes; `react`/`react-dom` pineados `<19.3`.

- [x] **Step 1: Editar `package.json`** — en `"dependencies"`, cambiar los pines de React y añadir el stack. Deja el bloque `dependencies` así (respeta el orden alfabético existente donde puedas):

```jsonc
"dependencies": {
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.6.1",
  "@react-three/postprocessing": "^3.0.4",
  "katex": "^0.16.43",
  "lucide-react": "^1.7.0",
  "mafs": "^0.21.0",
  "motion": "^12.42.2",
  "react": "~19.2.4",
  "react-dom": "~19.2.4",
  "react-router-dom": "^7.13.2",
  "recharts": "^3.8.1",
  "three": "~0.185.1"
}
```

- [x] **Step 2: Instalar**

Run: `npm install`
Expected: instala sin errores de peer-deps. Si aparece `ERESOLVE`, NO uses `--force`; revisa que `react`/`react-dom` resolvieron a 19.2.x (ver Step 3).

- [x] **Step 3: Verificar versiones y compatibilidad de peers**

Run: `npm ls react react-dom @react-three/fiber @react-three/drei three motion`
Expected: `react@19.2.x`, `react-dom@19.2.x` (ambos < 19.3), `@react-three/fiber@9.6.x`, `@react-three/drei@10.7.x`, `three@0.185.x`, `motion@12.42.x`. Sin líneas `invalid` ni `UNMET PEER DEPENDENCY`.

- [x] **Step 4: El build y los tests actuales siguen sanos**

Run: `npm run build && npm test`
Expected: build OK; los 28 tests existentes pasan (verde). Aún no hay imports nuevos, así que no debe cambiar nada.

- [x] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: añadir stack 3D/animación (r3f v9, drei, postprocessing, motion) y pinear React <19.3"
```

---

## Task 2: Tokens glossy + fuente display auto-hospedada

**Files:**
- Create: `public/fonts/fredoka-variable.woff2`
- Modify: `src/index.css`

**Interfaces:**
- Produces: utilidades Tailwind nuevas — `font-display`; colores de mundo `bg-world-volcan`/`text-world-volcan`/… para `volcan|castillo|laberinto|estacion|montanas|feria|isla|reino`; y variables CSS de vidrio (`--glass-bg`, `--glass-border`, `--shadow-glow`). Consumidas por todas las tareas de UI.

- [x] **Step 1: Obtener la fuente (asset de build, no runtime)** — Fredoka Variable es OFL (libre). Descárgala una vez a `public/fonts/`:

```bash
mkdir -p public/fonts
curl -L -o public/fonts/fredoka-variable.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/fredoka:vf@latest/latin-wght-normal.woff2"
ls -l public/fonts/fredoka-variable.woff2   # debe pesar > 20 KB
```

Si la descarga fallara, la UI no se rompe (el token cae a `sans-serif`); consigue el `.woff2` de https://fontsource.org/fonts/fredoka y colócalo con ese nombre. El navegador de la app NUNCA baja esta fuente: se sirve local desde `public/`.

- [x] **Step 2: Reescribir `src/index.css`** con `@font-face` + tokens glossy. El orden importa: `@import` primero, luego `@font-face` (regla normal), luego `@theme`.

```css
@import "tailwindcss";
@import "katex/dist/katex.min.css";
@import "mafs/core.css";

/* Fuente display auto-hospedada (offline). Variable: rango de pesos 300–700. */
@font-face {
  font-family: "Fredoka";
  src: url("/fonts/fredoka-variable.woff2") format("woff2");
  font-weight: 300 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  /* Marca */
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;

  /* Colores de mundo (glossy, saturados) — generan bg-world-*/text-world-*/… */
  --color-world-volcan: #f97316;   /* 🌋 potencias  */
  --color-world-castillo: #10b981; /* 🏰 álgebra    */
  --color-world-laberinto: #3b82f6;/* 🌀 sistemas   */
  --color-world-estacion: #8b5cf6; /* 🚀 funciones  */
  --color-world-montanas: #ef4444; /* ⛰️ geometría  */
  --color-world-feria: #ec4899;    /* 🎡 datos      */
  --color-world-isla: #14b8a6;     /* 🏝️ próximamente */
  --color-world-reino: #eab308;    /* 🍕 próximamente */

  /* Colores legacy de bloque (los usan Layout/bloques hoy) */
  --color-bloque1: #f59e0b;
  --color-bloque2: #10b981;
  --color-bloque3: #3b82f6;
  --color-bloque4: #8b5cf6;
  --color-bloque5: #ef4444;
  --color-bloque6: #ec4899;

  /* Tipografía */
  --font-display: "Fredoka", "Nunito", system-ui, sans-serif;
}

/* Variables de vidrio/elevación (usadas por clases utilitarias glossy) */
:root {
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(255, 255, 255, 0.8);
  --shadow-glow: 0 10px 40px -10px rgba(99, 102, 241, 0.45);
}

body {
  margin: 0;
  min-width: 320px;
  font-family: "Nunito", system-ui, -apple-system, sans-serif;
  /* Cielo de aventura: degradado suave detrás de todo */
  background:
    radial-gradient(1200px 600px at 50% -10%, #dbeafe 0%, transparent 60%),
    linear-gradient(180deg, #eef2ff 0%, #faf5ff 100%);
  background-attachment: fixed;
}

/* Superficie de vidrio reutilizable */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}

.katex { font-size: 1.1em; }
.MafsView { --mafs-bg: transparent; }

/* Respeto global a reduced-motion como red de seguridad */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [x] **Step 3: Verificar que Tailwind genera las utilidades y el build pasa**

Run: `npm run build`
Expected: build OK. (Las clases `font-display`, `bg-world-volcan`, etc. quedan disponibles; se usarán en tareas siguientes.)

- [x] **Step 4: Verificación visual rápida (opcional pero recomendada)** — arranca el dev server y confirma el fondo degradado nuevo.

Run: `npm run dev` → abre http://localhost:5173 → el fondo ya no es gris plano sino el cielo degradado. Ctrl+C al terminar.

- [x] **Step 5: Commit**

```bash
git add public/fonts/fredoka-variable.woff2 src/index.css
git commit -m "feat: tokens glossy (colores de mundo, vidrio, cielo) + fuente display auto-hospedada"
```

---

## Task 3: Modelo de datos del mapa (`worldMap.js`) — TDD

**Files:**
- Create: `src/content/worldMap.js`
- Test: `src/content/__tests__/worldMap.test.js`

**Interfaces:**
- Produces:
  - `worldMapNodes: Node[]` donde `Node = { id, world, emoji, title, subtitle, theme, shape, position:[x,y,z], target, mode:'game'|'study'|'none', status:'active'|'coming-soon' }`.
  - `nodeState(node, gameState) -> 'coming-soon' | 'available' | 'completed'` (puro).
  - `blockRoutes: {path, label}[]` — orden de las 6 páginas de bloque para nav prev/next.
  - `adjacentBlock(pathname) -> { prev: {path,label}|null, next: {path,label}|null }` (puro).
- Consumes: `gameState.completedLevels: string[]` (de `gameStore`), donde las claves son `"<worldId>/<levelId>"`.

- [x] **Step 1: Escribir el test que falla** — `src/content/__tests__/worldMap.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
  worldMapNodes, nodeState, blockRoutes, adjacentBlock,
} from '../worldMap'

describe('worldMap: modelo de nodos', () => {
  it('tiene 8 nodos: 2 teasers (coming-soon) + 6 mundos activos', () => {
    expect(worldMapNodes).toHaveLength(8)
    expect(worldMapNodes.filter(n => n.status === 'coming-soon')).toHaveLength(2)
    expect(worldMapNodes.filter(n => n.status === 'active')).toHaveLength(6)
  })

  it('cada nodo activo apunta a una ruta válida conocida', () => {
    const validTargets = new Set([
      '/mundo/volcan-potencias', '/bloque2', '/bloque3', '/bloque4', '/bloque5', '/bloque6',
    ])
    for (const n of worldMapNodes.filter(n => n.status === 'active')) {
      expect(validTargets.has(n.target), `${n.id} -> ${n.target}`).toBe(true)
    }
  })

  it('cada nodo tiene emoji, título, tema (color) y posición 3D', () => {
    for (const n of worldMapNodes) {
      expect(n.emoji, n.id).toBeTruthy()
      expect(n.title, n.id).toBeTruthy()
      expect(n.theme, n.id).toMatch(/^world-/)
      expect(Array.isArray(n.position) && n.position.length === 3, n.id).toBe(true)
    }
  })

  it('los ids son únicos', () => {
    const ids = worldMapNodes.map(n => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('worldMap: nodeState', () => {
  const volcan = worldMapNodes.find(n => n.id === 'volcan-potencias')
  const castillo = worldMapNodes.find(n => n.id === 'castillo-algebra')
  const isla = worldMapNodes.find(n => n.id === 'isla-numerica')

  it('teaser -> coming-soon sin importar el estado', () => {
    expect(nodeState(isla, { completedLevels: [] })).toBe('coming-soon')
  })

  it('nodo de estudio -> siempre available', () => {
    expect(nodeState(castillo, { completedLevels: [] })).toBe('available')
    expect(nodeState(castillo, { completedLevels: ['mundo3/aproximacion'] })).toBe('available')
  })

  it('mundo jugable -> available si no está todo completo', () => {
    expect(nodeState(volcan, { completedLevels: [] })).toBe('available')
    expect(nodeState(volcan, { completedLevels: ['mundo3/aproximacion'] })).toBe('available')
  })

  it('mundo jugable -> completed cuando TODOS sus niveles están en completedLevels', () => {
    const all = [
      'mundo3/aproximacion', 'mundo3/potencias', 'mundo3/notacion', 'mundo3/radicales',
    ]
    expect(nodeState(volcan, { completedLevels: all })).toBe('completed')
  })
})

describe('worldMap: navegación de bloques', () => {
  it('blockRoutes lista las 6 páginas de bloque en orden', () => {
    expect(blockRoutes.map(b => b.path)).toEqual([
      '/bloque1', '/bloque2', '/bloque3', '/bloque4', '/bloque5', '/bloque6',
    ])
  })

  it('adjacentBlock da prev/next correctos y bordes null', () => {
    expect(adjacentBlock('/bloque1').prev).toBeNull()
    expect(adjacentBlock('/bloque1').next.path).toBe('/bloque2')
    expect(adjacentBlock('/bloque6').next).toBeNull()
    expect(adjacentBlock('/bloque3').prev.path).toBe('/bloque2')
    expect(adjacentBlock('/otra').prev).toBeNull()
    expect(adjacentBlock('/otra').next).toBeNull()
  })
})
```

- [x] **Step 2: Ejecutar el test para verlo fallar**

Run: `npx vitest run src/content/__tests__/worldMap.test.js`
Expected: FAIL — `Failed to resolve import '../worldMap'`.

- [x] **Step 3: Implementar `src/content/worldMap.js`**

```js
// Fuente de verdad única del mapa de mundos. Alimenta la escena 3D, el
// fallback 2D accesible y la navegación. Sin dependencias de React/DOM: puro.
//
// La identidad de mundos sigue el spec base (2026-07-18-math-quest-design):
// los 6 bloques existentes se presentan como mundos; los 2 primeros mundos
// del roadmap aparecen como teasers "Próximamente".

// Niveles del Mundo 3 (para calcular estado 'completed'). Deben coincidir con
// los ids de src/content/worlds/mundo3-potencias.jsx.
const MUNDO3_LEVELS = ['aproximacion', 'potencias', 'notacion', 'radicales']

export const worldMapNodes = [
  // — Teasers (roadmap Fase 4), bloqueados —
  {
    id: 'isla-numerica', world: 'Isla Numérica', emoji: '🏝️',
    title: 'Isla Numérica', subtitle: 'Próximamente',
    theme: 'world-isla', shape: 'island', position: [-4.2, 0.6, -1.5],
    target: null, mode: 'none', status: 'coming-soon',
  },
  {
    id: 'reino-fracciones', world: 'Reino de las Fracciones', emoji: '🍕',
    title: 'Reino de las Fracciones', subtitle: 'Próximamente',
    theme: 'world-reino', shape: 'pizza', position: [-2.8, -0.7, -0.5],
    target: null, mode: 'none', status: 'coming-soon',
  },
  // — Mundos jugables/estudiables (contenido actual) —
  {
    id: 'volcan-potencias', world: 'Volcán de las Potencias', emoji: '🌋',
    title: 'Volcán de las Potencias', subtitle: 'Potencias, notación científica y radicales',
    theme: 'world-volcan', shape: 'crystal', position: [-1.3, 0.9, 0.4],
    target: '/mundo/volcan-potencias', mode: 'game', status: 'active',
    levelKeys: MUNDO3_LEVELS.map(id => `mundo3/${id}`),
  },
  {
    id: 'castillo-algebra', world: 'Castillo del Álgebra', emoji: '🏰',
    title: 'Castillo del Álgebra', subtitle: 'Polinomios, MCD/MCM y fracciones algebraicas',
    theme: 'world-castillo', shape: 'castle', position: [0.1, -0.6, 0.8],
    target: '/bloque2', mode: 'study', status: 'active',
  },
  {
    id: 'laberinto-sistemas', world: 'Laberinto de Sistemas', emoji: '🌀',
    title: 'Laberinto de Sistemas', subtitle: 'Sistemas 2×2: gráfico, reducción y Cramer',
    theme: 'world-laberinto', shape: 'maze', position: [1.5, 0.7, 0.3],
    target: '/bloque3', mode: 'study', status: 'active',
  },
  {
    id: 'estacion-funciones', world: 'Estación de Funciones', emoji: '🚀',
    title: 'Estación de Funciones', subtitle: 'Funciones lineales y cuadráticas',
    theme: 'world-estacion', shape: 'rocket', position: [2.9, -0.5, -0.3],
    target: '/bloque4', mode: 'study', status: 'active',
  },
  {
    id: 'montanas-geometria', world: 'Montañas de Geometría', emoji: '⛰️',
    title: 'Montañas de Geometría', subtitle: 'Pitágoras, trigonometría, cilindro y prisma',
    theme: 'world-montanas', shape: 'mountain', position: [4.1, 0.8, -1.2],
    target: '/bloque5', mode: 'study', status: 'active',
  },
  {
    id: 'feria-datos', world: 'Feria de Datos', emoji: '🎡',
    title: 'Feria de Datos', subtitle: 'Estadística, conteo y probabilidad',
    theme: 'world-feria', shape: 'ferris', position: [5.4, -0.4, -2.4],
    target: '/bloque6', mode: 'study', status: 'active',
  },
]

// Estado de un nodo dado el estado del juego. Puro.
export function nodeState(node, gameState) {
  if (node.status === 'coming-soon') return 'coming-soon'
  if (node.mode === 'game' && Array.isArray(node.levelKeys)) {
    const done = new Set(gameState?.completedLevels ?? [])
    if (node.levelKeys.every(k => done.has(k))) return 'completed'
  }
  return 'available'
}

// Navegación prev/next entre las páginas de bloque (se conservan las rutas).
export const blockRoutes = [
  { path: '/bloque1', label: 'Volcán de las Potencias' },
  { path: '/bloque2', label: 'Castillo del Álgebra' },
  { path: '/bloque3', label: 'Laberinto de Sistemas' },
  { path: '/bloque4', label: 'Estación de Funciones' },
  { path: '/bloque5', label: 'Montañas de Geometría' },
  { path: '/bloque6', label: 'Feria de Datos' },
]

export function adjacentBlock(pathname) {
  const i = blockRoutes.findIndex(b => b.path === pathname)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? blockRoutes[i - 1] : null,
    next: i < blockRoutes.length - 1 ? blockRoutes[i + 1] : null,
  }
}
```

- [x] **Step 4: Ejecutar los tests para verlos pasar**

Run: `npx vitest run src/content/__tests__/worldMap.test.js`
Expected: PASS (todos).

- [x] **Step 5: Commit**

```bash
git add src/content/worldMap.js src/content/__tests__/worldMap.test.js
git commit -m "feat: modelo de datos del mapa de mundos (fuente única) + tests"
```

---

## Task 4: HUD de juego + helper `hudStats` (TDD del helper) y montaje en Layout

**Files:**
- Create: `src/state/hudStats.js`
- Test: `src/state/__tests__/hudStats.test.js`
- Create: `src/components/Hud.jsx`
- Modify: `src/components/Layout.jsx`

**Interfaces:**
- Produces: `hudStats(state) -> { level, title, xp, coins, intoLevel, span, progress, xpToNext }` (puro); componente `<Hud />`.
- Consumes: `useGame()` (de `gameStore`), `xpForLevel`/`levelForXp`/`titleForLevel` (de `xpCurve`), `motion` (de `motion/react`).

- [x] **Step 1: Escribir el test que falla** — `src/state/__tests__/hudStats.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { hudStats } from '../hudStats'

describe('hudStats', () => {
  it('nivel 1 con 0 XP: progreso 0, faltan 100 para nivel 2', () => {
    const s = hudStats({ xp: 0, coins: 0 })
    expect(s.level).toBe(1)
    expect(s.title).toBe('Aprendiz')
    expect(s.intoLevel).toBe(0)
    expect(s.span).toBe(100)       // xpForLevel(2) - xpForLevel(1) = 100 - 0
    expect(s.progress).toBeCloseTo(0)
    expect(s.xpToNext).toBe(100)
  })

  it('50 XP en nivel 1: mitad de la barra', () => {
    const s = hudStats({ xp: 50, coins: 30 })
    expect(s.level).toBe(1)
    expect(s.progress).toBeCloseTo(0.5)
    expect(s.xpToNext).toBe(50)
    expect(s.coins).toBe(30)
  })

  it('justo al alcanzar nivel 2 (100 XP): progreso 0 del nuevo nivel', () => {
    const s = hudStats({ xp: 100, coins: 0 })
    expect(s.level).toBe(2)
    expect(s.intoLevel).toBe(0)
    expect(s.span).toBe(200)       // xpForLevel(3) - xpForLevel(2) = 300 - 100
    expect(s.progress).toBeCloseTo(0)
  })

  it('progress siempre queda en [0,1]', () => {
    for (const xp of [0, 1, 99, 100, 250, 999, 5000]) {
      const p = hudStats({ xp, coins: 0 }).progress
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })
})
```

- [x] **Step 2: Ejecutar el test para verlo fallar**

Run: `npx vitest run src/state/__tests__/hudStats.test.js`
Expected: FAIL — `Failed to resolve import '../hudStats'`.

- [x] **Step 3: Implementar `src/state/hudStats.js`**

```js
import { xpForLevel, levelForXp, titleForLevel } from './xpCurve'

// Deriva los datos que muestra el HUD a partir del estado del juego. Puro.
export function hudStats(state) {
  const xp = state?.xp ?? 0
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const span = ceil - floor
  const intoLevel = xp - floor
  const progress = span > 0 ? Math.min(1, Math.max(0, intoLevel / span)) : 1
  return {
    level,
    title: titleForLevel(level),
    xp,
    coins: state?.coins ?? 0,
    intoLevel,
    span,
    progress,
    xpToNext: Math.max(0, ceil - xp),
  }
}
```

- [x] **Step 4: Ejecutar los tests para verlos pasar**

Run: `npx vitest run src/state/__tests__/hudStats.test.js`
Expected: PASS.

- [x] **Step 5: Implementar `src/components/Hud.jsx`** — barra de XP animada + monedas con pop, leyendo el estado real:

```jsx
import { Link } from 'react-router-dom'
import { Home, Coins } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'

export default function Hud() {
  const { state } = useGame()
  const s = hudStats(state)
  const reduce = useReducedMotion()

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary hover:text-primary-dark transition-colors shrink-0">
        <Home size={20} />
        <span className="hidden sm:inline">Math Quest</span>
      </Link>

      {/* Nivel + barra de XP */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display font-bold text-sm text-gray-800 truncate">
            Nv. {s.level} · <span className="text-primary">{s.title}</span>
          </span>
          <span className="text-[11px] text-gray-500 shrink-0 tabular-nums">
            {s.intoLevel}/{s.span} XP
          </span>
        </div>
        <div className="mt-1 h-2.5 rounded-full bg-gray-200/70 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
            initial={false}
            animate={{ width: `${Math.round(s.progress * 100)}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Monedas con pop al cambiar */}
      <motion.div
        key={s.coins}
        initial={reduce ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 15 }}
        className="flex items-center gap-1 font-display font-bold text-amber-600 glass rounded-full px-3 py-1 shrink-0"
      >
        <Coins size={16} />
        <span className="tabular-nums">{s.coins}</span>
      </motion.div>
    </div>
  )
}
```

- [x] **Step 6: Montar el HUD en `src/components/Layout.jsx`** — reemplaza el nav de "Bloque 1..6" por el HUD, y cambia la fuente de prev/next a `worldMap.js`. Reemplaza el archivo entero:

```jsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import Hud from './Hud'
import { adjacentBlock } from '../content/worldMap'

export default function Layout() {
  const location = useLocation()
  const { prev, next } = adjacentBlock(location.pathname)
  const onBlockPage = prev !== null || next !== null || location.pathname.startsWith('/bloque')

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <Hud />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {onBlockPage && (
        <div className="max-w-5xl mx-auto px-4 pb-12 flex justify-between">
          {prev ? (
            <Link to={prev.path} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:shadow-md transition-all text-gray-700 hover:text-primary">
              <ChevronLeft size={18} /> {prev.label}
            </Link>
          ) : <div />}
          {next ? (
            <Link to={next.path} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:shadow-md transition-all text-gray-700 hover:text-primary">
              {next.label} <ChevronRight size={18} />
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all">
              <Home size={18} /> Volver al mapa
            </Link>
          )}
        </div>
      )}

      <footer className="text-center py-6 text-gray-400 text-sm">
        Math Quest — repaso matemático gamificado
      </footer>
    </div>
  )
}
```

- [x] **Step 7: Verificar build + tests + HUD en vivo**

Run: `npm run build && npm test`
Expected: build OK; todos los tests verdes (incluye `hudStats` y `worldMap`).
Manual: `npm run dev` → en cualquier `/bloqueN` el HUD superior muestra "Nv. 1 · Aprendiz", barra de XP y monedas. Completa un nivel del Volcán → la barra de XP y las monedas animan su cambio.

- [x] **Step 8: Commit**

```bash
git add src/state/hudStats.js src/state/__tests__/hudStats.test.js src/components/Hud.jsx src/components/Layout.jsx
git commit -m "feat: HUD de juego (nivel, barra XP animada, monedas) + helper hudStats con tests"
```

---

## Task 5: Fallback 2D accesible + detección de equipo + página WorldMap (baseline sin 3D)

Entrega una home funcional y accesible ANTES de meter WebGL: el mapa 2D es la base y el fallback permanente.

**Files:**
- Create: `src/three/useDeviceTier.js`
- Create: `src/components/WorldMap2D.jsx`
- Create: `src/pages/WorldMap.jsx`
- Modify: `src/App.jsx`
- Delete: `src/pages/Home.jsx`

**Interfaces:**
- Produces: `useDeviceTier() -> { use3D: boolean, reduce: boolean }`; `<WorldMap2D />`; `<WorldMap />` (ruta `/`).
- Consumes: `worldMapNodes`, `nodeState` (de `worldMap.js`), `useGame()`.

- [x] **Step 1: Implementar `src/three/useDeviceTier.js`** — decide si activar el 3D (WebGL disponible + no reduced-motion + no equipo mínimo):

```js
import { useMemo } from 'react'

function hasWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Decisión estable durante la sesión: WebGL disponible, respeta reduced-motion,
// y descarta equipos muy limitados (<= 4 hilos lógicos como señal barata).
export function useDeviceTier() {
  return useMemo(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
    const use3D = hasWebGL() && !reduce && cores > 4
    return { use3D, reduce: !!reduce }
  }, [])
}
```

- [x] **Step 2: Implementar `src/components/WorldMap2D.jsx`** — tarjetas glossy como enlaces reales (esta es la capa accesible):

```jsx
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { worldMapNodes, nodeState } from '../content/worldMap'
import { useGame } from '../state/gameStore'

// Clases de gradiente LITERALES por tema (Tailwind escanea substrings literales;
// construir `from-${theme}` dinámicamente NO se detecta, por eso el mapa estático).
const THEME_GRADIENT = {
  'world-volcan': 'from-world-volcan to-world-volcan/70',
  'world-castillo': 'from-world-castillo to-world-castillo/70',
  'world-laberinto': 'from-world-laberinto to-world-laberinto/70',
  'world-estacion': 'from-world-estacion to-world-estacion/70',
  'world-montanas': 'from-world-montanas to-world-montanas/70',
  'world-feria': 'from-world-feria to-world-feria/70',
  'world-isla': 'from-world-isla to-world-isla/70',
  'world-reino': 'from-world-reino to-world-reino/70',
}

function WorldCard({ node, state }) {
  const reduce = useReducedMotion()
  const st = nodeState(node, state)
  const locked = st === 'coming-soon'

  const inner = (
    <>
      <div className={`text-4xl mb-2 drop-shadow-sm ${locked ? 'grayscale opacity-70' : ''}`}>{node.emoji}</div>
      <h3 className="font-display font-bold text-white text-lg leading-tight">{node.title}</h3>
      <p className="text-white/85 text-sm mt-1">{node.subtitle}</p>
      {st === 'completed' && <span className="inline-block mt-2 text-amber-200 text-sm font-bold">⭐ Completado</span>}
      {locked && (
        <span className="inline-flex items-center gap-1 mt-2 text-white/90 text-xs font-semibold">
          <Lock size={12} /> Próximamente
        </span>
      )}
    </>
  )

  const cls = `block rounded-[1.75rem] p-5 shadow-xl bg-gradient-to-br ${THEME_GRADIENT[node.theme]}`
  const hover = reduce || locked ? undefined : { rotateX: 6, rotateY: -6, scale: 1.04 }

  if (locked) {
    return (
      <div className={cls} aria-disabled="true" style={{ transformPerspective: 700 }}>{inner}</div>
    )
  }
  return (
    <motion.div style={{ transformPerspective: 700 }} whileHover={hover} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link to={node.target} className={cls} aria-label={`${node.title}: ${node.subtitle}`}>{inner}</Link>
    </motion.div>
  )
}

export default function WorldMap2D() {
  const { state } = useGame()
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0">
      {worldMapNodes.map((node) => (
        <li key={node.id}><WorldCard node={node} state={state} /></li>
      ))}
    </ul>
  )
}
```

> Nota: como `THEME_GRADIENT` contiene los nombres de clase completos y literales (`from-world-volcan`, `to-world-volcan/70`, …), el escáner de Tailwind v4 los detecta y genera esas utilidades — sin necesidad de safelist. Todas dependen de los tokens `--color-world-*` definidos en la Task 2.

- [x] **Step 3: Implementar `src/pages/WorldMap.jsx`** — baseline: por ahora SIEMPRE renderiza el 2D (el canvas 3D se enchufa en la Task 6). Incluye el "consejo" reubicado:

```jsx
import WorldMap2D from '../components/WorldMap2D'

export default function WorldMap() {
  return (
    <div>
      <header className="text-center mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-800">
          🗺️ Mapa de Mundos
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-2">
          Explora cada mundo, gana XP y estrellas. Elige por dónde empezar tu aventura matemática.
        </p>
      </header>

      <WorldMap2D />

      <div className="mt-12 text-center glass rounded-[1.75rem] p-6 max-w-2xl mx-auto">
        <h2 className="font-display text-xl font-bold text-gray-700 mb-1">💡 Consejo</h2>
        <p className="text-gray-500 text-sm">
          Estudia un mundo a la vez y juega con los ejemplos interactivos.
          ¡Las matemáticas se aprenden practicando!
        </p>
      </div>
    </div>
  )
}
```

- [x] **Step 4: Enrutar `/` a WorldMap en `src/App.jsx`** — cambia el import y la ruta index:

```jsx
// línea 3: reemplazar
import WorldMap from './pages/WorldMap'
// (elimina `import Home from './pages/Home'`)

// dentro de <Routes>: reemplazar la ruta index
<Route path="/" element={<WorldMap />} />
```

- [x] **Step 5: Eliminar la Home vieja**

Run: `git rm src/pages/Home.jsx`
Expected: se elimina. Verifica que nada más la importa: `grep -rn "pages/Home" src` → sin resultados.

- [x] **Step 6: Verificar**

Run: `npm run build && npm test`
Expected: build OK; tests verdes.
Manual: `npm run dev` → `/` muestra el mapa 2D glossy con los 8 mundos (2 "Próximamente" en gris), tilt al pasar el cursor, y navega al hacer click. Tab por el teclado enfoca cada mundo activo.

- [x] **Step 7: Commit**

```bash
git add src/three/useDeviceTier.js src/components/WorldMap2D.jsx src/pages/WorldMap.jsx src/App.jsx src/index.css
git commit -m "feat: home = mapa de mundos 2D glossy accesible (fallback/baseline) + detección de equipo"
```

---

## Task 6: Escena 3D del mapa (react-three-fiber) — lazy, offline, con Bloom

**Files:**
- Create: `src/three/lighting.jsx`
- Create: `src/three/WorldObject.jsx`
- Create: `src/three/Effects.jsx`
- Create: `src/three/WorldMapCanvas.jsx`
- Modify: `src/pages/WorldMap.jsx`

**Interfaces:**
- Consumes: `worldMapNodes`, `nodeState`; `useGame()`; `useDeviceTier()`; drei (`Float`, `RoundedBox`, `PerformanceMonitor`, `Html`, `useCursor`, `Environment`, `Lightformer`); `@react-three/postprocessing` (`EffectComposer`, `Bloom`); `useNavigate` (react-router).
- Produces: `<WorldMapCanvas />` (default export, lazy-cargable).

- [x] **Step 1: Implementar `src/three/lighting.jsx`** — iluminación 100% offline (sin `preset`):

```jsx
import { Environment, Lightformer } from '@react-three/drei'

// Estudio de luz procedural: reflejos glossy sin descargar HDR de ningún CDN.
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.3} />
      <directionalLight position={[-5, 2, -2]} intensity={0.4} color="#a5b4fc" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={8} />
        <Lightformer form="rect" intensity={1.4} position={[-4, 1, 2]} scale={5} color="#ffd8a8" />
        <Lightformer form="circle" intensity={1.2} position={[4, -2, 2]} scale={4} color="#bae6fd" />
      </Environment>
    </>
  )
}
```

- [x] **Step 2: Implementar `src/three/WorldObject.jsx`** — un mundo glossy con forma temática, label DOM, hover y click→navegar. Materiales `meshStandardMaterial` pulidos (baratos) con `emissive` para que el Bloom los haga brillar:

```jsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Html, useCursor } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'

// Color hex por tema (deben coincidir con los tokens --color-world-* del CSS).
const THEME_HEX = {
  'world-volcan': '#f97316', 'world-castillo': '#10b981',
  'world-laberinto': '#3b82f6', 'world-estacion': '#8b5cf6',
  'world-montanas': '#ef4444', 'world-feria': '#ec4899',
  'world-isla': '#14b8a6', 'world-reino': '#eab308',
}

// Geometría primitiva por tipo de forma. Glossy = metalness alta + roughness baja.
function Shape({ kind, color, glow }) {
  const mat = (
    <meshStandardMaterial
      color={color} metalness={0.35} roughness={0.15}
      emissive={color} emissiveIntensity={glow ? 0.6 : 0.15}
    />
  )
  switch (kind) {
    case 'crystal':  return <mesh><icosahedronGeometry args={[0.62, 0]} />{mat}</mesh>
    case 'castle':   return <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.12} smoothness={5}>{mat}</RoundedBox>
    case 'maze':     return <mesh><torusKnotGeometry args={[0.4, 0.14, 120, 16]} />{mat}</mesh>
    case 'rocket':   return <mesh rotation={[0, 0, -0.3]}><coneGeometry args={[0.4, 1.1, 24]} />{mat}</mesh>
    case 'mountain': return <mesh><coneGeometry args={[0.7, 1.0, 5]} />{mat}</mesh>
    case 'ferris':   return <mesh><torusGeometry args={[0.55, 0.12, 16, 40]} />{mat}</mesh>
    case 'island':   return <mesh><sphereGeometry args={[0.6, 32, 32]} />{mat}</mesh>
    case 'pizza':    return <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.65, 0.65, 0.16, 32]} />{mat}</mesh>
    default:         return <mesh><sphereGeometry args={[0.6, 32, 32]} />{mat}</mesh>
  }
}

export default function WorldObject({ node, state, spin }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  const locked = state === 'coming-soon'
  useCursor(hovered && !locked)
  const color = THEME_HEX[node.theme] ?? '#6366f1'

  useFrame((_, delta) => {
    if (spin && groupRef.current) groupRef.current.rotation.y += delta * 0.35
  })

  const go = () => { if (!locked && node.target) navigate(node.target) }

  return (
    <group position={node.position}>
      <Float speed={locked ? 0.6 : 1.4} rotationIntensity={locked ? 0.2 : 0.5} floatIntensity={locked ? 0.4 : 0.9}>
        <group
          ref={groupRef}
          scale={hovered && !locked ? 1.18 : 1}
          onClick={go}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Shape kind={node.shape} color={color} glow={hovered && !locked} />
          {/* Plataforma/isla redondeada bajo el objeto */}
          <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.7, 0.85, 0.25, 32]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} opacity={locked ? 0.5 : 1} transparent />
          </mesh>
          {/* Label DOM anclado en 3D (no usa <Text> de drei → no baja fuente) */}
          <Html center distanceFactor={9} position={[0, 1.15, 0]} occlude>
            <div className={`pointer-events-none select-none font-display font-bold text-sm px-2 py-0.5 rounded-full whitespace-nowrap ${locked ? 'bg-gray-500/80 text-white' : 'bg-white/85 text-gray-800'}`}>
              {node.emoji} {node.title}{locked ? ' · Próximamente' : ''}
            </div>
          </Html>
        </group>
      </Float>
    </group>
  )
}
```

- [x] **Step 3: Implementar `src/three/Effects.jsx`** — Bloom en su propio módulo con **default export** (para poder `lazy()`):

```jsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Glow suave: solo los píxeles brillantes (emissive de los mundos) florecen.
export default function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.7} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
    </EffectComposer>
  )
}
```

- [x] **Step 4: Implementar `src/three/WorldMapCanvas.jsx`** — el Canvas, DPR adaptativo, PerformanceMonitor, y el Bloom lazy:

```jsx
import { lazy, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { worldMapNodes, nodeState } from '../content/worldMap'
import { useGame } from '../state/gameStore'
import Lighting from './lighting'
import WorldObject from './WorldObject'

const Effects = lazy(() => import('./Effects'))

export default function WorldMapCanvas({ spin = true }) {
  const { state } = useGame()
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0.6, 0, 8], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerformanceMonitor onChange={({ factor }) => setDpr(Math.round((1 + factor) * 10) / 10)} />
      <Lighting />
      {worldMapNodes.map((node) => (
        <WorldObject key={node.id} node={node} state={nodeState(node, state)} spin={spin} />
      ))}
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </Canvas>
  )
}
```

- [x] **Step 5: Enchufar el canvas en `src/pages/WorldMap.jsx`** — si el equipo lo soporta, canvas (decorativo, `aria-hidden`) + lista `sr-only` accesible; si no, el 2D visible. Reemplaza el archivo:

```jsx
import { lazy, Suspense } from 'react'
import WorldMap2D from '../components/WorldMap2D'
import { useDeviceTier } from '../three/useDeviceTier'

const WorldMapCanvas = lazy(() => import('../three/WorldMapCanvas'))

export default function WorldMap() {
  const { use3D } = useDeviceTier()

  return (
    <div>
      <header className="text-center mb-6">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-800">
          🗺️ Mapa de Mundos
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-2">
          Explora cada mundo, gana XP y estrellas. Elige por dónde empezar tu aventura.
        </p>
      </header>

      {use3D ? (
        <>
          <div className="h-[60vh] min-h-[420px] -mx-4" aria-hidden="true">
            <Suspense fallback={<div className="h-full grid place-items-center text-gray-400">Cargando mundos…</div>}>
              <WorldMapCanvas />
            </Suspense>
          </div>
          {/* Navegación accesible paralela: enfocable por teclado / lectores de pantalla */}
          <div className="sr-only focus-within:not-sr-only">
            <WorldMap2D />
          </div>
        </>
      ) : (
        <WorldMap2D />
      )}

      <div className="mt-10 text-center glass rounded-[1.75rem] p-6 max-w-2xl mx-auto">
        <h2 className="font-display text-xl font-bold text-gray-700 mb-1">💡 Consejo</h2>
        <p className="text-gray-500 text-sm">
          Estudia un mundo a la vez y juega con los ejemplos interactivos.
          ¡Las matemáticas se aprenden practicando!
        </p>
      </div>
    </div>
  )
}
```

- [x] **Step 6: Verificar build, tamaño del chunk, y la escena en vivo**

Run: `npm run build`
Expected: build OK. En el resumen de Vite verás chunks separados para el canvas y para el Bloom (three/postprocessing NO están en el bundle de entrada). 
Manual: `npm run dev` → `/` muestra los mundos 3D glossy flotando y girando; hover agranda + brilla + resalta el label; click navega. Prueba en una ventana normal (equipo con WebGL). Verifica en la pestaña Network del navegador que **no hay peticiones a dominios externos** (ni googleapis, ni raw.githubusercontent, ni drei-assets).
Encuadre: si algún mundo queda fuera de cuadro (los `position` van de x≈−4.2 a 5.4), ajusta la `position`/`fov` de la cámara en `WorldMapCanvas.jsx` (p. ej. alejar a `z: 9` o subir `fov`) hasta que los 8 quepan cómodos. Es un ajuste puramente visual.

- [x] **Step 7: Verificar el fallback** — fuerza reduced-motion (DevTools → Rendering → "Emulate prefers-reduced-motion: reduce") y recarga: debe verse el mapa 2D, no el canvas. 

- [x] **Step 8: Commit**

```bash
git add src/three/lighting.jsx src/three/WorldObject.jsx src/three/Effects.jsx src/three/WorldMapCanvas.jsx src/pages/WorldMap.jsx
git commit -m "feat: mapa de mundos 3D (react-three-fiber) lazy, offline, con bloom y fallback 2D accesible"
```

---

## Task 7: Transiciones de página (motion) en el shell

**Files:**
- Create: `src/components/PageTransition.jsx`
- Modify: `src/components/Layout.jsx`

**Interfaces:**
- Consumes: `motion`, `AnimatePresence`, `useReducedMotion` (de `motion/react`); `useLocation` (react-router).
- Produces: `<PageTransition>{children}</PageTransition>`.

- [x] **Step 1: Implementar `src/components/PageTransition.jsx`**

```jsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()
  const reduce = useReducedMotion()

  if (reduce) return <>{children}</>

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

- [x] **Step 2: Envolver el `<Outlet>` en `src/components/Layout.jsx`** — importa y usa:

```jsx
// añadir import
import PageTransition from './PageTransition'
// ...
// reemplazar <main>…<Outlet />…</main> por:
<main className="max-w-5xl mx-auto px-4 py-8">
  <PageTransition><Outlet /></PageTransition>
</main>
```

> Nota: `AnimatePresence mode="wait"` necesita una `key` estable (aquí `location.pathname`) y que el elemento animado envuelva el contenido que cambia — por eso va dentro de `<main>`, alrededor del `<Outlet>`.

- [x] **Step 3: Verificar**

Run: `npm run build && npm test`
Expected: build OK; tests verdes.
Manual: `npm run dev` → navegar entre mundos/bloques hace un fade+slide suave. Con reduced-motion emulado, los cambios son instantáneos (sin animación).

- [x] **Step 4: Commit**

```bash
git add src/components/PageTransition.jsx src/components/Layout.jsx
git commit -m "feat: transiciones de página con motion (respetando reduced-motion)"
```

---

## Task 8: Reskin glossy de bloques y modo juego (sin tocar contenido/lógica)

Solo estilos. NO cambies textos, quizzes, generadores ni la máquina de estados.

**Files:**
- Modify: `src/engine/WorldView.jsx`
- Modify: `src/engine/LevelPlayer.jsx`
- Modify: `src/pages/Bloque1.jsx` … `src/pages/Bloque6.jsx`

**Interfaces:**
- Consumes: tokens glossy de `index.css` (`.glass`, `rounded-[1.75rem]`, `font-display`).

- [x] **Step 1: Reskin `WorldView.jsx`** — tarjetas de nivel glossy. Cambia solo `className`s:
  - El contenedor de cada nivel desbloqueado: de `bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all` → `glass rounded-[1.5rem] p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all`.
  - El título del mundo `h1`: añade `font-display`.
  - La caja de stats del jugador: `bg-white rounded-xl border` → `glass rounded-2xl`.

- [x] **Step 2: Reskin `LevelPlayer.jsx`** — cambia solo `className`s (no la lógica):
  - Paneles `bg-white rounded-2xl shadow p-6/p-8` → `glass rounded-[1.75rem] shadow-lg p-6/p-8`.
  - Títulos `h1/h2`: añade `font-display`.
  - Botones primarios `bg-primary`/`bg-green-500`: mantenerlos, pero añade `rounded-xl font-display` donde falte para consistencia.
  - (El bloque `phase === 'completado'` se ampliará con la celebración 3D en la Task 9 — por ahora solo reskin.)

- [x] **Step 3: Reskin de las páginas de bloque** — en `Bloque1.jsx`…`Bloque6.jsx`, el patrón repetido es el contenedor de sección y los títulos. Aplica de forma consistente:
  - Encabezados de página (`h1`/`h2` de título de bloque): añade `font-display`.
  - Contenedores tipo tarjeta `bg-white rounded-xl/2xl shadow`: cámbialos a `glass rounded-[1.5rem] shadow-md`.
  - No cambies el contenido interno (MathTex, MiniQuiz, widgets, textos).

Para localizar los patrones exactos por archivo:

Run: `grep -rn "bg-white rounded" src/pages/Bloque*.jsx src/engine/*.jsx`
Sustituye cada `bg-white rounded-xl`/`bg-white rounded-2xl` por `glass rounded-[1.5rem]` (ajusta el radio si el original era más pequeño).

- [x] **Step 4: Verificar que nada de lógica se rompió**

Run: `npm test`
Expected: los 28 tests + los nuevos siguen verdes (el reskin no toca lógica).

Run: `npm run build`
Expected: OK.

Manual: `npm run dev` → recorre `/bloque1..6`, `/mundo/volcan-potencias` y un nivel: todo comparte el look glossy (vidrio, `font-display`, radios grandes) y el contenido está intacto.

- [x] **Step 5: Commit**

```bash
git add src/engine/WorldView.jsx src/engine/LevelPlayer.jsx src/pages/Bloque1.jsx src/pages/Bloque2.jsx src/pages/Bloque3.jsx src/pages/Bloque4.jsx src/pages/Bloque5.jsx src/pages/Bloque6.jsx
git commit -m "style: reskin glossy de bloques y modo juego (sin cambios de contenido/lógica)"
```

---

## Task 9: Celebración 3D al completar un nivel

**Files:**
- Create: `src/three/Celebration.jsx`
- Modify: `src/engine/LevelPlayer.jsx`

**Interfaces:**
- Consumes: `@react-three/fiber` (`Canvas`, `useFrame`), drei (`Float`); `useReducedMotion` (motion) para el gate.
- Produces: `<Celebration />` (default export, lazy).

- [x] **Step 1: Implementar `src/three/Celebration.jsx`** — un estallido corto: partículas de estrella + un objeto girando. Sin CDN, geometría procedural:

```jsx
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308']

function Confetti() {
  const ref = useRef()
  const pieces = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      pos: [(i % 8) - 3.5 + (i % 3) * 0.3, 2.2 - Math.floor(i / 8) * 0.2, (i % 5) * 0.2 - 0.4],
      color: COLORS[i % COLORS.length],
      speed: 0.6 + (i % 5) * 0.15,
    })),
    [],
  )
  useFrame((_, delta) => {
    if (!ref.current) return
    for (const child of ref.current.children) {
      child.position.y -= delta * (child.userData.speed ?? 0.8)
      child.rotation.x += delta * 2
      child.rotation.z += delta * 1.5
      if (child.position.y < -2.4) child.position.y = 2.4
    }
  })
  return (
    <group ref={ref}>
      {pieces.map((p, i) => (
        <mesh key={i} position={p.pos} userData={{ speed: p.speed }}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Trophy() {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 1.2 })
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.15} emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  )
}

export default function Celebration() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} />
      <Trophy />
      <Confetti />
    </Canvas>
  )
}
```

- [x] **Step 2: Montar la celebración en el estado `completado` de `LevelPlayer.jsx`** — añade el import lazy arriba del componente y renderiza el canvas sobre el panel, gated por reduced-motion:

```jsx
// imports (arriba del archivo)
import { lazy, Suspense } from 'react'
import { useReducedMotion } from 'motion/react'
const Celebration = lazy(() => import('../three/Celebration'))
```

Dentro del componente, antes del `return`, añade:

```jsx
const reduceMotion = useReducedMotion()
```

En el bloque `phase === 'completado'`, envuelve el contenido para superponer la celebración (solo si no hay reduced-motion). Reemplaza el `<div className="text-center bg-white rounded-2xl shadow p-8">` de `completado` por:

```jsx
<div className="relative text-center glass rounded-[1.75rem] shadow-lg p-8 overflow-hidden">
  {!reduceMotion && (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <Suspense fallback={null}><Celebration /></Suspense>
    </div>
  )}
  <div className="relative">
    <p className="text-4xl mb-2">🎉</p>
    <h2 className="font-display text-xl font-bold mb-1">¡Nivel superado!</h2>
    <p className="text-2xl my-2">{'⭐'.repeat(result?.stars ?? 1)}</p>
    <p className="text-sm text-gray-500 mb-4">+{XP_LEVEL_COMPLETE} XP · +{result?.coins ?? 0} 🪙</p>
    <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
  </div>
</div>
```

- [x] **Step 3: Verificar**

Run: `npm run build && npm test`
Expected: build OK (nuevo chunk lazy para la celebración); tests verdes.
Manual: `npm run dev` → juega y completa un nivel del Volcán → aparece la celebración 3D (trofeo girando + confeti) tras el panel de "¡Nivel superado!". Con reduced-motion emulado, el panel se ve sin el canvas.

- [x] **Step 4: Commit**

```bash
git add src/three/Celebration.jsx src/engine/LevelPlayer.jsx
git commit -m "feat: celebración 3D al completar nivel (lazy, gated por reduced-motion)"
```

---

## Task 10: Auditoría final (offline + a11y + reduced-motion) y docs

**Files:**
- Modify: `README.md`, `TODO.md`

- [x] **Step 1: Auditoría offline** — ninguna referencia a recursos remotos en runtime:

Run: `grep -rniE "https?://|googleapis|githubusercontent|drei-assets|preset=" src`
Expected: sin resultados problemáticos. Cualquier `preset=` en un `<Environment>` es un fallo (debe usar Lightformer/local). URLs solo permitidas en comentarios/docs, no en código que se ejecute.

- [x] **Step 2: Auditoría de red en el navegador** — `npm run dev`, abre DevTools → Network, recarga `/` y navega. Filtra por dominio: **cero** peticiones a hosts externos (solo `localhost`). Confirma que la fuente `fredoka-variable.woff2` se sirve desde `localhost`.

- [x] **Step 3: Auditoría reduced-motion** — con "Emulate prefers-reduced-motion: reduce": el mapa cae a 2D, no hay transiciones de página, no hay celebración 3D, la barra de XP salta sin spring. Todo navegable.

- [x] **Step 4: Auditoría de teclado/a11y** — solo con Tab/Enter: desde `/` se puede enfocar y entrar a cada mundo activo (via la lista `sr-only` cuando el 3D está activo, o las tarjetas 2D). Los teasers no son enfocables como enlace.

- [x] **Step 5: Suite completa + build de producción**

Run: `npm test && npm run build && npm run preview`
Expected: todos los tests verdes; build OK; `preview` sirve la app de producción sin errores en consola. Repite el spot-check en `preview`.

- [x] **Step 6: Actualizar `README.md` y `TODO.md`**
  - README: en "Estado", añade una línea sobre el rediseño (mapa de mundos 3D + HUD + reskin glossy) y en "Stack" añade three.js/react-three-fiber/drei/motion.
  - TODO: marca en Fase 5 "Animaciones y celebraciones" el avance de la celebración de nivel; añade una nota de que el rediseño visual (Spec 1) está completo y que la migración de contenido de bloques (Fase 2) sigue pendiente como follow-on.

- [x] **Step 7: Commit**

```bash
git add README.md TODO.md
git commit -m "docs: registrar rediseño World Map 3D completo (Spec 1) y follow-ups"
```

---

## Self-review del plan (cobertura del spec)

- **§4 Arquitectura / rutas** → Tasks 5 (WorldMap, App), 4 (Layout). `worldMap.js` fuente única → Task 3. ✅
- **§5 Sistema visual glossy (tokens + fuente)** → Task 2. ✅
- **§6 World Map 3D** (mundos, animación, materiales glossy, bloom, progreso, iluminación offline) → Tasks 6 (+ 3 datos). ✅
- **§7 HUD** → Task 4. ✅
- **§8 Reskin + transiciones + celebración** → Tasks 7, 8, 9. ✅
- **§9 Rendimiento y a11y** (lazy, reduced-motion, device tier, fallback 2D, enlaces accesibles) → Tasks 5, 6, 7, 10. ✅
- **§10 Dependencias** (versiones exactas verificadas) → Task 1. ✅
- **§11 Tests** (modelo worldMap, hudStats; render vía build+e2e) → Tasks 3, 4, 10. ✅ (Ajuste consciente vs spec: en lugar de un smoke-test de render del fallback 2D — que exigiría añadir `@testing-library/react`, ausente en el repo — se testea la lógica pura que lo alimenta y se verifica el render con build + e2e manual, siguiendo la convención de tests del proyecto.)
- **§12 Criterios de aceptación** → cubiertos por las verificaciones de Tasks 6, 4, 7/8, 9, 5/10, 1/10. ✅
- **§13 Riesgos** → mitigaciones implementadas (lazy/dpr/PerformanceMonitor/fallback en 5-6; iluminación manual en 6; guard React en 1; 3D decorativo/DOM en 5-6; tests intactos en cada Task). ✅
```
