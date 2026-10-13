import { useMemo, useSyncExternalStore } from 'react'

const COMPACT_QUERY = '(max-width: 767px)'
const compactViewport = () => typeof window !== 'undefined' && !!window.matchMedia?.(COMPACT_QUERY).matches
const serverViewport = () => false
function subscribeViewport(listener) {
  const query = typeof window !== 'undefined' ? window.matchMedia?.(COMPACT_QUERY) : null
  query?.addEventListener?.('change', listener)
  return () => query?.removeEventListener?.('change', listener)
}

function hasWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// El diorama necesita espacio: en pantallas estrechas el mapa 2D mantiene
// todos los mundos visibles y pulsables. Se actualiza al redimensionar.
// Además respeta reduced-motion y descarta equipos muy limitados.
export function useDeviceTier() {
  const compact = useSyncExternalStore(subscribeViewport, compactViewport, serverViewport)
  return useMemo(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
    const use3D = !compact && hasWebGL() && !reduce && cores > 4
    return { use3D, reduce: !!reduce }
  }, [compact])
}
