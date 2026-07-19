import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308']

function Confetti() {
  const ref = useRef()
  const pieces = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      pos: [(i % 8) - 3.5 + (i % 3) * 0.3, 2.2 - Math.floor(i / 8) * 0.2, (i % 5) * 0.2 - 0.4],
      color: COLORS[i % COLORS.length],
      speed: 0.6 + (i % 5) * 0.15,
    })),
    [],
  )
  useFrame((_, delta) => {
    if (!ref.current) return
    for (const child of ref.current.children) {
      child.position.y -= delta * (child.userData.speed ?? 0.8)
      child.rotation.x += delta * 2
      child.rotation.z += delta * 1.5
      if (child.position.y < -2.4) child.position.y = 2.4
    }
  })
  return (
    <group ref={ref}>
      {pieces.map((p, i) => (
        <mesh key={i} position={p.pos} userData={{ speed: p.speed }}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Trophy() {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 1.2 })
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.15} emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  )
}

export default function Celebration() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} />
      <Trophy />
      <Confetti />
    </Canvas>
  )
}
