export const SAVE_KEY = 'mathquest-save-v1'
export const BACKUP_KEY = 'mathquest-save-v1-backup'

function tryParse(raw) {
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && data.version === 1 ? data : null
  } catch {
    return null
  }
}

export function loadSave() {
  const main = tryParse(localStorage.getItem(SAVE_KEY))
  if (main) return main
  return tryParse(localStorage.getItem(BACKUP_KEY))
}

export function persistSave(data) {
  try {
    const current = localStorage.getItem(SAVE_KEY)
    if (current !== null) localStorage.setItem(BACKUP_KEY, current)
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // localStorage lleno (QuotaExceededError) o no disponible (modo privado):
    // no bloquear el juego; la partida sigue viva en memoria. Sin console.warn
    // porque esto corre en cada cambio de estado y haría spam.
  }
}
