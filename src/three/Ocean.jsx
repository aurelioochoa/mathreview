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
      pos.setZ(i, Math.sin(x * 0.35 + t * 0.7) * Math.cos(y * 0.28 + t * 0.55) * 0.055 + Math.sin(x * 1.3 - y * 0.8 + t * 0.45) * 0.018)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-1, -0.55, -5]}>
      <planeGeometry ref={geoRef} args={[90, 60, 96, 64]} />
      <meshPhysicalMaterial color={color} roughness={0.27} metalness={0.18} clearcoat={0.65} clearcoatRoughness={0.2} />
    </mesh>
  )
}
