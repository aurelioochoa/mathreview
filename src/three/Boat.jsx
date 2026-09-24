import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { live } from './explorerStore'

// El barco del jugador: casco, cabina, mástil y vela con el color de marca.
// La física vive en explorerLogic; aquí solo se pinta donde diga `live.boat`,
// con un cabeceo que depende de la velocidad y una estela de anillos.

const WAKE = 7

export default function Boat({ animate = true }) {
  const root = useRef()
  const body = useRef()
  const wake = useRef([])
  const wakeState = useRef(Array.from({ length: WAKE }, () => ({ x: 0, z: 0, age: 1 })))
  const wakeTimer = useRef(0)
  const wakeIdx = useRef(0)

  useFrame(({ clock }, dt) => {
    const b = live.boat
    if (!root.current) return
    root.current.position.set(b.x, -0.5, b.z)
    root.current.rotation.y = b.heading
    const t = clock.getElapsedTime()
    if (body.current) {
      const s = b.speed / 4.2
      body.current.position.y = animate ? Math.sin(t * 2.2) * 0.04 : 0
      body.current.rotation.x = animate ? -0.08 * s + Math.sin(t * 1.7) * 0.03 : 0
      body.current.rotation.z = animate ? Math.sin(t * 1.3) * 0.05 : 0
    }
    // Estela: suelta un anillo cada poco mientras avanza; cada uno crece y se
    // desvanece solo. Posiciones en coordenadas de mundo (fuera del grupo).
    wakeTimer.current += dt
    if (b.speed > 0.6 && wakeTimer.current > 0.12) {
      wakeTimer.current = 0
      const w = wakeState.current[wakeIdx.current]
      w.x = b.x - Math.sin(b.heading) * 0.55
      w.z = b.z - Math.cos(b.heading) * 0.55
      w.age = 0
      wakeIdx.current = (wakeIdx.current + 1) % WAKE
    }
    wakeState.current.forEach((w, i) => {
      w.age = Math.min(1, w.age + dt * 0.9)
      const m = wake.current[i]
      if (!m) return
      m.position.set(w.x, -0.47, w.z)
      const sc = 0.3 + w.age * 1.1
      m.scale.set(sc, sc, sc)
      m.material.opacity = (1 - w.age) * 0.55
      m.visible = w.age < 1
    })
  })

  return (
    <>
      <group ref={root}>
        <group ref={body}>
          {/* Casco: caja estrecha con proa en cuña */}
          <mesh position={[0, 0.12, -0.05]} castShadow>
            <boxGeometry args={[0.5, 0.24, 0.9]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.12, 0.48]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.354, 0.24, 0.354]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
          {/* Franja blanca y cubierta */}
          <mesh position={[0, 0.2, -0.05]}>
            <boxGeometry args={[0.52, 0.05, 0.92]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.25, -0.05]} receiveShadow>
            <boxGeometry args={[0.44, 0.03, 0.84]} />
            <meshStandardMaterial color="#d6a567" roughness={0.9} />
          </mesh>
          {/* Cabina */}
          <mesh position={[0, 0.38, -0.25]} castShadow>
            <boxGeometry args={[0.32, 0.24, 0.3]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.53, -0.25]} castShadow>
            <boxGeometry args={[0.38, 0.06, 0.36]} />
            <meshStandardMaterial color="#6366f1" roughness={0.5} />
          </mesh>
          {/* Mástil, vela y banderín */}
          <mesh position={[0, 0.8, 0.12]} castShadow>
            <cylinderGeometry args={[0.022, 0.028, 1.1, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 0.85, 0.3]} castShadow>
            <boxGeometry args={[0.02, 0.7, 0.34]} />
            <meshStandardMaterial color="#e0e7ff" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.33, 0.02]}>
            <boxGeometry args={[0.015, 0.12, 0.2]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>
      {Array.from({ length: WAKE }, (_, i) => (
        <mesh key={i} ref={el => { wake.current[i] = el }} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.28, 0.36, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
