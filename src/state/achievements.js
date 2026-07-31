import { ACHIEVEMENTS } from '../content/achievements'

// Devuelve los ids de logros que se cumplen ahora y no estaban ya desbloqueados.
// Un check que lance (guardado incompleto, campo ausente) se trata como "no
// cumplido" en vez de tumbar la partida.
export function evaluateAchievements(state, event) {
  const ya = new Set(state.achievements ?? [])
  const nuevos = []
  for (const a of ACHIEVEMENTS) {
    if (ya.has(a.id)) continue
    let ok = false
    try { ok = a.check(state, event) } catch { ok = false }
    if (ok) nuevos.push(a.id)
  }
  return nuevos
}
