import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Océano low-poly: plano con ondulación senoidal suave de vértices.
// Procedural, sin texturas ni red. Estático si animate=false.
export default function Ocean({ animate = true, color = '#3fa7e0' }) {
  const geoRef = useRef()

  useFrame(({ clock }) => {
    const geo = geoRef.current
    if (!animate || !geo) return
    const t = clock.getElapsedTime()
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, Math.sin(x * 0.35 + t * 0.7) * Math.cos(y * 0.28 + t * 0.55) * 0.1)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, -0.55, -5]}>
      <planeGeometry ref={geoRef} args={[90, 60, 48, 32]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} flatShading />
    </mesh>
  )
}
