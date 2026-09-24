import { useSyncExternalStore } from 'react'
import { sanitizeWalker } from './walkLogic'

// Estado de la exploración a pie, con la misma división que el del barco
// (explorerStore): `live` muta cada fotograma sin avisar a React; `snap` es lo
// que ven los paneles DOM (estación cercana, posición para el minimapa).

export const live = {
  p: { x: 0, z: 0, heading: Math.PI, speed: 0 },
  y: 0,
  vy: 0,
  keys: new Set(),
  stick: { x: 0, y: 0 },
  jumpPad: false,
  cameraYaw: 0,
}

let snap = { nearby: null, pos: { x: 0, z: 0, heading: Math.PI } }
const listeners = new Set()
const emit = () => listeners.forEach(l => l())
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }

export function setWalkSnap(patch) {
  let changed = false
  for (const k in patch) if (snap[k] !== patch[k]) { changed = true; break }
  if (!changed) return
  snap = { ...snap, ...patch }
  emit()
}
export const getWalkSnap = () => snap
export function useWalk(selector) {
  return useSyncExternalStore(subscribe, () => selector(snap), () => selector(snap))
}

const key = (slug) => `mq-pie-${slug}`

// Al entrar: donde lo dejaste en este mundo (volviendo de un nivel) o en el
// embarcadero.
export function initWalker(slug, spawn) {
  let saved = null
  try { saved = sanitizeWalker(JSON.parse(sessionStorage.getItem(key(slug)))) } catch { /* sin almacenamiento */ }
  const p = saved ?? spawn
  live.p = { ...p, speed: 0 }
  live.y = 0; live.vy = 0
  live.keys.clear(); live.stick = { x: 0, y: 0 }; live.jumpPad = false
  snap = { nearby: null, pos: { x: p.x, z: p.z, heading: p.heading } }
  emit()
}

export function saveWalker(slug) {
  try {
    const { x, z, heading } = live.p
    sessionStorage.setItem(key(slug), JSON.stringify({ x, z, heading }))
  } catch { /* modo privado */ }
}
