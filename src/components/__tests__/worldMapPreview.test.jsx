import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorldMapPreview from '../WorldMapPreview'
import { worldMapNodes } from '../../content/worldMap'
import { defaultState } from '../../state/gameStore'

afterEach(cleanup)

function preview(node, gameState = defaultState()) {
  return render(<MemoryRouter><WorldMapPreview node={node} gameState={gameState} /></MemoryRouter>)
}

describe('detalles del mapa', () => {
  it('enseña el progreso guardado y enlaza al mundo seleccionado', () => {
    const node = worldMapNodes[0]
    const state = { ...defaultState(), completedLevels: [node.levelKeys[0]], stars: { [node.levelKeys[0]]: 3 } }
    preview(node, state)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25')
    expect(screen.getByText('⭐ 3/12')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Entrar al mundo/ }).getAttribute('href')).toBe(node.target)
  })

  it('permite ver la puerta de un mundo cerrado y conserva la opción de portal', () => {
    const node = worldMapNodes[1]
    preview(node)
    expect(screen.getByText(/usa el portal/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Ver cómo desbloquear/ }).getAttribute('href')).toBe(node.target)
  })

  it('cambiar la selección reemplaza el detalle anterior', () => {
    const view = preview(worldMapNodes[0])
    view.rerender(<MemoryRouter><WorldMapPreview node={worldMapNodes[1]} gameState={defaultState()} /></MemoryRouter>)
    expect(screen.getAllByRole('region', { name: 'Mundo seleccionado' })).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: /Isla Numérica/ })).toBeNull()
    expect(screen.getByRole('heading', { name: /Reino de las Fracciones/ })).toBeTruthy()
  })

  it('un mundo futuro no ofrece navegación', () => {
    preview({ ...worldMapNodes[0], status: 'coming-soon' })
    expect(screen.getByText('Próximamente')).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
