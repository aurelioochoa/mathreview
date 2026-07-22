import { describe, it, expect } from 'vitest'
import { worlds, findWorld } from '../content/worlds'
import { widgets } from '../widgets'
import { buildReto } from '../engine/generators'
import { gameReducer, initialState } from '../state/gameStore'
import { levelForXp } from '../state/xpCurve'

// Verificación de integración del bucle jugable del Mundo 6: cruza contenido +
// registro de widgets + generación de retos + reducer + predicado de desbloqueo,
// que es lo que ningún test por-módulo cubría de extremo a extremo.
describe('integración: Mundo 6 jugable', () => {
  const world = findWorld('estacion-funciones')

  it('worlds exporta el Mundo 6 y findWorld lo resuelve', () => {
    expect(world).toBeTruthy()
    expect(worlds.map((w) => w.slug)).toContain('estacion-funciones')
    expect(world.id).toBe('mundo6')
  })

  it('tiene 2 niveles bien formados (briefing no vacío, reto con pick 3 y ≥3 fábricas)', () => {
    expect(world.levels).toHaveLength(2)
    for (const lvl of world.levels) {
      expect(lvl.id, 'id de nivel').toBeTruthy()
      expect(lvl.title, 'título de nivel').toBeTruthy()
      expect(Array.isArray(lvl.briefing)).toBe(true)
      expect(lvl.briefing.length).toBeGreaterThan(0)
      expect(lvl.reto.pick).toBe(3)
      expect(lvl.reto.factories.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('todo widgetId del briefing existe en el registro de widgets', () => {
    for (const lvl of world.levels) {
      for (const step of lvl.briefing) {
        if (step.type === 'widget') {
          expect(widgets[step.widgetId], `widget "${step.widgetId}" en nivel "${lvl.id}"`).toBeTruthy()
        }
      }
    }
  })

  it('cada reto genera 3 preguntas válidas (4 opciones, correctAnswer 0..3) en 50 tiradas', () => {
    for (const lvl of world.levels) {
      for (let n = 0; n < 50; n++) {
        const qs = buildReto(lvl.reto.factories, lvl.reto.pick)
        expect(qs).toHaveLength(3)
        for (const q of qs) {
          expect(typeof q.question).toBe('string')
          expect(q.options).toHaveLength(4)
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
          expect(q.correctAnswer).toBeLessThan(4)
        }
      }
    }
  })

  it('completar el nivel 1 desbloquea el nivel 2 (mismo predicado que WorldView)', () => {
    const l0 = world.levels[0]
    let state = initialState
    const keyL0 = `${world.id}/${l0.id}`
    // Nivel 1 arranca desbloqueado; simular su completado como hace LevelPlayer.
    state = gameReducer(state, {
      type: 'LEVEL_COMPLETED',
      levelKey: keyL0,
      stars: 3,
      xp: 50,
      coins: 30,
    })
    // WorldView desbloquea el nivel i (>0) si completedLevels incluye la clave del nivel i-1.
    const prevKey = `${world.id}/${world.levels[0].id}`
    expect(state.completedLevels.includes(prevKey)).toBe(true)
    expect(state.stars[keyL0]).toBe(3)
    expect(state.xp).toBe(50)
    expect(state.coins).toBe(30)
    expect(levelForXp(state.xp)).toBe(1) // 50 XP < 100 → sigue nivel 1 de jugador
  })

  it('rejugar un nivel con peor puntuación no baja las estrellas guardadas', () => {
    const keyL0 = `${world.id}/${world.levels[0].id}`
    let state = gameReducer(initialState, {
      type: 'LEVEL_COMPLETED', levelKey: keyL0, stars: 3, xp: 50, coins: 30,
    })
    state = gameReducer(state, {
      type: 'LEVEL_COMPLETED', levelKey: keyL0, stars: 1, xp: 50, coins: 10,
    })
    expect(state.stars[keyL0]).toBe(3) // mejor histórico preservado
    expect(state.completedLevels.filter((k) => k === keyL0)).toHaveLength(1) // sin duplicados
  })
})
