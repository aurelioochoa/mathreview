import { describe, it, expect } from 'vitest'
import {
  ISLANDS, SPREAD, ISLAND_RADIUS, BOAT_RADIUS, NEAR_RADIUS, DOCK_RADIUS, BOUNDS, MAX_SPEED,
  angleDelta, cameraRelative, stepBoat, nearestIsland, dockPoint, autopilotDir,
  recommendedWorld, spawnNear, sanitizeBoat,
} from '../explorerLogic'
import { worldMapNodes } from '../../content/worldMap'
import { BOTELLAS, bottleAt } from '../../content/curiosidades'

const quieto = { x: 0, z: 0, heading: 0, speed: 0 }

describe('mapa explorable: islas', () => {
  it('hay una isla por mundo, separada por SPREAD', () => {
    expect(ISLANDS).toHaveLength(worldMapNodes.length)
    const n = worldMapNodes[0]
    expect(ISLANDS[0]).toEqual({ id: n.id, x: n.position[0] * SPREAD, z: n.position[2] * SPREAD })
  })

  // Lo que motivó separar las islas: con la cámara libre, dos islas demasiado
  // juntas vuelven a pisarse las placas y a encerrar al barco entre ellas.
  it('entre dos islas cualesquiera cabe el barco con holgura', () => {
    for (const a of ISLANDS) for (const b of ISLANDS) {
      if (a === b) continue
      expect(Math.hypot(a.x - b.x, a.z - b.z), `${a.id} ↔ ${b.id}`).toBeGreaterThan(2 * ISLAND_RADIUS + 4 * BOAT_RADIUS)
    }
  })

  it('todas las islas caen dentro del mar navegable', () => {
    for (const is of ISLANDS) {
      expect(is.x).toBeGreaterThan(BOUNDS.minX + ISLAND_RADIUS)
      expect(is.x).toBeLessThan(BOUNDS.maxX - ISLAND_RADIUS)
      expect(is.z).toBeGreaterThan(BOUNDS.minZ + ISLAND_RADIUS)
      expect(is.z).toBeLessThan(BOUNDS.maxZ - ISLAND_RADIUS)
    }
  })
})

