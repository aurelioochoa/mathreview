import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../../state/GameProvider'
import { SAVE_KEY } from '../../state/persistence'
import WorldView from '../WorldView'

// Render REAL de WorldView (no una copia del predicado en el test): verifica el
// desbloqueo secuencial `i === 0 || completedLevels.includes(prevKey)` renderizando
// el componente, para que una regresión en WorldView.jsx sí rompa un test.
function renderWorld(slug) {
  return render(
    <GameProvider>
      <MemoryRouter initialEntries={[`/mundo/${slug}`]}>
        <Routes>
          <Route path="/mundo/:slug" element={<WorldView />} />
        </Routes>
      </MemoryRouter>
    </GameProvider>,
  )
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('WorldView: desbloqueo de niveles (render real)', () => {
  it('sin progreso: solo el nivel 1 es jugable; el nivel 2 está bloqueado', () => {
    renderWorld('castillo-algebra') // mundo4, 5 niveles
    // Un enlace "Jugar" por nivel desbloqueado; sin progreso, solo el nivel 1.
    expect(screen.getAllByText(/Jugar/)).toHaveLength(1)
    // El nivel 2 se muestra bloqueado: su texto NO está dentro de un <a>.
    expect(screen.getByText(/Nivel 2:/).closest('a')).toBeNull()
  })

  it('completar el nivel 1 (mundo4/mcd) desbloquea el nivel 2', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, xp: 0, coins: 0, stars: {}, completedLevels: ['mundo4/mcd'] }),
    )
    renderWorld('castillo-algebra')
    // Ahora niveles 1 y 2 son jugables → al menos 2 enlaces "Jugar".
    expect(screen.getAllByText(/Jugar/).length).toBeGreaterThanOrEqual(2)
    // Y el nivel 2 ahora SÍ es un enlace.
    expect(screen.getByText(/Nivel 2:/).closest('a')).not.toBeNull()
  })
})
