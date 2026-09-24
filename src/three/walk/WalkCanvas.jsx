import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { escenaDe } from '../sceneTheme'
import { useTema } from '../../state/theme'
import { texture } from '../textures'
import Lighting from '../lighting'
import SkyDome from '../SkyDome'
import Ocean from '../Ocean'
import WorldModel from '../WorldModel'
import { Pine, RoundTree, Palm, Bush, Rock, DeadTree, Crystal } from '../Vegetation'
import { useMoveKeys, inputAxes } from '../useMoveKeys'
import { cameraRelative } from '../explorerLogic'
import Character from './Character'
import Rasgos from './Rasgos'
import { Velero } from '../Boat'

const cero = () => 0
import { stepWalker, stepVertical, nearestStation, pathPoints, cameraClear, cameraBlockers } from './walkLogic'
import { live, setWalkSnap, getWalkSnap, saveWalker, useWalk } from './walkStore'

const Effects = lazy(() => import('../Effects'))
const EXTRA = [' ', 'shift']

// ——— Terreno ———
function Terreno({ terrain }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(50, 50, 160, 160)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    const col = new Float32Array(p.count * 3)
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i)
      const h = terrain.height(x, z)
      p.setY(i, h)
      // Los colores del bioma están en sRGB; los atributos de color van en lineal.
      const [r, gg, b] = terrain.color(x, z, h)
      col.set([r ** 2.2, gg ** 2.2, b ** 2.2], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.computeVertexNormals()
    return g
  }, [terrain])
  // Textura de detalle en grises: el color lo pone el bioma (vértices) y la
  // textura solo añade grano, así sirve igual para hierba, basalto o nieve.
  const map = useMemo(() => texture('detalle', 16), [])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={map} vertexColors roughness={0.95} />
    </mesh>
  )
}

// ——— Camino de losas ———
function Camino({ points, terrain }) {
  const losas = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x, 0, p.z)), false, 'catmullrom', 0.3)
    const n = Math.floor(curve.getLength() / 0.9)
    const out = []
    for (let i = 0; i <= n; i++) {
      const p = curve.getPoint(i / n)
      if (Math.hypot(p.x, p.z) < 3.8) continue
      out.push({ x: p.x, z: p.z, y: terrain.height(p.x, p.z), rot: (i * 1.7) % 3, s: 0.34 + ((i * 7) % 5) * 0.03 })
    }
    return out
  }, [points, terrain])
  const map = useMemo(() => texture('dirt', 1), [])
  return losas.map((l, i) => (
    <mesh key={i} position={[l.x, l.y + 0.03, l.z]} rotation={[0, l.rot, 0]} receiveShadow>
      <cylinderGeometry args={[l.s, l.s * 1.05, 0.08, 7]} />
      <meshStandardMaterial map={map} color="#e7dcc8" roughness={1} />
    </mesh>
  ))
}

// ——— Placa flotante que se apaga con la distancia ———
function Placa({ position, children, far = 36 }) {
  const ref = useRef()
  const anchor = useRef()
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    if (!ref.current || !anchor.current) return
    // Distancia en coordenadas de mundo: la placa puede ir dentro de un grupo.
    const d = camera.position.distanceTo(anchor.current.getWorldPosition(v))
    ref.current.style.opacity = String(Math.max(0, Math.min(1, (far - d) / 10)))
  })
  return (
    <group ref={anchor} position={position}>
      <Html center zIndexRange={[20, 0]}>
        <div ref={ref} className="pointer-events-none select-none whitespace-nowrap">{children}</div>
      </Html>
    </group>
  )
}

// ——— Monumento del mundo: su diorama en grande sobre un pedestal ———
function Monumento({ shape, color, terrain }) {
  const rock = useMemo(() => texture('rock', 3), [])
  const bricks = useMemo(() => texture('bricks', 4), [])
  const y = terrain.height(0, 0)
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.1, 3.4, 0.9, 40]} />
        <meshStandardMaterial map={rock} bumpMap={rock} bumpScale={2} color="#c9c0b3" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.84, 0]} receiveShadow>
        <cylinderGeometry args={[2.9, 3.05, 0.1, 40]} />
        <meshStandardMaterial map={bricks} color="#ffffff" roughness={0.9} />
      </mesh>
      <group position={[0, 2.9, 0]} scale={2.6}>
        <WorldModel kind={shape} color={color} glow locked={false} />
      </group>
    </group>
  )
}

