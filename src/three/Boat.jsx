import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { live } from './explorerStore'
import { texture } from './textures'

// El velero del jugador. El casco se construye por secciones (como la
// plantilla de un astillero): manga ancha en popa, proa afilada, quilla que
// sube hacia la proa y arrufo en la cubierta. Pintura antiincrustante bajo la
// flotación, franja azul y obra muerta blanca; cubierta de tablones, cabina
// con ojos de buey, mástil con botavara, mayor y foque con bolsa, jarcia,
// candeleros y una bandera que ondea. La física vive en explorerLogic; aquí
// solo se pinta donde diga `live.boat`, con cabeceo según la velocidad.

const L = 1.5      // eslora
const B = 0.52     // manga
const D = 0.34     // puntal
const WAKE = 8

// Semimanga y cotas de una sección a lo largo de la eslora (t: 0 popa, 1 proa).
function seccion(t) {
  const semimanga = (B / 2) * Math.pow(Math.max(0, 1 - Math.pow(t, 2.6)), 0.55) * (0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, t + 0.35)))
  const cubierta = 0.06 * t * t                    // arrufo: la proa sube
  const fondo = -D + 0.22 * Math.pow(t, 2.2)       // la quilla sube hacia la proa
  return { semimanga, cubierta, fondo }
}

