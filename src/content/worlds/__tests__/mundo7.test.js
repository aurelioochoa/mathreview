import { describe, it, expect } from 'vitest'
import {
  hipotenusa, catetoFaltante, senOpuesto, cosAdyacente,
  areaLateralCilindro, areaLateralPrisma, carasPrisma, aristasPrisma,
} from '../mundo7-geometria'

const fs = { hipotenusa, catetoFaltante, senOpuesto, cosAdyacente, areaLateralCilindro, areaLateralPrisma, carasPrisma, aristasPrisma }

describe('fábricas del Mundo 7', () => {
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
  it('hipotenusa: con rng mínimo (triple 3-4-5) responde 5', () => {
    expect(hipotenusa(() => 0).options[hipotenusa(() => 0).correctAnswer]).toBe('5')
  })
  it('carasPrisma: siempre n+2 (rng mínimo n=3 → 5)', () => {
    const q = carasPrisma(() => 0)
    expect(q.options[q.correctAnswer]).toBe('5')
  })
  it('correctitud con rng determinista (rng=()=>0)', () => {
    const casos = [
      [catetoFaltante, '4'],        // triple 3-4-5: hip 5, cateto 3 → falta 4
      [senOpuesto, '2'],            // hip=4, sen(30°)=0.5 → opuesto 2
      [cosAdyacente, '2'],          // hip=4, cos(60°)=0.5 → adyacente 2
      [areaLateralCilindro, '8π'],  // r=2, h=2 → 2πrh = 8π
      [areaLateralPrisma, '24'],    // 2×2×3 → perímetro 8 × altura 3 = 24
      [aristasPrisma, '9'],         // n=3 → 3n = 9
    ]
    for (const [f, esperado] of casos) {
      const q = f(() => 0)
      expect(q.options[q.correctAnswer], f.name).toBe(esperado)
    }
  })
})
