import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Profile from '../pages/Profile'
import { defaultState } from '../state/gameStore'
import { EQUIPABLE_SLOTS } from '../content/shop'
import { SAVE_KEY } from '../state/persistence'
import { todayStr } from '../state/streak'

function renderProfile(extra = {}) {
  const save = { ...defaultState(), streak: { count: 1, best: 1, lastDate: todayStr() }, ...extra }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  return render(<GameProvider><MemoryRouter><Profile /></MemoryRouter></GameProvider>)
}

describe('integración: Profile', () => {
  beforeEach(() => localStorage.clear())

  it('muestra nivel de jugador y stats', () => {
    renderProfile()
    expect(screen.getByText(/Perfil/i)).toBeTruthy()
    expect(screen.getByText(/XP/)).toBeTruthy()
  })

  it('sin cosméticos comprados invita a la tienda', () => {
    renderProfile()
    expect(screen.getAllByText(/Consíguelos en la tienda/).length).toBeGreaterThan(0)
  })

  it('equipa un cosmético poseído y lo marca como activo', () => {
    renderProfile({ cosmetics: { owned: ['avatar-default', 'avatar-mago'], avatar: 'avatar-default', frame: null, title: null } })
    const boton = screen.getByRole('button', { name: /Mago/ })
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-pressed')).toBe('true')
  })

  // Los cinco slots (avatar, marco, título, aura, estela) se pintan en fila,
  // uno al lado de otro, en vez de apilados.
  it('Personalizar lista un grupo por slot equipable', () => {
    renderProfile()
    expect(screen.getByTestId('personalizar').children).toHaveLength(EQUIPABLE_SLOTS.length)
  })

  // El marco es el único cosmético que no se ve desde el propio perfil, así
  // que su columna tiene que decir dónde se ve.
  it('el selector de marco cuenta dónde aparece', () => {
    renderProfile()
    expect(screen.getByText(/Enciende la opción que señalas/)).toBeTruthy()
  })

  it('sin aura equipada no hay halo alrededor del avatar', () => {
    renderProfile()
    expect(screen.queryByTestId('aura-ring')).toBeNull()
  })

  it('con un aura equipada el avatar lleva su halo', () => {
    renderProfile({
      cosmetics: { ...defaultState().cosmetics, owned: ['avatar-default', 'aura-fuego'], aura: 'aura-fuego' },
    })
    expect(screen.getByTestId('aura-ring')).toBeTruthy()
  })

  it('equipa una estela de ratón desde su selector', () => {
    renderProfile({
      cosmetics: { ...defaultState().cosmetics, owned: ['avatar-default', 'cursor-chispas'] },
    })
    const boton = screen.getByRole('button', { name: /Estela de chispas/ })
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-pressed')).toBe('true')
  })

  it('el título comprado sustituye al título automático del nivel', () => {
    renderProfile({
      cosmetics: { owned: ['avatar-default', 'title-leyenda'], avatar: 'avatar-default', frame: null, title: 'title-leyenda' },
    })
    // En la cabecera, no en el botón del selector (que también dice "Leyenda").
    expect(screen.getByText(/^Nv\. \d+ · Leyenda$/)).toBeTruthy()
  })
})
