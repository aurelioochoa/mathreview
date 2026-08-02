import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import QuestPlayer from '../engine/QuestPlayer'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY } from '../state/persistence'
import { todayStr } from '../state/streak'

// El marco no se ve en el perfil ni en el mapa: se ve respondiendo. Este test
// recorre el camino entero -- guardado con un marco puesto, misión aceptada,
// preguntas en pantalla -- para que no vuelva a pasar que el cosmético exista
// en el estado y no llegue a ninguna parte.
function renderQuest(cosmetics) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    ...defaultState(),
    streak: { count: 1, best: 1, lastDate: todayStr() },
    cosmetics: { ...defaultState().cosmetics, ...cosmetics },
  }))
  render(
    <GameProvider>
      <MemoryRouter initialEntries={['/mundo/volcan-potencias/quest/volcan-quest-1']}>
        <Routes><Route path="/mundo/:slug/quest/:questId" element={<QuestPlayer />} /></Routes>
      </MemoryRouter>
    </GameProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: /Aceptar misión/ }))
  // Las opciones son los únicos botones de la pantalla de preguntas.
  return screen.getAllByRole('button')
}

describe('integración: el marco en las opciones de una misión', () => {
  beforeEach(() => localStorage.clear())

  it('con un marco equipado, todas las opciones lo llevan', () => {
    const opciones = renderQuest({ owned: ['avatar-default', 'frame-oro'], frame: 'frame-oro' })
    expect(opciones.length).toBeGreaterThan(0)
    opciones.forEach(o => {
      expect(o.className).toContain('marco')
      expect(o.style.getPropertyValue('--marco-colores')).toBeTruthy()
    })
  })

  it('sin marco equipado las opciones van como siempre', () => {
    renderQuest({}).forEach(o => expect(o.className).not.toContain('marco'))
  })
})
