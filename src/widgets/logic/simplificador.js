// Fracciones algebraicas para el simplificador: cada una con sus factores ya
// calculados (tex para pintarlos, fn para evaluarlos y key para saber cuáles
// se pueden cancelar entre sí). Pura.

const F = {
  xm2: { key: 'x-2', tex: '(x-2)', fn: x => x - 2 },
  xp2: { key: 'x+2', tex: '(x+2)', fn: x => x + 2 },
  xm3: { key: 'x-3', tex: '(x-3)', fn: x => x - 3 },
  xp3: { key: 'x+3', tex: '(x+3)', fn: x => x + 3 },
  xm1: { key: 'x-1', tex: '(x-1)', fn: x => x - 1 },
  xp1: { key: 'x+1', tex: '(x+1)', fn: x => x + 1 },
  x: { key: 'x', tex: 'x', fn: x => x },
  dos: { key: '2', tex: '2', fn: () => 2 },
  tres: { key: '3', tex: '3', fn: () => 3 },
}

export const FRACCIONES = [
  { id: 'a', num: 'x^2 - 4', den: 'x^2 - 4x + 4', numF: [F.xm2, F.xp2], denF: [F.xm2, F.xm2] },
  { id: 'b', num: 'x^2 + 5x + 6', den: 'x^2 - 9', numF: [F.xp2, F.xp3], denF: [F.xm3, F.xp3] },
  { id: 'c', num: '2x^2 + 4x', den: '4x', numF: [F.dos, F.x, F.xp2], denF: [F.dos, F.dos, F.x] },
  { id: 'd', num: 'x^2 - 1', den: 'x^2 + 2x + 1', numF: [F.xm1, F.xp1], denF: [F.xp1, F.xp1] },
  { id: 'e', num: '3x - 9', den: 'x^2 - 6x + 9', numF: [F.tres, F.xm3], denF: [F.xm3, F.xm3] },
]

// Producto de los factores que quedan (índices no cancelados).
export function evalFactors(factors, x, cancelled = new Set()) {
  return factors.reduce((p, f, i) => (cancelled.has(i) ? p : p * f.fn(x)), 1)
}

// Valor de la fracción original en x; null si el denominador se anula.
export function evalOriginal(frac, x) {
  const d = evalFactors(frac.denF, x)
  if (d === 0) return null
  return evalFactors(frac.numF, x) / d
}

// Parejas cancelables: ¿queda algún factor igual arriba y abajo?
export function pendingPairs(frac, cancelNum, cancelDen) {
  const libresDen = frac.denF.map((f, i) => (cancelDen.has(i) ? null : f.key))
  let n = 0
  const usados = new Set()
  frac.numF.forEach((f, i) => {
    if (cancelNum.has(i)) return
    const j = libresDen.findIndex((k, jj) => k === f.key && !usados.has(jj))
    if (j >= 0) { usados.add(j); n++ }
  })
  return n
}

// Valores de x que prohíbe el denominador original (entre -6 y 6, enteros).
export function restricted(frac) {
  const out = []
  for (let x = -6; x <= 6; x++) if (evalFactors(frac.denF, x) === 0) out.push(x)
  return out
}

export function texOf(factors, cancelled) {
  const left = factors.filter((_, i) => !cancelled.has(i)).map(f => f.tex)
  if (left.length === 0) return '1'
  return left.join(' \\cdot ').replace(/(\d) \\cdot (\d)/g, '$1 \\cdot $2')
}
