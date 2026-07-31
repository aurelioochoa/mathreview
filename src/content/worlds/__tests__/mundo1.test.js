import { describe, it, expect } from 'vitest'
import { mundo1 } from '../mundo1-numeros'
import { widgets } from '../../../widgets'

describe('Mundo 1 — estructura', () => {
  it('tiene id, slug, jefe y 4 niveles bien formados', () => {
    expect(mundo1.id).toBe('mundo1')
    expect(mundo1.slug).toBe('isla-numerica')
    expect(mundo1.boss.name).toBeTruthy()
    expect(mundo1.boss.emoji).toBeTruthy()
    expect(mundo1.levels).toHaveLength(4)
    for (const lvl of mundo1.levels) {
      expect(lvl.id, 'id de nivel').toBeTruthy()
      expect(lvl.title, 'título de nivel').toBeTruthy()
      expect(lvl.briefing.length).toBeGreaterThan(0)
      expect(lvl.reto.pick).toBe(3)
      expect(lvl.reto.factories.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('todo widgetId del briefing existe en el registro', () => {
    for (const lvl of mundo1.levels) {
      for (const step of lvl.briefing) {
        if (step.type === 'widget') expect(widgets[step.widgetId], step.widgetId).toBeTruthy()
      }
    }
  })
})

describe('Mundo 1 — fábricas', () => {
  it('cada fábrica da 4 opciones distintas y correctAnswer válido (500 tiradas)', () => {
    for (const lvl of mundo1.levels) {
      for (const [i, f] of lvl.reto.factories.entries()) {
        for (let n = 0; n < 500; n++) {
          const q = f()
          expect(q.options, `${lvl.id} fábrica ${i}`).toHaveLength(4)
          expect(new Set(q.options).size, `${lvl.id} fábrica ${i}: ${q.options}`).toBe(4)
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
          expect(q.correctAnswer).toBeLessThan(4)
          expect(q.question).toBeTruthy()
        }
      }
    }
  })

  // Tono 8-11 (spec §3): nada de incógnitas ni exponentes en los enunciados.
  it('ningún enunciado usa notación algebraica', () => {
    for (const lvl of mundo1.levels) {
      for (const f of lvl.reto.factories) {
        for (let n = 0; n < 50; n++) {
          expect(f().question).not.toMatch(/\bx\b|\^|√/)
        }
      }
    }
  })

  it('ninguna respuesta correcta es negativa', () => {
    for (const lvl of mundo1.levels) {
      for (const f of lvl.reto.factories) {
        for (let n = 0; n < 200; n++) {
          const q = f()
          const correcta = Number(q.options[q.correctAnswer])
          if (Number.isFinite(correcta)) expect(correcta).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })
})
