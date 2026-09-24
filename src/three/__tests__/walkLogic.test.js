import { describe, it, expect } from 'vitest'
import { worlds, findWorld } from '../../content/worlds'
import { questsForWorld } from '../../content/quests'
import {
  layoutFor, propsFor, obstaclesFor, pathPoints, stepWalker, stepVertical,
  nearestStation, spawnPoint, sanitizeWalker, hashSeed, cameraClear, cameraBlockers,
  WALK_R, PLAYER_R, WALK_SPEED, RUN_SPEED, NEAR,
} from '../walk/walkLogic'

const vacio = { completedLevels: [], stars: {}, bossDefeats: [], questsCompleted: [] }

describe('exploración a pie: distribución de la isla', () => {
  it('cada mundo tiene sus niveles, el jefe, sus sidequests y el embarcadero', () => {
    for (const w of worlds) {
      const st = layoutFor(w, questsForWorld(w.id), vacio)
      expect(st.filter(s => s.kind === 'level')).toHaveLength(w.levels.length)
      expect(st.filter(s => s.kind === 'boss')).toHaveLength(1)
      expect(st.filter(s => s.kind === 'dock')).toHaveLength(1)
      expect(st.filter(s => s.kind === 'quest').length).toBe(Math.min(4, questsForWorld(w.id).length))
    }
  })

  it('las estaciones no se solapan y caben en la isla', () => {
    for (const w of worlds) {
      const st = layoutFor(w, questsForWorld(w.id), vacio)
      for (const a of st) {
        expect(Math.hypot(a.x, a.z)).toBeLessThanOrEqual(WALK_R)
        for (const b of st) {
          if (a !== b) expect(Math.hypot(a.x - b.x, a.z - b.z), `${w.id}: ${a.id} ↔ ${b.id}`).toBeGreaterThan(2.5)
        }
      }
    }
  })

  it('sin progreso solo el nivel 1 está abierto y el jefe cerrado; los enlaces son los de siempre', () => {
    const w = findWorld('castillo-algebra')
    const st = layoutFor(w, [], vacio)
    const niveles = st.filter(s => s.kind === 'level')
    expect(niveles.map(s => s.unlocked)).toEqual([true, false, false, false, false])
    expect(niveles[0].to).toBe('/mundo/castillo-algebra/nivel/mcd')
    const jefe = st.find(s => s.kind === 'boss')
    expect(jefe.unlocked).toBe(false)
    expect(jefe.to).toBe('/mundo/castillo-algebra/jefe')
    expect(st.find(s => s.kind === 'dock').to).toBe('/')
  })

  it('completar niveles abre el siguiente y, con todos, la puerta del jefe', () => {
    const w = findWorld('estacion-funciones')
    const keys = w.levels.map(l => `${w.id}/${l.id}`)
    const st = layoutFor(w, [], { ...vacio, completedLevels: keys, stars: { [keys[0]]: 3 } })
    expect(st.filter(s => s.kind === 'level').every(s => s.unlocked && s.done)).toBe(true)
    expect(st.find(s => s.kind === 'level').stars).toBe(3)
    expect(st.find(s => s.kind === 'boss').unlocked).toBe(true)
  })

  it('el camino va del embarcadero a los niveles en orden y acaba en el jefe', () => {
    const st = layoutFor(findWorld('isla-numerica'), [], vacio)
    const p = pathPoints(st)
    expect(p[0]).toEqual({ x: st.find(s => s.kind === 'dock').x, z: st.find(s => s.kind === 'dock').z })
    expect(p.at(-1)).toEqual({ x: st.find(s => s.kind === 'boss').x, z: st.find(s => s.kind === 'boss').z })
    expect(p).toHaveLength(st.filter(s => s.kind === 'level').length + 2)
  })

  it('la vegetación es determinista y no tapa estaciones ni se sale de la isla', () => {
    const w = findWorld('montanas-geometria')
    const st = layoutFor(w, questsForWorld(w.id), vacio)
    const a = propsFor(hashSeed(w.slug), st)
    const b = propsFor(hashSeed(w.slug), st)
    expect(a).toEqual(b)
    expect(a.length).toBeGreaterThan(20)
    for (const p of a) {
      expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(WALK_R)
      for (const s of st) expect(Math.hypot(p.x - s.x, p.z - s.z)).toBeGreaterThanOrEqual(2.6)
    }
  })
})

