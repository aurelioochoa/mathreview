import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Profile from '../pages/Profile'
import { defaultState } from '../state/gameStore'
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

  it('el título comprado sustituye al título automático del nivel', () => {
    renderProfile({
      cosmetics: { owned: ['avatar-default', 'title-leyenda'], avatar: 'avatar-default', frame: null, title: 'title-leyenda' },
    })
    // En la cabecera, no en el botón del selector (que también dice "Leyenda").
    expect(screen.getByText(/^Nv\. \d+ · Leyenda$/)).toBeTruthy()
  })
})
