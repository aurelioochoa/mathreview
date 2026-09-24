import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html, useCursor } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { THEME_HEX } from '../content/worldMap'
import { SPREAD } from './explorerLogic'
import { sailToIsland, getSnap } from './explorerStore'
import Island from './Island'
import WorldModel from './WorldModel'

// Cartel de la isla. Antes era una tarjeta ancha con progreso, todas ancladas a
// la misma altura: en islas vecinas una tapaba a la otra y de paso al diorama.
// Ahora es una placa pequeña (emoji + nombre + estrellas), las islas están más
// separadas, la placa se desvanece con la distancia a la cámara, y la ficha
// completa sale en un panel DOM solo cuando el barco llega a la isla.
function Placa({ node, state, progress, hovered, rec }) {
  const locked = state === 'locked' || state === 'coming-soon'
  return (
    <div className={`pointer-events-none select-none whitespace-nowrap rounded-full pl-1.5 pr-3 py-1 flex items-center gap-1.5 border-2 shadow-[0_3px_0_rgba(30,27,75,0.25)] transition-transform duration-150 ${
      locked ? 'bg-slate-200/90 border-slate-300 text-slate-500' : 'bg-white/95 border-white text-indigo-950'
    } ${hovered ? 'scale-110' : ''}`}>
      <span className="text-base leading-none">{locked ? '🔒' : node.emoji}</span>
      <span className="font-display font-bold text-[13px] leading-none">{node.title}</span>
      {progress && !locked && (
        <span className="text-[11px] font-bold text-amber-500 leading-none">★{progress.stars}</span>
      )}
      {state === 'completed' && <span className="text-[11px] leading-none">✅</span>}
      {rec && <span className="text-[11px] leading-none">🎯</span>}
    </div>
  )
}

// Faro del objetivo: columna de luz y una flecha que rebota sobre la isla que
// toca jugar. Es el "marcador de misión" de cualquier juego de mundo abierto.
function Faro({ animate }) {
  const arrow = useRef()
  useFrame(({ clock }) => {
    if (!arrow.current) return
    const t = clock.getElapsedTime()
    arrow.current.position.y = 3.05 + (animate ? Math.sin(t * 3) * 0.14 : 0)
    arrow.current.rotation.y = animate ? t * 1.5 : 0
  })
  return (
    <group>
      <mesh position={[0, 3.4, 0]}>
        <cylinderGeometry args={[0.16, 0.5, 5.5, 20, 1, true]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.16} depthWrite={false} side={2} />
      </mesh>
      <mesh ref={arrow} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.38, 4]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}

// Banderín dorado en las islas completadas.
function Bandera() {
  return (
    <group position={[0.78, 0.2, -0.55]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.14, 0.78, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.015]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.35} metalness={0.3} />
      </mesh>
    </group>
  )
}

export default function WorldObject({ node, state, progress, spin, nearby, recommended }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  const labelRef = useRef()
  // 'coming-soon' es un mundo que aún no existe; 'locked' existe pero pide el
  // jefe anterior. Los dos se ven apagados, pero al cerrado sí se puede entrar:
  // WorldView explica la puerta y ofrece el portal.
  const proximamente = state === 'coming-soon'
  const locked = proximamente || state === 'locked'
  useCursor(hovered && !proximamente)
  const color = THEME_HEX[node.theme] ?? '#6366f1'
  const [x, , z] = node.position
  const pos = [x * SPREAD, 0, z * SPREAD]

  useFrame(({ camera }, delta) => {
    if (spin && !locked && groupRef.current) groupRef.current.rotation.y += delta * 0.09
    // La placa se apaga con la distancia: de cerca se lee, de lejos no estorba.
    const el = labelRef.current
    if (el) {
      const d = camera.position.distanceTo({ x: pos[0], y: 2, z: pos[2] })
      const o = nearby ? 0 : Math.max(0, Math.min(1, (26 - d) / 8))
      el.style.opacity = String(o)
    }
  })

  // Clic en la isla: si ya estás atracado, entras; si no, el barco va solo.
  const onClick = (e) => {
    e.stopPropagation()
    if (e.delta > 6) return // fue un arrastre de cámara, no un clic
    if (proximamente) return
    if (getSnap().nearby === node.id && node.target) navigate(locked ? node.target : `${node.target}/explorar`)
    else sailToIsland(node.id)
  }

  return (
    <group position={pos}>
      <group
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
      >
        <Island nodeId={node.id} locked={locked} />
        <Float speed={spin ? (locked ? 0.5 : 1.3) : 0} rotationIntensity={0.06} floatIntensity={0.15}>
          <group ref={groupRef} position={[0, 1.15, 0]} scale={hovered && !locked ? 1.12 : 1}>
            <WorldModel kind={node.shape} color={color} glow={(hovered || nearby) && !locked} locked={locked} />
          </group>
        </Float>
        {state === 'completed' && <Bandera />}
      </group>
      {recommended && !nearby && <Faro animate={spin} />}
      {/* Anillo en el agua cuando el barco está atracado aquí */}
      {nearby && (
        <mesh position={[0, -0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.05, 2.25, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      )}
      <Html center position={[0, 2.35, 0]} zIndexRange={[20, 0]} style={{ transition: 'opacity 200ms' }}>
        <div ref={labelRef}>
          <Placa node={node} state={state} progress={progress} hovered={hovered} rec={recommended} />
        </div>
      </Html>
    </group>
  )
}
