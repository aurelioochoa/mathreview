import { describe, it, expect } from 'vitest'
import * as balanza from '../logic/balanza'
import * as red from '../logic/reduccion'
import * as prob from '../logic/probabilidad'
import * as sol from '../logic/solidos'
import * as simp from '../logic/simplificador'

// Generador determinista para que las tiradas sean reproducibles.
function mulberry(seed) {
  let a = seed
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('balanza de ecuaciones', () => {
  it('las ecuaciones aleatorias se pueden dibujar y tienen solución entera positiva', () => {
    const rng = mulberry(7)
    for (let i = 0; i < 300; i++) {
      const e = balanza.randomEquation(rng)
      for (const k of ['a', 'b', 'c', 'd']) expect(e[k]).toBeGreaterThanOrEqual(0)
      expect(e.a).toBeGreaterThan(e.c)
      const x = balanza.solution(e)
      expect(Number.isInteger(x)).toBe(true)
      expect(x).toBeGreaterThan(0)
    }
  })

  it('solo con la solución se equilibra la balanza', () => {
    const e = { a: 3, b: 2, c: 1, d: 10 } // x = 4
    expect(balanza.tilt(e, 4)).toBe(0)
    expect(balanza.tilt(e, 1)).toBeLessThan(0) // pesa más la derecha
    expect(balanza.tilt(e, 7)).toBeGreaterThan(0)
  })

  // La idea que enseña el widget: hacer lo mismo a los dos lados no cambia
  // la solución. Se resuelve a ciegas aplicando lo que se pueda.
  it('cualquier secuencia de operaciones conserva la solución y termina en x = k', () => {
    const rng = mulberry(3)
    for (let n = 0; n < 200; n++) {
      let e = balanza.randomEquation(rng)
      const x = balanza.solution(e)
      for (let paso = 0; paso < 50 && !balanza.isSolved(e); paso++) {
        const ops = balanza.available(e)
        const pref = ['menosX', 'menosTodas', 'dividir'].find(o => ops.includes(o)) ?? ops[0]
        e = balanza.apply(e, pref).eq
        expect(balanza.solution(e)).toBe(x)
      }
      expect(balanza.isSolved(e)).toBe(true)
      expect(e.d).toBe(x)
    }
  })

  it('no deja hacer operaciones imposibles', () => {
    expect(balanza.apply({ a: 2, b: 0, c: 0, d: 8 }, 'menos1')).toBeNull()
    expect(balanza.apply({ a: 2, b: 1, c: 0, d: 9 }, 'menosX')).toBeNull()
  })

  it('toTex escribe la ecuación como se lee', () => {
    expect(balanza.toTex({ a: 3, b: 2, c: 1, d: 10 })).toBe('3x + 2 = x + 10')
    expect(balanza.toTex({ a: 1, b: 0, c: 0, d: 4 })).toBe('x = 4')
  })
})

describe('reducción', () => {
  it('los sistemas de ejemplo tienen solución entera', () => {
    for (const { e1, e2 } of red.PRESETS) {
      const s = red.solve(e1, e2)
      expect(Number.isInteger(s.x) && Number.isInteger(s.y)).toBe(true)
      expect(e1.a * s.x + e1.b * s.y).toBe(e1.c)
      expect(e2.a * s.x + e2.b * s.y).toBe(e2.c)
    }
  })

  it('los multiplicadores sugeridos eliminan de verdad la incógnita pedida', () => {
    for (const { e1, e2 } of red.PRESETS) {
      for (const v of ['x', 'y']) {
        const { k1, k2 } = red.suggest(e1, e2, v)
        expect(red.eliminated(e1, e2, k1, k2)).toBe(v)
      }
    }
  })

  it('con multiplicadores cualesquiera no desaparece nada', () => {
    const { e1, e2 } = red.PRESETS[0]
    expect(red.eliminated(e1, e2, 1, 2)).toBeNull()
  })

  it('eqTex pone bien los signos', () => {
    expect(red.eqTex({ a: 4, b: -3, c: 6 })).toBe('4x - 3y = 6')
    expect(red.eqTex({ a: -1, b: 1, c: 0 })).toBe('- x + y = 0')
  })
})

describe('simulador de probabilidad', () => {
  it('las probabilidades de cada experimento suman 1', () => {
    for (const exp of Object.values(prob.EXPERIMENTOS)) {
      expect(exp.resultados.reduce((s, r) => s + r.p, 0)).toBeCloseTo(1)
      for (const ev of exp.eventos) {
        const [n, d] = ev.frac.split('/').map(Number)
        expect(prob.eventP(exp, ev.ids)).toBeCloseTo(n / d)
      }
    }
  })

  it('con muchas tiradas la frecuencia se acerca a la probabilidad', () => {
    const exp = prob.EXPERIMENTOS.dado
    const ev = exp.eventos.find(e => e.id === 'par')
    const run = prob.simulate(exp, prob.emptyRun(exp), 20000, ev.ids, mulberry(11))
    expect(run.total).toBe(20000)
    expect(Object.values(run.counts).reduce((a, b) => a + b, 0)).toBe(20000)
    expect(run.hits / run.total).toBeCloseTo(0.5, 1)
  })

  it('la historia no crece sin límite y acaba en la frecuencia actual', () => {
    const exp = prob.EXPERIMENTOS.moneda
    const run = prob.simulate(exp, prob.emptyRun(exp), 5000, ['cara'], mulberry(5), 300)
    expect(run.history.length).toBeLessThanOrEqual(300)
    expect(run.history.at(-1)).toEqual([5000, run.hits / 5000])
    expect(run.last).toHaveLength(12)
  })
})

describe('sólidos 3D', () => {
  it('medidas del prisma rectangular y del cilindro', () => {
    const r = sol.medidas('rect', { l: 4, w: 2 }, 3)
    expect(r).toMatchObject({ perimetro: 12, areaBase: 8, lateral: 36, total: 52, volumen: 24 })
    const c = sol.medidas('cyl', { r: 1 }, 2)
    expect(c.areaBase).toBeCloseTo(Math.PI)
    expect(c.lateral).toBeCloseTo(4 * Math.PI)
    expect(c.volumen).toBeCloseTo(2 * Math.PI)
  })

  // Plegada, la cadena de caras laterales tiene que cerrar la base; desplegada,
  // ser una recta tan larga como el perímetro. Si no, la red 3D se abriría rota.
  it('la cadena plegada cierra el polígono y desplegada mide el perímetro', () => {
    for (const [kind, dims] of [['rect', { l: 4, w: 2.5 }], ['tri', { a: 3 }], ['hex', { a: 2 }], ['cyl', { r: 1.5 }]]) {
      const { lados } = sol.base(kind, dims)
      const cerrada = sol.cadena(lados, 0)
      expect(cerrada.at(-1)[0]).toBeCloseTo(cerrada[0][0], 6)
      expect(cerrada.at(-1)[1]).toBeCloseTo(cerrada[0][1], 6)
      const abierta = sol.cadena(lados, 1)
      const P = lados.reduce((s, x) => s + x, 0)
      expect(abierta.at(-1)[0] - abierta[0][0]).toBeCloseTo(P, 6)
      expect(abierta.every(p => Math.abs(p[1]) < 1e-9)).toBe(true)
    }
  })

  it('la tapa queda hacia dentro (profundidad positiva)', () => {
    const t = sol.tapa(sol.base('tri', { a: 2 }).lados)
    expect(t).toHaveLength(3)
    expect(Math.max(...t.map(p => p[1]))).toBeCloseTo(Math.sqrt(3))
  })
})

describe('simplificador de fracciones algebraicas', () => {
  it('los factores reproducen la fracción original (probado en varios x)', () => {
    const polys = {
      'x^2 - 4': x => x * x - 4, 'x^2 - 4x + 4': x => x * x - 4 * x + 4,
      'x^2 + 5x + 6': x => x * x + 5 * x + 6, 'x^2 - 9': x => x * x - 9,
      '2x^2 + 4x': x => 2 * x * x + 4 * x, '4x': x => 4 * x,
      'x^2 - 1': x => x * x - 1, 'x^2 + 2x + 1': x => x * x + 2 * x + 1,
      '3x - 9': x => 3 * x - 9, 'x^2 - 6x + 9': x => x * x - 6 * x + 9,
    }
    for (const f of simp.FRACCIONES) {
      for (const x of [-4, -1, 0.5, 5, 7]) {
        expect(simp.evalFactors(f.numF, x)).toBeCloseTo(polys[f.num](x))
        expect(simp.evalFactors(f.denF, x)).toBeCloseTo(polys[f.den](x))
      }
    }
  })

  it('cuenta las parejas que quedan por tachar', () => {
    const f = simp.FRACCIONES[0] // (x-2)(x+2) / (x-2)(x-2)
    expect(simp.pendingPairs(f, new Set(), new Set())).toBe(1)
    expect(simp.pendingPairs(f, new Set([0]), new Set([1]))).toBe(0)
  })

  it('el valor prohibido es el que anula el denominador original', () => {
    expect(simp.restricted(simp.FRACCIONES[0])).toEqual([2])
    expect(simp.restricted(simp.FRACCIONES[1])).toEqual([-3, 3])
    expect(simp.evalOriginal(simp.FRACCIONES[0], 2)).toBeNull()
  })
})
