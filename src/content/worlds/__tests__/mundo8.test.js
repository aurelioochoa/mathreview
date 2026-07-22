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
  it('correctitud con rng determinista (rng=()=>0)', () => {
    const casos = [
      [media, '5'],                 // valores [0,4,5,6,10] → media 5
      [mediana, '5'],               // [1,2,5,8,11] → mediana 5
      [moda, '1'],                  // moda 1 (aparece 3 veces)
      [principioConteo, '8'],       // 2×2×2
      [menuConteo, '12'],           // 2×3×2
      [factorial, '6'],             // 3! = 6
      [probEvento, '1/4'],          // 1 favorable de 4
      [probComplementario, '4/5'],  // 1 − 1/5 = 4/5
      [probIndependientes, '1/6'],  // 1/2 × 1/3 (d2 ajustado a 3)
    ]
    for (const [f, esperado] of casos) {
      const q = f(() => 0)
      expect(q.options[q.correctAnswer], f.name).toBe(esperado)
    }
  })
})
