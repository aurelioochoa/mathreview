// Fuente de verdad única del mapa de mundos. Alimenta la escena 3D, el
// fallback 2D accesible y la navegación. Sin dependencias de React/DOM: puro.
//
// La identidad de mundos sigue el spec base (2026-07-18-math-quest-design):
// los 6 bloques originales se presentan como mundos 3-8, y los mundos 1-2
// (contenido nuevo de Fase 4) completan la escalera 8-15 años. El estado
// 'coming-soon' se conserva para futuros teasers, aunque hoy no lo use nadie.

// Niveles del Mundo 3 (para calcular estado 'completed'). Deben coincidir con
// los ids de src/content/worlds/mundo3-potencias.jsx.
const MUNDO3_LEVELS = ['aproximacion', 'potenciacion', 'notacion', 'radicacion']

export const worldMapNodes = [
  // — Mundos iniciales (Fase 4). Sin studyTarget: no vienen de ningún Bloque,
  //   así que no tienen página de estudio —
  {
    id: 'isla-numerica', world: 'Isla Numérica', emoji: '🏝️',
    title: 'Isla Numérica', subtitle: 'Operaciones, orden, múltiplos y divisores',
    theme: 'world-isla', shape: 'island', position: [-6.2, 0, 0.2],
    target: '/mundo/isla-numerica', mode: 'game', status: 'active',
    levelKeys: ['mundo1/operaciones', 'mundo1/orden', 'mundo1/multiplos-divisores', 'mundo1/jerarquia'],
  },
  {
    id: 'reino-fracciones', world: 'Reino de las Fracciones', emoji: '🍕',
    title: 'Reino de las Fracciones', subtitle: 'Fracciones, decimales y porcentajes',
    theme: 'world-reino', shape: 'pizza', position: [-4.9, 0, 2.4],
    target: '/mundo/reino-fracciones', mode: 'game', status: 'active',
    levelKeys: ['mundo2/fracciones', 'mundo2/operar-fracciones', 'mundo2/decimales', 'mundo2/porcentajes'],
  },
  // — Mundos jugables/estudiables (contenido actual) —
  {
    id: 'volcan-potencias', world: 'Volcán de las Potencias', emoji: '🌋',
    title: 'Volcán de las Potencias', subtitle: 'Potencias, notación científica y radicales',
    theme: 'world-volcan', shape: 'crystal', position: [-3.6, 0, -2.2],
    target: '/mundo/volcan-potencias', mode: 'game', status: 'active',
    studyTarget: '/mundo/volcan-potencias/estudio',
    levelKeys: MUNDO3_LEVELS.map(id => `mundo3/${id}`),
  },
  {
    id: 'castillo-algebra', world: 'Castillo del Álgebra', emoji: '🏰',
    title: 'Castillo del Álgebra', subtitle: 'Polinomios, MCD/MCM y fracciones algebraicas',
    theme: 'world-castillo', shape: 'castle', position: [-0.4, 0, -3.0],
    target: '/mundo/castillo-algebra', mode: 'game', status: 'active',
    studyTarget: '/mundo/castillo-algebra/estudio',
    levelKeys: ['mundo4/mcd', 'mundo4/mcm', 'mundo4/fracciones-algebraicas', 'mundo4/operaciones', 'mundo4/ecuaciones-lineales'],
  },
  {
    id: 'laberinto-sistemas', world: 'Laberinto de Sistemas', emoji: '🌀',
    title: 'Laberinto de Sistemas', subtitle: 'Sistemas 2×2: gráfico, reducción y Cramer',
    theme: 'world-laberinto', shape: 'maze', position: [2.8, 0, -2.0],
    target: '/mundo/laberinto-sistemas', mode: 'game', status: 'active',
    studyTarget: '/mundo/laberinto-sistemas/estudio',
    levelKeys: ['mundo5/intro-sistemas', 'mundo5/metodo-grafico', 'mundo5/reduccion', 'mundo5/cramer'],
  },
  {
    id: 'estacion-funciones', world: 'Estación de Funciones', emoji: '🚀',
    title: 'Estación de Funciones', subtitle: 'Funciones lineales y cuadráticas',
    theme: 'world-estacion', shape: 'rocket', position: [4.4, 0, 0.4],
    target: '/mundo/estacion-funciones', mode: 'game', status: 'active',
    studyTarget: '/mundo/estacion-funciones/estudio',
    levelKeys: ['mundo6/funcion-lineal', 'mundo6/funcion-cuadratica'],
  },
  {
    id: 'montanas-geometria', world: 'Montañas de Geometría', emoji: '⛰️',
    title: 'Montañas de Geometría', subtitle: 'Pitágoras, trigonometría, cilindro y prisma',
    theme: 'world-montanas', shape: 'mountain', position: [1.4, 0, 1.5],
    target: '/mundo/montanas-geometria', mode: 'game', status: 'active',
    studyTarget: '/mundo/montanas-geometria/estudio',
    levelKeys: ['mundo7/pitagoras', 'mundo7/trigonometria', 'mundo7/cilindro', 'mundo7/prisma'],
  },
  {
    id: 'feria-datos', world: 'Feria de Datos', emoji: '🎡',
    title: 'Feria de Datos', subtitle: 'Estadística, conteo y probabilidad',
    theme: 'world-feria', shape: 'ferris', position: [-1.8, 0, 2.3],
    target: '/mundo/feria-datos', mode: 'game', status: 'active',
    studyTarget: '/mundo/feria-datos/estudio',
    levelKeys: ['mundo8/estadistica', 'mundo8/percentiles', 'mundo8/conteo', 'mundo8/permutaciones', 'mundo8/combinaciones', 'mundo8/probabilidad'],
  },
]

