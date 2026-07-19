import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../gameStore'

describe('gameReducer', () => {
  it('ANSWER_CORRECT suma XP', () => {
    const s = gameReducer(initialState, { type: 'ANSWER_CORRECT', xp: 10 })
    expect(s.xp).toBe(10)
  })
  it('LEVEL_COMPLETED registra nivel, estrellas, XP y monedas', () => {
    const s = gameReducer(initialState, {
      type: 'LEVEL_COMPLETED', levelKey: 'mundo3/aproximacion', stars: 2, xp: 50, coins: 20,
    })
    expect(s.completedLevels).toContain('mundo3/aproximacion')
    expect(s.stars['mundo3/aproximacion']).toBe(2)
    expect(s.xp).toBe(50)
    expect(s.coins).toBe(20)
  })
  it('rejugar nunca baja estrellas y no duplica completedLevels', () => {
    let s = gameReducer(initialState, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 3, xp: 0, coins: 0 })
    s = gameReducer(s, { type: 'LEVEL_COMPLETED', levelKey: 'k', stars: 1, xp: 0, coins: 0 })
    expect(s.stars.k).toBe(3)
    expect(s.completedLevels.filter(x => x === 'k')).toHaveLength(1)
  })
  it('acción desconocida devuelve el mismo estado', () => {
    expect(gameReducer(initialState, { type: 'NOPE' })).toBe(initialState)
  })
})
