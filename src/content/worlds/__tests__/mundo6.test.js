import { describe, it, expect } from 'vitest'
import { pendienteDe, corteEjeY, verticeParabola } from '../mundo6-funciones'

describe('fábricas del Mundo 6', () => {
  for (const [n, f] of Object.entries({ pendienteDe, corteEjeY, verticeParabola })) {
    it(`${n}: 4 opciones distintas y correctAnswer válido (500 tiradas)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = f()
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(4)
      }
    })
  }
  it('correctitud con rng determinista (rng=()=>0)', () => {
    const casos = [
      [pendienteDe, '-5'],           // m = NO_CERO[0] = -5
      [corteEjeY, '(0, 1)'],         // m=-5, b=1 → corte (0, 1)
      [verticeParabola, '(-4, -5)'], // h=-4, k=-5 → vértice (-4, -5)
    ]
    for (const [f, esperado] of casos) {
      const q = f(() => 0)
      expect(q.options[q.correctAnswer], f.name).toBe(esperado)
    }
  })
})