// Orden del camino principal entre mundos activos (serpiente por el mapa).
export const pathOrder = [
  'isla-numerica', 'reino-fracciones', 'volcan-potencias', 'castillo-algebra', 'laberinto-sistemas',
  'estacion-funciones', 'montanas-geometria', 'feria-datos',
]

// Ruta del modo estudio de un mundo, o null si no tiene (los Mundos 1-2 son
// contenido nuevo, no vienen de ninguna página de Bloque). Puro.
export function studyTargetFor(slug) {
  return worldMapNodes.find(n => n.id === slug)?.studyTarget ?? null
}

// Progreso real de un mundo jugable: estrellas ganadas y niveles completados.
// Devuelve null para nodos sin niveles (teasers o páginas sueltas). Puro.
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

// El worldId ('mundoN') se deriva de los propios levelKeys ('mundoN/nivel'),
// que es donde ya vive esa relación: sin campo nuevo que mantener a mano.
function worldIdDe(node) {
  return node?.levelKeys?.[0]?.split('/')[0] ?? null
}

const nodoPorId = (id) => worldMapNodes.find(n => n.id === id) ?? null

// ¿Está abierto este mundo? Puro. Cuatro vías, cualquiera basta:
//   1. es el primero del camino,
//   2. el anterior tiene jefe derrotado,
//   3. el anterior se superó por portal,
//   4. el jugador YA tiene progreso aquí.
//
// La cuarta es el grandfathering: el desbloqueo secuencial llega en Fase 4, con
// partidas ya en marcha, y sin ella un jugador que venía por el Mundo 7 se
// encontraría su mundo cerrado de un día para otro. Va antes que nada porque no
// depende del camino.
export function isWorldUnlocked(nodeId, gameState) {
  const i = pathOrder.indexOf(nodeId)
  if (i <= 0) return true // el primero, o un nodo fuera del camino

  const node = nodoPorId(nodeId)
  const hechos = new Set(gameState?.completedLevels ?? [])
  if (node?.levelKeys?.some(k => hechos.has(k))) return true

  const anterior = worldIdDe(nodoPorId(pathOrder[i - 1]))
  if (!anterior) return true
  return (gameState?.bossDefeats ?? []).includes(anterior)
    || (gameState?.portalPasses ?? []).includes(anterior)
}

// Estado de un nodo dado el estado del juego. Puro.
export function nodeState(node, gameState) {
  if (node.status === 'coming-soon') return 'coming-soon'
  if (!isWorldUnlocked(node.id, gameState)) return 'locked'
  if (node.mode === 'game' && Array.isArray(node.levelKeys)) {
    const done = new Set(gameState?.completedLevels ?? [])
    if (node.levelKeys.every(k => done.has(k))) return 'completed'
  }
  return 'available'
}

// Navegación prev/next entre las páginas de bloque (se conservan las rutas).
export const blockRoutes = [
  { path: '/bloque1', slug: 'volcan-potencias', label: 'Volcán de las Potencias' },
  { path: '/bloque2', slug: 'castillo-algebra', label: 'Castillo del Álgebra' },
  { path: '/bloque3', slug: 'laberinto-sistemas', label: 'Laberinto de Sistemas' },
  { path: '/bloque4', slug: 'estacion-funciones', label: 'Estación de Funciones' },
  { path: '/bloque5', slug: 'montanas-geometria', label: 'Montañas de Geometría' },
  { path: '/bloque6', slug: 'feria-datos', label: 'Feria de Datos' },
]

export function adjacentBlock(pathname) {
  const i = blockRoutes.findIndex(b => b.path === pathname)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? blockRoutes[i - 1] : null,
    next: i < blockRoutes.length - 1 ? blockRoutes[i + 1] : null,
  }
}
