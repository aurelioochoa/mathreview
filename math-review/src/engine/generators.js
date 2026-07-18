// Una "fábrica de pregunta" es () => ({question, options[4], correctAnswer, hint, reminder}).
// Las preguntas parametrizadas son fábricas que generan valores nuevos en cada llamada;
// las fijas se envuelven con staticQuestion. Así rejugar un nivel = práctica real.

export function staticQuestion(q) {
  return () => q
}

export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

export function buildReto(factories, pick, rng = Math.random) {
  const pool = [...factories]
  // Fisher-Yates parcial
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(pick, pool.length)).map(f => f())
}
