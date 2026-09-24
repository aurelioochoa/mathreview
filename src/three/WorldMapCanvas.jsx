import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { worldMapNodes, nodeState, worldProgress } from '../content/worldMap'
import { BOTELLAS, bottleAt } from '../content/curiosidades'
import { useGame } from '../state/gameStore'
import { useTema } from '../state/theme'
import { escenaDe } from './sceneTheme'
import { stepBoat, cameraRelative, autopilotDir, nearestIsland } from './explorerLogic'
import { live, setSnap, getSnap, cancelAutopilot, sailToPoint, pickBottle, useExplorer, saveBoat } from './explorerStore'
import Lighting from './lighting'
import WorldObject from './WorldObject'
import Ocean from './Ocean'
import Clouds from './Clouds'
import Paths from './Paths'
import Boat from './Boat'

const Effects = lazy(() => import('./Effects'))

// Teclas de navegación → eje (x = derecha, y = adelante).
const KEY_AXES = {
  w: [0, 1], arrowup: [0, 1], s: [0, -1], arrowdown: [0, -1],
  a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0],
}

function useKeyboard() {
  useEffect(() => {
    const isField = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)
    const down = (e) => {
      if (isField(e) || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (KEY_AXES[k]) { live.keys.add(k); e.preventDefault() }
    }
    const up = (e) => live.keys.delete(e.key.toLowerCase())
    const blur = () => live.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])
}

// Bucle de juego: lee la entrada, mueve el barco, decide qué isla tiene cerca
// y si ha pescado una botella. Corre dentro del render loop de r3f.
function ExplorerLoop() {
  const acc = useRef(0)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    let ix = live.stick.x, iy = live.stick.y
    for (const k of live.keys) { ix += KEY_AXES[k][0]; iy += KEY_AXES[k][1] }
    let dir = { x: 0, z: 0 }
    if (Math.abs(ix) > 0.05 || Math.abs(iy) > 0.05) {
      cancelAutopilot()
      dir = cameraRelative(ix, iy, live.cameraYaw)
    } else if (live.target) {
      const d = autopilotDir(live.boat, live.target)
      if (d) dir = d
      else cancelAutopilot()
    }
    live.boat = stepBoat(live.boat, dir, dt)
    const { x, z, heading } = live.boat
    const snap = getSnap()
    setSnap({ nearby: nearestIsland(x, z) })
    const found = new Set(snap.found)
    const b = bottleAt(x, z, found)
    if (b) pickBottle(b)
    acc.current += dt
    if (acc.current > 0.1) {
      acc.current = 0
      setSnap({ boat: { x, z, heading } })
    }
  })
  return null
}

// Cámara en tercera persona: OrbitControls para girar (arrastrar) y acercar
// (rueda / pellizco), con el objetivo pegado al barco. Al moverse el barco se
// traslada cámara y objetivo juntos, así el ángulo que eligió el jugador se
// conserva. En vista general sube y se centra en el archipiélago.
function CameraRig() {
  const controls = useRef()
  useFrame(({ camera }, delta) => {
    const c = controls.current
    if (!c) return
    const dt = Math.min(delta, 0.05)
    const ov = getSnap().overview
    const b = live.boat
    const goal = ov ? { x: -1.8, z: -0.6 } : { x: b.x, z: b.z }
    const k = 1 - Math.exp(-dt * (ov ? 2.5 : 6))
    const nx = c.target.x + (goal.x - c.target.x) * k
    const nz = c.target.z + (goal.z - c.target.z) * k
    camera.position.x += nx - c.target.x
    camera.position.z += nz - c.target.z
    c.target.set(nx, 0, nz)
    // El tope de distancia se desliza en vez de saltar al salir de la vista general.
    const maxGoal = ov ? 30 : 17
    c.maxDistance += (maxGoal - c.maxDistance) * k
    if (ov) {
      const dist = camera.position.distanceTo(c.target)
      if (dist < 27) {
        const s = 1 + (27 - dist) / dist * k
        camera.position.set(
          c.target.x + (camera.position.x - c.target.x) * s,
          c.target.y + (camera.position.y - c.target.y) * s,
          c.target.z + (camera.position.z - c.target.z) * s,
        )
      }
    }
    c.update()
    live.cameraYaw = Math.atan2(camera.position.x - c.target.x, camera.position.z - c.target.z)
  })
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.12}
      minDistance={5}
      maxDistance={17}
      minPolarAngle={0.35}
      maxPolarAngle={1.2}
      rotateSpeed={0.6}
    />
  )
}

// Botella con mensaje flotando en el agua; desaparece al recogerla.
function Botella({ x, z, animate }) {
  const ref = useRef()
  const phase = (x * 7 + z * 3) % 6
  useFrame(({ clock }) => {
    if (!ref.current || !animate) return
    const t = clock.getElapsedTime() + phase
    ref.current.position.y = -0.4 + Math.sin(t * 1.8) * 0.06
    ref.current.rotation.z = 0.9 + Math.sin(t * 1.2) * 0.15
    ref.current.rotation.y = t * 0.4
  })
  return (
    <group position={[x, -0.4, z]}>
      <group ref={ref} rotation={[0, 0, 0.9]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.38, 12]} />
          <meshPhysicalMaterial color="#6ee7b7" transmission={0.4} roughness={0.15} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.14, 8]} />
          <meshStandardMaterial color="#6ee7b7" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 8]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.04]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.6} />
        </mesh>
      </group>
      {/* Destello para que se vea desde lejos */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.16, 12, 8]} />
        <meshBasicMaterial color="#fef9c3" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Botellas({ animate }) {
  const found = useExplorer(s => s.found)
  return BOTELLAS.filter(b => !found.includes(b.id)).map(b => (
    <Botella key={b.id} x={b.x} z={b.z} animate={animate} />
  ))
}

export default function WorldMapCanvas({ spin = true, recommended = null }) {
  const { state } = useGame()
  const { resuelto } = useTema()
  const escena = escenaDe(resuelto)
  const [dpr, setDpr] = useState(1.5)
  const nearby = useExplorer(s => s.nearby)
  useKeyboard()

  // Guarda el barco al salir del mapa (p. ej. al entrar a un mundo) para
  // reaparecer en el mismo sitio al volver.
  useEffect(() => () => saveBoat(), [])

  const b = live.boat
  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      camera={{ position: [b.x, 6.5, b.z + 9.5], fov: 50, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <PerformanceMonitor onChange={({ factor }) => setDpr(Math.round((1 + factor) * 10) / 10)} />
      <fog attach="fog" args={[escena.niebla, 22, 48]} />
      <Lighting escena={escena} />
      <Ocean
        animate={spin}
        color={escena.oceano}
        onClick={(e) => {
          if (e.delta > 6) return // arrastre de cámara, no clic
          sailToPoint(e.point.x, e.point.z)
        }}
      />
      <Clouds animate={spin} />
      <Paths />
      <Botellas animate={spin} />
      {worldMapNodes.map((node) => (
        <WorldObject
          key={node.id}
          node={node}
          state={nodeState(node, state)}
          progress={worldProgress(node, state)}
          spin={spin}
          nearby={nearby === node.id}
          recommended={recommended === node.id}
        />
      ))}
      <Boat animate={spin} />
      <ExplorerLoop />
      <CameraRig />
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </Canvas>
  )
}
