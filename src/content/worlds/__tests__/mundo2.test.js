import { describe, it, expect } from 'vitest'
import { mundo2, porcentajeDe, precioConDescuento } from '../mundo2-fracciones'
import { widgets } from '../../../widgets'

describe('Mundo 2 — estructura', () => {
  it('tiene id, slug, jefe y 4 niveles bien formados', () => {
    expect(mundo2.id).toBe('mundo2')
    expect(mundo2.slug).toBe('reino-fracciones')
    expect(mundo2.boss.name).toBeTruthy()
    expect(mundo2.boss.emoji).toBeTruthy()
    expect(mundo2.levels).toHaveLength(4)
    for (const lvl of mundo2.levels) {
      expect(lvl.id, 'id de nivel').toBeTruthy()
      expect(lvl.title, 'título de nivel').toBeTruthy()
      expect(lvl.briefing.length).toBeGreaterThan(0)
      expect(lvl.reto.pick).toBe(3)
      expect(lvl.reto.factories.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('todo widgetId del briefing existe en el registro', () => {
    for (const lvl of mundo2.levels) {
      for (const step of lvl.briefing) {
        if (step.type === 'widget') expect(widgets[step.widgetId], step.widgetId).toBeTruthy()
      }
    }
  })
})

describe('Mundo 2 — fábricas', () => {
  // Las opciones son strings tipo "3/4": makeOptions no puede sintetizar vecinos
  // numéricos para rellenar, así que los distractores tienen que venir ya
  // distintos por construcción. Estas tiradas son la red que lo vigila.
  it('cada fábrica da 4 opciones distintas y correctAnswer válido (500 tiradas)', () => {
    for (const lvl of mundo2.levels) {
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

  it('ninguna opción cae en el relleno de emergencia de makeOptions', () => {
    for (const lvl of mundo2.levels) {
      for (const f of lvl.reto.factories) {
        for (let n = 0; n < 200; n++) {
          for (const opt of f().options) expect(String(opt)).not.toMatch(/\(\d\)$/)
        }
      }
    }
  })

  // Se cuentan cromos y se pagan monedas: un "9.6" ahí no significa nada a esta
  // edad. Además, restar flotantes generaba opciones como 11.600000000000001.
  it('las fábricas de porcentaje dan siempre cantidades enteras', () => {
    for (const f of [porcentajeDe, precioConDescuento]) {
      for (let n = 0; n < 500; n++) {
        for (const opt of f().options) {
          expect(Number.isInteger(Number(opt)), `opción no entera: ${opt}`).toBe(true)
        }
      }
    }
  })

  // Tono 8-11 (spec §3): sin incógnitas ni exponentes.
  it('ningún enunciado usa notación algebraica', () => {
    for (const lvl of mundo2.levels) {
      for (const f of lvl.reto.factories) {
        for (let n = 0; n < 50; n++) expect(f().question).not.toMatch(/\bx\b|\^|√/)
      }
    }
  })
})
