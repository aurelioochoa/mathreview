import { describe, it, expect } from 'vitest'
import { SEASON, SEASON_LISTS, pickSeason } from '../season'

describe('season: catálogo', () => {
  it('tiene etiqueta y todas las listas con contenido', () => {
    expect(SEASON.etiqueta).toBeTruthy()
    expect(SEASON_LISTS.length).toBeGreaterThan(0)
    for (const lista of SEASON_LISTS) {
      expect(Array.isArray(lista)).toBe(true)
      expect(lista.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('todas las entradas son texto no vacío y sin duplicados dentro de su lista', () => {
    for (const lista of SEASON_LISTS) {
      for (const entrada of lista) {
        expect(typeof entrada).toBe('string')
        expect(entrada.trim()).not.toBe('')
      }
      expect(new Set(lista).size).toBe(lista.length)
    }
  })

  // La spec base exige que las referencias caducables vivan solo aquí; una cifra
  // dentro de una entrada (seguidores, records, versiones) es justo lo que
  // envejece mal. Los nombres son texto plano.
  it('ninguna entrada lleva cifras', () => {
    for (const lista of SEASON_LISTS) {
      for (const entrada of lista) expect(entrada).not.toMatch(/\d/)
    }
  })
})

describe('pickSeason', () => {
  it('devuelve siempre un elemento de la lista', () => {
    for (const lista of SEASON_LISTS) {
      for (let i = 0; i < 200; i++) expect(lista).toContain(pickSeason(Math.random, lista))
    }
  })

  it('es determinista dado el rng: los extremos caen en el primero y el último', () => {
    const lista = ['a', 'b', 'c', 'd']
    expect(pickSeason(() => 0, lista)).toBe('a')
    expect(pickSeason(() => 0.999999, lista)).toBe('d')
  })

  it('con una lista vacía devuelve null en vez de undefined', () => {
    expect(pickSeason(Math.random, [])).toBe(null)
  })
})
