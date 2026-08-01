import { defaultState } from './gameStore'

export const SAVE_KEY = 'mathquest-save-v1'
export const BACKUP_KEY = 'mathquest-save-v1-backup'
// Instantánea tomada justo antes de aplicar un código importado. Clave aparte
// de BACKUP_KEY a propósito: BACKUP_KEY la pisa persistSave() en cada cambio
// de estado (incluido el que dispara el propio import al desbloquear logros
// retroactivos), así que no sirve para deshacer un import. Esta sí sobrevive,
// porque persistSave() no la toca nunca.
export const PRE_IMPORT_KEY = 'mathquest-save-v1-pre-import'

// Cuánto vale una instantánea de pre-importación. Deshacer está para el
// arrepentimiento inmediato ("esto no es mi partida"), no para viajar en el
// tiempo: en el caso legítimo -- llevarse la partida a una tablet nueva -- un
// aviso eterno acaba siendo una trampa, porque meses después un clic
// devolvería la partida vacía del dispositivo nuevo. Un día cubre de sobra el
// "me di cuenta un rato después" e incluso el "lo vi al día siguiente", que es
// todo lo que hace falta.
export const PRE_IMPORT_TTL_MS = 24 * 60 * 60 * 1000

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
// La instantánea se guarda con la hora a la que se tomó, para poder caducarla
// (ver PRE_IMPORT_TTL_MS): { guardadaEn, save }.
//
// Devuelve si al salir hay una instantánea con la que deshacer: la que se
// acaba de guardar, o la que ya estaba. Si localStorage no deja escribir
// (cuota llena, modo privado) devuelve false, y quien llama tiene que
// enterarse: ofrecer un "Deshacer" que no puede funcionar es peor que no
// ofrecerlo.
export function savePreImportSnapshot(data) {
  if (loadPreImportSnapshot() !== null) return true
  try {
    localStorage.setItem(PRE_IMPORT_KEY, JSON.stringify({ guardadaEn: Date.now(), save: data }))
    return true
  } catch {
    // Igual que persistSave: sin instantánea no hay deshacer, pero el juego
    // sigue funcionando con lo que haya en memoria.
    return false
  }
}

// Lee la instantánea previa a importar, ya migrada a la forma actual. null si
// no hay ninguna: no se ha importado nada, ya se deshizo, o caducó.
//
// Una instantánea que ya no vale se borra aquí mismo, en la lectura: así el
// aviso de "puedes deshacer" desaparece solo del perfil, sin depender de que
// alguien se acuerde de barrer. Lo mismo con una instantánea ilegible o sin
// marca de tiempo (formato viejo o tocada a mano): sin saber cuándo se tomó no
// se puede saber si sigue vigente, y el lado seguro es tratarla como caducada.
export function loadPreImportSnapshot() {
  const crudo = localStorage.getItem(PRE_IMPORT_KEY)
  if (!crudo) return null

  let sobre = null
  try {
    sobre = JSON.parse(crudo)
  } catch {
    // sobre se queda en null y cae en la limpieza de abajo
  }
  const vigente = !!sobre && typeof sobre.guardadaEn === 'number' &&
    Date.now() - sobre.guardadaEn <= PRE_IMPORT_TTL_MS
  const save = vigente ? migrate(sobre.save) : null
  if (!save) {
    clearPreImportSnapshot()
    return null
  }
  return save
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
