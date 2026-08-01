import { lazy, Suspense, useEffect, useState } from 'react'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))

// Aviso efímero de logro desbloqueado. Lleva su propia celebración de fondo,
// dentro de la caja: nunca ocupa la pantalla, así que puede solaparse con la
// celebración de un nivel recién superado sin pelearse con ella.
export default function Toast({ toast, onDismiss }) {
  const { use3D } = useDeviceTier()
  // Se guarda PARA QUÉ aviso se midió, no un simple sí/no. Así un aviso nuevo
  // vuelve a estar sin medir por comparación, sin necesidad de resetear el
  // estado a mano dentro del efecto (que dispara renders en cascada), y de paso
  // se remide cuando el nombre del logro cambia el ancho de la caja.
  const [medidoPara, setMedidoPara] = useState(null)
  const medido = toast != null && medidoPara === toast

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  // El canvas espera un fotograma antes de montarse. React Three Fiber mide su
  // contenedor al montar, y la capa `absolute inset-0` todavía no tiene la
  // altura que le presta el contenido en ese instante. Medido en navegador: sin
  // esta espera el canvas se quedaba en su tamaño por defecto (300x150) dentro
  // de una caja de 286x64, así que la medalla se dibujaba centrada fuera de la
  // franja visible y el jugador no veía nunca la celebración.
  useEffect(() => {
    if (!toast) return
    const id = requestAnimationFrame(() => setMedidoPara(toast))
    return () => cancelAnimationFrame(id)
  }, [toast])

  if (!toast) return null
  return (
    // `fixed` ya crea el contexto de posicionamiento que necesita el canvas de
    // dentro, así que NO se añade `relative`: convivirían dos position en la
    // misma caja y ganaría el que Tailwind emita último, no el que se lea antes.
    <div role="status" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass rounded-2xl shadow-xl overflow-hidden ${use3D ? 'min-w-[18rem]' : ''}`}>
      {use3D && medido && (
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
