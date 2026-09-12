import { describe, it, expect } from 'vitest'
import { FORMAS } from '../worldModelShapes'
import { worldMapNodes } from '../../content/worldMap'

describe('dioramas de los mundos', () => {
  it('cada mundo del mapa tiene su forma dibujada', () => {
    for (const node of worldMapNodes) {
      expect(FORMAS, `${node.id} usa shape "${node.shape}"`).toContain(node.shape)
    }
  })

  it('no sobra ninguna forma sin mundo que la use', () => {
    const usadas = new Set(worldMapNodes.map((n) => n.shape))
    expect([...FORMAS].filter((f) => !usadas.has(f))).toEqual([])
  })
})
