import { lazy, Suspense } from 'react'
import WorldMap2D from '../components/WorldMap2D'
import { useDeviceTier } from '../three/useDeviceTier'

const WorldMapCanvas = lazy(() => import('../three/WorldMapCanvas'))

export default function WorldMap() {
  const { use3D } = useDeviceTier()

  return (
    <div>
      <header className="text-center mb-6">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-800">
          🗺️ Mapa de Mundos
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-2">
          Explora cada mundo, gana XP y estrellas. Elige por dónde empezar tu aventura.
        </p>
      </header>

      {use3D ? (
        <>
          <div className="h-[60vh] min-h-[420px] -mx-4" aria-hidden="true">
            <Suspense fallback={<div className="h-full grid place-items-center text-gray-400">Cargando mundos…</div>}>
              <WorldMapCanvas />
            </Suspense>
          </div>
          {/* Navegación accesible paralela: enfocable por teclado / lectores de pantalla */}
          <div className="sr-only focus-within:not-sr-only">
            <WorldMap2D />
          </div>
        </>
      ) : (
        <WorldMap2D />
      )}

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
