import { describe, it, expect, beforeEach } from 'vitest'
import { loadSave, persistSave, SAVE_KEY, BACKUP_KEY } from '../persistence'
import { defaultState } from '../gameStore'

// Fake localStorage (Vitest corre en Node, sin DOM)
function fakeStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  }
}

beforeEach(() => { globalThis.localStorage = fakeStorage() })

describe('persistence', () => {
  it('devuelve null sin partida guardada', () => {
    expect(loadSave()).toBeNull()
  })
  it('guarda y carga ida y vuelta (v1 se migra a v2 al leer)', () => {
    persistSave({ version: 1, xp: 50 })
    expect(loadSave()).toEqual({ ...defaultState(), xp: 50 })
  })
  it('al guardar, la versión anterior pasa a backup', () => {
    persistSave({ version: 1, xp: 10 })
    persistSave({ version: 1, xp: 20 })
    expect(JSON.parse(localStorage.getItem(BACKUP_KEY)).xp).toBe(10)
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).xp).toBe(20)
  })
  it('si el guardado principal está corrupto, restaura el backup (migrado a v2)', () => {
    persistSave({ version: 1, xp: 10 })
    persistSave({ version: 1, xp: 20 })
    localStorage.setItem(SAVE_KEY, '{corrupto!!!')
    expect(loadSave()).toEqual({ ...defaultState(), xp: 10 })
  })
  it('si todo está corrupto, devuelve null', () => {
    localStorage.setItem(SAVE_KEY, '{x')
    localStorage.setItem(BACKUP_KEY, '{y')
    expect(loadSave()).toBeNull()
  })
  it('no lanza cuando setItem falla (cuota llena o modo privado)', () => {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => { throw new DOMException('exceeded', 'QuotaExceededError') },
      removeItem: () => {},
    }
    expect(() => persistSave({ version: 1, xp: 5 })).not.toThrow()
  })
})

describe('migración de guardados', () => {
  beforeEach(() => localStorage.clear())

  it('un save v1 se migra a la última versión conservando xp/coins/stars/completedLevels', () => {
    const v1 = { version: 1, xp: 120, coins: 30, stars: { 'mundo3/aproximacion': 2 }, completedLevels: ['mundo3/aproximacion'] }
    localStorage.setItem('mathquest-save-v1', JSON.stringify(v1))
    const s = loadSave()
    expect(s.version).toBe(3)
    expect(s.xp).toBe(120)
    expect(s.coins).toBe(30)
    expect(s.stars).toEqual({ 'mundo3/aproximacion': 2 })
    expect(s.completedLevels).toEqual(['mundo3/aproximacion'])
    // campos nuevos con defaults:
    expect(s.bossDefeats).toEqual([])
    expect(s.cosmetics.avatar).toBe('avatar-default')
    expect(s.streak).toEqual({ count: 0, best: 0, lastDate: null })
  })

  it('un save v2 (partida de Fase 3) sube a v3 con portalPasses vacío y sin perder nada', () => {
    const v2 = {
      ...defaultState(), version: 2, xp: 500, coins: 80,
      completedLevels: ['mundo3/aproximacion'], bossDefeats: ['mundo3'],
    }
    delete v2.portalPasses
    localStorage.setItem('mathquest-save-v1', JSON.stringify(v2))
    const s = loadSave()
    expect(s.version).toBe(3)
    expect(s.xp).toBe(500)
    expect(s.coins).toBe(80)
    expect(s.bossDefeats).toEqual(['mundo3'])
    expect(s.portalPasses).toEqual([])
  })

  it('un save v2 parcial (sin cosmetics) se completa con defaults', () => {
    const v2 = { ...defaultState(), coins: 5 }
    delete v2.cosmetics
    localStorage.setItem('mathquest-save-v1', JSON.stringify(v2))
    const s = loadSave()
    expect(s.coins).toBe(5)
    expect(s.cosmetics).toEqual(defaultState().cosmetics)
  })

  it('JSON inválido cae al backup; sin backup → null', () => {
    localStorage.setItem('mathquest-save-v1', '{no-json')
    expect(loadSave()).toBe(null)
    localStorage.setItem('mathquest-save-v1-backup', JSON.stringify({ version: 1, xp: 7, coins: 0, stars: {}, completedLevels: [] }))
    expect(loadSave().xp).toBe(7)
  })
})