// ——— Estación de nivel: pedestal con gema flotante ———
function Estacion({ s, color, terrain, nearby }) {
  const gem = useRef()
  const bricks = useMemo(() => texture('bricks', 1), [])
  const y = terrain.height(s.x, s.z)
  const on = s.unlocked
  useFrame(({ clock }) => {
    if (!gem.current) return
    const t = clock.getElapsedTime() + s.index
    gem.current.rotation.y = t * 0.9
    gem.current.position.y = 1.55 + Math.sin(t * 2) * 0.08
  })
  return (
    <group position={[s.x, y, s.z]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.7, 8]} />
        <meshStandardMaterial map={bricks} bumpMap={bricks} bumpScale={1} color={on ? '#ffffff' : '#a8a29e'} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.74, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.08, 24]} />
        <meshStandardMaterial color={on ? color : '#78716c'} emissive={on ? color : '#000000'} emissiveIntensity={nearby ? 0.9 : 0.35} roughness={0.4} />
      </mesh>
      <mesh ref={gem} castShadow>
        <octahedronGeometry args={[0.36, 0]} />
        <meshPhysicalMaterial color={on ? color : '#9ca3af'} emissive={on ? color : '#000000'} emissiveIntensity={on ? (nearby ? 1.6 : 0.8) : 0}
          roughness={0.1} metalness={0.1} clearcoat={1} transmission={on ? 0.3 : 0} thickness={0.5} />
      </mesh>
      {nearby && on && <pointLight position={[0, 1.6, 0]} color={color} intensity={4} distance={5} />}
      <Placa position={[0, 2.45, 0]}>
        <div className={`rounded-full px-2.5 py-1 border-2 flex items-center gap-1.5 shadow-[0_3px_0_rgba(30,27,75,0.25)] ${on ? 'bg-white/95 border-white text-indigo-950' : 'bg-slate-200/90 border-slate-300 text-slate-500'}`}>
          <span className="text-base leading-none">{on ? s.icon : '🔒'}</span>
          <span className="font-display font-bold text-[12px] leading-none">{s.index + 1}</span>
          {s.done && <span className="text-[11px] leading-none text-amber-500">{'★'.repeat(s.stars)}</span>}
        </div>
      </Placa>
    </group>
  )
}

// ——— Puerta del jefe: arco de sillares con antorchas ———
function Antorcha({ position, on }) {
  const fuego = useRef()
  useFrame(({ clock }) => {
    if (!fuego.current) return
    const t = clock.getElapsedTime()
    fuego.current.scale.setScalar(0.9 + Math.sin(t * 13 + position[0]) * 0.1 + Math.sin(t * 7) * 0.05)
  })
  const wood = useMemo(() => texture('wood', 1), [])
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.4, 8]} />
        <meshStandardMaterial map={wood} color="#8a6a4a" />
      </mesh>
      {on && (
        <mesh ref={fuego} position={[0, 1.52, 0]}>
          <coneGeometry args={[0.13, 0.35, 8]} />
          <meshStandardMaterial color="#ffb347" emissive="#ff6a00" emissiveIntensity={3} />
        </mesh>
      )}
      {on && <pointLight position={[0, 1.7, 0]} color="#ff8c3a" intensity={3} distance={5} />}
    </group>
  )
}

function PuertaJefe({ s, terrain }) {
  const bricks = useMemo(() => texture('bricks', 2), [])
  const y = terrain.height(s.x, s.z)
  const on = s.unlocked
  // Mira hacia el centro de la isla.
  const rot = Math.atan2(-s.x, -s.z)
  return (
    <group position={[s.x, y, s.z]} rotation={[0, rot, 0]}>
      {[-1.3, 1.3].map(x => (
        <mesh key={x} position={[x, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 3, 0.7]} />
          <meshStandardMaterial map={bricks} bumpMap={bricks} bumpScale={1} color={on ? '#ffffff' : '#b5b0aa'} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.6, 0.8]} />
        <meshStandardMaterial map={bricks} bumpMap={bricks} bumpScale={1} color={on ? '#ffffff' : '#b5b0aa'} roughness={0.9} />
      </mesh>
      {/* Estandarte */}
      <mesh position={[0, 2.5, 0.36]}>
        <planeGeometry args={[0.9, 1.1]} />
        <meshStandardMaterial color={on ? '#dc2626' : '#57534e'} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {/* Portal: velo brillante cuando está abierto, rejas si no */}
      {on ? (
        <mesh position={[0, 1.3, 0]}>
          <planeGeometry args={[1.9, 2.6]} />
          <meshStandardMaterial color="#f97316" emissive="#dc2626" emissiveIntensity={1.4} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      ) : (
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-0.8 + i * 0.32, 1.3, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 2.6, 6]} />
            <meshStandardMaterial color="#44403c" metalness={0.8} roughness={0.4} />
          </mesh>
        ))
      )}
      <Antorcha position={[-2, 0, 0.6]} on={on} />
      <Antorcha position={[2, 0, 0.6]} on={on} />
      <Placa position={[0, 4.3, 0]} far={46}>
        <div className={`rounded-full px-3 py-1 border-2 font-display font-bold text-[13px] flex items-center gap-1.5 shadow-[0_3px_0_rgba(30,27,75,0.25)] ${on ? 'bg-red-500 border-red-300 text-white' : 'bg-slate-200/90 border-slate-300 text-slate-500'}`}>
          <span className="text-lg leading-none">{on ? s.icon : '🔒'}</span> Jefe {s.done && '⭐'}
        </div>
      </Placa>
    </group>
  )
}

