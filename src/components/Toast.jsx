import { lazy, Suspense, useEffect } from 'react'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))

// Aviso efímero de logro desbloqueado. Lleva su propia celebración de fondo,
// dentro de la caja: nunca ocupa la pantalla, así que puede solaparse con la
// celebración de un nivel recién superado sin pelearse con ella.
export default function Toast({ toast, onDismiss }) {
  const { use3D } = useDeviceTier()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null
  return (
    // `fixed` ya crea el contexto de posicionamiento que necesita el canvas de
    // dentro, así que NO se añade `relative`: convivirían dos position en la
    // misma caja y ganaría el que Tailwind emita último, no el que se lea antes.
    <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass rounded-2xl shadow-xl overflow-hidden min-w-[18rem]">
      {use3D && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Suspense fallback={null}><Celebration variant="logro" /></Suspense>
        </div>
      )}
      <div className="relative px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">{toast.emoji}</span>
        <div>
          <p className="text-xs text-gray-500">¡Logro desbloqueado!</p>
          <p className="font-display font-bold text-gray-800">{toast.name}</p>
        </div>
      </div>
    </div>
  )
}
