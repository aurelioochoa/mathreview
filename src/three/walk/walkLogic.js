// Lógica pura de la exploración a pie dentro de un mundo: el relieve de la
// isla, dónde va cada cosa (niveles, jefe, sidequests, embarcadero, árboles) y
// cómo se mueve el personaje. Sin React ni three.js: la escena solo pinta.

export const WALK_R = 17.5      // radio caminable
export const SHORE_R = 18.5     // donde la hierba se vuelve playa
export const STATION_R = 9      // anillo de los niveles
export const BOSS_R = 14        // el jefe, al fondo (norte)
export const NEAR = 2.6         // a esta distancia una estación "te habla"
export const PLAYER_R = 0.35
export const WALK_SPEED = 4.6
export const RUN_SPEED = 7.5
const ACCEL = 18
const DRAG = 14
const TURN = 10
const GRAVITY = -22
const JUMP_V = 7.5

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

export function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export function rng(seed) {
  let a = seed | 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Altura del suelo: lomas suaves, una explanada en el centro para el
// monumento del mundo, y la orilla que baja hasta perderse bajo el agua.
export function groundHeight(x, z, seed = 0) {
  const r = Math.hypot(x, z)
  const s = (seed % 1000) / 100
  const lomas = 0.55 * Math.sin(x * 0.23 + s) * Math.cos(z * 0.19 + s * 1.7)
    + 0.3 * Math.sin((x + z) * 0.41 + s * 0.3)
    + 0.15 * Math.cos(x * 0.7 - z * 0.5 + s)
  const explanada = smooth(3.5, 6.5, r)
  const orilla = -3.2 * smooth(SHORE_R - 1, SHORE_R + 3.5, r)
  return (lomas + 0.35) * explanada * (1 - smooth(SHORE_R - 2, SHORE_R, r)) + orilla
}

// Posición polar: φ = 0 es el sur (+z, donde está el embarcadero y la cámara
// al llegar) y crece en sentido antihorario visto desde arriba.
export function polar(r, phi) {
  return { x: Math.sin(phi) * r, z: Math.cos(phi) * r }
}

const QUEST_PHI = [0.62, 1.38, 0.8, 1.2].map(k => k * Math.PI)

// Todo lo que hay en la isla. `world` es el de content/worlds; `quests`, sus
// sidequests; `state`, la partida (para saber qué está abierto).
export function layoutFor(world, quests = [], state = {}) {
  const done = new Set(state.completedLevels ?? [])
  const n = world.levels.length
  const keyOf = (l) => `${world.id}/${l.id}`
  const stations = world.levels.map((l, i) => {
    const phi = Math.PI * (0.3 + 1.4 * (n === 1 ? 0.5 : i / (n - 1)))
    const unlocked = i === 0 || done.has(keyOf(world.levels[i - 1]))
    return {
      id: `nivel-${l.id}`, kind: 'level', index: i, ...polar(STATION_R, phi),
      label: `Nivel ${i + 1}: ${l.title}`, icon: l.icon,
      to: `/mundo/${world.slug}/nivel/${l.id}`,
      unlocked, done: done.has(keyOf(l)), stars: state.stars?.[keyOf(l)] ?? 0,
    }
  })
  const allDone = world.levels.every(l => done.has(keyOf(l)))
  stations.push({
    id: 'jefe', kind: 'boss', ...polar(BOSS_R, Math.PI),
    label: `Jefe: ${world.boss.name}`, icon: world.boss.emoji,
    to: `/mundo/${world.slug}/jefe`, unlocked: allDone,
    done: (state.bossDefeats ?? []).includes(world.id), stars: 0,
  })
  quests.slice(0, QUEST_PHI.length).forEach((q, i) => {
    stations.push({
      id: `quest-${q.id}`, kind: 'quest', ...polar(12.5, QUEST_PHI[i]),
      label: q.title, icon: q.emoji, to: `/mundo/${world.slug}/quest/${q.id}`,
      unlocked: true, done: (state.questsCompleted ?? []).includes(`${world.id}/${q.id}`), stars: 0,
    })
  })
  stations.push({
    id: 'muelle', kind: 'dock', ...polar(16, 0),
    label: 'Embarcadero: volver al mapa', icon: '⛵', to: '/', unlocked: true, done: false, stars: 0,
  })
  return stations
}

// Camino de piedras: embarcadero → niveles en orden → jefe.
export function pathPoints(stations) {
  const dock = stations.find(s => s.kind === 'dock')
  const levels = stations.filter(s => s.kind === 'level')
  const boss = stations.find(s => s.kind === 'boss')
  return [dock, ...levels, boss].filter(Boolean).map(s => ({ x: s.x, z: s.z }))
}

// Obstáculos circulares { x, z, r } de la isla.
export function obstaclesFor(stations, props) {
  const obs = [{ x: 0, z: 0, r: 3.3 }]
  for (const s of stations) {
    if (s.kind === 'dock') continue
    obs.push({ x: s.x, z: s.z, r: s.kind === 'boss' ? 1.6 : s.kind === 'quest' ? 0.5 : 0.95 })
  }
  for (const p of props) if (p.solid) obs.push({ x: p.x, z: p.z, r: p.r })
  return obs
}

// Árboles, arbustos y rocas: por semilla, lejos del monumento, del camino y de
// las estaciones, y sin montarse entre ellos.
export function propsFor(seed, stations, mix = ['pine', 'round', 'bush', 'rock']) {
  const rand = rng(seed)
  const path = pathPoints(stations)
  const densePath = []
  for (let i = 0; i < path.length - 1; i++) {
    for (let t = 0; t <= 1; t += 0.1) densePath.push({ x: path[i].x + (path[i + 1].x - path[i].x) * t, z: path[i].z + (path[i + 1].z - path[i].z) * t })
  }
  const props = []
  for (let tries = 0; tries < 900 && props.length < 70; tries++) {
    const r = 4.6 + rand() * (WALK_R - 4.6)
    const a = rand() * Math.PI * 2
    const x = Math.sin(a) * r, z = Math.cos(a) * r
    if (stations.some(s => Math.hypot(x - s.x, z - s.z) < 2.6)) continue
    if (densePath.some(p => Math.hypot(x - p.x, z - p.z) < 1.4)) continue
    if (props.some(p => Math.hypot(x - p.x, z - p.z) < 1.3)) continue
    const kind = mix[Math.floor(rand() * mix.length)]
    const scale = 0.8 + rand() * 0.8
    props.push({ kind, x, z, scale, seed: rand(), solid: kind !== 'bush', r: kind === 'rock' ? 0.45 * scale : 0.3 })
  }
  return props
}

// Un paso del personaje en el plano. `dir` en coordenadas de mundo (0..1).
export function stepWalker(p, dir, dt, obstacles, run = false) {
  const want = Math.min(1, Math.hypot(dir.x, dir.z))
  let { heading, speed } = p
  const max = (run ? RUN_SPEED : WALK_SPEED) * want
  if (want > 0.05) {
    const target = Math.atan2(dir.x, dir.z)
    let d = (target - heading) % (Math.PI * 2)
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    heading += clamp(d, -TURN * dt, TURN * dt)
    speed = speed < max ? Math.min(max, speed + ACCEL * dt) : Math.max(max, speed - DRAG * dt)
  } else {
    speed = Math.max(0, speed - DRAG * dt)
  }
  // Se avanza hacia donde se pide (no hacia donde mira), que es lo que se siente
  // natural al caminar; la cabeza gira detrás.
  const mx = want > 0.05 ? dir.x / want : Math.sin(heading)
  const mz = want > 0.05 ? dir.z / want : Math.cos(heading)
  let x = p.x + mx * speed * dt
  let z = p.z + mz * speed * dt
  for (const o of obstacles) {
    const dx = x - o.x, dz = z - o.z
    const d = Math.hypot(dx, dz)
    const min = o.r + PLAYER_R
    if (d < min && d > 1e-6) { x = o.x + (dx / d) * min; z = o.z + (dz / d) * min }
  }
  const r = Math.hypot(x, z)
  if (r > WALK_R) { x *= WALK_R / r; z *= WALK_R / r }
  return { ...p, x, z, heading, speed }
}

// Salto y gravedad: y nunca baja del suelo.
export function stepVertical(y, vy, ground, jump, dt) {
  const onGround = y <= ground + 0.01
  if (onGround && jump) vy = JUMP_V
  vy += GRAVITY * dt
  y += vy * dt
  if (y <= ground) { y = ground; vy = 0 }
  return { y, vy, onGround: y <= ground + 0.01 }
}

export function nearestStation(x, z, stations, radius = NEAR) {
  let best = null, bd = Infinity
  for (const s of stations) {
    const d = Math.hypot(x - s.x, z - s.z)
    const lim = s.kind === 'boss' ? radius + 1 : radius
    if (d < lim && d < bd) { best = s.id; bd = d }
  }
  return best
}

export function spawnPoint(stations) {
  const dock = stations.find(s => s.kind === 'dock')
  return { x: dock.x * 0.93, z: dock.z * 0.93, heading: Math.PI, speed: 0 }
}

// Ambientación por mundo: qué crece y de qué color es la hierba.
export const AMBIENTE = {
  mundo1: { mix: ['palm', 'palm', 'bush', 'rock', 'round'], hierba: '#ffffff' },
  mundo2: { mix: ['round', 'round', 'bush', 'bush', 'pine'], hierba: '#fff6d6' },
  mundo3: { mix: ['rock', 'rock', 'pine', 'bush'], hierba: '#d9c9b0' },
  mundo4: { mix: ['pine', 'round', 'bush', 'rock'], hierba: '#ffffff' },
  mundo5: { mix: ['bush', 'bush', 'round', 'rock'], hierba: '#e8f2ff' },
  mundo6: { mix: ['pine', 'rock', 'bush'], hierba: '#eee8ff' },
  mundo7: { mix: ['pine', 'pine', 'rock', 'rock'], hierba: '#f2f2ea' },
  mundo8: { mix: ['round', 'bush', 'bush', 'palm'], hierba: '#fff0f6' },
}

export function sanitizeWalker(raw) {
  if (!raw || typeof raw !== 'object') return null
  const { x, z, heading } = raw
  if (![x, z, heading].every(Number.isFinite)) return null
  const r = Math.hypot(x, z)
  const k = r > WALK_R ? WALK_R / r : 1
  return { x: x * k, z: z * k, heading, speed: 0 }
}
