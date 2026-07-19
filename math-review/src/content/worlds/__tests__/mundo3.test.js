import { describe, it, expect } from 'vitest'
import { potenciaDanio, raizCuadradaMinecraft } from '../mundo3-potencias'

describe('fábricas parametrizadas del Mundo 3', () => {
  it('potenciaDanio: siempre 4 opciones distintas con respuesta correcta válida', () => {
    for (let i = 0; i < 500; i++) {
      const q = potenciaDanio()
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.correctAnswer).toBeLessThan(4)
    }
  })
  it('raizCuadradaMinecraft: siempre 4 opciones distintas con respuesta correcta válida', () => {
    for (let i = 0; i < 500; i++) {
      const q = raizCuadradaMinecraft()
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.correctAnswer).toBeLessThan(4)
    }
  })
})