describe('exploración a pie: movimiento', () => {
  const w = findWorld('isla-numerica')
  const st = layoutFor(w, questsForWorld(w.id), vacio)
  const obs = obstaclesFor(st, [])

  it('caminar llega a la velocidad de paso; correr, a la de carrera', () => {
    let p = { x: 0, z: 14, heading: Math.PI, speed: 0 }
    for (let i = 0; i < 60; i++) p = stepWalker(p, { x: 1, z: 0 }, 1 / 60, [])
    expect(p.speed).toBeCloseTo(WALK_SPEED)
    for (let i = 0; i < 60; i++) p = stepWalker(p, { x: 1, z: 0 }, 1 / 60, [], true)
    expect(p.speed).toBeCloseTo(RUN_SPEED)
  })

  it('no atraviesa el monumento ni sale de la isla', () => {
    let p = { x: 0, z: 8, heading: Math.PI, speed: 0 }
    for (let i = 0; i < 300; i++) p = stepWalker(p, { x: 0, z: -1 }, 1 / 60, obs)
    expect(Math.hypot(p.x, p.z)).toBeGreaterThanOrEqual(3.3 + PLAYER_R - 1e-6)
    let q = { x: 0, z: 10, heading: 0, speed: 0 }
    for (let i = 0; i < 600; i++) q = stepWalker(q, { x: 0, z: 1 }, 1 / 60, obs)
    expect(Math.hypot(q.x, q.z)).toBeLessThanOrEqual(WALK_R + 1e-6)
  })

  it('el salto sube y vuelve al suelo; en el aire no se vuelve a saltar', () => {
    let v = stepVertical(0, 0, 0, true, 1 / 60)
    expect(v.vy).toBeGreaterThan(0)
    let alto = 0
    for (let i = 0; i < 120; i++) {
      v = stepVertical(v.y, v.vy, 0, true, 1 / 60)
      alto = Math.max(alto, v.y)
      if (v.onGround) break
    }
    expect(alto).toBeGreaterThan(0.8)
    expect(v.y).toBe(0)
  })

  it('al llegar a una estación, la estación "habla"', () => {
    const s = st.find(x => x.kind === 'level')
    expect(nearestStation(s.x + NEAR - 0.2, s.z, st)).toBe(s.id)
    expect(nearestStation(0, 0, st)).toBeNull()
  })

  it('se aparece en el embarcadero, que está cerca', () => {
    const sp = spawnPoint(st)
    expect(nearestStation(sp.x, sp.z, st)).toBe('muelle')
  })

  it('sanitizeWalker descarta basura y devuelve dentro de la isla', () => {
    expect(sanitizeWalker(null)).toBeNull()
    expect(sanitizeWalker({ x: 1, z: 'a', heading: 0 })).toBeNull()
    const s = sanitizeWalker({ x: 100, z: 0, heading: 1 })
    expect(s.x).toBeCloseTo(WALK_R)
  })
})

describe('exploración a pie: cámara', () => {
  it('sin nada en medio, la cámara se queda donde la puso el jugador', () => {
    expect(cameraClear(0, 0, 0, 1, 8, [])).toBe(8)
  })

  it('un árbol entre el personaje y la cámara la acerca por delante del árbol', () => {
    const d = cameraClear(0, 0, 0, 1, 8, [{ x: 0, z: 4, r: 1 }])
    expect(d).toBeLessThan(3)
    expect(d).toBeGreaterThanOrEqual(1.2)
  })

  it('lo que está detrás de la cámara o a un lado no cuenta', () => {
    expect(cameraClear(0, 0, 0, 1, 8, [{ x: 0, z: 12, r: 1 }])).toBe(8)
    expect(cameraClear(0, 0, 0, 1, 8, [{ x: 4, z: 4, r: 1 }])).toBe(8)
  })

  it('las copas de los árboles tapan; los arbustos no', () => {
    const b = cameraBlockers([{ kind: 'pine', x: 1, z: 1, scale: 1 }, { kind: 'bush', x: 2, z: 2, scale: 1 }], [])
    expect(b).toHaveLength(1)
  })

  it('el embarcadero, donde se llega, queda despejado de árboles', () => {
    for (const w of worlds) {
      const st = layoutFor(w, questsForWorld(w.id), vacio)
      const dock = st.find(s => s.kind === 'dock')
      for (const p of propsFor(hashSeed(w.slug), st)) {
        expect(Math.hypot(p.x - dock.x, p.z - dock.z), w.slug).toBeGreaterThanOrEqual(5)
      }
    }
  })
})
