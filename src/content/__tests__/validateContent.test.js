import { describe, it, expect } from 'vitest'
import { validateContent } from '../validateContent'
import { worlds } from '../worlds'
import { widgets } from '../../widgets'
import { worldMapNodes } from '../worldMap'
import { questsByWorld } from '../quests'

describe('validación de contenido', () => {
  it('el detector encuentra un mundo inválido de prueba', () => {
    const malo = [{ id: 'mundoX', slug: 'x', levels: [{ id: 'l', briefing: [], reto: { factories: [] } }] }]
    const problems = validateContent({ worlds: malo, widgets, worldMapNodes: [] })
    expect(problems.length).toBeGreaterThan(0)
  })

  it('el contenido real no tiene problemas', () => {
    const problems = validateContent({ worlds, widgets, worldMapNodes, questsByWorld })
    expect(problems, problems.join('\n')).toEqual([])
  })
})

describe('validación de sidequests', () => {
  const mundoOk = {
    id: 'mundoX', slug: 'x',
    boss: { name: 'Jefe', emoji: '👾', intro: 'hola' },
    levels: [{
      id: 'l', briefing: [{ type: 'why' }],
      reto: { factories: Array.from({ length: 3 }, () => () => ({ question: 'q', options: ['a', 'b', 'c', 'd'], correctAnswer: 0 })) },
    }],
  }
  const questOk = {
    id: 'qx',
    questions: Array.from({ length: 3 }, () => () => ({ question: 'q', options: ['a', 'b', 'c', 'd'], correctAnswer: 0 })),
  }
  const run = (questsByWorld) => validateContent({ worlds: [mundoOk], widgets, worldMapNodes: [], questsByWorld })

  it('sin el argumento questsByWorld no se valida nada de quests', () => {
    expect(validateContent({ worlds: [mundoOk], widgets, worldMapNodes: [] })).toEqual([])
  })

  it('un mundo sin sidequests se reporta', () => {
    expect(run({}).join('\n')).toMatch(/sin sidequests/)
  })

  it('una quest con menos de 3 fábricas se reporta', () => {
    const corta = { ...questOk, questions: questOk.questions.slice(0, 2) }
    expect(run({ mundoX: [corta] }).join('\n')).toMatch(/3-5 fábricas/)
  })

  it('una fábrica con opciones repetidas se reporta', () => {
    const repetida = { ...questOk, questions: [() => ({ question: 'q', options: ['a', 'a', 'c', 'd'], correctAnswer: 0 }), ...questOk.questions] }
    expect(run({ mundoX: [repetida] }).join('\n')).toMatch(/4 opciones distintas/)
  })

  it('una fábrica que lanza se reporta sin romper la validación', () => {
    const rota = { ...questOk, questions: [() => { throw new Error('boom') }, ...questOk.questions] }
    expect(run({ mundoX: [rota] }).join('\n')).toMatch(/lanzó: boom/)
  })

  it('quests bien formadas no producen problemas', () => {
    expect(run({ mundoX: [questOk] })).toEqual([])
  })
})
