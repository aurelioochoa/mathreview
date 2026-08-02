import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameProvider } from '../../state/GameProvider'
import OptionButton from '../OptionButton'
import { defaultState } from '../../state/gameStore'
import { findItem } from '../../content/shop'
import { SAVE_KEY } from '../../state/persistence'
import { todayStr } from '../../state/streak'

// El aro es CSS puro (`.marco` + :hover), y jsdom no aplica hojas de estilo:
// lo que se puede comprobar aquí es que la opción sale marcada y con los
// colores del marco equipado, que es la parte que decide el componente. Que un
// borde encendido se vea bonito no lo prueba un test.
function renderOpcion(props = {}, cosmetics = {}) {
  const save = {
    ...defaultState(),
    streak: { count: 1, best: 1, lastDate: todayStr() },
    cosmetics: { ...defaultState().cosmetics, ...cosmetics },
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  render(<GameProvider><OptionButton index={1} {...props}>0.125</OptionButton></GameProvider>)
  return screen.getByRole('button', { name: /0\.125/ })
}

const conMarco = { owned: ['avatar-default', 'frame-fuego'], frame: 'frame-fuego' }

describe('OptionButton — el marco equipado', () => {
  beforeEach(() => localStorage.clear())

  it('numera la opción con su letra', () => {
    expect(renderOpcion().textContent).toContain('B)')
  })

  it('con un marco equipado, la opción lo lleva con sus colores', () => {
    const boton = renderOpcion({}, conMarco)
    expect(boton.className).toContain('marco')
    expect(boton.style.getPropertyValue('--marco-colores')).toContain(findItem('frame-fuego').colors[0])
  })

  // Sin cerrar la vuelta hay un corte duro entre el último color y el primero.
  it('los colores cierran la vuelta repitiendo el primero', () => {
    const colores = renderOpcion({}, conMarco).style.getPropertyValue('--marco-colores').split(', ')
    expect(colores).toHaveLength(findItem('frame-fuego').colors.length + 1)
    expect(colores[colores.length - 1]).toBe(colores[0])
  })

  it('sin marco equipado la opción va limpia', () => {
    const boton = renderOpcion()
    expect(boton.className).not.toContain('marco')
    expect(boton.style.getPropertyValue('--marco-colores')).toBe('')
  })

  // Lo que manda cuando ya has respondido es el verde o el rojo; el marco se
  // aparta para no discutirle el sitio.
  it('la opción acertada no lleva marco aunque haya uno equipado', () => {
    expect(renderOpcion({ estado: 'correcta' }, conMarco).className).not.toContain('marco')
  })

  it('la opción fallada tampoco lo lleva', () => {
    expect(renderOpcion({ estado: 'fallada' }, conMarco).className).not.toContain('marco')
  })

  // Una partida guardada puede traer un marco que ya no esté en el catálogo:
  // no hay colores que pintar, así que la opción se queda como estaba.
  it('un marco que ya no existe en el catálogo se ignora', () => {
    const boton = renderOpcion({}, { owned: ['avatar-default'], frame: 'frame-fantasma' })
    expect(boton.className).not.toContain('marco')
    expect(boton.style.getPropertyValue('--marco-colores')).toBe('')
  })
})
