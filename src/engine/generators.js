// Una "fábrica de pregunta" es () => ({question, options[4], correctAnswer, hint, reminder}).
// Las preguntas parametrizadas son fábricas que generan valores nuevos en cada llamada;
// las fijas se envuelven con staticQuestion. Así rejugar un nivel = práctica real.

export function staticQuestion(q) {
  return () => q
}

export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

// Devuelve una copia de la pregunta con las opciones barajadas y correctAnswer
// recalculado, para que rejugar sea práctica real y la respuesta no sea siempre "A".
export function shuffleOptions(q, rng = Math.random) {
  const order = q.options.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correctAnswer: order.indexOf(q.correctAnswer),
  }
}

export function buildReto(factories, pick, rng = Math.random) {
  const pool = [...factories]
  // Fisher-Yates (baraja completa)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(pick, pool.length)).map(f => shuffleOptions(f(), rng))
}

// Arma { options: [correcto, +3 distractores], correctAnswer: 0 } con 4 opciones
// distintas (dedup por string). Si faltan distractores y el correcto es numérico,
// sintetiza vecinos (correcto ± k). buildReto baraja después → índice 0 seguro.
export function makeOptions(correct, distractors = []) {
  const s = (v) => String(v)
  const seen = new Set([s(correct)])
  const options = [s(correct)]
  const push = (v) => {
    const str = s(v)
    if (!seen.has(str)) { seen.add(str); options.push(str); return true }
    return false
  }
  for (const d of distractors) { if (options.length >= 4) break; push(d) }
  const n = Number(correct)
  for (let k = 1; options.length < 4 && Number.isFinite(n) && k <= 99; k++) {
    push(n + k) || push(n - k)
  }
  // Respaldo no numérico (fábricas bien hechas no deberían llegar aquí):
  for (let k = 1; options.length < 4; k++) push(`${correct} (${k})`)
  return { options, correctAnswer: 0 }
}
