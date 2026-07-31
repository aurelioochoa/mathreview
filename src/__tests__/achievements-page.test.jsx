import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import Achievements from '../pages/Achievements'
import { ACHIEVEMENTS } from '../content/achievements'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY } from '../state/persistence'
import { todayStr } from '../state/streak'

function renderPage(extra = {}) {
  // lastDate de hoy: así el bono/racha diaria no desbloquea logros de racha
  // que este test no está probando.
  const save = { ...defaultState(), streak: { count: 1, best: 1, lastDate: todayStr() }, ...extra }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  return render(<GameProvider><MemoryRouter><Achievements /></MemoryRouter></GameProvider>)
}

describe('página /logros', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el título y al menos un logro', () => {
    renderPage()
    expect(screen.getByText(/Logros/i)).toBeTruthy()
    expect(screen.getByText(/Cazajefes/)).toBeTruthy()
  })

  it('los secretos bloqueados se muestran como ???', () => {
    renderPage()
    expect(screen.getAllByText('???').length).toBeGreaterThan(0)
  })

  it('un secreto desbloqueado revela su nombre', () => {
    renderPage({ achievements: ['fenix'] })
    expect(screen.getByText('Fénix')).toBeTruthy()
  })

  it('el contador refleja los logros desbloqueados', () => {
    renderPage({ achievements: ['cazajefes', 'fenix'] })
    expect(screen.getByText(`2 / ${ACHIEVEMENTS.length} desbloqueados`)).toBeTruthy()
  })
})
