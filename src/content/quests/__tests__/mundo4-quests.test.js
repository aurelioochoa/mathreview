import { describe, it, expect } from 'vitest'
import { mundo4Quests } from '../mundo4-quests'

describe('sidequests del Mundo 4', () => {
  it('hay 2 quests bien formadas', () => {
    expect(mundo4Quests).toHaveLength(2)
    for (const q of mundo4Quests) {
      expect(q.id).toBeTruthy()
      expect(q.title).toBeTruthy()
      expect(q.intro).toBeTruthy()
      expect(q.questions.length).toBeGreaterThanOrEqual(3)
      expect(q.questions.length).toBeLessThanOrEqual(5)
    }
  })
  it('cada fábrica produce 4 opciones distintas y correctAnswer válido (300 tiradas)', () => {
    for (const quest of mundo4Quests) {
      for (const f of quest.questions) {
        for (let i = 0; i < 300; i++) {
          const q = f()
          expect(q.options).toHaveLength(4)
          expect(new Set(q.options).size).toBe(4)
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
          expect(q.correctAnswer).toBeLessThan(4)
        }
      }
    }
  })
})
