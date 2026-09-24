import { useMemo } from 'react'
import * as THREE from 'three'
import { texture } from './textures'

// Vegetación y rocas procedurales compartidas por el mapa y la exploración a
// pie. Cada pieza admite `seed` para variar forma y color sin assets: dos
// pinos nunca son idénticos.

function rng(seed) {
  let a = Math.floor(seed * 1e6) | 0 || 1
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const HOJAS = ['#2f7a3d', '#3b8a45', '#4c9a4a', '#2e6b43']
const HOJAS_OTONO = ['#6f8f3a', '#8aa04a']

function useWood() {
  return useMemo(() => texture('wood', 1), [])
}

// Geometría irregular: un icosaedro con los vértices empujados por ruido.
function blob(detail, amp, seed) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const p = g.attributes.position
  const r = rng(seed)
  const offs = Array.from({ length: 6 }, () => r() * 6.28)
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i))
    const k = 1 + amp * (Math.sin(v.x * 3 + offs[0]) * Math.cos(v.y * 2.7 + offs[1]) + Math.sin(v.z * 3.3 + offs[2]) * 0.6)
    v.multiplyScalar(k)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export function Pine({ position, scale = 1, seed = 1, muted = false }) {
  const wood = useWood()
  const { color, rot } = useMemo(() => {
    const r = rng(seed)
    return { color: muted ? '#7f8c83' : HOJAS[Math.floor(r() * HOJAS.length)], rot: r() * 6.28 }
  }, [seed, muted])
  const tiers = 3
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.36, 7]} />
        <meshStandardMaterial map={wood} color="#9b7653" roughness={0.95} />
      </mesh>
      {Array.from({ length: tiers }, (_, i) => (
        <mesh key={i} position={[0, 0.42 + i * 0.26, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.36 - i * 0.09, 0.5 - i * 0.06, 9]} />
          <meshStandardMaterial color={color} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function RoundTree({ position, scale = 1, seed = 1, muted = false }) {
  const wood = useWood()
  const { geos, color, rot } = useMemo(() => {
    const r = rng(seed)
    return {
      geos: [0, 1, 2].map(i => blob(1, 0.12, seed + i)),
      color: muted ? '#8a978f' : [...HOJAS, ...HOJAS_OTONO][Math.floor(r() * 6)],
      rot: r() * 6.28,
    }
  }, [seed, muted])
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.09, 0.5, 7]} />
        <meshStandardMaterial map={wood} color="#9b7653" roughness={0.95} />
      </mesh>
      {[[0, 0.62, 0, 0.3], [0.16, 0.54, 0.06, 0.2], [-0.13, 0.55, -0.08, 0.22]].map(([x, y, z, s], i) => (
        <mesh key={i} geometry={geos[i]} position={[x, y, z]} scale={s} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function Palm({ position, scale = 1, seed = 1, muted = false }) {
  const wood = useWood()
  const lean = useMemo(() => (rng(seed)() - 0.5) * 0.5, [seed])
  const green = muted ? '#82978b' : '#3d8b4f'
  return (
    <group position={position} scale={scale} rotation={[0, seed * 7, lean]}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[i * 0.02, 0.1 + i * 0.18, 0]} rotation={[0, 0, -0.04 * i]} castShadow>
          <cylinderGeometry args={[0.045 - i * 0.004, 0.055 - i * 0.004, 0.2, 7]} />
          <meshStandardMaterial map={wood} color="#b08a5a" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[0.1, 0.98, 0]} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
          <mesh position={[0.26, -0.05, 0]} rotation={[0, 0, -0.35]} scale={[0.36, 0.035, 0.1]} castShadow>
            <sphereGeometry args={[1, 10, 6]} />
            <meshStandardMaterial color={green} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.1, 0.92, 0.04]} castShadow>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
    </group>
  )
}

export function Bush({ position, scale = 1, seed = 1, muted = false, flowers = true }) {
  const { geo, color, flores } = useMemo(() => {
    const r = rng(seed)
    const cols = ['#f472b6', '#facc15', '#f8fafc', '#a78bfa']
    return {
      geo: blob(1, 0.15, seed),
      color: muted ? '#8a978f' : HOJAS[Math.floor(r() * HOJAS.length)],
      flores: Array.from({ length: 5 }, () => ({
        p: [(r() - 0.5) * 0.3, 0.12 + r() * 0.08, (r() - 0.5) * 0.3],
        c: cols[Math.floor(r() * cols.length)],
      })),
    }
  }, [seed, muted])
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geo} position={[0, 0.1, 0]} scale={[0.2, 0.14, 0.2]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} flatShading />
      </mesh>
      {flowers && !muted && flores.map((f, i) => (
        <mesh key={i} position={f.p}>
          <sphereGeometry args={[0.025, 6, 4]} />
          <meshStandardMaterial color={f.c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function Rock({ position, scale = 1, seed = 1, color = '#a39a8e' }) {
  const { geo, map, rot } = useMemo(() => ({
    geo: blob(1, 0.22, seed),
    map: texture('rock', 1),
    rot: [seed * 3, seed * 5, seed * 2],
  }), [seed])
  return (
    <mesh geometry={geo} position={position} scale={[scale, scale * 0.7, scale]} rotation={rot} castShadow receiveShadow>
      <meshStandardMaterial map={map} bumpMap={map} bumpScale={1.5} color={color} roughness={0.95} flatShading />
    </mesh>
  )
}