function cascoGeo() {
  const N = 28, M = 16
  const pos = [], col = [], idx = []
  const rojo = new THREE.Color('#9f1d1d'), azul = new THREE.Color('#1e3a8a'), blanco = new THREE.Color('#f8fafc')
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const { semimanga, cubierta, fondo } = seccion(t)
    const z = (t - 0.5) * L
    for (let j = 0; j <= M; j++) {
      const th = -Math.PI / 2 + (j / M) * Math.PI
      const x = semimanga * Math.sin(th)
      const k = Math.pow(Math.cos(th), 0.7)
      const y = cubierta + (fondo - cubierta) * k
      pos.push(x, y, z)
      const c = y < -0.13 ? rojo : y < -0.09 ? azul : blanco
      col.push(c.r, c.g, c.b)
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j, b = a + M + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  // Espejo de popa: abanico cerrando la primera sección.
  const c0 = pos.length / 3
  const { cubierta: cub0 } = seccion(0)
  pos.push(0, cub0 - 0.05, -L / 2)
  col.push(1, 1, 1)
  for (let j = 0; j < M; j++) idx.push(c0, j + 1, j)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function cubiertaGeo() {
  const N = 28
  const pos = [], uv = [], idx = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const { semimanga, cubierta } = seccion(t)
    const z = (t - 0.5) * L
    const w = semimanga * 0.97
    // Tres puntos por fila: babor, crujía (con bombeo) y estribor.
    pos.push(-w, cubierta + 0.004, z, 0, cubierta + 0.018, z, w, cubierta + 0.004, z)
    uv.push(0, t * 4, 0.5, t * 4, 1, t * 4)
  }
  for (let i = 0; i < N; i++) {
    const a = i * 3
    idx.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// Vela triangular con bolsa: puño de amura, de driza y de escota.
function velaGeo(amura, driza, escota, bolsa = 0.07, lado = 1) {
  const U = 10, V = 12
  const pos = [], idx = []
  const A = new THREE.Vector3(...amura), P = new THREE.Vector3(...driza), E = new THREE.Vector3(...escota)
  for (let v = 0; v <= V; v++) {
    const fv = v / V
    const izq = A.clone().lerp(P, fv)       // grátil
    const der = E.clone().lerp(P, fv)       // baluma
    for (let u = 0; u <= U; u++) {
      const fu = u / U
      const p = izq.clone().lerp(der, fu)
      p.x += lado * bolsa * Math.sin(Math.PI * fu) * (1 - fv * 0.85)
      pos.push(p.x, p.y, p.z)
    }
  }
  for (let v = 0; v < V; v++) {
    for (let u = 0; u < U; u++) {
      const a = v * (U + 1) + u, b = a + U + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// Cabo recto entre dos puntos.
function Cabo({ a, b, r = 0.005, color = '#475569' }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b)
    const d = Bv.clone().sub(A)
    return {
      pos: A.clone().add(Bv).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()),
      len: d.length(),
    }
  }, [a, b])
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 5]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

const MASTIL_Z = 0.12
const MASTIL_H = 1.45

// El velero en sí, sin física: lo usan el barco del mapa y el embarcadero de
// cada isla. `speed()` da la velocidad para el cabeceo y la escora.
export function Velero({ animate = true, speed = () => 0 }) {
  const body = useRef()
  const bandera = useRef()
  const vela = useRef()
  const geos = useMemo(() => {
    const cub = seccion(0.5).cubierta
    const baseMastil = [0, cub + 0.02, MASTIL_Z]
    const tope = [0, cub + MASTIL_H, MASTIL_Z]
    const botavara = [0, cub + 0.2, MASTIL_Z - 0.62]
    const proa = [0, seccion(1).cubierta + 0.03, L / 2 - 0.02]
    return {
      casco: cascoGeo(),
      cubierta: cubiertaGeo(),
      mayor: velaGeo([0.012, cub + 0.22, MASTIL_Z - 0.02], [0.012, cub + MASTIL_H - 0.05, MASTIL_Z - 0.02], [0.012, cub + 0.22, MASTIL_Z - 0.6], 0.09, 1),
      foque: velaGeo([0, proa[1] + 0.05, proa[2] - 0.04], [0, cub + MASTIL_H * 0.82, MASTIL_Z + 0.03], [-0.02, cub + 0.2, MASTIL_Z + 0.12], 0.06, -1),
      puntos: { baseMastil, tope, botavara, proa, popa: [0, seccion(0).cubierta + 0.04, -L / 2 + 0.03] },
      cub,
    }
  }, [])
  useEffect(() => () => { Object.values(geos).forEach(g => g?.dispose?.()) }, [geos])

  const madera = useMemo(() => texture('wood', 1), [])
  const tablones = useMemo(() => {
    const t = texture('wood', 1)
    t.repeat.set(3, 1)
    return t
  }, [])
  const metal = useMemo(() => texture('metal', 1), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const s = speed() / 4.2
    if (body.current) {
      body.current.position.y = 0.07 + (animate ? Math.sin(t * 2.2) * 0.035 + 0.02 * s : 0)
      body.current.rotation.x = animate ? -0.07 * s + Math.sin(t * 1.7) * 0.025 : 0
      // Escora: al navegar el viento tumba un poco el barco.
      body.current.rotation.z = animate ? Math.sin(t * 1.3) * 0.04 + 0.1 * s : 0
    }
    if (bandera.current && animate) bandera.current.rotation.y = Math.sin(t * 6) * 0.35 + 0.2
    if (vela.current && animate) vela.current.rotation.y = -0.15 - 0.2 * s + Math.sin(t * 0.8) * 0.03
  })

  const { puntos: p, cub } = geos
  return (
    <>
        {/* La franja de flotación (y ≈ -0.11) queda a ras del agua. */}
        <group ref={body} position={[0, 0.07, 0]} scale={0.8}>
          {/* Casco y cubierta */}
          <mesh geometry={geos.casco} castShadow receiveShadow>
            <meshPhysicalMaterial vertexColors roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={geos.cubierta} receiveShadow>
            <meshStandardMaterial map={tablones} color="#e7c79b" roughness={0.8} />
          </mesh>
          {/* Candeleros y guardamancebos */}
          {[-1, 1].flatMap(lado => [-0.5, -0.25, 0, 0.25].map(z => {
            const w = seccion(z / L + 0.5).semimanga * 0.9
            return (
              <mesh key={`${lado}${z}`} position={[lado * w, cub + 0.08, z]}>
                <cylinderGeometry args={[0.004, 0.004, 0.12, 4]} />
                <meshStandardMaterial map={metal} color="#e2e8f0" metalness={0.9} roughness={0.25} />
              </mesh>
            )
          }))}
          {/* Cabina con ojos de buey */}
          <group position={[0, cub + 0.08, -0.2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.28, 0.14, 0.4]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[0.3, 0.025, 0.42]} />
              <meshStandardMaterial map={madera} color="#c69c6d" roughness={0.6} />
            </mesh>
            {[-1, 1].flatMap(lado => [-0.1, 0.06].map(z => (
              <mesh key={`${lado}${z}`} position={[lado * 0.141, 0.01, z]} rotation={[0, lado * Math.PI / 2, 0]}>
                <circleGeometry args={[0.025, 14]} />
                <meshPhysicalMaterial color="#1e3a5f" roughness={0.05} metalness={0.3} clearcoat={1} />
              </mesh>
            )))}
            {/* Tambucho */}
            <mesh position={[0, 0.02, 0.201]}>
              <planeGeometry args={[0.1, 0.1]} />
              <meshStandardMaterial map={madera} color="#8a6a4a" />
            </mesh>
          </group>
          {/* Timón en popa */}
          <mesh position={[0, cub + 0.1, -L / 2 + 0.14]} rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.05, 0.007, 6, 16]} />
            <meshStandardMaterial map={madera} color="#8a6a4a" />
          </mesh>
          {/* Mástil y botavara */}
          <mesh position={[0, cub + MASTIL_H / 2, MASTIL_Z]} castShadow>
            <cylinderGeometry args={[0.011, 0.017, MASTIL_H, 8]} />
            <meshStandardMaterial map={metal} color="#d1d5db" metalness={0.85} roughness={0.3} />
          </mesh>
          <group ref={vela} position={[0, 0, MASTIL_Z]}>
            <group position={[0, 0, -MASTIL_Z]}>
              <mesh position={[0, cub + 0.2, MASTIL_Z - 0.31]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.62, 6]} />
                <meshStandardMaterial map={metal} color="#9ca3af" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh geometry={geos.mayor} castShadow>
                <meshStandardMaterial color="#fbfaf5" side={THREE.DoubleSide} roughness={0.85} />
              </mesh>
            </group>
          </group>
          <mesh geometry={geos.foque} castShadow>
            <meshStandardMaterial color="#f5f3ea" side={THREE.DoubleSide} roughness={0.85} />
          </mesh>
          {/* Jarcia: estay de proa, backstay y obenques */}
          <Cabo a={p.tope} b={p.proa} />
          <Cabo a={p.tope} b={p.popa} />
          <Cabo a={p.tope} b={[0.22, cub + 0.03, MASTIL_Z - 0.05]} />
          <Cabo a={p.tope} b={[-0.22, cub + 0.03, MASTIL_Z - 0.05]} />
          {/* Grímpola en el tope */}
          <group ref={bandera} position={[0, cub + MASTIL_H + 0.01, MASTIL_Z]}>
            <mesh position={[0, -0.03, -0.07]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.14, 0.07]} />
              <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.25} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
    </>
  )
}

