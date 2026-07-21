import { describe, it, expect } from 'vitest'
import { validateContent } from '../validateContent'
import { worlds } from '../worlds'
import { widgets } from '../../widgets'
import { worldMapNodes } from '../worldMap'

describe('validación de contenido', () => {
  it('el detector encuentra un mundo inválido de prueba', () => {
    const malo = [{ id: 'mundoX', slug: 'x', levels: [{ id: 'l', briefing: [], reto: { factories: [] } }] }]
    const problems = validateContent({ worlds: malo, widgets, worldMapNodes: [] })
    expect(problems.length).toBeGreaterThan(0)
  })

  it('el contenido real no tiene problemas', () => {
    const problems = validateContent({ worlds, widgets, worldMapNodes })
    expect(problems, problems.join('\n')).toEqual([])
  })
})
