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
})
