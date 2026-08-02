import { describe, it, expect } from 'vitest'
import { escenaDe } from '../sceneTheme'

describe('escenaDe', () => {
  it('de noche el cielo y el agua se oscurecen respecto al día', () => {
    const dia = escenaDe('claro')
    const noche = escenaDe('oscuro')
    expect(noche.niebla).not.toBe(dia.niebla)
    expect(noche.oceano).not.toBe(dia.oceano)
    expect(noche.sol.intensidad).toBeLessThan(dia.sol.intensidad)
  })

  it('cualquier tema que no sea oscuro pinta de día', () => {
    expect(escenaDe('claro')).toBe(escenaDe(undefined))
  })

  it('el estudio de luz trae las tres luces en ambos temas', () => {
    expect(escenaDe('claro').estudio).toHaveLength(3)
    expect(escenaDe('oscuro').estudio).toHaveLength(3)
  })
})
