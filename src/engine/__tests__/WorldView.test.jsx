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

// Con el desbloqueo entre mundos (Fase 4), llegar a un mundo del medio exige
// haber derrotado el jefe anterior. Se siembra para poder mirar sus niveles.
function abrirCastillo(extra = {}) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    version: 3, xp: 0, coins: 0, stars: {}, completedLevels: [],
    bossDefeats: ['mundo3'], portalPasses: [], ...extra,
  }))
}

describe('WorldView: puerta entre mundos', () => {
  it('un mundo cerrado no muestra sus niveles, y ofrece el portal', () => {
    renderWorld('castillo-algebra')
    expect(screen.getByText(/está cerrado/i)).toBeTruthy()
    expect(screen.queryAllByText(/Jugar/)).toHaveLength(0)
    expect(screen.getByText(/Probar el portal/i)).toBeTruthy()
  })

  it('el primer mundo siempre está abierto', () => {
    renderWorld('isla-numerica')
    expect(screen.queryByText(/está cerrado/i)).toBeNull()
    expect(screen.getAllByText(/Jugar/).length).toBeGreaterThanOrEqual(1)
  })
})

describe('WorldView: desbloqueo de niveles (render real)', () => {
  it('sin progreso: solo el nivel 1 es jugable; el nivel 2 está bloqueado', () => {
    abrirCastillo()
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
