import { xpForLevel, levelForXp, titleForLevel } from './xpCurve'

// Deriva los datos que muestra el HUD a partir del estado del juego. Puro.
export function hudStats(state) {
  const xp = state?.xp ?? 0
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const span = ceil - floor
  const intoLevel = xp - floor
  const progress = span > 0 ? Math.min(1, Math.max(0, intoLevel / span)) : 1
  return {
    level,
    title: titleForLevel(level),
    xp,
    coins: state?.coins ?? 0,
    intoLevel,
    span,
    progress,
    xpToNext: Math.max(0, ceil - xp),
  }
}
