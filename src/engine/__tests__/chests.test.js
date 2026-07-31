import { describe, it, expect } from 'vitest'
import { rollChest } from '../chests'
import { defaultState } from '../../state/gameStore'
import { COSMETIC_ITEMS } from '../../content/shop'

describe('rollChest', () => {
  it('siempre devuelve una recompensa con forma válida', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(defaultState(), Math.random)
      expect(['coins', 'hint', 'cosmetic']).toContain(r.type)
      if (r.type === 'coins') expect(r.amount).toBeGreaterThan(0)
      if (r.type === 'hint') expect(r.amount).toBeGreaterThan(0)
      if (r.type === 'cosmetic') expect(COSMETIC_ITEMS.map(c => c.id)).toContain(r.id)
    }
  })
  it('nunca entrega un cosmético ya poseído', () => {
    const allOwned = { ...defaultState(), cosmetics: { ...defaultState().cosmetics, owned: COSMETIC_ITEMS.map(c => c.id) } }
    for (let i = 0; i < 500; i++) {
      const r = rollChest(allOwned, Math.random)
      expect(r.type).not.toBe('cosmetic') // sin cosméticos disponibles → cae a coins/hint
    }
  })
  it('con rng=0 cae en la primera franja (coins)', () => {
    expect(rollChest(defaultState(), () => 0).type).toBe('coins')
  })
  it('la franja alta entrega un cosmético no poseído', () => {
    const r = rollChest(defaultState(), () => 0.9)
    expect(r.type).toBe('cosmetic')
    expect(COSMETIC_ITEMS.map(c => c.id)).toContain(r.id)
  })
  it('tolera un estado sin cosmetics (guardado incompleto)', () => {
    expect(() => rollChest({}, () => 0.9)).not.toThrow()
    expect(rollChest({}, () => 0.9).type).toBe('cosmetic')
  })
})
