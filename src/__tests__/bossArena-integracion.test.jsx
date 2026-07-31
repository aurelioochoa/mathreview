import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import BossArena from '../engine/BossArena'
import { findWorld } from '../content/worlds'

function renderBoss(slug) {
  return render(
    <GameProvider>
      <MemoryRouter initialEntries={[`/mundo/${slug}/jefe`]}>
        <Routes><Route path="/mundo/:slug/jefe" element={<BossArena />} /></Routes>
      </MemoryRouter>
    </GameProvider>,
  )
}

describe('integración: BossArena', () => {
  it('muestra el nombre del jefe del mundo', () => {
    renderBoss('volcan-potencias')
    expect(screen.getByText(new RegExp(findWorld('volcan-potencias').boss.name))).toBeTruthy()
  })
  it('mundo inexistente muestra fallback', () => {
    renderBoss('no-existe')
    expect(screen.getByText(/no encontrado/i)).toBeTruthy()
  })
})
