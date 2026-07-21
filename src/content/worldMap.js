// Fuente de verdad única del mapa de mundos. Alimenta la escena 3D, el
// fallback 2D accesible y la navegación. Sin dependencias de React/DOM: puro.
//
// La identidad de mundos sigue el spec base (2026-07-18-math-quest-design):
// los 6 bloques existentes se presentan como mundos; los 2 primeros mundos
// del roadmap aparecen como teasers "Próximamente".

// Niveles del Mundo 3 (para calcular estado 'completed'). Deben coincidir con
// los ids de src/content/worlds/mundo3-potencias.jsx.
const MUNDO3_LEVELS = ['aproximacion', 'potenciacion', 'notacion', 'radicacion']

export const worldMapNodes = [
  // — Teasers (roadmap Fase 4), bloqueados —
  {
    id: 'isla-numerica', world: 'Isla Numérica', emoji: '🏝️',
    title: 'Isla Numérica', subtitle: 'Próximamente',
    theme: 'world-isla', shape: 'island', position: [-6.2, 0, 0.2],
    target: null, mode: 'none', status: 'coming-soon',
  },
  {
    id: 'reino-fracciones', world: 'Reino de las Fracciones', emoji: '🍕',
    title: 'Reino de las Fracciones', subtitle: 'Próximamente',
    theme: 'world-reino', shape: 'pizza', position: [-4.9, 0, 2.4],
    target: null, mode: 'none', status: 'coming-soon',
  },
  // — Mundos jugables/estudiables (contenido actual) —
  {
    id: 'volcan-potencias', world: 'Volcán de las Potencias', emoji: '🌋',
    title: 'Volcán de las Potencias', subtitle: 'Potencias, notación científica y radicales',
    theme: 'world-volcan', shape: 'crystal', position: [-3.6, 0, -2.2],
    target: '/mundo/volcan-potencias', mode: 'game', status: 'active',
    levelKeys: MUNDO3_LEVELS.map(id => `mundo3/${id}`),
  },
  {
    id: 'castillo-algebra', world: 'Castillo del Álgebra', emoji: '🏰',
    title: 'Castillo del Álgebra', subtitle: 'Polinomios, MCD/MCM y fracciones algebraicas',
    theme: 'world-castillo', shape: 'castle', position: [-0.4, 0, -3.0],
    target: '/bloque2', mode: 'study', status: 'active',
  },
  {
    id: 'laberinto-sistemas', world: 'Laberinto de Sistemas', emoji: '🌀',
    title: 'Laberinto de Sistemas', subtitle: 'Sistemas 2×2: gráfico, reducción y Cramer',
    theme: 'world-laberinto', shape: 'maze', position: [2.8, 0, -2.0],
    target: '/bloque3', mode: 'study', status: 'active',
  },
  {
    id: 'estacion-funciones', world: 'Estación de Funciones', emoji: '🚀',
    title: 'Estación de Funciones', subtitle: 'Funciones lineales y cuadráticas',
    theme: 'world-estacion', shape: 'rocket', position: [4.4, 0, 0.4],
    target: '/bloque4', mode: 'study', status: 'active',
  },
  {
    id: 'montanas-geometria', world: 'Montañas de Geometría', emoji: '⛰️',
    title: 'Montañas de Geometría', subtitle: 'Pitágoras, trigonometría, cilindro y prisma',
    theme: 'world-montanas', shape: 'mountain', position: [1.4, 0, 1.5],
    target: '/bloque5', mode: 'study', status: 'active',
  },
  {
    id: 'feria-datos', world: 'Feria de Datos', emoji: '🎡',
    title: 'Feria de Datos', subtitle: 'Estadística, conteo y probabilidad',
    theme: 'world-feria', shape: 'ferris', position: [-1.8, 0, 2.3],
    target: '/bloque6', mode: 'study', status: 'active',
  },
]

// Orden del camino principal entre mundos activos (serpiente por el mapa).
export const pathOrder = [
  'volcan-potencias', 'castillo-algebra', 'laberinto-sistemas',
  'estacion-funciones', 'montanas-geometria', 'feria-datos',
]

// Ramal bloqueado hacia los teasers (parte del último mundo activo).
export const teaserBranch = ['feria-datos', 'reino-fracciones', 'isla-numerica']

// Progreso real de un mundo jugable: estrellas ganadas y niveles completados.
// Devuelve null para nodos sin niveles (páginas de estudio y teasers). Puro.
export function worldProgress(node, gameState) {
  if (node.mode !== 'game' || !Array.isArray(node.levelKeys)) return null
  const done = new Set(gameState?.completedLevels ?? [])
  const starsMap = gameState?.stars ?? {}
  const total = node.levelKeys.length
  const completed = node.levelKeys.filter(k => done.has(k)).length
  const stars = node.levelKeys.reduce((sum, k) => sum + (starsMap[k] ?? 0), 0)
  return {
    stars,
    totalStars: total * 3,
    done: completed,
    total,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

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
