import { useMemo } from 'react'

function hasWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Decisión estable durante la sesión: WebGL disponible, respeta reduced-motion,
// y descarta equipos muy limitados (<= 4 hilos lógicos como señal barata).
export function useDeviceTier() {
  return useMemo(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
    const use3D = hasWebGL() && !reduce && cores > 4
    return { use3D, reduce: !!reduce }
  }, [])
}
