import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { GameProvider } from '../GameProvider'
import { useGame, defaultState } from '../gameStore'
import { SAVE_KEY } from '../persistence'
import { todayStr, dailyBonus } from '../streak'

// Render-test del cableado proveedor + hook (el reducer se prueba aparte en
// gameStore.test.js). Verifica el contrato del contexto tras separar
// gameStore.js (contexto/hook) de GameProvider.jsx (componente).
beforeEach(() => localStorage.clear())

// El proveedor cobra el bono de racha al montar. Los tests que no van de la
// racha siembran lastDate = hoy para que el saldo bajo prueba no se mueva.
function conRachaAlDia(extra = {}) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    ...defaultState(), streak: { count: 1, best: 1, lastDate: todayStr() }, ...extra,
  }))
}

describe('GameProvider + useGame', () => {
  it('useGame lanza fuera de un GameProvider', () => {
    // React loguea el error de render a consola; lo silenciamos.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useGame())).toThrow(
      'useGame debe usarse dentro de <GameProvider>',
    )
    spy.mockRestore()
  })

  it('dentro del proveedor entrega { state, dispatch } con el estado inicial', () => {
    conRachaAlDia()
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    expect(typeof result.current.dispatch).toBe('function')
    expect(result.current.state).toMatchObject({
      version: 2, xp: 0, coins: 0, stars: {}, completedLevels: [],
    })
  })

  it('dispatch(LEVEL_COMPLETED) actualiza el estado del proveedor', () => {
    conRachaAlDia()
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    act(() => {
      result.current.dispatch({
        type: 'LEVEL_COMPLETED', levelKey: 'mundo3/x', stars: 2, xp: 50, coins: 20,
      })
    })
    expect(result.current.state.stars['mundo3/x']).toBe(2)
    expect(result.current.state.xp).toBe(50)
    expect(result.current.state.coins).toBe(35) // 2★ primer clear = 2*COINS_PER_STAR + BASE_FIRST_CLEAR
    expect(result.current.state.completedLevels).toContain('mundo3/x')
  })
})

describe('GameProvider: racha diaria y logros', () => {
  it('al montar con la racha de otro día, la avanza y paga el bono', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      ...defaultState(), streak: { count: 0, best: 0, lastDate: null },
    }))
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    expect(result.current.state.streak).toEqual({ count: 1, best: 1, lastDate: todayStr() })
    expect(result.current.state.coins).toBe(dailyBonus(1))
  })

  it('con la racha ya al día no vuelve a pagar', () => {
    conRachaAlDia({ coins: 3 })
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    expect(result.current.state.coins).toBe(3)
  })

  it('desbloquea logros al despachar (reto perfecto y rápido)', () => {
    conRachaAlDia()
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    act(() => {
      result.current.dispatch({
        type: 'LEVEL_COMPLETED', levelKey: 'mundo3/x', stars: 3, xp: 50, perfectLives: true, seconds: 30,
      })
    })
    expect(result.current.state.achievements).toContain('sin-dano')
    expect(result.current.state.achievements).toContain('speedrunner')
    expect(result.current.state.achievements).toContain('perfeccionista')
  })

  it('desbloquea de forma retroactiva lo que un guardado antiguo ya cumplía', () => {
    conRachaAlDia({ bossDefeats: ['mundo3'] })
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    expect(result.current.state.achievements).toContain('cazajefes')
  })
})
