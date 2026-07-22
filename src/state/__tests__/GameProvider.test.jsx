import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { GameProvider } from '../GameProvider'
import { useGame } from '../gameStore'

// Render-test del cableado proveedor + hook (el reducer se prueba aparte en
// gameStore.test.js). Verifica el contrato del contexto tras separar
// gameStore.js (contexto/hook) de GameProvider.jsx (componente).
beforeEach(() => localStorage.clear())

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
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider })
    expect(typeof result.current.dispatch).toBe('function')
    expect(result.current.state).toMatchObject({
      version: 2, xp: 0, coins: 0, stars: {}, completedLevels: [],
    })
  })

  it('dispatch(LEVEL_COMPLETED) actualiza el estado del proveedor', () => {
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
