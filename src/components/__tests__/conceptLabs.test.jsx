import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { AlgebraLab, CountingLab, FractionsLab, FunctionsLab, GeometryLab, PowersLab, ProbabilityLab, SystemsLab } from '../../widgets/ConceptLabs'
import RaizCalculadora from '../../widgets/RaizCalculadora'
import { worlds } from '../../content/worlds'
import { widgets } from '../../widgets'
import { mathHistory } from '../../content/mathHistory'

afterEach(cleanup)
const move = (name, value) => fireEvent.change(screen.getByRole('slider', { name }), { target: { value: String(value) } })
const status = () => screen.getByRole('status', { name: 'Resultado de la misión' }).textContent

describe('laboratorios visuales: aprendizaje con acciones', () => {
  it('agrupa la misma cantidad de dos formas y cambia el significado del reparto', () => {
    render(<CountingLab />)
    expect(status()).not.toContain('¡Lo lograste!')
    move(/Grupos/, 4)
    move(/Fichas por grupo/, 6)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('4 filas de 6 fichas, 24 en total')
    expect(status()).toContain('¡Lo lograste!')
    expect(status()).toContain('24 entre 4 grupos devuelve 6')
    move(/Grupos/, 6)
    move(/Fichas por grupo/, 4)
    expect(status()).toContain('24 entre 6 grupos devuelve 4')
  })

  it('reparte las barras sin cambiar su cantidad y exige el denominador común', () => {
    render(<FractionsLab />)
    move(/Cuartos/, 2)
    move(/Sextos/, 2)
    const before = screen.getAllByRole('img').map(svg => svg.querySelectorAll('rect')[1].getAttribute('width'))
    expect(status()).not.toContain('¡Lo lograste!')
    fireEvent.click(screen.getByRole('button', { name: /Dividir ambas/ }))
    expect(screen.getAllByRole('img').map(svg => svg.querySelectorAll('rect')[1].getAttribute('width'))).toEqual(before)
    expect(status()).toContain('¡Lo lograste!')
    expect(screen.getByText('2/4 + 2/6 = 6/12 + 4/12 = 10/12')).toBeTruthy()
    move(/Cuartos/, 4)
    move(/Sextos/, 6)
    expect(status()).toContain('24 doceavos, más de un entero')
  })

  it('distingue potencias de multiplicación por el exponente y conserva el paso cero', () => {
    render(<PowersLab />)
    move(/Base/, 3)
    move(/Exponente/, 2)
    expect(status()).toContain('3 × 2 = 6')
    expect(status()).toContain('3 elevado a 2 = 9')
    expect(status()).toContain('¡Lo lograste!')
    move(/Exponente/, 0)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Crecimiento de 3 elevado a 0: 1')
    expect(status()).toContain('base⁰ = 1')
  })

  it('conserva la solución de la balanza al restar y dividir en ambos lados', () => {
    render(<AlgebraLab />)
    const divide = screen.getByRole('button', { name: /Dividir ambos/ })
    expect(divide.disabled).toBe(true)
    expect(screen.getByRole('img').querySelector('g').getAttribute('transform')).toBe('rotate(8 160 65)')
    move(/Valor de x/, 4)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('izquierda 11, derecha 11, equilibrada')
    fireEvent.click(screen.getByRole('button', { name: /Restar 3/ }))
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('izquierda 8, derecha 8, equilibrada')
    expect(divide.disabled).toBe(false)
    fireEvent.click(divide)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('izquierda 4, derecha 4, equilibrada')
    expect(status()).toContain('¡Lo lograste!')
    move(/Valor de x/, 3)
    expect(status()).not.toContain('¡Lo lograste!')
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('desequilibrada')
    fireEvent.click(screen.getByRole('button', { name: /Reiniciar/ }))
    expect(screen.getByText('2x + 3 = 11')).toBeTruthy()
  })

  it('resolver un sistema exige cumplir ambas pistas, no solo una', () => {
    render(<SystemsLab />)
    move(/Coordenada x/, 1)
    move(/Coordenada y/, 5)
    expect(status()).toContain('✓ cumple 6')
    expect(status()).toContain('≠ 8')
    expect(status()).not.toContain('¡Lo lograste!')
    move(/Coordenada x/, 2)
    move(/Coordenada y/, 4)
    expect(status()).toContain('¡Lo lograste!')
    expect(status()).toContain('intersección es (2, 4)')
  })

  it('observa una salida constante al cambiar x, y reinicia la misión al cambiar la regla', () => {
    render(<FunctionsLab />)
    move(/Pendiente de la máquina/, 0)
    expect(status()).toContain('recorrido es {1}')
    expect(status()).not.toContain('¡Lo lograste!')
    move(/Entrada x/, -3)
    expect(status()).toContain('¡Lo lograste!')
    expect(screen.getByText('f(-3) = (0) × (-3) + (1) = 1')).toBeTruthy()
    move(/Entrada x/, 3)
    expect(screen.getByText('f(3) = (0) × (3) + (1) = 1')).toBeTruthy()
    move(/Salida inicial b/, -2)
    expect(status()).toContain('recorrido es {-2}')
    expect(status()).not.toContain('¡Lo lograste!')
    move(/Entrada x/, 2)
    expect(status()).toContain('¡Lo lograste!')
    move(/Pendiente de la máquina/, -1)
    expect(status()).not.toContain('¡Lo lograste!')
    expect(screen.getByText('f(2) = (-1) × (2) + (-2) = -4')).toBeTruthy()
  })

  it('Pitágoras relaciona áreas, inicia sin premio y muestra la hipotenusa 5', () => {
    render(<GeometryLab />)
    expect(status()).not.toContain('¡Lo lograste!')
    move(/Cateto a/, 3)
    move(/Cateto b/, 4)
    expect(status()).toContain('¡Lo lograste!')
    expect(screen.getByRole('img', { name: /Triángulo rectángulo/ }).getAttribute('aria-label')).toContain('hipotenusa 5.00')
    expect(screen.getByRole('img', { name: /Cuadrados a escala/ }).getAttribute('aria-label')).toContain('área a² 9, área b² 16, área c² 25')
    move(/Cateto a/, 6)
    move(/Cateto b/, 6)
    expect(status()).toContain('c = √72 ≈ 8.49')
    expect(status()).not.toContain('¡Lo lograste!')
  })

  it('cuenta parejas equiprobables y distingue (1,6) de (6,1)', () => {
    render(<ProbabilityLab />)
    expect(screen.getByRole('group', { name: '36 parejas de dados' }).querySelectorAll('button')).toHaveLength(36)
    expect(screen.getByText('P(suma 7) = 6/36 ≈ 16.7 %')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Dado A 1, dado B 6/ }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: /Dado A 1, dado B 6/ }))
    expect(status()).toContain('¡Lo lograste!')
    fireEvent.click(screen.getByRole('button', { name: /Dado A 6, dado B 1/ }))
    expect(screen.getByRole('button', { name: /Dado A 1, dado B 6/ }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: /Dado A 6, dado B 1/ }).getAttribute('aria-pressed')).toBe('true')
    move(/Suma objetivo/, 2)
    expect(screen.getByText('P(suma 2) = 1/36 ≈ 2.8 %')).toBeTruthy()
    expect(status()).not.toContain('¡Lo lograste!')
    move(/Suma objetivo/, 12)
    expect(screen.getByText('P(suma 12) = 1/36 ≈ 2.8 %')).toBeTruthy()
  })

  it('calcula raíces impares negativas sin confundirlas con raíces pares', () => {
    render(<RaizCalculadora />)
    const [index, radicand] = screen.getAllByRole('spinbutton')
    fireEvent.change(radicand, { target: { value: '-8' } })
    expect(screen.getByText(/Verificación:/).textContent).toContain('-2^3 ≈ -8.00')
    fireEvent.change(index, { target: { value: '2' } })
    expect(screen.getByText('No existe')).toBeTruthy()
    fireEvent.change(index, { target: { value: '0' } })
    expect(index.value).toBe('2')
    fireEvent.change(index, { target: { value: '100' } })
    expect(index.value).toBe('10')
  })
})

