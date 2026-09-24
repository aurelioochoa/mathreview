import { useSyncExternalStore } from 'react'
import { ISLANDS, dockPoint, sanitizeBoat, spawnNear } from './explorerLogic'

// Estado compartido entre la escena 3D (que corre a 60 fps dentro de useFrame)
// y los paneles DOM que la rodean (minimapa, panel de isla, joystick).
//
// Hay dos mitades a propósito:
//  - `live`: lo que cambia cada fotograma (posición del barco, teclas, stick).
//    Es mutable y NO avisa a React: repintar el árbol 60 veces por segundo por
//    mover un barco sería tirar el rendimiento.
//  - `snap`: lo que la interfaz necesita ver (isla cercana, barco para el
//    minimapa a ~10 Hz, vista general). Inmutable y con suscripción.

const STORAGE_KEY = 'mq-barco'
const BOTTLES_KEY = 'mq-botellas'

function leerGuardado() {
  try { return sanitizeBoat(JSON.parse(sessionStorage.getItem(STORAGE_KEY))) } catch { return null }
}

export const live = {
  boat: { x: 0, z: 0, heading: 0, speed: 0 },
  keys: new Set(),
  stick: { x: 0, y: 0 },
  target: null,       // { x, z, nodeId } del piloto automático
  cameraYaw: 0,
}

// Botellas encontradas: preferencia del aparato, como el tema, fuera de la
// partida (no dan nada que traspasar).
function leerBotellas() {
  try {
    const v = JSON.parse(localStorage.getItem(BOTTLES_KEY))
    return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []
  } catch { return [] }
}

let snap = { nearby: null, boat: { x: 0, z: 0, heading: 0 }, overview: false, sailingTo: null, found: leerBotellas(), bottle: null }
const listeners = new Set()

function emit() { listeners.forEach(l => l()) }
function subscribe(l) { listeners.add(l); return () => listeners.delete(l) }

export function setSnap(patch) {
  let changed = false
  for (const k in patch) if (snap[k] !== patch[k]) { changed = true; break }
  if (!changed) return
  snap = { ...snap, ...patch }
  emit()
}

export function getSnap() { return snap }

export function useExplorer(selector) {
  return useSyncExternalStore(subscribe, () => selector(snap), () => selector(snap))
}

// Coloca el barco al montar el mapa: donde lo dejaste en esta pestaña, o
// junto al mundo que toca jugar.
export function initBoat(fallbackIslandId) {
  const b = leerGuardado() ?? spawnNear(fallbackIslandId)
  live.boat = { ...b, speed: 0 }
  live.target = null
  live.keys.clear()
  live.stick = { x: 0, y: 0 }
  snap = { ...snap, boat: { x: b.x, z: b.z, heading: b.heading }, sailingTo: null, overview: false }
  emit()
}

export function saveBoat() {
  try {
    const { x, z, heading } = live.boat
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ x, z, heading }))
  } catch { /* modo privado: no pasa nada, se reaparece junto al mundo */ }
}

// Piloto automático hacia una isla (clic en la isla o en el minimapa).
export function sailToIsland(id) {
  const is = ISLANDS.find(i => i.id === id)
  if (!is) return
  const p = dockPoint(live.boat, is)
  live.target = { x: p.x, z: p.z, nodeId: id }
  setSnap({ sailingTo: id, overview: false })
}

// Piloto automático a un punto del mar (clic en el agua).
export function sailToPoint(x, z) {
  live.target = { x, z, nodeId: null }
  setSnap({ sailingTo: null })
}

export function cancelAutopilot() {
  if (!live.target) return
  live.target = null
  setSnap({ sailingTo: null })
}

export function toggleOverview() { setSnap({ overview: !snap.overview }) }

// Recoge una botella: la marca como encontrada y abre su mensaje.
export function pickBottle(id) {
  if (snap.found.includes(id)) return
  const found = [...snap.found, id]
  try { localStorage.setItem(BOTTLES_KEY, JSON.stringify(found)) } catch { /* sin almacenamiento */ }
  setSnap({ found, bottle: id })
}

export function closeBottle() { setSnap({ bottle: null }) }
