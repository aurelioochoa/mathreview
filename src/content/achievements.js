import { worlds } from './worlds'
import { questsByWorld } from './quests'
import { levelForXp } from '../state/xpCurve'

// Cada logro: { id, name, emoji, description, secret?, check(state, event) }.
// `check` devuelve boolean; los que dependen de un suceso puntual (terminar un
// reto, derrotar un jefe) leen `event`, el resto solo miran el estado.
// evaluateAchievements captura cualquier excepción, así que un check no puede
// romper la partida por un guardado incompleto.

const worldLevelKeys = (w) => w.levels.map(l => `${w.id}/${l.id}`)
const allThreeStars = (state, w) => worldLevelKeys(w).every(k => (state.stars[k] ?? 0) === 3)
const allQuestsDone = (state, w) => (questsByWorld[w.id] ?? []).every(q => state.questsCompleted.includes(`${w.id}/${q.id}`))

export const ACHIEVEMENTS = [
  // Por nivel (dependen del evento)
  { id: 'sin-dano', name: 'Sin daño', emoji: '🛡️', description: 'Completa un reto sin perder vidas.', check: (_s, e) => e?.type === 'LEVEL_DONE' && e.perfectLives },
  { id: 'speedrunner', name: 'Speedrunner', emoji: '⚡', description: 'Completa un reto en menos de 2 minutos.', check: (_s, e) => e?.type === 'LEVEL_DONE' && e.seconds != null && e.seconds < 120 },
  { id: 'perfeccionista', name: 'Perfeccionista', emoji: '💯', description: 'Consigue 3★ en un nivel.', check: (s) => Object.values(s.stars).some(v => v === 3) },
  // Por mundo
  { id: 'cazajefes', name: 'Cazajefes', emoji: '🗡️', description: 'Derrota a tu primer jefe.', check: (s) => s.bossDefeats.length >= 1 },
  { id: 'completionista', name: 'Completionista', emoji: '📋', description: 'Termina todas las sidequests de un mundo.', check: (s) => worlds.some(w => (questsByWorld[w.id]?.length ?? 0) > 0 && allQuestsDone(s, w)) },
  { id: 'new-game-plus', name: 'New Game+', emoji: '🌟', description: 'Consigue 3★ en todos los niveles de un mundo.', check: (s) => worlds.some(w => allThreeStars(s, w)) },
  { id: 'maestro-mundo', name: 'Maestro del Mundo', emoji: '👑', description: 'Domina un mundo: jefe + 3★ + todas sus quests.', check: (s) => worlds.some(w => s.bossDefeats.includes(w.id) && allThreeStars(s, w) && allQuestsDone(s, w)) },
  { id: 'todos-mundos', name: 'Conquistador', emoji: '🗺️', description: 'Derrota a los jefes de todos los mundos.', check: (s) => worlds.every(w => s.bossDefeats.includes(w.id)) },
  // Globales
  { id: 'racha-3', name: 'Racha de 3', emoji: '🔥', description: 'Juega 3 días seguidos.', check: (s) => s.streak.best >= 3 },
  { id: 'racha-7', name: 'Racha de 7', emoji: '🔥', description: 'Juega 7 días seguidos.', check: (s) => s.streak.best >= 7 },
  { id: 'racha-30', name: 'Racha de 30', emoji: '🔥', description: 'Juega 30 días seguidos.', check: (s) => s.streak.best >= 30 },
  { id: 'primera-compra', name: 'Primera compra', emoji: '🛍️', description: 'Consigue tu primer cosmético.', check: (s) => s.cosmetics.owned.length > 1 },
  { id: 'coleccionista', name: 'Coleccionista', emoji: '🎨', description: 'Posee 5 cosméticos.', check: (s) => s.cosmetics.owned.length >= 5 },
  { id: 'nivel-5', name: 'Explorador experto', emoji: '🧭', description: 'Alcanza el nivel 5 de jugador.', check: (s) => levelForXp(s.xp) >= 5 },
  { id: 'nivel-10', name: 'Veterano', emoji: '🎖️', description: 'Alcanza el nivel 10 de jugador.', check: (s) => levelForXp(s.xp) >= 10 },
  // Secretos
  { id: 'fenix', name: 'Fénix', emoji: '🔥', description: '???', secret: true, check: (_s, e) => e?.type === 'BOSS_DEFEATED' && e.livesLeft === 1 },
  { id: 'ahorrador', name: 'Ahorrador', emoji: '🐷', description: '???', secret: true, check: (s) => s.coins >= 500 },
  { id: 'madrugador', name: 'Búho nocturno', emoji: '🦉', description: '???', secret: true, check: (_s, e) => e?.type === 'STREAK' && e.hour != null && (e.hour < 6 || e.hour >= 23) },
]

export function findAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id) ?? null
}
