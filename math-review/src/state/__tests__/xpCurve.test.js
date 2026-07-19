import { describe, it, expect } from 'vitest'
import { xpForLevel, levelForXp, titleForLevel } from '../xpCurve'

describe('xpCurve', () => {
  it('nivel 1 empieza en 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(levelForXp(0)).toBe(1)
  })
  it('umbrales triangulares: L2=100, L3=300, L4=600', () => {
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(300)
    expect(xpForLevel(4)).toBe(600)
  })
  it('levelForXp es inversa de xpForLevel', () => {
    expect(levelForXp(99)).toBe(1)
    expect(levelForXp(100)).toBe(2)
    expect(levelForXp(299)).toBe(2)
    expect(levelForXp(300)).toBe(3)
  })
  it('títulos: primero, intermedio y tope estable', () => {
    expect(titleForLevel(1)).toBe('Aprendiz')
    expect(titleForLevel(5)).toBe('Mago Numérico')
    expect(titleForLevel(8)).toBe('Gran Maestro Matemático')
    expect(titleForLevel(99)).toBe('Gran Maestro Matemático')
  })
  it('titleForLevel(0) se clampa al título de nivel 1 en vez de undefined', () => {
    expect(titleForLevel(0)).toBe('Aprendiz')
  })
})
