// Lógica de la balanza de ecuaciones: a·x + b = c·x + d, siempre con pesos
// positivos para que se pueda dibujar (cajas "x" y pesas de 1) y con solución
// entera positiva. Pura, para testearla sin montar el widget.

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function randomEquation(rng = Math.random) {
  const r = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1))
  const x = r(1, 6)
  const c = r(0, 2)
  const a = c + r(1, 3)
  const b = r(0, 6)
  const d = (a - c) * x + b
  return { a, b, c, d }
}

// Qué operaciones se pueden hacer ahora mismo (a los dos lados a la vez).
export function available(eq) {
  const ops = []
  if (eq.b > 0 && eq.d > 0) ops.push('menos1')
  if (Math.min(eq.b, eq.d) >= 1) ops.push('menosTodas')
  if (eq.a > 0 && eq.c > 0) ops.push('menosX')
  const g = gcd(gcd(eq.a, eq.c), gcd(eq.b, eq.d))
  if (g > 1) ops.push('dividir')
  return ops
}

// Aplica una operación a los dos lados. Devuelve la ecuación nueva y la frase
// que la explica, o null si no se puede.
export function apply(eq, op) {
  if (!available(eq).includes(op)) return null
  switch (op) {
    case 'menos1':
      return { eq: { ...eq, b: eq.b - 1, d: eq.d - 1 }, txt: 'Quitas 1 pesa de cada platillo' }
    case 'menosTodas': {
      const k = Math.min(eq.b, eq.d)
      return { eq: { ...eq, b: eq.b - k, d: eq.d - k }, txt: `Quitas ${k} ${k === 1 ? 'pesa' : 'pesas'} de cada platillo` }
    }
    case 'menosX': {
      const k = Math.min(eq.a, eq.c)
      return { eq: { ...eq, a: eq.a - k, c: eq.c - k }, txt: `Quitas ${k === 1 ? 'una caja x' : `${k} cajas x`} de cada platillo` }
    }
    case 'dividir': {
      const g = gcd(gcd(eq.a, eq.c), gcd(eq.b, eq.d))
      return { eq: { a: eq.a / g, b: eq.b / g, c: eq.c / g, d: eq.d / g }, txt: `Divides los dos platillos entre ${g}` }
    }
    default:
      return null
  }
}

// La ecuación ya dice "x = número".
export function isSolved(eq) {
  return (eq.a === 1 && eq.b === 0 && eq.c === 0) || (eq.c === 1 && eq.d === 0 && eq.a === 0)
}

export function solution(eq) {
  return (eq.d - eq.b) / (eq.a - eq.c)
}

// Peso de cada platillo si x valiera `g`: lo que inclina la balanza.
export function weights(eq, g) {
  return { left: eq.a * g + eq.b, right: eq.c * g + eq.d }
}

// Inclinación en grados (positivo = baja la izquierda), acotada.
export function tilt(eq, g) {
  const { left, right } = weights(eq, g)
  const diff = left - right
  return Math.max(-14, Math.min(14, diff * 2.5))
}

export function side(coefX, units) {
  const parts = []
  if (coefX) parts.push(coefX === 1 ? 'x' : `${coefX}x`)
  if (units || !coefX) parts.push(String(units))
  return parts.join(' + ')
}

export function toTex(eq) {
  return `${side(eq.a, eq.b)} = ${side(eq.c, eq.d)}`
}
