import { describe, it, expect } from 'vitest'
import { staticQuestion, randInt, buildReto } from '../generators'

const q = { question: '¿2+2?', options: ['3', '4', '5', '6'], correctAnswer: 1, hint: 'h', reminder: 'r' }

describe('generators', () => {
  it('staticQuestion devuelve la misma pregunta', () => {
    expect(staticQuestion(q)()).toEqual(q)
  })
  it('randInt respeta límites inclusivos', () => {
    expect(randInt(() => 0, 3, 7)).toBe(3)
    expect(randInt(() => 0.999999, 3, 7)).toBe(7)
  })
  it('buildReto elige N sin repetir y ejecuta las fábricas', () => {
    const factories = [1, 2, 3, 4, 5].map(n =>
      staticQuestion({ ...q, question: `Q${n}` }))
    const reto = buildReto(factories, 3, () => 0.5)
    expect(reto).toHaveLength(3)
    const texts = reto.map(x => x.question)
    expect(new Set(texts).size).toBe(3)
    reto.forEach(x => {
      expect(x.options).toHaveLength(4)
      expect(x.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(x.correctAnswer).toBeLessThan(4)
    })
  })
  it('si pick >= fábricas, devuelve todas', () => {
    const factories = [q, q].map(staticQuestion)
    expect(buildReto(factories, 5)).toHaveLength(2)
  })
})
