import { lazy, Suspense } from 'react'
import WorldMap2D from '../components/WorldMap2D'
import { useDeviceTier } from '../three/useDeviceTier'

const WorldMapCanvas = lazy(() => import('../three/WorldMapCanvas'))

export default function WorldMap() {
  const { use3D } = useDeviceTier()

  // Fallback 2D: página normal centrada (equipos sin WebGL / reduced-motion).
  if (!use3D) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="text-center mb-6">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-800">
            🗺️ Tu Aventura Matemática
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-2">
            Explora cada mundo, gana XP y estrellas. Elige por dónde empezar tu aventura.
          </p>
        </header>
        <WorldMap2D />
        <div className="mt-10 text-center glass rounded-[1.75rem] p-6 max-w-2xl mx-auto">
          <h2 className="font-display text-xl font-bold text-gray-700 mb-1">💡 Consejo</h2>
          <p className="text-gray-500 text-sm">
            Estudia un mundo a la vez y juega con los ejemplos interactivos.
            ¡Las matemáticas se aprenden practicando!
          </p>
        </div>
      </div>
    )
  }

  // Mapa 3D full-bleed: cielo CSS detrás del canvas transparente + overlays.
  return (
    <div className="relative h-full min-h-[480px] overflow-hidden">
      {/* Cielo: degradado detrás del canvas (offline, sin HDR) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-300 via-[#a8d4f2] to-[#b7d9f5]"
        aria-hidden="true"
      />

      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<div className="h-full grid place-items-center text-sky-900/60 font-display font-bold">Cargando mundos…</div>}>
          <WorldMapCanvas />
        </Suspense>
      </div>

      {/* Título flotante (como cartel del mapa) */}
      <div className="absolute top-4 left-5 md:top-8 md:left-10 max-w-[16rem] md:max-w-xs pointer-events-none select-none">
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-[1.05] drop-shadow-[0_3px_10px_rgba(79,70,229,0.55)]">
          Tu Aventura Matemática
        </h1>
        <p className="mt-2 md:mt-3 text-sm md:text-base font-semibold text-indigo-950/70 drop-shadow-sm">
          Explora cada mundo, gana XP y estrellas.
        </p>
      </div>

      {/* Consejo: tarjeta glass abajo (contenido real existente) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 w-[min(92%,22rem)] glass rounded-2xl px-4 py-3 shadow-lg pointer-events-none select-none">
        <p className="font-display font-bold text-gray-800 text-sm">💡 ¡Sigue explorando!</p>
        <p className="text-gray-600 text-xs mt-0.5">
          Estudia un mundo a la vez y juega con los ejemplos interactivos.
          ¡Las matemáticas se aprenden practicando!
        </p>
      </div>

      {/* Navegación accesible paralela: enfocable por teclado / lectores de pantalla */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-x-4 focus-within:top-4 focus-within:z-50">
        <WorldMap2D />
      </div>
    </div>
  )
}
