import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Personaje de juego hecho de piezas: cabeza con la cara del avatar equipado
// (el emoji se pinta en una textura), torso, brazos y piernas con pivote en el
// hombro y la cadera para el ciclo de paso. `state` es una función que da
// { x, y, z, heading, speed } cada fotograma, así sirve igual para el jugador
// que para los personajes de las sidequests.

function caraTexture(emoji) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#ffd9b3'
  ctx.fillRect(0, 0, 128, 128)
  ctx.font = '92px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export default function Character({ state, emoji = '🙂', shirt = '#6366f1', pants = '#1e3a8a', scale = 1, idle = false }) {
  const root = useRef()
  const legL = useRef(), legR = useRef(), armL = useRef(), armR = useRef(), body = useRef()
  const phase = useRef(0)
  const cara = useMemo(() => caraTexture(emoji), [emoji])

  useFrame(({ clock }, dt) => {
    const s = state()
    if (!root.current) return
    root.current.position.set(s.x, s.y, s.z)
    // Gira suave hacia donde mira (la física da el rumbo; aquí solo se interpola).
    const cur = root.current.rotation.y
    let d = (s.heading - cur) % (Math.PI * 2)
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    root.current.rotation.y = cur + d * Math.min(1, dt * 12)
    const v = Math.min(1, s.speed / 7.5)
    phase.current += dt * (4 + s.speed * 1.6)
    const swing = Math.sin(phase.current) * 0.9 * v
    const airborne = s.air ? 1 : 0
    if (legL.current) legL.current.rotation.x = airborne ? -0.5 : swing
    if (legR.current) legR.current.rotation.x = airborne ? 0.3 : -swing
    if (armL.current) armL.current.rotation.x = airborne ? -2.4 : -swing * 0.8
    if (armR.current) armR.current.rotation.x = airborne ? -2.4 : swing * 0.8
    if (body.current) {
      const breathe = idle || v < 0.05 ? Math.sin(clock.getElapsedTime() * 2) * 0.015 : 0
      body.current.position.y = Math.abs(Math.cos(phase.current)) * 0.06 * v + breathe
    }
  })

  const skin = '#ffd9b3'
  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        {/* Piernas (pivote en la cadera) */}
        {[[-0.11, legL], [0.11, legR]].map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 0.62, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow>
              <boxGeometry args={[0.16, 0.6, 0.18]} />
              <meshStandardMaterial color={pants} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.6, 0.04]} castShadow>
              <boxGeometry args={[0.18, 0.08, 0.26]} />
              <meshStandardMaterial color="#3f2a1d" roughness={0.7} />
            </mesh>
          </group>
        ))}
        {/* Torso */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.46, 0.58, 0.28]} />
          <meshStandardMaterial color={shirt} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.48, 0.08, 0.3]} />
          <meshStandardMaterial color="#3f2a1d" roughness={0.6} />
        </mesh>
        {/* Brazos (pivote en el hombro) */}
        {[[-0.31, armL], [0.31, armR]].map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 1.2, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.14, 0.5, 0.16]} />
              <meshStandardMaterial color={shirt} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.54, 0]} castShadow>
              <boxGeometry args={[0.13, 0.1, 0.14]} />
              <meshStandardMaterial color={skin} roughness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Cabeza: la cara del avatar solo en el frente (+z) */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.44, 0.44, 0.44]} />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <meshStandardMaterial key={i} attach={`material-${i}`} color={i === 4 ? '#ffffff' : skin} map={i === 4 ? cara : null} roughness={0.6} />
          ))}
        </mesh>
        {/* Pelo */}
        <mesh position={[0, 1.75, -0.02]} castShadow>
          <boxGeometry args={[0.47, 0.1, 0.48]} />
          <meshStandardMaterial color="#4a2f1f" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
