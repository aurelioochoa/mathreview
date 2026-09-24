// Lógica pura del mapa explorable: el barco que navega entre islas. Sin React
// ni three.js, para poder testearla y para que useFrame solo tenga que llamar
// a funciones deterministas con el dt del fotograma.
import { worldMapNodes, pathOrder, nodeState } from '../content/worldMap'

// Las posiciones de worldMap.js se pensaron para una cámara fija que veía todo
// el mapa a la vez: con las islas tan juntas, las etiquetas de unas tapaban a
// las otras. Para explorar hace falta mar entre isla e isla, así que la escena
// las separa con este factor sin tocar la fuente de verdad.
export const SPREAD = 2

export const ISLAND_RADIUS = 1.75   // colisión del barco con la isla
export const DOCK_RADIUS = 2.45     // donde se para el piloto automático
export const NEAR_RADIUS = 3.3      // a esta distancia la isla "te habla"
export const BOAT_RADIUS = 0.35

export const MAX_SPEED = 4.2
const ACCEL = 7
const DRAG = 3.2
const TURN_RATE = 3.2

// Límites del mar navegable (más allá solo hay niebla).
export const BOUNDS = { minX: -17, maxX: 14, minZ: -11, maxZ: 9.5 }

export function islandsFrom(nodes = worldMapNodes) {
  return nodes.map(n => ({ id: n.id, x: n.position[0] * SPREAD, z: n.position[2] * SPREAD }))
}

export const ISLANDS = islandsFrom()

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// Diferencia angular normalizada a (-π, π].
export function angleDelta(from, to) {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d <= -Math.PI) d += Math.PI * 2
  return d
}

// Convierte la entrada de pantalla (derecha = +x, arriba = +y) en dirección de
// mundo según hacia dónde mira la cámara (yaw = ángulo de la cámara alrededor
// del barco). "Arriba" siempre aleja el barco de la cámara, como en cualquier
// juego en tercera persona.
export function cameraRelative(ix, iy, yaw) {
  // Hacia delante (alejándose de la cámara) es -(sin yaw, cos yaw).
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw)
  const rx = Math.cos(yaw), rz = -Math.sin(yaw)
  const x = fx * iy + rx * ix
  const z = fz * iy + rz * ix
  const len = Math.hypot(x, z)
  return len > 1 ? { x: x / len, z: z / len } : { x, z }
}

// Un paso de simulación. `dir` es la dirección deseada en el mundo (longitud
// 0..1, 0 = soltar el acelerador). Devuelve un barco nuevo.
export function stepBoat(boat, dir, dt, islands = ISLANDS) {
  const want = Math.min(1, Math.hypot(dir.x, dir.z))
  let { heading, speed } = boat
  if (want > 0.05) {
    const targetHeading = Math.atan2(dir.x, dir.z)
    heading += clamp(angleDelta(heading, targetHeading), -TURN_RATE * dt, TURN_RATE * dt)
    speed = Math.min(MAX_SPEED * want, speed + ACCEL * dt)
  } else {
    speed = Math.max(0, speed - DRAG * dt)
  }
  let x = boat.x + Math.sin(heading) * speed * dt
  let z = boat.z + Math.cos(heading) * speed * dt

  // Colisión: si entras en una isla, sales empujado hacia fuera y pierdes algo
  // de velocidad, que es como se siente encallar sin frenar en seco.
  for (const is of islands) {
    const dx = x - is.x, dz = z - is.z
    const d = Math.hypot(dx, dz)
    const min = ISLAND_RADIUS + BOAT_RADIUS
    if (d < min) {
      const k = d > 1e-6 ? min / d : 1
      x = is.x + (d > 1e-6 ? dx * k : min)
      z = is.z + (d > 1e-6 ? dz * k : 0)
      speed *= 0.6
    }
  }
  x = clamp(x, BOUNDS.minX, BOUNDS.maxX)
  z = clamp(z, BOUNDS.minZ, BOUNDS.maxZ)
  return { x, z, heading, speed }
}

// Isla más cercana dentro de `radius`, o null.
export function nearestIsland(x, z, islands = ISLANDS, radius = NEAR_RADIUS) {
  let best = null, bestD = Infinity
  for (const is of islands) {
    const d = Math.hypot(x - is.x, z - is.z)
    if (d < radius && d < bestD) { best = is.id; bestD = d }
  }
  return best
}

// Punto de atraque: la orilla de la isla que queda del lado del barco.
export function dockPoint(from, island, radius = DOCK_RADIUS) {
  let dx = from.x - island.x, dz = from.z - island.z
  const d = Math.hypot(dx, dz)
  if (d < 1e-6) { dx = 0; dz = 1 } else { dx /= d; dz /= d }
  return { x: island.x + dx * radius, z: island.z + dz * radius }
}

// Dirección del piloto automático hacia `target`, frenando al llegar. null
// cuando ya ha llegado (el que llama suelta el piloto).
export function autopilotDir(boat, target, arrive = 0.25) {
  const dx = target.x - boat.x, dz = target.z - boat.z
  const d = Math.hypot(dx, dz)
  if (d < arrive) return null
  const k = Math.min(1, d / 2.2) // frena en los últimos metros
  return { x: (dx / d) * k, z: (dz / d) * k }
}

// El mundo que toca jugar: el primero del camino que está abierto y sin
// completar. Si todo está completo, el último. Es el que lleva el faro.
export function recommendedWorld(gameState, nodes = worldMapNodes) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]))
  for (const id of pathOrder) {
    const n = byId[id]
    if (n && nodeState(n, gameState) === 'available') return id
  }
  return pathOrder[pathOrder.length - 1] ?? null
}

// Dónde aparece el barco: junto a la isla indicada (o la recomendada), por el
// lado que mira al centro del mapa, para que se vean islas por delante.
export function spawnNear(islandId, islands = ISLANDS) {
  const is = islands.find(i => i.id === islandId) ?? islands[0]
  const c = islands.reduce((a, i) => ({ x: a.x + i.x / islands.length, z: a.z + i.z / islands.length }), { x: 0, z: 0 })
  const p = dockPoint({ x: c.x, z: c.z + 0.001 }, is, DOCK_RADIUS + 0.4)
  return { x: p.x, z: p.z, heading: Math.atan2(is.x - p.x, is.z - p.z) + Math.PI, speed: 0 }
}

// Validación de lo guardado en sessionStorage: nada de NaN ni fuera del mar.
export function sanitizeBoat(raw) {
  if (!raw || typeof raw !== 'object') return null
  const { x, z, heading } = raw
  if (![x, z, heading].every(Number.isFinite)) return null
  return {
    x: clamp(x, BOUNDS.minX, BOUNDS.maxX),
    z: clamp(z, BOUNDS.minZ, BOUNDS.maxZ),
    heading,
    speed: 0,
  }
}
