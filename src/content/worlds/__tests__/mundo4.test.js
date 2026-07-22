import { describe, it, expect } from 'vitest'
import { mcdReparto, mcmEventos, resolverLineal } from '../mundo4-algebra'

const factorias = { mcdReparto, mcmEventos, resolverLineal }

describe('fábricas del Mundo 4', () => {
  for (const [nombre, f] of Object.entries(factorias)) {
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
  it('mcmEventos: la respuesta correcta es el MCM real (rng mínimo → 2 y 4 → MCM 4)', () => {
    const q = mcmEventos(() => 0) // g=2, m=1, n=2 → a=2,b=4 → MCM=4
    expect(q.options[q.correctAnswer]).toBe('4')
  })
  it('resolverLineal: la solución satisface la ecuación', () => {
    const q = resolverLineal(() => 0) // a=3,c=1,x0=1,b=-9 → 3x-9 = x-7 → x=1
    expect(q.options[q.correctAnswer]).toBe('x = 1')
  })
  it('mcdReparto: el MCD real (rng mínimo → d=3, par COPRIMOS [2,3] → 6 y 9 → MCD 3)', () => {
    const q = mcdReparto(() => 0)
    expect(q.options[q.correctAnswer]).toBe('3')
  })
})
