import { describe, it, expect } from 'vitest'
import { mundo2Quests } from '../mundo2-quests'

describe('sidequests del Mundo 2', () => {
  it('hay 2 quests bien formadas', () => {
    expect(mundo2Quests).toHaveLength(2)
    for (const q of mundo2Quests) {
      expect(q.id).toBeTruthy()
      expect(q.title).toBeTruthy()
      expect(q.intro).toBeTruthy()
      expect(q.questions.length).toBeGreaterThanOrEqual(3)
      expect(q.questions.length).toBeLessThanOrEqual(5)
    }
  })
  it('cada fábrica produce 4 opciones distintas y correctAnswer válido (300 tiradas)', () => {
    for (const quest of mundo2Quests) {
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

  // Mismo motivo que en el mundo: se pagan monedas, no 68.4 monedas.
  it('las preguntas de rebajas dan cantidades enteras', () => {
    const rebajas = mundo2Quests[1].questions
    for (const f of rebajas) {
      for (let i = 0; i < 300; i++) {
        for (const opt of f().options) {
          if (!Number.isNaN(Number(opt))) expect(Number.isInteger(Number(opt)), `${opt}`).toBe(true)
        }
      }
    }
  })
})