// ——— Personaje de sidequest ———
const CAMISAS = ['#f59e0b', '#10b981', '#ec4899', '#0ea5e9']
const PIELES_NPC = ['#d9a07a', '#8d5a3b', '#f1c7a3', '#b97a52']
const PELOS_NPC = ['#1f1a17', '#c8923d', '#7a4b24', '#3b2616']
function Npc({ s, i, terrain }) {
  const y = terrain.height(s.x, s.z)
  const pos = useMemo(() => ({ x: s.x, y, z: s.z, heading: Math.atan2(-s.x, -s.z), speed: 0 }), [s.x, s.z, y])
  return (
    <group>
      <Character state={() => pos} emoji={s.icon} shirt={CAMISAS[i % CAMISAS.length]} pants="#374151"
        skin={PIELES_NPC[i % 4]} hair={PELOS_NPC[i % 4]} scale={0.95} idle backpack={false} />
      <Placa position={[s.x, y + 2.3, s.z]}>
        <div className={`rounded-2xl px-2.5 py-1 border-2 font-display font-bold text-[12px] shadow-[0_3px_0_rgba(30,27,75,0.25)] ${s.done ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-amber-300 border-amber-200 text-amber-950 animate-bounce'}`}>
          {s.done ? '✓' : '!'}
        </div>
      </Placa>
    </group>
  )
}

// ——— Embarcadero ———
function Muelle({ s, terrain }) {
  const wood = useMemo(() => texture('wood', 2), [])
  const rot = Math.atan2(s.x, s.z)
  const y = Math.max(terrain.height(s.x, s.z), -0.4)
  return (
    <group position={[s.x, y, s.z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.1, 1.6]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.12, 4.6]} />
        <meshStandardMaterial map={wood} color="#caa27a" roughness={0.9} />
      </mesh>
      {[-0.7, 0.7].flatMap(x => [0, 1.6, 3.2].map(z => (
        <mesh key={`${x}${z}`} position={[x, -0.4, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial map={wood} color="#8a6a4a" />
        </mesh>
      )))}
      {/* El velero del mapa, amarrado junto al muelle (a ras del agua) */}
      <group position={[1.7, -0.85 - y, 3]} rotation={[0, 0.25, 0]} scale={1.5}>
        <Velero speed={cero} />
      </group>
      <Placa position={[0, 1.4, 0.4]}>
        <div className="rounded-full px-2.5 py-1 border-2 bg-sky-100 border-sky-200 text-sky-900 font-display font-bold text-[12px]">⛵ Mapa</div>
      </Placa>
    </group>
  )
}

// ——— Vegetación ———
function Vegetacion({ props, terrain }) {
  return props.map((p, i) => {
    const pos = [p.x, terrain.height(p.x, p.z) - 0.02, p.z]
    const k = { position: pos, seed: p.seed }
    switch (p.kind) {
      case 'pine': return <Pine {...k} key={i} scale={p.scale * 2.4} />
      case 'round': return <RoundTree {...k} key={i} scale={p.scale * 2.4} />
      case 'palm': return <Palm {...k} key={i} scale={p.scale * 2.6} />
      case 'bush': return <Bush {...k} key={i} scale={p.scale * 2.2} />
      case 'deadtree': return <DeadTree {...k} key={i} scale={p.scale * 2.2} />
      case 'crystal': return <Crystal {...k} key={i} scale={p.scale * 1.2} />
      default: return <Rock key={i} position={[pos[0], pos[1] + 0.1, pos[2]]} seed={p.seed} scale={p.scale * 0.5} />
    }
  })
}

// ——— Bucle: entrada → física → estación cercana ———
function Bucle({ stations, obstacles, terrain }) {
  const acc = useRef(0)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { ix, iy } = inputAxes(live)
    const dir = Math.abs(ix) > 0.05 || Math.abs(iy) > 0.05 ? cameraRelative(ix, iy, live.cameraYaw) : { x: 0, z: 0 }
    live.p = stepWalker(live.p, dir, dt, obstacles, live.keys.has('shift'))
    const ground = terrain.height(live.p.x, live.p.z)
    const v = stepVertical(live.y, live.vy, ground, live.keys.has(' ') || live.jumpPad, dt)
    live.y = v.y; live.vy = v.vy; live.air = !v.onGround
    live.jumpPad = false
    setWalkSnap({ nearby: nearestStation(live.p.x, live.p.z, stations) })
    acc.current += dt
    if (acc.current > 0.1) {
      acc.current = 0
      setWalkSnap({ pos: { x: live.p.x, z: live.p.z, heading: live.p.heading } })
    }
  })
  return null
}

