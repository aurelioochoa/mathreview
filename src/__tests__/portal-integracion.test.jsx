import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import PortalTrial from '../engine/PortalTrial'
import { findWorld } from '../content/worlds'
import { gameReducer, defaultState } from '../state/gameStore'
import { isWorldUnlocked, portalTargetFor } from '../content/worldMap'

function renderPortal(slug) {
  return render(
    <GameProvider>
      <MemoryRouter initialEntries={[`/mundo/${slug}/portal`]}>
        <Routes><Route path="/mundo/:slug/portal" element={<PortalTrial />} /></Routes>
      </MemoryRouter>
    </GameProvider>,
  )
}

describe('integración: PortalTrial', () => {
  it('muestra el mundo que se va a poner a prueba', () => {
    renderPortal('isla-numerica')
    expect(screen.getByRole('heading', { name: new RegExp(findWorld('isla-numerica').name) })).toBeTruthy()
  })

  it('avisa de que no da estrellas', () => {
    renderPortal('isla-numerica')
    expect(screen.getByText(/no da estrellas/i)).toBeTruthy()
  })

  it('mundo inexistente muestra fallback', () => {
    renderPortal('no-existe')
    expect(screen.getByText(/no encontrado/i)).toBeTruthy()
  })
})

describe('portal: efecto sobre la progresión', () => {
  it('aprobar el portal de un mundo abre el siguiente, sin dar estrellas', () => {
    const antes = defaultState()
    expect(isWorldUnlocked('reino-fracciones', antes)).toBe(false)

    const despues = gameReducer(antes, { type: 'PORTAL_PASSED', worldId: 'mundo1' })
    expect(isWorldUnlocked('reino-fracciones', despues)).toBe(true)
    expect(despues.stars).toEqual({})
    expect(despues.bossDefeats).toEqual([]) // la maestría sigue siendo del jefe
  })

  it('el portal de un mundo bloqueado pone a prueba el mundo anterior', () => {
    // Para entrar al Reino hay que demostrar la Isla, que es lo que se salta.
    expect(portalTargetFor('reino-fracciones')).toBe('isla-numerica')
    expect(portalTargetFor('isla-numerica')).toBe(null) // el primero no se salta
  })
})
