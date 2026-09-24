import { useState } from 'react'

// ¿Pantalla táctil? Decide si se enseña el joystick o la ayuda de teclado.
// Estable durante la sesión, como useDeviceTier.
export default function useCoarsePointer() {
  const [coarse] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches)
  return coarse
}
