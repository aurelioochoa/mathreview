import { describe, it, expect } from 'vitest'
import {
  worldMapNodes, nodeState, blockRoutes, adjacentBlock,
  pathOrder, teaserBranch, worldProgress, studyTargetFor,
} from '../worldMap'

describe('worldMap: modelo de nodos', () => {
  it('tiene 8 nodos: 1 teaser (coming-soon) + 7 mundos activos', () => {
    expect(worldMapNodes).toHaveLength(8)
    expect(worldMapNodes.filter(n => n.status === 'coming-soon')).toHaveLength(1)
    expect(worldMapNodes.filter(n => n.status === 'active')).toHaveLength(7)
  })

  it('cada nodo activo apunta a una ruta válida conocida', () => {
    const validTargets = new Set([
      '/mundo/isla-numerica',
      '/mundo/volcan-potencias', '/mundo/castillo-algebra', '/mundo/laberinto-sistemas',
      '/mundo/estacion-funciones', '/mundo/montanas-geometria', '/mundo/feria-datos',
    ])
    for (const n of worldMapNodes.filter(n => n.status === 'active')) {
      expect(validTargets.has(n.target), `${n.id} -> ${n.target}`).toBe(true)
    }
  })

  it('los mundos activos son de modo juego con levelKeys', () => {
    for (const n of worldMapNodes.filter(n => n.status === 'active')) {
      expect(n.mode, n.id).toBe('game')
      expect(Array.isArray(n.levelKeys) && n.levelKeys.length > 0, n.id).toBe(true)
    }
  })

  // El modo estudio son las páginas de Bloque originales: los mundos nuevos
  // (contenido escrito de cero) no tienen, y su enlace no debe renderizarse.
  it('studyTargetFor da la ruta de estudio de los mundos migrados y null en los nuevos', () => {
    expect(studyTargetFor('volcan-potencias')).toMatch(/^\/mundo\/.+\/estudio$/)
    expect(studyTargetFor('isla-numerica')).toBe(null)
    expect(studyTargetFor('no-existe')).toBe(null)
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

  it('los nodos viven en el plano XZ (y = 0) para el mapa aéreo', () => {
    for (const n of worldMapNodes) {
      expect(n.position[1], n.id).toBe(0)
    }
  })
})

describe('worldMap: caminos', () => {
  it('pathOrder recorre todos los mundos activos, sin repetir', () => {
    const activeIds = [...new Set(worldMapNodes.filter(n => n.status === 'active').map(n => n.id))]
    expect(pathOrder).toHaveLength(activeIds.length)
    expect(new Set(pathOrder).size).toBe(pathOrder.length)
    for (const id of pathOrder) expect(activeIds).toContain(id)
  })

  it('el camino empieza por el mundo inicial (el más fácil)', () => {
    expect(pathOrder[0]).toBe('isla-numerica')
  })

  it('teaserBranch arranca en un mundo activo y sigue con teasers', () => {
    const byId = Object.fromEntries(worldMapNodes.map(n => [n.id, n]))
    expect(byId[teaserBranch[0]].status).toBe('active')
    for (const id of teaserBranch.slice(1)) {
      expect(byId[id].status, id).toBe('coming-soon')
    }
  })
})

describe('worldMap: worldProgress', () => {
  const volcan = worldMapNodes.find(n => n.id === 'volcan-potencias')
  const castillo = worldMapNodes.find(n => n.id === 'castillo-algebra')

  it('teaser (coming-soon) -> null (sin progreso falso)', () => {
    const teaser = worldMapNodes.find(n => n.status === 'coming-soon')
    expect(worldProgress(teaser, { completedLevels: [] })).toBeNull()
  })

  it('mundo jugable sin avance: 0 estrellas, 0%', () => {
    const p = worldProgress(castillo, { completedLevels: [], stars: {} })
    expect(p).toEqual({ stars: 0, totalStars: 15, done: 0, total: 5, pct: 0 })
  })

  it('sin avance: 0 estrellas, 0%', () => {
    const p = worldProgress(volcan, { completedLevels: [], stars: {} })
    expect(p).toEqual({ stars: 0, totalStars: 12, done: 0, total: 4, pct: 0 })
  })

  it('avance parcial: cuenta niveles y estrellas reales', () => {
    const p = worldProgress(volcan, {
      completedLevels: ['mundo3/aproximacion', 'mundo3/potenciacion'],
      stars: { 'mundo3/aproximacion': 3, 'mundo3/potenciacion': 1 },
    })
    expect(p.done).toBe(2)
    expect(p.stars).toBe(4)
    expect(p.pct).toBe(50)
  })

  it('todo completo: 100%', () => {
    const all = ['mundo3/aproximacion', 'mundo3/potenciacion', 'mundo3/notacion', 'mundo3/radicacion']
    const p = worldProgress(volcan, {
      completedLevels: all,
      stars: Object.fromEntries(all.map(k => [k, 3])),
    })
    expect(p).toEqual({ stars: 12, totalStars: 12, done: 4, total: 4, pct: 100 })
  })
})

describe('worldMap: nodeState', () => {
  const volcan = worldMapNodes.find(n => n.id === 'volcan-potencias')
  const castillo = worldMapNodes.find(n => n.id === 'castillo-algebra')
  const isla = worldMapNodes.find(n => n.id === 'isla-numerica')

  it('teaser -> coming-soon sin importar el estado', () => {
    const teaser = worldMapNodes.find(n => n.status === 'coming-soon')
    expect(nodeState(teaser, { completedLevels: [] })).toBe('coming-soon')
  })

  it('la Isla Numérica ya es jugable y no un teaser', () => {
    expect(isla.mode).toBe('game')
    expect(nodeState(isla, { completedLevels: [] })).toBe('available')
  })

  it('mundo jugable -> available si no está completo', () => {
    expect(nodeState(castillo, { completedLevels: [] })).toBe('available')
    expect(nodeState(castillo, { completedLevels: ['mundo3/aproximacion'] })).toBe('available')
  })

  it('mundo jugable -> available si no está todo completo', () => {
    expect(nodeState(volcan, { completedLevels: [] })).toBe('available')
    expect(nodeState(volcan, { completedLevels: ['mundo3/aproximacion'] })).toBe('available')
  })

  it('mundo jugable -> completed cuando TODOS sus niveles están en completedLevels', () => {
    const all = [
      'mundo3/aproximacion', 'mundo3/potenciacion', 'mundo3/notacion', 'mundo3/radicacion',
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

  it('cada blockRoutes.slug corresponde a un nodo activo del mapa', () => {
    const activeSlugs = new Set(
      worldMapNodes.filter(n => n.status === 'active').map(n => n.id)
    )
    for (const b of blockRoutes) {
      expect(b.slug, b.path).toBeTruthy()
      expect(activeSlugs.has(b.slug), `${b.path} -> ${b.slug}`).toBe(true)
    }
  })
})
