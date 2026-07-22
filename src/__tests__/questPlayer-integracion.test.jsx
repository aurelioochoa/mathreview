import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import QuestPlayer from '../engine/QuestPlayer'
import { findQuest } from '../content/quests'

describe('integración: QuestPlayer', () => {
  it('muestra la intro de una sidequest real del Mundo 3', () => {
    const quest = findQuest('mundo3', 'volcan-quest-1')
    render(
      <GameProvider>
        <MemoryRouter initialEntries={['/mundo/volcan-potencias/quest/volcan-quest-1']}>
          <Routes><Route path="/mundo/:slug/quest/:questId" element={<QuestPlayer />} /></Routes>
        </MemoryRouter>
      </GameProvider>,
    )
    expect(screen.getByText(new RegExp(quest.title))).toBeTruthy()
  })
})
