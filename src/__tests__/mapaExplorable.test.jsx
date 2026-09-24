import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import { IslandPanel, Minimap, BottleMessage, Objective } from '../components/map/MapOverlays'
import { live, setSnap, getSnap, pickBottle, initBoat } from '../three/explorerStore'
import { BOTELLAS } from '../content/curiosidades'
import { findQuest } from '../content/quests'
import QuestPlayer from '../engine/QuestPlayer'

function renderConJuego(ui, path = '/') {
  return render(
    <GameProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/mundo/:slug" element={<p>Dentro del mundo</p>} />
          <Route path="/mundo/:slug/quest/:questId" element={ui} />
        </Routes>
      </MemoryRouter>
    </GameProvider>,
  )
}

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); initBoat('isla-numerica') })
afterEach(() => { cleanup(); act(() => setSnap({ nearby: null, bottle: null })) })

describe('mapa explorable: ficha de isla', () => {
  it('sin isla cerca no hay ficha', () => {
    renderConJuego(<IslandPanel />)
    expect(screen.queryByText(/Desembarcar/)).toBeNull()
  })

  it('al atracar en un mundo abierto, la ficha deja desembarcar', () => {
    renderConJuego(<IslandPanel />)
    act(() => setSnap({ nearby: 'isla-numerica' }))
    expect(screen.getByRole('heading', { name: /Isla Numérica/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Desembarcar/ }).getAttribute('href')).toBe('/mundo/isla-numerica')
  })

  it('la tecla E desembarca', () => {
    renderConJuego(<IslandPanel />)
    act(() => setSnap({ nearby: 'isla-numerica' }))
    fireEvent.keyDown(window, { key: 'e' })
    expect(screen.getByText('Dentro del mundo')).toBeTruthy()
  })

  it('en un mundo cerrado ofrece el portal', () => {
    renderConJuego(<IslandPanel />)
    act(() => setSnap({ nearby: 'castillo-algebra' }))
    expect(screen.getByText(/Cerrado/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Portal/ }).getAttribute('href')).toBe('/mundo/volcan-potencias/portal')
  })
})

describe('mapa explorable: minimapa y objetivo', () => {
  it('pinchar una isla del minimapa pone rumbo a ella', () => {
    const { container } = renderConJuego(<Minimap recommended="isla-numerica" />)
    const islas = container.querySelectorAll('svg g.cursor-pointer')
    expect(islas.length).toBe(8)
    fireEvent.click(islas[4])
    expect(live.target?.nodeId).toBeTruthy()
    expect(getSnap().sailingTo).toBe(live.target.nodeId)
  })

  it('el objetivo sin progreso es la Isla Numérica y lleva hasta ella', () => {
    renderConJuego(<Objective recommended="isla-numerica" />)
    act(() => setSnap({ nearby: null }))
    fireEvent.click(screen.getByRole('button', { name: /Navegar hasta allí/ }))
    expect(live.target.nodeId).toBe('isla-numerica')
  })

  it('vista general se alterna desde el minimapa', () => {
    renderConJuego(<Minimap recommended={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Vista general/ }))
    expect(getSnap().overview).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Volver al barco/ }))
    expect(getSnap().overview).toBe(false)
  })
})

describe('mapa explorable: botellas', () => {
  it('recoger una botella la guarda y enseña su mensaje', () => {
    renderConJuego(<BottleMessage />)
    const b = BOTELLAS[2]
    act(() => pickBottle(b.id))
    expect(screen.getByRole('dialog', { name: new RegExp(b.titulo) })).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('mq-botellas'))).toContain(b.id)
    fireEvent.click(screen.getByRole('button', { name: /Seguir navegando/ }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('atajos de teclado al responder', () => {
  it('en una sidequest, pulsar "a" responde la primera opción', () => {
    const quest = findQuest('mundo1', 'isla-quest-1')
    expect(quest).toBeTruthy()
    renderConJuego(<QuestPlayer />, `/mundo/isla-numerica/quest/${quest.id}`)
    fireEvent.click(screen.getByRole('button', { name: /Aceptar misión/ }))
    fireEvent.keyDown(window, { key: 'a' })
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
