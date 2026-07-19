import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Html, useCursor } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'

// Color hex por tema (deben coincidir con los tokens --color-world-* del CSS).
const THEME_HEX = {
  'world-volcan': '#f97316', 'world-castillo': '#10b981',
  'world-laberinto': '#3b82f6', 'world-estacion': '#8b5cf6',
  'world-montanas': '#ef4444', 'world-feria': '#ec4899',
  'world-isla': '#14b8a6', 'world-reino': '#eab308',
}

// Geometría primitiva por tipo de forma. Glossy = metalness alta + roughness baja.
function Shape({ kind, color, glow }) {
  const mat = (
    <meshStandardMaterial
      color={color} metalness={0.35} roughness={0.15}
      emissive={color} emissiveIntensity={glow ? 0.6 : 0.15}
    />
  )
  switch (kind) {
    case 'crystal':  return <mesh><icosahedronGeometry args={[0.62, 0]} />{mat}</mesh>
    case 'castle':   return <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.12} smoothness={5}>{mat}</RoundedBox>
    case 'maze':     return <mesh><torusKnotGeometry args={[0.4, 0.14, 120, 16]} />{mat}</mesh>
    case 'rocket':   return <mesh rotation={[0, 0, -0.3]}><coneGeometry args={[0.4, 1.1, 24]} />{mat}</mesh>
    case 'mountain': return <mesh><coneGeometry args={[0.7, 1.0, 5]} />{mat}</mesh>
    case 'ferris':   return <mesh><torusGeometry args={[0.55, 0.12, 16, 40]} />{mat}</mesh>
    case 'island':   return <mesh><sphereGeometry args={[0.6, 32, 32]} />{mat}</mesh>
    case 'pizza':    return <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.65, 0.65, 0.16, 32]} />{mat}</mesh>
    default:         return <mesh><sphereGeometry args={[0.6, 32, 32]} />{mat}</mesh>
  }
}

export default function WorldObject({ node, state, spin }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  const locked = state === 'coming-soon'
  useCursor(hovered && !locked)
  const color = THEME_HEX[node.theme] ?? '#6366f1'

  useFrame((_, delta) => {
    if (spin && groupRef.current) groupRef.current.rotation.y += delta * 0.35
  })

  const go = () => { if (!locked && node.target) navigate(node.target) }

  return (
    <group position={node.position}>
      <Float speed={locked ? 0.6 : 1.4} rotationIntensity={locked ? 0.2 : 0.5} floatIntensity={locked ? 0.4 : 0.9}>
        <group
          ref={groupRef}
          scale={hovered && !locked ? 1.18 : 1}
          onClick={go}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Shape kind={node.shape} color={color} glow={hovered && !locked} />
          {/* Plataforma/isla redondeada bajo el objeto */}
          <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.7, 0.85, 0.25, 32]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} opacity={locked ? 0.5 : 1} transparent />
          </mesh>
          {/* Label DOM anclado en 3D (no usa <Text> de drei → no baja fuente) */}
          <Html center distanceFactor={9} position={[0, 1.15, 0]} occlude>
            <div className={`pointer-events-none select-none font-display font-bold text-sm px-2 py-0.5 rounded-full whitespace-nowrap ${locked ? 'bg-gray-500/80 text-white' : 'bg-white/85 text-gray-800'}`}>
              {node.emoji} {node.title}{locked ? ' · Próximamente' : ''}
            </div>
          </Html>
        </group>
      </Float>
    </group>
  )
}
