import { defaultState } from './gameStore'

export const SAVE_KEY = 'mathquest-save-v1'
export const BACKUP_KEY = 'mathquest-save-v1-backup'

// Lleva cualquier save reconocido (v1 o v2) al estado v2 completo, rellenando
// defaults. Devuelve null si no es un objeto reconocible.
function migrate(data) {
  if (!data || typeof data !== 'object') return null
  const base = defaultState()
  if (data.version === 2) {
    return {
      ...base,
      ...data,
      cosmetics: { ...base.cosmetics, ...(data.cosmetics ?? {}) },
      streak: { ...base.streak, ...(data.streak ?? {}) },
      version: 2,
    }
  }
  if (data.version === 1) {
    return {
      ...base,
      xp: data.xp ?? 0,
      coins: data.coins ?? 0,
      stars: data.stars ?? {},
      completedLevels: data.completedLevels ?? [],
      version: 2,
    }
  }
  return null
}

function tryParse(raw) {
  if (!raw) return null
  try {
    return migrate(JSON.parse(raw))
  } catch {
    return null
  }
}

export function loadSave() {
  return tryParse(localStorage.getItem(SAVE_KEY)) ?? tryParse(localStorage.getItem(BACKUP_KEY))
}

export function persistSave(data) {
  try {
    const current = localStorage.getItem(SAVE_KEY)
    if (current !== null) localStorage.setItem(BACKUP_KEY, current)
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // localStorage lleno (QuotaExceededError) o no disponible (modo privado):
    // la partida sigue viva en memoria.
  }
}
