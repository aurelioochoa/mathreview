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
