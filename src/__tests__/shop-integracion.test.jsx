import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Shop from '../pages/Shop'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY } from '../state/persistence'

// El estado arranca desde localStorage, así que sembrar un save es la forma
// de entrar a la tienda con monedas.
function renderShop(extra = {}) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...defaultState(), ...extra }))
  return render(<GameProvider><MemoryRouter><Shop /></MemoryRouter></GameProvider>)
}

describe('integración: Shop', () => {
  beforeEach(() => localStorage.clear())

  it('lista los ítems del catálogo con sus precios', () => {
    renderShop()
    expect(screen.getByText(/Tienda/i)).toBeTruthy()
    expect(screen.getAllByText(/🪙/).length).toBeGreaterThan(0)
  })

  it('sin monedas, los botones de compra están deshabilitados', () => {
    renderShop({ coins: 0 })
    expect(screen.getByRole('button', { name: /Mago/ })).toHaveProperty('disabled', true)
  })

  it('con monedas suficientes, comprar descuenta y marca el ítem como poseído', () => {
    renderShop({ coins: 100 })
    fireEvent.click(screen.getByRole('button', { name: /Mago/ }))
    expect(screen.getByText('40 🪙')).toBeTruthy() // 100 - 60
    expect(screen.getByText(/En tu colección/)).toBeTruthy()
  })
})
