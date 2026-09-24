import { describe, it, expect } from 'vitest'
import { worlds } from '../../content/worlds'
import { questsForWorld } from '../../content/quests'
import { worldMapNodes } from '../../content/worldMap'
import { makeTerrain, biomaDe, BIOMA_POR_MUNDO, BIOMAS } from '../walk/biomes'
import { layoutFor, hashSeed, SHORE_R } from '../walk/walkLogic'

const AGUA = -0.9

function isla(w) {
  const st = layoutFor(w, questsForWorld(w.id), {})
  return { st, t: makeTerrain(biomaDe(w.slug), hashSeed(w.slug), st) }
}

describe('biomas: cada isla tiene su terreno', () => {
  it('los ocho mundos tienen un bioma propio y distinto', () => {
    const ids = worldMapNodes.map(n => BIOMA_POR_MUNDO[n.id])
    expect(ids.every(Boolean)).toBe(true)
    expect(new Set(ids).size).toBe(worldMapNodes.length)
    for (const id of ids) expect(BIOMAS[id].mix.length).toBeGreaterThan(0)
  })

  for (const w of worlds) {
    describe(w.name, () => {
      const { st, t } = isla(w)

      it('las estaciones están en tierra firme, no bajo el agua', () => {
        for (const s of st.filter(x => x.kind !== 'dock')) {
          expect(t.height(s.x, s.z), s.id).toBeGreaterThan(AGUA + 0.3)
        }
      })

      it('el monumento está sobre una explanada', () => {
        expect(Math.abs(t.height(0, 0) - t.height(1.2, 0.8))).toBeLessThan(0.1)
      })

      it('más allá de la orilla solo hay mar', () => {
        for (let a = 0; a < 6.28; a += 0.4) {
          expect(t.height(Math.sin(a) * (SHORE_R + 4), Math.cos(a) * (SHORE_R + 4))).toBeLessThan(AGUA)
        }
      })

      it('los colores son válidos', () => {
        for (let x = -16; x <= 16; x += 4) for (let z = -16; z <= 16; z += 4) {
          for (const c of t.color(x, z, t.height(x, z))) { expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThanOrEqual(1) }
        }
      })

      it('ningún obstáculo del bioma tapa una estación', () => {
        for (const o of t.obstacles) for (const s of st) {
          expect(Math.hypot(o.x - s.x, o.z - s.z), `${s.id}`).toBeGreaterThan(o.r + 0.5)
        }
      })
    })
  }
})

describe('biomas: rasgos que los distinguen', () => {
  const t = (slug) => isla(worlds.find(w => w.slug === slug)).t

  it('el volcán sube hacia el centro y tiene ríos de lava', () => {
    const v = t('volcan-potencias')
    expect(v.height(0, 0)).toBeGreaterThan(v.height(0, -13) + 1)
    expect(v.features.lava.length).toBeGreaterThan(0)
  })

  it('la isla tropical tiene una laguna con agua', () => {
    const d = t('isla-numerica')
    const l = d.features.laguna
    expect(l).toBeTruthy()
    expect(d.height(l.x, l.z)).toBeLessThan(AGUA)
  })

  it('la cordillera tiene cumbres altas pero deja paso al embarcadero', () => {
    const c = t('montanas-geometria')
    let max = -Infinity
    for (let a = 0; a < 6.28; a += 0.05) max = Math.max(max, c.height(Math.sin(a) * 16.2, Math.cos(a) * 16.2))
    expect(max).toBeGreaterThan(2.5)
    expect(c.height(0, 15.5)).toBeLessThan(1.2) // el sur, donde está el muelle
  })

  it('los cráteres son hoyos de verdad', () => {
    const c = t('estacion-funciones')
    expect(c.features.crateres.length).toBeGreaterThan(2)
    const k = c.features.crateres[0]
    expect(c.height(k.x, k.z)).toBeLessThan(c.height(k.x + k.rad * 1.2, k.z))
  })

  it('el laberinto tiene setos, la feria carpas y farolas, el castillo foso', () => {
    expect(t('laberinto-sistemas').features.setos.length).toBeGreaterThan(10)
    const f = t('feria-datos')
    expect(f.features.carpas.length).toBeGreaterThan(1)
    expect(f.features.farolas.length).toBeGreaterThan(3)
    const c = t('castillo-algebra')
    expect(c.height(0, 4.75)).toBeLessThan(c.height(0, 3.5) - 0.8)
  })

  it('misma semilla, misma isla', () => {
    const w = worlds[0]
    const a = isla(w).t, b = isla(w).t
    expect(a.height(5, 7)).toBe(b.height(5, 7))
    expect(a.features).toEqual(b.features)
  })
})
