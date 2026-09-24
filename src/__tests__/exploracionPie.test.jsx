import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import WorldExplore from '../pages/WorldExplore'
import { rutaMundo, setVistaMundo } from '../state/vistaMundo'

beforeEach(() => { localStorage.clear(); sessionStorage.clear() })
afterEach(cleanup)

function renderRuta(path) {
  return render(
    <GameProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/mundo/:slug" element={<p>Lista de niveles</p>} />
          <Route path="/mundo/:slug/explorar" element={<WorldExplore />} />
        </Routes>
      </MemoryRouter>
    </GameProvider>,
  )
}

describe('exploración a pie: entrada', () => {
  // jsdom no tiene WebGL: sin 3D, la exploración cede a la vista de siempre.
  it('sin 3D manda a la lista de niveles', () => {
    renderRuta('/mundo/isla-numerica/explorar')
    expect(screen.getByText('Lista de niveles')).toBeTruthy()
  })

  it('un mundo que no existe avisa', () => {
    renderRuta('/mundo/no-existe/explorar')
    expect(screen.getByText(/no encontrado/i)).toBeTruthy()
  })
})

describe('volver al mundo', () => {
  it('por defecto vuelve a la lista', () => {
    expect(rutaMundo('isla-numerica')).toBe('/mundo/isla-numerica')
  })

  it('si venías caminando, vuelve a la isla a pie', () => {
    setVistaMundo('pie')
    expect(rutaMundo('isla-numerica')).toBe('/mundo/isla-numerica/explorar')
    setVistaMundo('lista')
    expect(rutaMundo('isla-numerica')).toBe('/mundo/isla-numerica')
  })
})
