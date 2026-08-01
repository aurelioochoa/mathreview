import { defaultState } from './gameStore'

export const SAVE_KEY = 'mathquest-save-v1'
export const BACKUP_KEY = 'mathquest-save-v1-backup'
// Instantánea tomada justo antes de aplicar un código importado. Clave aparte
// de BACKUP_KEY a propósito: BACKUP_KEY la pisa persistSave() en cada cambio
// de estado (incluido el que dispara el propio import al desbloquear logros
// retroactivos), así que no sirve para deshacer un import. Esta sí sobrevive,
// porque persistSave() no la toca nunca.
export const PRE_IMPORT_KEY = 'mathquest-save-v1-pre-import'

// Lleva cualquier save reconocido (v1 o v2) al estado v2 completo, rellenando
// defaults. Devuelve null si no es un objeto reconocible.
export function migrate(data) {
  if (!data || typeof data !== 'object') return null
  const base = defaultState()
  // v2 y v3 comparten forma: los campos que faltan se rellenan con los defaults,
  // así que subir de versión no necesita un paso propio por cada una.
  if (data.version === 2 || data.version === 3) {
    return {
      ...base,
      ...data,
      cosmetics: { ...base.cosmetics, ...(data.cosmetics ?? {}) },
      streak: { ...base.streak, ...(data.streak ?? {}) },
      version: 3,
    }
  }
  if (data.version === 1) {
    return {
      ...base,
      xp: data.xp ?? 0,
      coins: data.coins ?? 0,
      stars: data.stars ?? {},
      completedLevels: data.completedLevels ?? [],
      version: 3,
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

// Guarda la partida actual como instantánea de "antes de importar". Se llama
// justo antes de despachar IMPORT_SAVE, para poder deshacer si el código
// pegado no era el que el jugador creía.
//
// Si YA hay una instantánea, no se pisa: la primera es la que guarda la
// partida propia del jugador. El caso real es el niño que pega un código, ve
// que no es el suyo y, en vez de deshacer, prueba con otro código: si la
// segunda importación pisara la instantánea, "Deshacer" devolvería la partida
// equivocada de la primera importación y la suya se habría perdido para
// siempre.
export function savePreImportSnapshot(data) {
  if (loadPreImportSnapshot() !== null) return
  try {
    localStorage.setItem(PRE_IMPORT_KEY, JSON.stringify(data))
  } catch {
    // Igual que persistSave: sin instantánea no hay deshacer, pero el juego
    // sigue funcionando con lo que haya en memoria.
  }
}

// Lee la instantánea previa a importar, ya migrada a la forma actual. null si
// no hay ninguna (no se ha importado nada, o ya se deshizo).
export function loadPreImportSnapshot() {
  return tryParse(localStorage.getItem(PRE_IMPORT_KEY))
}

// Borra la instantánea tras usarla (o si el jugador decide que ya no la
// necesita). Sin esto, "Deshacer" seguiría ofreciéndose para siempre.
export function clearPreImportSnapshot() {
  try {
    localStorage.removeItem(PRE_IMPORT_KEY)
  } catch {
    // ver savePreImportSnapshot
  }
}
