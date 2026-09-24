import { lazy, Suspense, useEffect, useState } from 'react'
import WorldMap2D from '../components/WorldMap2D'
import { useDeviceTier } from '../three/useDeviceTier'
import { useGame } from '../state/gameStore'
import { recommendedWorld } from '../three/explorerLogic'
import { initBoat, toggleOverview, closeBottle, getSnap } from '../three/explorerStore'
import { IslandPanel, Minimap, Objective, ControlsHint, Joystick, BottleMessage } from '../components/map/MapOverlays'
import useCoarsePointer from '../components/map/useCoarsePointer'

const WorldMapCanvas = lazy(() => import('../three/WorldMapCanvas'))

// Pantalla de carga con aspecto de juego mientras llega el chunk de three.js.
function Cargando() {
  return (
    <div className="h-full grid place-items-center">
      <div className="text-center">
        <p className="text-5xl flotar inline-block">⛵</p>
        <p className="font-display font-bold text-sky-900/70 mt-2">Izando velas…</p>
      </div>
    </div>
  )
}

function Explorable() {
  const { state } = useGame()
  const recommended = recommendedWorld(state)
  const coarse = useCoarsePointer()
  // El barco se coloca antes de montar la escena: donde lo dejaste en esta
  // pestaña o junto al mundo que toca jugar.
  useState(() => initBoat(recommended))

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName) || e.metaKey || e.ctrlKey) return
      if (e.key === 'm' || e.key === 'M') toggleOverview()
      if (e.key === 'Escape' && getSnap().bottle) closeBottle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative h-full overflow-hidden">
      <h1 className="sr-only">Tu Aventura Matemática</h1>
      {/* Cielo: degradado detrás del canvas (offline, sin HDR) */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-[#a8d4f2] to-[#b7d9f5]" aria-hidden="true" />

      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<Cargando />}>
          <WorldMapCanvas recommended={recommended} />
        </Suspense>
      </div>

      {/* Capa de interfaz: no captura el ratón salvo en sus paneles. */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-3 sm:left-5 top-[4.6rem] sm:top-20 hidden sm:block">
          <Objective recommended={recommended} />
        </div>
        <div className="absolute right-3 sm:right-5 top-[4.6rem] sm:top-20">
          <Minimap recommended={recommended} />
        </div>
        {!coarse && (
          <div className="absolute left-3 sm:left-5 bottom-4 hidden md:block">
            <ControlsHint />
          </div>
        )}
        {coarse && (
          <div className="absolute left-5 bottom-6">
            <Joystick />
          </div>
        )}
        <div className={`absolute left-1/2 -translate-x-1/2 ${coarse ? 'bottom-40' : 'bottom-4'}`}>
          <IslandPanel />
        </div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4">
          <BottleMessage />
        </div>
      </div>

      {/* Navegación accesible paralela: enfocable por teclado / lectores de pantalla */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-x-4 focus-within:top-20 focus-within:z-50 focus-within:max-h-[80vh] focus-within:overflow-auto">
        <WorldMap2D />
      </div>
    </div>
  )
}

export default function WorldMap() {
  const { use3D } = useDeviceTier()

  // Fallback 2D: página normal centrada (equipos sin WebGL / reduced-motion).
  if (!use3D) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-10">
          <header className="text-center mb-8">
            <h1 className="titulo-juego text-4xl md:text-6xl">🗺️ Tu Aventura Matemática</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-3 font-semibold">
              Explora cada mundo, gana XP y estrellas. Elige por dónde empezar tu aventura.
            </p>
          </header>
          <WorldMap2D />
          <div className="mt-10 text-center panel p-6 max-w-2xl mx-auto">
            <h2 className="font-display text-xl font-bold mb-1">💡 Consejo</h2>
            <p className="text-gray-500 text-sm">
              Estudia un mundo a la vez y juega con los ejemplos interactivos.
              ¡Las matemáticas se aprenden practicando!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <Explorable />
}
