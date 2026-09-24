import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { texture } from './textures'
import { Pine, RoundTree, Bush, Rock, Palm, DeadTree, Crystal } from './Vegetation'
import { BIOMAS, biomaDe } from './walk/biomes'

// Isla del mapa bajo cada mundo: acantilado de roca con relieve, playa de
// arena, pradera ondulada con textura de hierba y un anillo de espuma en el
// agua. Procedural y determinista por id (sin assets, sin aleatoriedad entre
// renders).

function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GRASS_LOCKED = '#a7b5ad'

// Pradera: disco con anillos interiores (RingGeometry) para poder ondularlo.
function praderaGeo(seed) {
  const g = new THREE.RingGeometry(0.0001, 1.1, 48, 10)
  g.rotateX(-Math.PI / 2)
  const p = g.attributes.position
  const colors = new Float32Array(p.count * 3)
  const base = new THREE.Color('#ffffff')
  const s = seed % 100
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i)
    const r = Math.hypot(x, z) / 1.1
    const a = Math.atan2(z, x)
    // Contorno irregular y lomas suaves que se aplanan hacia la orilla.
    const borde = 1 + 0.05 * Math.sin(a * 5 + s) + 0.03 * Math.cos(a * 9 + s)
    p.setX(i, x * borde); p.setZ(i, z * borde)
    const loma = (Math.sin(x * 3.1 + s) * Math.cos(z * 2.7 + s * 0.5) * 0.06 + 0.04) * (1 - r * r)
    p.setY(i, loma)
    const k = 0.85 + loma * 2.5
    colors.set([base.r * k, base.g * k, base.b * k], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

function acantiladoGeo(seed) {
  const g = new THREE.CylinderGeometry(1.1, 0.62, 0.95, 40, 5)
  const p = g.attributes.position
  const s = seed % 100
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const a = Math.atan2(z, x)
    const v = 1 + 0.07 * Math.sin(a * 5 + s) + 0.05 * Math.cos(a * 11 + y * 6) + 0.03 * Math.sin(a * 23 + y * 13)
    p.setXYZ(i, x * v, y, z * v)
  }
  g.computeVertexNormals()
  return g
}

// Detalles en miniatura que delatan el bioma desde el barco.
function Miniatura({ bioma, locked }) {
  if (locked) return null
  switch (bioma) {
    case 'volcan':
      return [0.4, 2.3, 4.1].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.72, 0.2, Math.sin(a) * 0.72]} rotation={[-Math.PI / 2, 0, a]}>
          <planeGeometry args={[0.5, 0.07]} />
          <meshStandardMaterial color="#ff7a1a" emissive="#ff3d00" emissiveIntensity={2} />
        </mesh>
      ))
    case 'cordillera':
      return [[0.7, 0.3], [-0.6, 0.55], [0.2, -0.78]].map(([x, z], i) => (
        <group key={i} position={[x, 0.18, z]}>
          <mesh castShadow><coneGeometry args={[0.22, 0.5, 7]} /><meshStandardMaterial color="#8d8a86" flatShading /></mesh>
          <mesh position={[0, 0.17, 0]}><coneGeometry args={[0.09, 0.17, 7]} /><meshStandardMaterial color="#f8fafc" flatShading /></mesh>
        </group>
      ))
    case 'setos':
      return [0.6, 2.2, 3.9, 5.3].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.8, 0.26, Math.sin(a) * 0.8]} rotation={[0, -a, 0]} castShadow>
          <boxGeometry args={[0.08, 0.14, 0.42]} />
          <meshStandardMaterial color="#2f6f3a" roughness={0.9} />
        </mesh>
      ))
    case 'plaza':
      return [[0.72, 0.35, '#ef4444'], [-0.6, -0.55, '#3b82f6']].map(([x, z, c], i) => (
        <group key={i} position={[x, 0.2, z]}>
          <mesh position={[0, 0.07, 0]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.14, 12]} /><meshStandardMaterial color="#fff7ed" /></mesh>
          <mesh position={[0, 0.2, 0]} castShadow><coneGeometry args={[0.16, 0.14, 12]} /><meshStandardMaterial color={c} /></mesh>
        </group>
      ))
    case 'dunas':
      return (
        <mesh position={[-0.55, 0.2, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 20]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.1} />
        </mesh>
      )
    default:
      return null
  }
}

export default function Island({ nodeId, locked = false }) {
  const seed = hashSeed(nodeId)
  const biomaId = biomaDe(nodeId)
  const bioma = BIOMAS[biomaId]

  const deco = useMemo(() => {
    const rand = mulberry32(seed)
    const kinds = bioma.mix
    const items = []
    const n = 9 + Math.floor(rand() * 4)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const r = 0.72 + rand() * 0.28
      items.push({
        kind: kinds[Math.floor(rand() * kinds.length)],
        pos: [Math.cos(a) * r, 0.2, Math.sin(a) * r],
        s: 0.55 + rand() * 0.45,
        seed: rand(),
      })
    }
    return items
  }, [seed, bioma])

  const geos = useMemo(() => ({ pradera: praderaGeo(seed), acantilado: acantiladoGeo(seed) }), [seed])
  useEffect(() => () => { geos.pradera.dispose(); geos.acantilado.dispose() }, [geos])

  const tex = useMemo(() => ({
    grass: texture('grass', 1.5),
    rock: texture('rock', 2),
    sand: texture('sand', 2),
  }), [])

  return (
    <group>
      {/* Acantilado de roca que se hunde en el agua */}
      <mesh geometry={geos.acantilado} position={[0, -0.33, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.rock} bumpMap={tex.rock} bumpScale={2} color={locked ? '#9a958f' : bioma.acantilado} roughness={0.95} />
      </mesh>
      {/* Playa */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.16, 1.14, 0.08, 48]} />
        <meshStandardMaterial map={tex.sand} color={locked ? '#c9c4b5' : bioma.arena} roughness={1} />
      </mesh>
      {/* Pradera ondulada */}
      <mesh geometry={geos.pradera} position={[0, 0.15, 0]} receiveShadow>
        <meshStandardMaterial map={biomaId === 'volcan' || biomaId === 'crateres' ? tex.rock : tex.grass} vertexColors color={locked ? GRASS_LOCKED : bioma.pradera} roughness={0.95} />
      </mesh>
      {/* Espuma y agua somera alrededor */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.32, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.9, 48]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {deco.map((d, i) => {
        const props = { position: d.pos, seed: d.seed, muted: locked }
        if (d.kind === 'pine') return <Pine key={i} {...props} scale={d.s * 0.7} />
        if (d.kind === 'round') return <RoundTree key={i} {...props} scale={d.s * 0.65} />
        if (d.kind === 'bush') return <Bush key={i} {...props} scale={d.s} />
        if (d.kind === 'palm') return <Palm key={i} {...props} scale={d.s * 0.6} />
        if (d.kind === 'deadtree') return <DeadTree key={i} {...props} scale={d.s * 0.7} />
        if (d.kind === 'crystal') return <Crystal key={i} {...props} scale={d.s * 0.4} />
        return <Rock key={i} position={[d.pos[0], 0.2, d.pos[2]]} scale={d.s * 0.12} seed={d.seed} />
      })}
      <Miniatura bioma={biomaId} locked={locked} />
    </group>
  )
}
