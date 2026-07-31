import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { CELEBRATION_VARIANTS, DEFAULT_VARIANT } from './celebrationVariants'

function Confetti({ pieces, colors }) {
  const ref = useRef()
  const trozos = useMemo(
    () => Array.from({ length: pieces }, (_, i) => ({
      pos: [(i % 8) - 3.5 + (i % 3) * 0.3, 2.2 - Math.floor(i / 8) * 0.2, (i % 5) * 0.2 - 0.4],
      color: colors[i % colors.length],
      speed: 0.6 + (i % 5) * 0.15,
    })),
    [pieces, colors],
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
      {trozos.map((p, i) => (
        <mesh key={i} position={p.pos} userData={{ speed: p.speed }}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Trofeo() {
  return (
    <mesh>
      <icosahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.15} emissive="#f59e0b" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Aro con puntas: la corona del jefe derrotado.
function Corona() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.12, 12, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.15} emissive="#dc2626" emissiveIntensity={0.4} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.65, 0.32, Math.sin(a) * 0.65]}>
            <coneGeometry args={[0.12, 0.42, 8]} />
            <meshStandardMaterial color="#fde047" metalness={0.7} roughness={0.2} emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}

// Disco con borde: la medalla del logro.
function Medalla() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.75} roughness={0.12} emissive="#f59e0b" emissiveIntensity={0.55} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.6, 0.07, 12, 32]} />
        <meshStandardMaterial color="#fde047" metalness={0.8} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

const PIEZAS = { trofeo: Trofeo, corona: Corona, medalla: Medalla }

function Centro({ centerpiece }) {
  const ref = useRef()
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 1.2 })
  const Pieza = PIEZAS[centerpiece] ?? Trofeo
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
      <group ref={ref}><Pieza /></group>
    </Float>
  )
}

export default function Celebration({ variant = DEFAULT_VARIANT }) {
  const v = CELEBRATION_VARIANTS[variant] ?? CELEBRATION_VARIANTS[DEFAULT_VARIANT]
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, v.camera], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} />
      <group scale={v.scale}>
        <Centro centerpiece={v.centerpiece} />
        <Confetti pieces={v.pieces} colors={v.colors} />
      </group>
    </Canvas>
  )
}
