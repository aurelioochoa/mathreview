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

  // Este test es literal, no relativo como los de arriba: fija el aspecto exacto que
  // tenía el juego antes de que existieran las variantes (40 piezas, trofeo, escala 1,
  // cámara en 5, la paleta FIESTA en su orden). Los tests de relación no detectarían que
  // alguien cambie 'nivel.pieces' de 40 a 35, reordene un color o mueva la cámara a 4.5:
  // solo comprueban tipos y comparaciones contra las otras variantes. Si este test hay
  // que tocarlo, debe ser un cambio de test deliberado, nunca un efecto colateral.
  it('la variante nivel conserva los valores de antes de existir las variantes', () => {
    expect(CELEBRATION_VARIANTS.nivel).toEqual({
      pieces: 40,
      centerpiece: 'trofeo',
      scale: 1,
      camera: 5,
      colors: ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308'],
    })
  })
})
