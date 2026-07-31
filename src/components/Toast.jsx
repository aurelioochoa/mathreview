import { useEffect } from 'react'

// Aviso efímero de logro desbloqueado. Sin dependencias nuevas.
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null
  return (
    <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
      <span className="text-2xl">{toast.emoji}</span>
      <div>
        <p className="text-xs text-gray-500">¡Logro desbloqueado!</p>
        <p className="font-display font-bold text-gray-800">{toast.name}</p>
      </div>
    </div>
  )
}
