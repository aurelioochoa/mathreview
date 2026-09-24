import { useEffect } from 'react'

// Atajos de teclado para responder: 1-4 o A-D eligen la opción, Enter
// continúa. Solo mientras `enabled`; se ignora si el foco está en un campo.
export default function useAnswerKeys({ count, onPick, onContinue, enabled = true }) {
  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      let idx = -1
      if (k >= '1' && k <= '9') idx = Number(k) - 1
      else if (k.length === 1 && k >= 'a' && k <= 'z') idx = k.charCodeAt(0) - 97
      if (idx >= 0 && idx < count && onPick) { e.preventDefault(); onPick(idx); return }
      if (k === 'enter' && onContinue) { e.preventDefault(); onContinue() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, onPick, onContinue, enabled])
}
