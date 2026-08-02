import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../state/GameProvider'
import CursorAura from '../components/CursorAura'
import Profile from '../pages/Profile'
import { defaultState } from '../state/gameStore'
import { SAVE_KEY } from '../state/persistence'
import { todayStr } from '../state/streak'

const matchMediaOriginal = window.matchMedia

// Las tres condiciones que deciden si hay estela son medias queries, así que
// la prueba las controla desde aquí en vez de simular un ratón real.
function simularEntorno({ punteroFino = true, reduceMotion = false } = {}) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: query.includes('pointer: fine') ? punteroFino
      : query.includes('prefers-reduced-motion') ? reduceMotion
        : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function renderCursor(cursor) {
  const save = {
    ...defaultState(),
    streak: { count: 1, best: 1, lastDate: todayStr() },
    cosmetics: {
      ...defaultState().cosmetics,
      owned: ['avatar-default', cursor].filter(Boolean),
      cursor,
    },
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  return render(<GameProvider><CursorAura /></GameProvider>)
}

// El movimiento vive en un bucle de requestAnimationFrame, así que las pruebas
// hacen de reloj: encolan los frames y los van soltando a mano con el
// intervalo que les interesa.
function conRelojFalso(fn) {
  const pendientes = []
  const rafOriginal = window.requestAnimationFrame
  const cancelOriginal = window.cancelAnimationFrame
  let ahora = 0
  window.requestAnimationFrame = (cb) => pendientes.push(cb)
  window.cancelAnimationFrame = () => {}
  const correr = (frames, paso = 16) => {
    for (let i = 0; i < frames; i++) { ahora += paso; pendientes.shift()?.(ahora) }
  }
  try {
    return fn(correr)
  } finally {
    window.requestAnimationFrame = rafOriginal
    window.cancelAnimationFrame = cancelOriginal
  }
}

const mover = (x, y) => window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }))
const visibles = (capa) => Array.from(capa.children).filter(n => Number(n.style.opacity) > 0)
const posX = (nodo) => Number(nodo.style.transform.match(/translate3d\((-?[\d.]+)px/)[1])

describe('CursorAura', () => {
  beforeEach(() => { localStorage.clear(); simularEntorno() })
  afterEach(() => { window.matchMedia = matchMediaOriginal })

  it('sin estela equipada no pinta nada', () => {
    renderCursor(null)
    expect(screen.queryByTestId('cursor-aura')).toBeNull()
  })

  it('con estela equipada pinta la capa decorativa', () => {
    renderCursor('cursor-chispas')
    const capa = screen.getByTestId('cursor-aura')
    expect(capa.getAttribute('aria-hidden')).toBe('true')
    expect(capa.childElementCount).toBeGreaterThan(0)
  })

  // En una tablet la estela iría siempre pegada al último toque, parada en
  // medio de la pantalla: mejor no pintarla.
  it('en pantalla táctil (puntero grueso) no pinta nada aunque esté equipada', () => {
    simularEntorno({ punteroFino: false })
    renderCursor('cursor-chispas')
    expect(screen.queryByTestId('cursor-aura')).toBeNull()
  })

  it('con reduced-motion no pinta nada: es puro movimiento', () => {
    simularEntorno({ reduceMotion: true })
    renderCursor('cursor-chispas')
    expect(screen.queryByTestId('cursor-aura')).toBeNull()
  })

  // Un id que ya no existe en el catálogo (partida vieja, código tocado a
  // mano) no puede tumbar la app entera: la estela simplemente no sale.
  it('con un id desconocido no pinta nada', () => {
    renderCursor('cursor-que-ya-no-existe')
    expect(screen.queryByTestId('cursor-aura')).toBeNull()
  })

  it('el ratón va soltando partículas por el camino que recorre', () => {
    conRelojFalso((correr) => {
      renderCursor('cursor-chispas')
      const capa = screen.getByTestId('cursor-aura')
      mover(100, 300)   // el primero solo fija de dónde parte
      mover(400, 300)   // 300 px de recorrido: suelta varias partículas
      correr(2)
      const pintadas = visibles(capa)
      expect(pintadas.length).toBeGreaterThan(5)
      // Nacen repartidas por el trayecto, no amontonadas delante del cursor.
      for (const nodo of pintadas) expect(posX(nodo)).toBeLessThanOrEqual(401)
    })
  })

  // Esta es la diferencia con la estela anterior, que era una cadena de puntos
  // pegada al puntero: ahora la partícula se queda donde nació y se apaga ahí.
  it('las partículas se quedan atrás en vez de perseguir al cursor', () => {
    conRelojFalso((correr) => {
      renderCursor('cursor-chispas')
      const capa = screen.getByTestId('cursor-aura')
      mover(100, 300)
      mover(200, 300)
      correr(2)
      const antesMin = Math.min(...visibles(capa).map(posX))

      mover(900, 300) // el cursor se va lejos
      correr(4)
      const rezagadas = visibles(capa).map(posX).filter(x => x < 400)
      expect(rezagadas.length).toBeGreaterThan(0)
      // Sigue rondando donde nació. No se pide que esté clavada: hereda algo
      // del impulso del ratón y deriva unos píxeles, que es lo que le da vida.
      expect(Math.min(...rezagadas)).toBeGreaterThan(antesMin - 30)
      expect(Math.min(...rezagadas)).toBeLessThan(antesMin + 30)
    })
  })

  it('la estela se apaga sola al agotarse la vida de las partículas', () => {
    conRelojFalso((correr) => {
      renderCursor('cursor-chispas')
      const capa = screen.getByTestId('cursor-aura')
      mover(100, 300)
      mover(400, 300)
      correr(2)
      expect(visibles(capa).length).toBeGreaterThan(0)
      correr(60) // ~960 ms, más que la vida de una chispa
      expect(visibles(capa)).toHaveLength(0)
    })
  })

  // Los nodos se reparten entre estelas. Si al cambiar de estela el bucle
  // anterior siguiera escribiendo, o los nodos que le sobran al nuevo se
  // quedaran encendidos, verías la estela vieja pegada en pantalla.
  it('al cambiar de estela no queda nada de la anterior en pantalla', () => {
    conRelojFalso((correr) => {
      const save = {
        ...defaultState(),
        streak: { count: 1, best: 1, lastDate: todayStr() },
        cosmetics: {
          ...defaultState().cosmetics,
          owned: ['avatar-default', 'cursor-monedas', 'cursor-nieve'],
          cursor: 'cursor-monedas',
        },
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(save))
      render(
        <GameProvider><MemoryRouter><Profile /><CursorAura /></MemoryRouter></GameProvider>,
      )

      mover(100, 300)
      mover(400, 300)
      correr(2)
      expect(visibles(screen.getByTestId('cursor-aura'))[0].textContent).toBe('🪙')

      // El camino real: pulsar otra estela en «Personalizar».
      fireEvent.click(screen.getByRole('button', { name: /Estela de nieve/ }))
      expect(visibles(screen.getByTestId('cursor-aura'))).toHaveLength(0)
    })
  })

  // Cada estela pinta su forma. El charco de nodos se reutiliza, así que un
  // nodo que antes fue un punto tiene que quedar limpio al tocarle ser glifo.
  it('cada estela pinta su forma: la de monedas usa su glifo', () => {
    conRelojFalso((correr) => {
      renderCursor('cursor-monedas')
      const capa = screen.getByTestId('cursor-aura')
      mover(100, 300)
      mover(400, 300)
      correr(2)
      const pintadas = visibles(capa)
      expect(pintadas.length).toBeGreaterThan(0)
      expect(pintadas[0].textContent).toBe('🪙')
      expect(pintadas[0].style.background).toBe('')
    })
  })
})
