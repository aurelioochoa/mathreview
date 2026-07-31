import { describe, it, expect } from 'vitest'
import { evaluateAchievements } from '../achievements'
import { ACHIEVEMENTS } from '../../content/achievements'
import { defaultState } from '../gameStore'

describe('evaluateAchievements', () => {
  it('desbloquea "sin-dano" con el evento de reto sin fallos', () => {
    const ids = evaluateAchievements(defaultState(), { type: 'LEVEL_DONE', perfectLives: true })
    expect(ids).toContain('sin-dano')
  })
  it('desbloquea "cazajefes" tras el primer jefe', () => {
    const s = { ...defaultState(), bossDefeats: ['mundo3'] }
    expect(evaluateAchievements(s, { type: 'BOSS_DEFEATED' })).toContain('cazajefes')
  })
  it('no re-desbloquea lo que ya está en state.achievements', () => {
    const s = { ...defaultState(), bossDefeats: ['mundo3'], achievements: ['cazajefes'] }
    expect(evaluateAchievements(s, { type: 'BOSS_DEFEATED' })).not.toContain('cazajefes')
  })
  it('desbloquea hitos de racha por umbral', () => {
    const s = { ...defaultState(), streak: { count: 7, best: 7, lastDate: '2026-07-22' } }
    const ids = evaluateAchievements(s, { type: 'STREAK' })
    expect(ids).toContain('racha-3')
    expect(ids).toContain('racha-7')
    expect(ids).not.toContain('racha-30')
  })
  it('el estado inicial sin evento no desbloquea nada', () => {
    expect(evaluateAchievements(defaultState(), null)).toEqual([])
  })
  it('un check que lanza no rompe la evaluación', () => {
    const s = { ...defaultState(), stars: null } // rompe los checks que leen stars
    expect(() => evaluateAchievements(s, { type: 'LEVEL_DONE', perfectLives: true })).not.toThrow()
    expect(evaluateAchievements(s, { type: 'LEVEL_DONE', perfectLives: true })).toContain('sin-dano')
  })
})

describe('catálogo de logros', () => {
  it('los ids son únicos y todos tienen nombre, emoji, descripción y check', () => {
    const ids = ACHIEVEMENTS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const a of ACHIEVEMENTS) {
      expect(a.name).toBeTruthy()
      expect(a.emoji).toBeTruthy()
      expect(a.description).toBeTruthy()
      expect(typeof a.check).toBe('function')
    }
  })
})
