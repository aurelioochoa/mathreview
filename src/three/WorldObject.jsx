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

export default function WorldObject({ node, state, spin, number, selected, onPreview }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  // 'coming-soon' es un mundo que aún no existe; 'locked' existe pero pide el
  // jefe anterior. Los dos se ven apagados, pero al cerrado sí se puede entrar:
  // WorldView explica la puerta y ofrece el portal.
  const proximamente = state === 'coming-soon'
  const locked = proximamente || state === 'locked'
  useCursor(hovered && !proximamente)
  const color = THEME_HEX[node.theme] ?? '#6366f1'

  useFrame((_, delta) => {
    if (spin && !locked && groupRef.current) groupRef.current.rotation.y += delta * 0.09
  })

  const go = () => { if (!proximamente && node.target) navigate(node.target) }

  return (
    <group position={node.position}>
      <group
        onClick={(event) => { event.stopPropagation(); go() }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          onPreview(node.id)
        }}
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
      {/* Marcador compacto. Los detalles viven en un único panel fuera del canvas. */}
      <Html center distanceFactor={10} position={[0, 2.45, 0]} zIndexRange={[40, 0]}>
        <button
          type="button"
          aria-label={`Ver ${node.title}`}
          aria-pressed={selected}
          title={node.title}
          onPointerEnter={() => onPreview(node.id)}
          onFocus={() => onPreview(node.id)}
          onClick={(event) => { event.stopPropagation(); onPreview(node.id) }}
          className={`flex items-center gap-1 rounded-full min-h-11 px-3 font-display font-bold shadow-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            selected ? 'bg-primary text-white border-white' : 'bg-surface/95 text-gray-700 border-surface'
          }`}
        >
          <span aria-hidden="true">{node.emoji}</span>
          <span>{number}</span>
          {locked && <span className="text-xs" aria-hidden="true">🔒</span>}
          {state === 'completed' && <span className="text-xs" aria-hidden="true">✔</span>}
        </button>
      </Html>
    </group>
  )
}
