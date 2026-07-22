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
  it('cramerDeterminante nunca da D = 0', () => {
    for (let i = 0; i < 200; i++) {
      const q = cramerDeterminante()
      expect(q.options[q.correctAnswer]).not.toBe('0')
    }
  })
  it('cuadrantePunto: cuadrante correcto (rng mínimo → punto (1,1) → I)', () => {
    const q = cuadrantePunto(() => 0)
    expect(q.options[q.correctAnswer]).toBe('I')
  })
  it('cramerDeterminante: el correcto ES a·d − c·b (rng mínimo → 1·(−5) − 1·1 = −6)', () => {
    const q = cramerDeterminante(() => 0)
    expect(q.options[q.correctAnswer]).toBe('-6')
  })
})
