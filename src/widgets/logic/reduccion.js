// Método de reducción: multiplicar cada ecuación por un número y sumarlas
// para que una incógnita desaparezca. Ecuaciones como { a, b, c } = ax + by = c.

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)

export const PRESETS = [
  { e1: { a: 2, b: 3, c: 12 }, e2: { a: 4, b: -3, c: 6 } },   // x=3, y=2
  { e1: { a: 3, b: 2, c: 16 }, e2: { a: 2, b: -1, c: 6 } },   // x=4, y=2
  { e1: { a: 5, b: 2, c: 1 }, e2: { a: 3, b: 4, c: -5 } },    // x=1, y=-2
  { e1: { a: 2, b: 5, c: 1 }, e2: { a: 3, b: 2, c: -4 } },    // x=-2, y=1
]

export function scale(e, k) {
  return { a: e.a * k, b: e.b * k, c: e.c * k }
}

export function add(e1, e2) {
  return { a: e1.a + e2.a, b: e1.b + e2.b, c: e1.c + e2.c }
}

// Qué incógnita desaparece al sumar k1·E1 + k2·E2 (o null).
export function eliminated(e1, e2, k1, k2) {
  const s = add(scale(e1, k1), scale(e2, k2))
  if (s.a === 0 && s.b !== 0) return 'x'
  if (s.b === 0 && s.a !== 0) return 'y'
  return null
}

// Multiplicadores mínimos para eliminar `v` ('x' o 'y').
export function suggest(e1, e2, v = 'y') {
  const p = v === 'x' ? e1.a : e1.b
  const q = v === 'x' ? e2.a : e2.b
  const m = lcm(p, q)
  let k1 = m / p, k2 = -(m / q)
  if (k1 < 0) { k1 = -k1; k2 = -k2 }
  return { k1, k2 }
}

// Solución del sistema (null si no es única).
export function solve(e1, e2) {
  const det = e1.a * e2.b - e2.a * e1.b
  if (det === 0) return null
  return {
    x: (e1.c * e2.b - e2.c * e1.b) / det,
    y: (e1.a * e2.c - e2.a * e1.c) / det,
  }
}

// "3x − 2y = 5" con signos bonitos.
export function eqTex(e) {
  const term = (k, v, first) => {
    if (k === 0) return ''
    const sign = k < 0 ? '-' : first ? '' : '+'
    const abs = Math.abs(k)
    return `${sign} ${abs === 1 ? '' : abs}${v}`
  }
  const left = [term(e.a, 'x', true), term(e.b, 'y', e.a === 0)].filter(Boolean).join(' ').trim() || '0'
  return `${left} = ${e.c}`
}
