import { describe, it, expect } from 'vitest'
import { cuadrantePunto, cramerDeterminante } from '../mundo5-sistemas'

describe('fábricas del Mundo 5', () => {
  for (const [nombre, f] of Object.entries({ cuadrantePunto, cramerDeterminante })) {
    it(`${nombre}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
  it('cramerDeterminante nunca da D = 0 y el correcto es a·d − c·b', () => {
    for (let i = 0; i < 200; i++) {
      const q = cramerDeterminante()
      expect(q.options[q.correctAnswer]).not.toBe('0')
    }
  })
})
