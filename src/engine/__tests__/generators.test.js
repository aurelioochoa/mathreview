import { describe, it, expect } from 'vitest'
import { staticQuestion, randInt, buildReto, shuffleOptions, makeOptions, buildBossPool } from '../generators'

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

describe('shuffleOptions', () => {
  it('preserva el conjunto de opciones y correctAnswer sigue apuntando al valor correcto', () => {
    const original = { question: '¿2+2?', options: ['3', '4', '5', '6'], correctAnswer: 1, hint: 'h', reminder: 'r' }
    const correctValue = original.options[original.correctAnswer]
    const result = shuffleOptions(original, () => 0.5)
    expect(result.options[result.correctAnswer]).toBe(correctValue)
    expect(new Set(result.options)).toEqual(new Set(original.options))
  })

  it('no siempre deja la respuesta correcta en el índice 0 (regresión "siempre A")', () => {
    const original = { question: '¿2+2?', options: ['3', '4', '5', '6'], correctAnswer: 1, hint: 'h', reminder: 'r' }
    let sawNonZero = false
    for (let i = 0; i < 200; i++) {
      const result = shuffleOptions(original, Math.random)
      if (result.correctAnswer !== 0) {
        sawNonZero = true
        break
      }
    }
    expect(sawNonZero).toBe(true)
  })
})

describe('makeOptions', () => {
  it('pone el correcto en el índice 0 y devuelve 4 opciones', () => {
    const r = makeOptions(5, [6, 7, 8])
    expect(r.correctAnswer).toBe(0)
    expect(r.options).toEqual(['5', '6', '7', '8'])
  })
  it('deduplica distractores repetidos o iguales al correcto', () => {
    const r = makeOptions(5, [5, 6, 6, 7])
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
    expect(r.options[0]).toBe('5')
  })
  it('rellena con vecinos numéricos si faltan distractores', () => {
    const r = makeOptions(10, [10]) // solo colisiones → rellena
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
    expect(r.options[0]).toBe('10')
  })
  it('conserva distractores string distintos', () => {
    const r = makeOptions('x = 3', ['x = 4', 'x = 2', 'x = -3'])
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
  })
  it('rellena con sufijos cuando el correcto es string y faltan distractores', () => {
    // Correcto no numérico + distractores que colapsan al deduplicar → único
    // camino que ejercita el respaldo no numérico `${correct} (${k})`.
    const r = makeOptions('rojo', ['rojo', 'rojo'])
    expect(r.options).toHaveLength(4)
    expect(new Set(r.options).size).toBe(4)
    expect(r.correctAnswer).toBe(0)
    expect(r.options[0]).toBe('rojo')
    expect(r.options.slice(1)).toEqual(['rojo (1)', 'rojo (2)', 'rojo (3)'])
  })
})

describe('buildBossPool', () => {
  const world = {
    levels: [
      { reto: { factories: [() => ({ question: 'a', options: ['1','2','3','4'], correctAnswer: 0 })] } },
      { reto: { factories: [() => ({ question: 'b', options: ['5','6','7','8'], correctAnswer: 0 })] } },
    ],
  }
  it('agrega fábricas de todos los niveles y devuelve pick preguntas válidas', () => {
    const qs = buildBossPool(world, 2)
    expect(qs).toHaveLength(2)
    for (const q of qs) {
      expect(q.options).toHaveLength(4)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.correctAnswer).toBeLessThan(4)
    }
  })
  it('si pick excede el pool, devuelve todas las disponibles', () => {
    expect(buildBossPool(world, 10)).toHaveLength(2)
  })
})
