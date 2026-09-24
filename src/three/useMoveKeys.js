import { useEffect } from 'react'

// Teclas de movimiento → eje (x = derecha, y = adelante). Las usan el barco del
// mapa y el personaje de la exploración a pie; cada uno pasa su `live`.
export const KEY_AXES = {
  w: [0, 1], arrowup: [0, 1], s: [0, -1], arrowdown: [0, -1],
  a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0],
}

// Además de las flechas guarda en live.keys las `extra` (p. ej. ' ' para
// saltar o 'shift' para correr) mientras están pulsadas.
const NINGUNA = []
export function useMoveKeys(live, extra = NINGUNA) {
  useEffect(() => {
    const isField = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)
    const down = (e) => {
      if (isField(e) || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (KEY_AXES[k] || extra.includes(k)) { live.keys.add(k); e.preventDefault() }
    }
    const up = (e) => live.keys.delete(e.key.toLowerCase())
    const blur = () => live.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [live, extra])
}

// Eje de entrada combinado: teclado + joystick.
export function inputAxes(live) {
  let ix = live.stick.x, iy = live.stick.y
  for (const k of live.keys) {
    const a = KEY_AXES[k]
    if (a) { ix += a[0]; iy += a[1] }
  }
  return { ix, iy }
}
