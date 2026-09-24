import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import BalanzaEcuaciones from '../BalanzaEcuaciones'
import SimplificadorAlgebraico from '../SimplificadorAlgebraico'
import SimuladorProbabilidad from '../SimuladorProbabilidad'
import OperacionesVisual from '../OperacionesVisual'
import CuadriculaDecimal from '../CuadriculaDecimal'
import ReduccionPasos from '../ReduccionPasos'
import { PrismaLab } from '../Laboratorio3D'

afterEach(cleanup)

describe('widgets nuevos: se usan de verdad', () => {
  it('balanza: quitando lo mismo a los dos lados se llega a x = 4', () => {
    render(<BalanzaEcuaciones />) // 3x + 2 = x + 10
    fireEvent.click(screen.getByRole('button', { name: '−x' }))
    fireEvent.click(screen.getByRole('button', { name: /todas las pesas/ }))
    fireEvent.click(screen.getByRole('button', { name: /partes iguales/ }))
    expect(screen.getByText(/¡Resuelta! x = 4/)).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('balanza: el deslizador solo equilibra con la solución', () => {
    render(<BalanzaEcuaciones />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '2' } })
    expect(screen.getByText(/baja la derecha/)).toBeTruthy()
    fireEvent.change(slider, { target: { value: '4' } })
    expect(screen.getByText(/¡Equilibrio!/)).toBeTruthy()
  })

  it('simplificador: factorizar y tachar la pareja deja la fracción simplificada', () => {
    const { container } = render(<SimplificadorAlgebraico />)
    fireEvent.click(screen.getByRole('button', { name: /Factorizar/ }))
    const zona = container.querySelector('.bg-indigo-50\\/70')
    const [filaNum, filaDen] = zona.querySelectorAll('.flex.flex-wrap.justify-center')
    // Emparejar mal avisa y no tacha nada.
    fireEvent.click(within(filaNum).getAllByRole('button')[1]) // (x+2)
    fireEvent.click(within(filaDen).getAllByRole('button')[0]) // (x-2)
    expect(screen.getByRole('status').textContent).toMatch(/no son iguales/)
    // Emparejar bien simplifica.
    fireEvent.click(within(filaNum).getAllByRole('button')[0]) // (x-2)
    fireEvent.click(within(filaDen).getAllByRole('button')[0]) // (x-2)
    expect(screen.getByText(/¡Simplificada!/)).toBeTruthy()
  })

  it('simulador: lanzar ×100 cuenta cien tiradas', () => {
    let i = 0
    const rng = () => ((i++ * 0.6180339887) % 1)
    render(<SimuladorProbabilidad rng={rng} />)
    fireEvent.click(screen.getByRole('button', { name: '×100' }))
    expect(screen.getByText(/tras 100 tiradas/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Borrar/ }))
    expect(screen.getByText(/tras 0 tiradas/)).toBeTruthy()
  })

  it('operaciones: multiplicar enseña la suma repetida', () => {
    render(<OperacionesVisual />)
    fireEvent.click(screen.getByRole('tab', { name: /Multiplicar/ }))
    expect(screen.getByText('4 × 5 = 20')).toBeTruthy()
    expect(screen.getByText(/5 \+ 5 \+ 5 \+ 5 = 20/)).toBeTruthy()
  })

  it('cuadrícula: 1/4 son 25 centésimas, 0,25 y 25 %', () => {
    render(<CuadriculaDecimal />)
    fireEvent.click(screen.getByRole('button', { name: '1/4' }))
    expect(screen.getByText('25/100')).toBeTruthy()
    expect(screen.getByText('= 1/4')).toBeTruthy()
    expect(screen.getByText('25%')).toBeTruthy()
  })

  it('reducción: la sugerencia elimina la y y da la solución', () => {
    render(<ReduccionPasos />)
    fireEvent.click(screen.getByRole('button', { name: /Eliminar y/ }))
    expect(screen.getByRole('status').textContent).toMatch(/y eliminada/)
    expect(screen.getByText('x = 3, y = 2')).toBeTruthy()
  })

  it('laboratorio 3D sin WebGL avisa en vez de romperse', () => {
    render(<PrismaLab />)
    expect(screen.getByText(/necesita WebGL/)).toBeTruthy()
  })
})
