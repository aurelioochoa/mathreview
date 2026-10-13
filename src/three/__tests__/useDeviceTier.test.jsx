import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDeviceTier } from '../useDeviceTier'

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('selección de mapa', () => {
  function device({ compact = false, reduce = false, cores = 8, webgl = true } = {}) {
    const listeners = new Set()
    const viewport = {
      matches: compact,
      addEventListener: (_, listener) => listeners.add(listener),
      removeEventListener: (_, listener) => listeners.delete(listener),
    }
    vi.stubGlobal('matchMedia', query => query.includes('max-width') ? viewport : { matches: reduce })
    vi.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(cores)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(webgl ? {} : null)
    return {
      resize(compact) { act(() => { viewport.matches = compact; for (const listener of listeners) listener() }) },
      listeners,
    }
  }

  it('un móvil capaz de WebGL conserva el mapa 2D con todos los mundos', () => {
    device({ compact: true })
    const { result } = renderHook(useDeviceTier)
    expect(result.current.use3D).toBe(false)
  })

  it('al redimensionar alterna entre mapa 3D y 2D y limpia el listener', () => {
    const mock = device()
    const { result, unmount } = renderHook(useDeviceTier)
    expect(result.current.use3D).toBe(true)
    mock.resize(true)
    expect(result.current.use3D).toBe(false)
    mock.resize(false)
    expect(result.current.use3D).toBe(true)
    unmount()
    expect(mock.listeners.size).toBe(0)
  })

  it.each([{ reduce: true }, { cores: 4 }, { webgl: false }])('respeta el fallback existente: %j', settings => {
    device(settings)
    expect(renderHook(useDeviceTier).result.current.use3D).toBe(false)
  })
})
