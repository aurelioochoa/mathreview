// Experimentos del simulador de probabilidad. Cada uno: resultados posibles con
// su probabilidad teórica, y eventos (subconjuntos de resultados) para comparar
// la frecuencia relativa con P(evento). Puro y con rng inyectable.

export const EXPERIMENTOS = {
  moneda: {
    nombre: 'Moneda', icono: '🪙',
    resultados: [
      { id: 'cara', label: 'Cara', icon: '🙂', p: 1 / 2 },
      { id: 'cruz', label: 'Cruz', icon: '❌', p: 1 / 2 },
    ],
    eventos: [
      { id: 'cara', label: 'Sale cara', ids: ['cara'], frac: '1/2' },
    ],
  },
  dado: {
    nombre: 'Dado', icono: '🎲',
    resultados: [1, 2, 3, 4, 5, 6].map(n => ({ id: String(n), label: String(n), icon: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][n - 1], p: 1 / 6 })),
    eventos: [
      { id: 'seis', label: 'Sacar un 6', ids: ['6'], frac: '1/6' },
      { id: 'par', label: 'Sacar par', ids: ['2', '4', '6'], frac: '3/6' },
      { id: 'mayor4', label: 'Sacar más de 4', ids: ['5', '6'], frac: '2/6' },
    ],
  },
  cofre: {
    nombre: 'Cofre gacha', icono: '🎁',
    resultados: [
      { id: 'comun', label: 'Común', icon: '⚪', p: 0.6 },
      { id: 'raro', label: 'Raro', icon: '🔵', p: 0.3 },
      { id: 'epico', label: 'Épico', icon: '🟣', p: 0.09 },
      { id: 'legendario', label: 'Legendario', icon: '🟡', p: 0.01 },
    ],
    eventos: [
      { id: 'legendario', label: 'Legendario', ids: ['legendario'], frac: '1/100' },
      { id: 'noComun', label: 'Mejor que común', ids: ['raro', 'epico', 'legendario'], frac: '40/100' },
    ],
  },
}

export function draw(exp, rng = Math.random) {
  const u = rng()
  let acc = 0
  for (const r of exp.resultados) {
    acc += r.p
    if (u < acc) return r.id
  }
  return exp.resultados[exp.resultados.length - 1].id
}

export function emptyCounts(exp) {
  return Object.fromEntries(exp.resultados.map(r => [r.id, 0]))
}

// Lanza n veces y devuelve { counts, last, history } actualizados.
// `history` guarda la frecuencia del evento tras cada tirada (muestreada para
// no crecer sin límite: como mucho `maxPoints` puntos).
export function simulate(exp, prev, n, eventIds, rng = Math.random, maxPoints = 300) {
  const counts = { ...prev.counts }
  let total = prev.total
  let hits = prev.hits
  const history = [...prev.history]
  const last = [...prev.last]
  for (let i = 0; i < n; i++) {
    const id = draw(exp, rng)
    counts[id]++
    total++
    if (eventIds.includes(id)) hits++
    last.push(id)
    history.push([total, hits / total])
  }
  // Muestreo: quedarse con puntos repartidos si hay demasiados.
  let h = history
  if (h.length > maxPoints) {
    const step = h.length / maxPoints
    const out = []
    for (let i = 0; i < maxPoints - 1; i++) out.push(h[Math.floor(i * step)])
    out.push(h[h.length - 1])
    h = out
  }
  return { counts, total, hits, history: h, last: last.slice(-12) }
}

export function emptyRun(exp) {
  return { counts: emptyCounts(exp), total: 0, hits: 0, history: [], last: [] }
}

export function eventP(exp, ids) {
  return exp.resultados.filter(r => ids.includes(r.id)).reduce((s, r) => s + r.p, 0)
}
