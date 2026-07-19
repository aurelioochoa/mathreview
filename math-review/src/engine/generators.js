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
