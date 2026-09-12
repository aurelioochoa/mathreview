import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html, useCursor } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import Island from './Island'
import WorldModel from './WorldModel'

// Color hex por tema (deben coincidir con los tokens --color-world-* del CSS).
const THEME_HEX = {
  'world-volcan': '#f97316', 'world-castillo': '#10b981',
  'world-laberinto': '#3b82f6', 'world-estacion': '#8b5cf6',
  'world-montanas': '#ef4444', 'world-feria': '#ec4899',
  'world-isla': '#14b8a6', 'world-reino': '#eab308',
}

// Tarjeta de info anclada (DOM). Solo datos reales: progreso únicamente en
// mundos jugables (worldProgress); nada de métricas falsas en los de estudio.
function InfoCard({ node, state, progress, hovered, locked }) {
  return (
    <div
      className={`pointer-events-none select-none rounded-2xl px-3 py-2 shadow-lg border transition-transform whitespace-nowrap ${
        locked ? 'bg-gray-100/90 border-gray-200' : 'bg-surface/95 border-white'
      } ${hovered && !locked ? 'scale-110' : ''}`}
    >
      <div className={`font-display font-bold text-sm leading-tight ${locked ? 'text-gray-500' : 'text-gray-800'}`}>
        {node.emoji} {node.title}
      </div>
      {state === 'coming-soon' && <div className="text-[11px] font-semibold text-gray-400 mt-0.5">🔒 Próximamente</div>}
      {state === 'locked' && <div className="text-[11px] font-semibold text-gray-400 mt-0.5">🔒 Derrota al jefe anterior</div>}
      {state === 'completed' && <div className="text-[11px] font-bold text-emerald-600 mt-0.5">✔ Completado</div>}
      {progress && (
        <div className="mt-1">
          <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
            <span className="text-amber-500">⭐ {progress.stars}/{progress.totalStars}</span>
            <span className="text-gray-500">{progress.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-32 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function WorldObject({ node, state, progress, spin }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  // 'coming-soon' es un mundo que aún no existe; 'locked' existe pero pide el
  // jefe anterior. Los dos se ven apagados, pero al cerrado sí se puede entrar:
  // WorldView explica la puerta y ofrece el portal.
  const proximamente = state === 'coming-soon'
  const locked = proximamente || state === 'locked'
  useCursor(hovered && !locked)
  const color = THEME_HEX[node.theme] ?? '#6366f1'

  useFrame((_, delta) => {
    if (spin && !locked && groupRef.current) groupRef.current.rotation.y += delta * 0.09
  })

  const go = () => { if (!proximamente && node.target) navigate(node.target) }

  return (
    <group position={node.position}>
      <group
        onClick={go}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Isla de terreno low-poly */}
        <Island nodeId={node.id} locked={locked} />
        {/* Objeto temático flotando sobre la isla */}
        <Float speed={spin ? (locked ? 0.5 : 1.3) : 0} rotationIntensity={0.06} floatIntensity={0.15}>
          <group ref={groupRef} position={[0, 1.15, 0]} scale={hovered && !locked ? 1.16 : 1}>
            <WorldModel kind={node.shape} color={color} glow={hovered && !locked} locked={locked} />
          </group>
        </Float>
      </group>
      {/* Tarjeta DOM anclada en 3D (no usa <Text> de drei → no baja fuente) */}
      <Html center distanceFactor={10} position={[0, 2.45, 0]} zIndexRange={[40, 0]}>
        <InfoCard node={node} state={state} progress={progress} hovered={hovered} locked={locked} />
      </Html>
    </group>
  )
}
