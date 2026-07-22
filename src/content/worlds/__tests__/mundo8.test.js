import { describe, it, expect } from 'vitest'
import {
  media, mediana, moda, principioConteo, menuConteo,
  permutaciones, factorial, combinaciones,
  probEvento, probComplementario, probIndependientes,
} from '../mundo8-datos'

const fs = { media, mediana, moda, principioConteo, menuConteo, permutaciones, factorial, combinaciones, probEvento, probComplementario, probIndependientes }

describe('fábricas del Mundo 8', () => {
  for (const [n, f] of Object.entries(fs)) {
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
  it('permutaciones: P(n,r) correcto (rng mín n=4,r=2 → 12)', () => {
    const q = permutaciones(() => 0)
    expect(q.options[q.correctAnswer]).toBe('12')
  })
  it('combinaciones: C(n,r) correcto (rng mín n=5,r=2 → 10)', () => {
    const q = combinaciones(() => 0)
    expect(q.options[q.correctAnswer]).toBe('10')
  })
})
