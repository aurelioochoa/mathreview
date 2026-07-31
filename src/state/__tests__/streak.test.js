import { describe, it, expect } from 'vitest'
import { nextStreak, dailyBonus, todayStr } from '../streak'

describe('nextStreak', () => {
  const base = { count: 3, best: 5, lastDate: '2026-07-21' }
  it('mismo día no cambia nada', () => {
    expect(nextStreak(base, '2026-07-21')).toEqual(base)
  })
  it('día siguiente incrementa', () => {
    expect(nextStreak(base, '2026-07-22')).toEqual({ count: 4, best: 5, lastDate: '2026-07-22' })
  })
  it('hueco reinicia a 1 y conserva best', () => {
    expect(nextStreak(base, '2026-07-25')).toEqual({ count: 1, best: 5, lastDate: '2026-07-25' })
  })
  it('desde estado inicial (lastDate null) arranca en 1', () => {
    expect(nextStreak({ count: 0, best: 0, lastDate: null }, '2026-07-22')).toEqual({ count: 1, best: 1, lastDate: '2026-07-22' })
  })
  it('supera best cuando la racha crece', () => {
    expect(nextStreak({ count: 5, best: 5, lastDate: '2026-07-21' }, '2026-07-22').best).toBe(6)
  })
  it('cruza fin de mes y fin de año como días consecutivos', () => {
    expect(nextStreak({ count: 2, best: 2, lastDate: '2026-07-31' }, '2026-08-01').count).toBe(3)
    expect(nextStreak({ count: 2, best: 2, lastDate: '2026-12-31' }, '2027-01-01').count).toBe(3)
  })
  it('una fecha anterior (reloj movido hacia atrás) reinicia a 1', () => {
    expect(nextStreak(base, '2026-07-20').count).toBe(1)
  })
})

describe('dailyBonus', () => {
  it('escala con la racha y se topa en 20', () => {
    expect(dailyBonus(1)).toBe(7)   // 5 + 1*2
    expect(dailyBonus(10)).toBe(20) // topado
  })
})

describe('todayStr', () => {
  it('formatea una fecha a YYYY-MM-DD local', () => {
    expect(todayStr(new Date(2026, 6, 5))).toBe('2026-07-05')
  })
})