describe('mapa explorable: movimiento del barco', () => {
  it('angleDelta toma el camino corto', () => {
    expect(angleDelta(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2)
    expect(angleDelta(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(-0.2)
  })

  it('con la cámara detrás (yaw 0), "adelante" es -z y "derecha" es +x', () => {
    const f = cameraRelative(0, 1, 0)
    expect(f.x).toBeCloseTo(0); expect(f.z).toBeCloseTo(-1)
    const r = cameraRelative(1, 0, 0)
    expect(r.x).toBeCloseTo(1); expect(r.z).toBeCloseTo(0)
  })

  it('la diagonal no va más rápido que una dirección recta', () => {
    const d = cameraRelative(1, 1, 0.7)
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1)
  })

  it('acelera hacia donde se le pide sin pasar de la velocidad máxima', () => {
    let b = { x: 0, z: 6, heading: Math.PI, speed: 0 }
    for (let i = 0; i < 200; i++) b = stepBoat(b, { x: 0, z: -1 }, 1 / 60, [])
    expect(b.speed).toBeCloseTo(MAX_SPEED)
    expect(b.z).toBeLessThan(6)
  })

  it('sin entrada frena hasta pararse', () => {
    let b = { ...quieto, speed: 3 }
    for (let i = 0; i < 120; i++) b = stepBoat(b, { x: 0, z: 0 }, 1 / 60, [])
    expect(b.speed).toBe(0)
  })

  it('no atraviesa una isla: encalla en su orilla', () => {
    const isla = { id: 'i', x: 0, z: 0 }
    let b = { x: 0, z: 5, heading: Math.PI, speed: 0 }
    for (let i = 0; i < 300; i++) b = stepBoat(b, { x: 0, z: -1 }, 1 / 60, [isla])
    expect(Math.hypot(b.x, b.z)).toBeGreaterThanOrEqual(ISLAND_RADIUS + BOAT_RADIUS - 1e-6)
  })

  it('no sale del mar navegable', () => {
    let b = { x: BOUNDS.maxX - 0.5, z: 0, heading: Math.PI / 2, speed: MAX_SPEED }
    for (let i = 0; i < 100; i++) b = stepBoat(b, { x: 1, z: 0 }, 1 / 30, [])
    expect(b.x).toBeLessThanOrEqual(BOUNDS.maxX)
  })
})

describe('mapa explorable: islas cercanas y piloto automático', () => {
  const [a] = ISLANDS

  it('reconoce la isla cercana y nada en mar abierto', () => {
    expect(nearestIsland(a.x + NEAR_RADIUS - 0.1, a.z)).toBe(a.id)
    expect(nearestIsland(BOUNDS.minX, BOUNDS.maxZ)).toBeNull()
  })

  it('el punto de atraque está en la orilla del lado del barco y dentro del radio de "cerca"', () => {
    const p = dockPoint({ x: a.x + 10, z: a.z }, a)
    expect(p.x).toBeCloseTo(a.x + DOCK_RADIUS)
    expect(p.z).toBeCloseTo(a.z)
    expect(DOCK_RADIUS).toBeLessThan(NEAR_RADIUS)
    expect(DOCK_RADIUS).toBeGreaterThan(ISLAND_RADIUS + BOAT_RADIUS)
  })

  it('el piloto llega a su destino y entonces se suelta', () => {
    let b = { x: 0, z: 0, heading: 0, speed: 0 }
    const target = { x: 4, z: 3 }
    let llegado = false
    for (let i = 0; i < 600 && !llegado; i++) {
      const d = autopilotDir(b, target)
      if (!d) { llegado = true; break }
      b = stepBoat(b, d, 1 / 60, [])
    }
    expect(llegado).toBe(true)
    expect(Math.hypot(b.x - 4, b.z - 3)).toBeLessThan(0.3)
  })

  it('llevado a una isla por el piloto, acaba con esa isla "cerca"', () => {
    const is = ISLANDS[3]
    let b = spawnNear(ISLANDS[0].id)
    const t = dockPoint(b, is)
    for (let i = 0; i < 3000; i++) {
      const d = autopilotDir(b, t)
      if (!d) break
      b = stepBoat(b, d, 1 / 60)
    }
    expect(nearestIsland(b.x, b.z)).toBe(is.id)
  })
})

describe('mapa explorable: aparición y guardado', () => {
  it('sin progreso el objetivo es el primer mundo', () => {
    expect(recommendedWorld({ completedLevels: [], bossDefeats: [], portalPasses: [] })).toBe('isla-numerica')
  })

  it('el barco aparece fuera de la isla pero a su alcance', () => {
    for (const is of ISLANDS) {
      const b = spawnNear(is.id)
      const d = Math.hypot(b.x - is.x, b.z - is.z)
      expect(d).toBeGreaterThan(ISLAND_RADIUS + BOAT_RADIUS)
      expect(nearestIsland(b.x, b.z)).toBe(is.id)
    }
  })

  it('sanitizeBoat descarta basura y acota al mar', () => {
    expect(sanitizeBoat(null)).toBeNull()
    expect(sanitizeBoat({ x: 'a', z: 0, heading: 0 })).toBeNull()
    expect(sanitizeBoat({ x: NaN, z: 0, heading: 0 })).toBeNull()
    expect(sanitizeBoat({ x: 999, z: -999, heading: 1 })).toEqual({ x: BOUNDS.maxX, z: BOUNDS.minZ, heading: 1, speed: 0 })
  })
})

describe('botellas con mensaje', () => {
  it('ids únicos, en mar abierto y dentro de los límites', () => {
    expect(new Set(BOTELLAS.map(b => b.id)).size).toBe(BOTELLAS.length)
    for (const b of BOTELLAS) {
      expect(b.x).toBeGreaterThan(BOUNDS.minX); expect(b.x).toBeLessThan(BOUNDS.maxX)
      expect(b.z).toBeGreaterThan(BOUNDS.minZ); expect(b.z).toBeLessThan(BOUNDS.maxZ)
      for (const is of ISLANDS) {
        expect(Math.hypot(b.x - is.x, b.z - is.z), `${b.id} junto a ${is.id}`).toBeGreaterThan(ISLAND_RADIUS + 1)
      }
    }
  })

  it('bottleAt encuentra la botella al pasar cerca y no repite las recogidas', () => {
    const b = BOTELLAS[0]
    expect(bottleAt(b.x + 0.5, b.z, new Set())).toBe(b.id)
    expect(bottleAt(b.x + 0.5, b.z, new Set([b.id]))).toBeNull()
    expect(bottleAt(b.x + 5, b.z + 5, new Set())).toBeNull()
  })
})
