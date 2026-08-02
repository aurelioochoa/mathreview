import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Shop from '../pages/Shop'
import { defaultState } from '../state/gameStore'
import { SHOP_ITEMS } from '../content/shop'
import { SAVE_KEY } from '../state/persistence'
import { todayStr } from '../state/streak'

// El estado arranca desde localStorage, así que sembrar un save es la forma
// de entrar a la tienda con monedas. La racha se siembra con la fecha de hoy
// para que el bono diario no altere el saldo bajo prueba.
function renderShop(extra = {}) {
  const save = { ...defaultState(), streak: { count: 1, best: 1, lastDate: todayStr() }, ...extra }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
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

  it('vende auras de perfil y estelas de ratón', () => {
    renderShop({ coins: 500 })
    expect(screen.getByRole('button', { name: /Comprar Aura de fuego/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Comprar Estela de chispas/ })).toBeTruthy()
  })

  it('el aura se previsualiza con su halo animado en la tarjeta', () => {
    renderShop({ coins: 500 })
    // Una por cada aura y cada estela del catálogo: el halo es la única forma
    // de saber de qué color es lo que estás comprando.
    const auras = SHOP_ITEMS.filter(i => i.slot === 'aura' || i.slot === 'cursor')
    expect(screen.getAllByTestId('aura-ring')).toHaveLength(auras.length)
  })

  // El marco solo se ve mientras respondes, así que en la tienda se enseña
  // encendido y sin esperar al ratón: si no, se compra a ciegas.
  it('el marco se previsualiza con su borde encendido en la tarjeta', () => {
    renderShop({ coins: 500 })
    const marcos = SHOP_ITEMS.filter(i => i.slot === 'frame')
    expect(marcos.length).toBeGreaterThan(0)
    marcos.forEach(m => {
      const vista = screen.getByTestId(`marco-${m.id}`)
      expect(vista.className).toContain('marco-encendido')
      expect(vista.style.getPropertyValue('--marco-colores')).toContain(m.colors[0])
    })
  })

  it('comprar un aura la mete en la colección', () => {
    // 500 y no 200 para que el saldo restante no coincida con el precio de
    // ningún ítem del catálogo, que haría ambigua la búsqueda por texto.
    renderShop({ coins: 500 })
    fireEvent.click(screen.getByRole('button', { name: /Comprar Aura de fuego/ }))
    expect(screen.getByText('360 🪙')).toBeTruthy() // 500 - 140
    expect(screen.getByText(/En tu colección/)).toBeTruthy()
  })

  it('con monedas suficientes, comprar descuenta y marca el ítem como poseído', () => {
    renderShop({ coins: 100 })
    fireEvent.click(screen.getByRole('button', { name: /Mago/ }))
    expect(screen.getByText('40 🪙')).toBeTruthy() // 100 - 60
    expect(screen.getByText(/En tu colección/)).toBeTruthy()
  })
})
