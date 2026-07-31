import { describe, it, expect } from 'vitest'
import { CELEBRATION_VARIANTS } from '../celebrationVariants'

describe('variantes de celebración', () => {
  it('están las tres', () => {
    expect(Object.keys(CELEBRATION_VARIANTS).sort()).toEqual(['jefe', 'logro', 'nivel'])
  })

  it('cada una trae la forma completa', () => {
    for (const [nombre, v] of Object.entries(CELEBRATION_VARIANTS)) {
      expect(typeof v.pieces, nombre).toBe('number')
      expect(v.pieces, nombre).toBeGreaterThan(0)
      expect(['trofeo', 'corona', 'medalla'], nombre).toContain(v.centerpiece)
      expect(typeof v.scale, nombre).toBe('number')
      expect(typeof v.camera, nombre).toBe('number')
      expect(Array.isArray(v.colors), nombre).toBe(true)
      expect(v.colors.length, nombre).toBeGreaterThan(0)
    }
  })

  it('la del jefe es más aparatosa que la del nivel', () => {
    expect(CELEBRATION_VARIANTS.jefe.pieces).toBeGreaterThan(CELEBRATION_VARIANTS.nivel.pieces)
    expect(CELEBRATION_VARIANTS.jefe.scale).toBeGreaterThan(CELEBRATION_VARIANTS.nivel.scale)
  })

  it('la del logro es la pequeña: vive dentro de un aviso, no en la pantalla entera', () => {
    expect(CELEBRATION_VARIANTS.logro.pieces).toBeLessThan(CELEBRATION_VARIANTS.nivel.pieces)
    expect(CELEBRATION_VARIANTS.logro.scale).toBeLessThan(1)
    expect(CELEBRATION_VARIANTS.logro.camera).toBeLessThan(CELEBRATION_VARIANTS.nivel.camera)
  })
})
