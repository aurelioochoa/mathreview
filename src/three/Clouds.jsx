import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Nubes procedurales: racimos de esferas blancas con deriva lenta.
// NADA de drei <Cloud> (descarga textura de CDN); esto es 100% offline.

const PUFFS = [
  [0, 0, 0, 0.5], [0.48, 0.1, 0.08, 0.36], [-0.46, 0.06, -0.06, 0.38],
  [0.12, 0.24, -0.12, 0.3], [-0.18, 0.2, 0.14, 0.27],
]

function Cloud({ base, scale = 1, speed = 0.1, animate }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!animate || !ref.current) return
    ref.current.position.x += delta * speed
    if (ref.current.position.x > 20) ref.current.position.x = -20
  })
  return (
    <group ref={ref} position={base} scale={scale}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 18, 14]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function Clouds({ animate = true }) {
  return (
    <group>
      {/* Al fondo del archipiélago y altas: forman horizonte sin tapar las islas
          ni en la vista general, que es cuando la cámara más sube. */}
      <Cloud base={[-16, 5.4, -15]} scale={1.8} speed={0.1} animate={animate} />
      <Cloud base={[-4, 6.2, -18]} scale={2.2} speed={0.07} animate={animate} />
      <Cloud base={[7, 5.6, -16]} scale={1.6} speed={0.13} animate={animate} />
      <Cloud base={[16, 6.4, -19]} scale={2} speed={0.05} animate={animate} />
      <Cloud base={[-10, 6.8, -22]} scale={2.4} speed={0.09} animate={animate} />
    </group>
  )
}
