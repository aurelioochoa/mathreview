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

  it('totalStars suma las estrellas reales de todos los niveles', () => {
    expect(hudStats({ xp: 0, coins: 0 }).totalStars).toBe(0)
    expect(hudStats({ xp: 0, coins: 0, stars: {} }).totalStars).toBe(0)
    expect(hudStats({
      xp: 0, coins: 0,
      stars: { 'mundo3/aproximacion': 3, 'mundo3/potencias': 2, 'mundo3/notacion': 1 },
    }).totalStars).toBe(6)
  })

  it('progress siempre queda en [0,1]', () => {
    for (const xp of [0, 1, 99, 100, 250, 999, 5000]) {
      const p = hudStats({ xp, coins: 0 }).progress
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })
})