describe('integración del material', () => {
  it('cada mundo ofrece un laboratorio registrado y cada concepto tiene historia atribuida', () => {
    expect(worlds).toHaveLength(8)
    const ids = worlds.flatMap(world => world.levels.flatMap(level => level.briefing.filter(step => step.widgetId?.startsWith('concept-')).map(step => step.widgetId)))
    expect(new Set(ids).size).toBe(8)
    for (const id of ids) {
      expect(widgets[id]).toBeTruthy()
      const history = mathHistory[id.replace('concept-', '')]
      expect(history.body.length).toBeGreaterThan(60)
      expect(history.connection.length).toBeGreaterThan(40)
      expect(new URL(history.source).hostname).toBe('mathshistory.st-andrews.ac.uk')
    }
  })

  it('la historia se presenta como ampliación voluntaria con enlace atribuido', () => {
    const view = render(<CountingLab />)
    const details = view.container.querySelector('details')
    expect(details.open).toBe(false)
    expect(details.querySelector('summary').textContent).toContain('Historia de las matemáticas')
    const source = screen.getByRole('link', { name: /Fuente: MacTutor/ })
    expect(source.getAttribute('href')).toBe(mathHistory.counting.source)
    expect(source.getAttribute('rel')).toContain('noopener')
  })

  it('las preguntas corregidas evitan dos respuestas equivalentes para 2⁻³', () => {
    const questions = worlds[2].levels.find(level => level.id === 'potenciacion').reto.factories.map(factory => factory())
    const negativeExponent = questions.find(question => question.question.includes('2⁻³'))
    expect(negativeExponent.options[negativeExponent.correctAnswer]).toBe('1/8')
    expect(negativeExponent.options).not.toContain('0.125')
    const rounding = worlds[2].levels.find(level => level.id === 'aproximacion').reto.factories.map(factory => factory()).find(question => question.question.includes('2.467'))
    expect(rounding.options[rounding.correctAnswer]).toBe('Truncó a 1 decimal')
    expect(rounding.hint).toContain('daría 2.5')
  })

  it('la pregunta de MCD contiene una sola pareja que satisface las dos condiciones', () => {
    const question = worlds[3].levels.find(level => level.id === 'mcd').reto.factories.map(factory => factory()).find(question => question.question.includes('Entre estas parejas'))
    const divisor = number => {
      for (let value = Math.min(number, 36); value >= 1; value--) if (number % value === 0 && 36 % value === 0) return value
    }
    const valid = question.options.map(option => option.split(' y ').map(Number).every(value => divisor(value) === 12))
    expect(valid.filter(Boolean)).toHaveLength(1)
    expect(valid[question.correctAnswer]).toBe(true)
  })
})