export default function Boat({ animate = true }) {
  const root = useRef()
  const wake = useRef([])
  const wakeState = useRef(Array.from({ length: WAKE }, () => ({ x: 0, z: 0, age: 1 })))
  const wakeTimer = useRef(0)
  const wakeIdx = useRef(0)

  useFrame((_, dt) => {
    const b = live.boat
    if (!root.current) return
    root.current.position.set(b.x, -0.5, b.z)
    root.current.rotation.y = b.heading
    // Estela: suelta un anillo cada poco mientras avanza.
    wakeTimer.current += dt
    if (b.speed > 0.6 && wakeTimer.current > 0.11) {
      wakeTimer.current = 0
      const w = wakeState.current[wakeIdx.current]
      w.x = b.x - Math.sin(b.heading) * 0.8
      w.z = b.z - Math.cos(b.heading) * 0.8
      w.age = 0
      wakeIdx.current = (wakeIdx.current + 1) % WAKE
    }
    wakeState.current.forEach((w, i) => {
      w.age = Math.min(1, w.age + dt * 0.8)
      const m = wake.current[i]
      if (!m) return
      m.position.set(w.x, -0.47, w.z)
      const sc = 0.35 + w.age * 1.3
      m.scale.set(sc, sc, sc)
      m.material.opacity = (1 - w.age) * 0.5
      m.visible = w.age < 1
    })
  })

  return (
    <>
      <group ref={root}>
        <Velero animate={animate} speed={() => live.boat.speed} />
      </group>
      {Array.from({ length: WAKE }, (_, i) => (
        <mesh key={i} ref={el => { wake.current[i] = el }} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.3, 0.4, 28]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