// ——— Cámara en tercera persona ———
function Camara({ terrain, blockers }) {
  const controls = useRef()
  const recortada = useRef(null) // distancia que eligió el jugador, si la cámara está acercada
  useFrame(({ camera }, delta) => {
    const c = controls.current
    if (!c) return
    // Si el fotograma anterior acercó la cámara por un obstáculo, se devuelve a
    // la distancia elegida antes de que OrbitControls la tome como suya.
    if (recortada.current) {
      const off = camera.position.clone().sub(c.target).setLength(recortada.current)
      camera.position.copy(c.target).add(off)
      recortada.current = null
    }
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 8)
    const gx = live.p.x, gy = live.y + 1.3, gz = live.p.z
    const nx = c.target.x + (gx - c.target.x) * k
    const ny = c.target.y + (gy - c.target.y) * k
    const nz = c.target.z + (gz - c.target.z) * k
    camera.position.x += nx - c.target.x
    camera.position.y += ny - c.target.y
    camera.position.z += nz - c.target.z
    c.target.set(nx, ny, nz)
    c.update()
    live.cameraYaw = Math.atan2(camera.position.x - c.target.x, camera.position.z - c.target.z)

    // Colisión: acercar si algo se cruza, y nunca por debajo del suelo.
    const off = camera.position.clone().sub(c.target)
    const dist = off.length()
    const hd = Math.hypot(off.x, off.z)
    if (hd > 1e-3) {
      const libre = cameraClear(c.target.x, c.target.z, off.x / hd, off.z / hd, hd, blockers)
      if (libre < hd - 0.01) {
        recortada.current = dist
        camera.position.copy(c.target).add(off.multiplyScalar(libre / hd))
      }
    }
    const suelo = terrain.height(camera.position.x, camera.position.z) + 0.45
    if (camera.position.y < suelo) camera.position.y = suelo
  })
  return (
    <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping dampingFactor={0.12}
      minDistance={2.5} maxDistance={16} minPolarAngle={0.3} maxPolarAngle={1.45} rotateSpeed={0.6} />
  )
}

export default function WalkCanvas({ world, shape, color, stations, props, obstacles, terrain, avatar }) {
  const { resuelto } = useTema()
  const escena = escenaDe(resuelto)
  const [dpr, setDpr] = useState(1.5)
  const nearby = useWalk(st => st.nearby)
  const navigate = useNavigate()
  const path = useMemo(() => pathPoints(stations), [stations])
  const blockers = useMemo(() => cameraBlockers(props, obstacles), [props, obstacles])
  useMoveKeys(live, EXTRA)

  useEffect(() => () => saveWalker(world.slug), [world.slug])

  const p = live.p
  const onClickStation = (s) => {
    if (getWalkSnap().nearby === s.id && s.unlocked) navigate(s.to)
  }

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      camera={{ position: [p.x, 5, p.z + 8], fov: 55, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <PerformanceMonitor onChange={({ factor }) => setDpr(Math.round((1 + factor) * 10) / 10)} />
      <fog attach="fog" args={[escena.niebla, 30, 85]} />
      <SkyDome cielo={escena.cielo} radius={150} />
      <Lighting escena={escena} />
      <Ocean color={escena.oceano} size={[260, 260]} segments={[80, 80]} position={[0, -0.9, 0]} />
      <Terreno terrain={terrain} />
      <Rasgos terrain={terrain} />
      <Camino points={path} terrain={terrain} />
      <Monumento shape={shape} color={color} terrain={terrain} />
      <Vegetacion props={props} terrain={terrain} />
      {stations.map((s, i) => {
        if (s.kind === 'level') return <group key={s.id} onClick={() => onClickStation(s)}><Estacion s={s} color={color} terrain={terrain} nearby={nearby === s.id} /></group>
        if (s.kind === 'boss') return <group key={s.id} onClick={() => onClickStation(s)}><PuertaJefe s={s} terrain={terrain} /></group>
        if (s.kind === 'quest') return <group key={s.id} onClick={() => onClickStation(s)}><Npc s={s} i={i} terrain={terrain} /></group>
        return <Muelle key={s.id} s={s} terrain={terrain} />
      })}
      <Character state={() => ({ x: live.p.x, y: live.y, z: live.p.z, heading: live.p.heading, speed: live.p.speed, air: live.air })} emoji={avatar} />
      <Bucle stations={stations} obstacles={obstacles} terrain={terrain} />
      <Camara terrain={terrain} blockers={blockers} />
      <Suspense fallback={null}><Effects bloom={0.45} /></Suspense>
    </Canvas>
  )
}
