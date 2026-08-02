import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Hud from '../components/Hud'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY } from '../state/persistence'
import { todayStr } from '../state/streak'

function renderHud(cosmetics = {}) {
  const save = {
    ...defaultState(),
    streak: { count: 1, best: 1, lastDate: todayStr() },
    cosmetics: { ...defaultState().cosmetics, ...cosmetics },
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  return render(<GameProvider><MemoryRouter><Hud /></MemoryRouter></GameProvider>)
}

describe('Hud — identidad del jugador', () => {
  beforeEach(() => localStorage.clear())

  // El avatar y su aura acompañan al nivel y al título en la barra, así que
  // se ven en todas las pantallas y no solo al entrar en el perfil.
  it('enseña el avatar equipado', () => {
    renderHud({ owned: ['avatar-default', 'avatar-dragon'], avatar: 'avatar-dragon' })
    expect(screen.getByText('🐲')).toBeTruthy()
  })

  it('enseña el aura equipada alrededor del avatar', () => {
    renderHud({ owned: ['avatar-default', 'aura-fuego'], aura: 'aura-fuego' })
    expect(screen.getByTestId('aura-ring')).toBeTruthy()
  })

  it('sin aura equipada el avatar va suelto, sin halo', () => {
    renderHud()
    expect(screen.queryByTestId('aura-ring')).toBeNull()
  })

  // El avatar es el acceso al perfil: sustituye al icono de muñeco que había,
  // en vez de dejar dos enlaces al mismo sitio en una barra ya apretada.
  it('el avatar lleva al perfil, y es el único enlace que lo hace', () => {
    renderHud({ owned: ['avatar-default', 'avatar-dragon'], avatar: 'avatar-dragon' })
    const enlaces = screen.getAllByRole('link', { name: /perfil/i })
    expect(enlaces).toHaveLength(1)
    expect(enlaces[0].getAttribute('href')).toBe('/perfil')
    expect(enlaces[0].textContent).toContain('🐲')
  })
})
