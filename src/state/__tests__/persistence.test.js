import { describe, it, expect, beforeEach } from 'vitest'
import { loadSave, persistSave, SAVE_KEY, BACKUP_KEY } from '../persistence'

// Fake localStorage (Vitest corre en Node, sin DOM)
function fakeStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

beforeEach(() => { globalThis.localStorage = fakeStorage() })

describe('persistence', () => {
  it('devuelve null sin partida guardada', () => {
    expect(loadSave()).toBeNull()
  })
  it('guarda y carga ida y vuelta', () => {
    persistSave({ version: 1, xp: 50 })
    expect(loadSave()).toEqual({ version: 1, xp: 50 })
  })
  it('al guardar, la versión anterior pasa a backup', () => {
    persistSave({ version: 1, xp: 10 })
    persistSave({ version: 1, xp: 20 })
    expect(JSON.parse(localStorage.getItem(BACKUP_KEY)).xp).toBe(10)
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)).xp).toBe(20)
  })
  it('si el guardado principal está corrupto, restaura el backup', () => {
    persistSave({ version: 1, xp: 10 })
    persistSave({ version: 1, xp: 20 })
    localStorage.setItem(SAVE_KEY, '{corrupto!!!')
    expect(loadSave()).toEqual({ version: 1, xp: 10 })
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
