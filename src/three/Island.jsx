import { useEffect, useMemo } from 'react'
import { CylinderGeometry } from 'three'

// Isla de terreno low-poly bajo cada mundo. Procedural y determinista por id
// (sin assets, sin aleatoriedad entre renders). Flat-shading estilo juego.

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

const GRASS = ['#739568', '#88a575', '#649480']
const GRASS_LOCKED = '#9fb3a9'
const ROCK = '#8d7b6a'
const ROCK_LOCKED = '#8a8580'

export default function Island({ nodeId, locked = false }) {
  const { grass, deco } = useMemo(() => {
    const rand = mulberry32(hashSeed(nodeId))
    const grassColor = GRASS[Math.floor(rand() * GRASS.length)]
    const items = []
    const n = 5 + Math.floor(rand() * 3) // 5-7 adornos por isla
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const r = 0.85 + rand() * 0.2
      items.push({
        kind: rand() < 0.6 ? 'tree' : 'rock',
        pos: [Math.cos(a) * r, 0.27, Math.sin(a) * r],
        s: 0.7 + rand() * 0.5,
      })
    }
    return { grass: grassColor, deco: items }
  }, [nodeId])

  const terrain = useMemo(() => {
    const geometry = new CylinderGeometry(1.08, 0.68, 0.9, 32, 4)
    const positions = geometry.attributes.position
    const seed = hashSeed(nodeId) % 100
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i)
      const angle = Math.atan2(z, x)
      const variation = 1 + 0.07 * Math.sin(angle * 5 + seed) + 0.04 * Math.cos(angle * 9 + y * 4)
      positions.setXYZ(i, x * variation, y, z * variation)
    }
    geometry.computeVertexNormals()
    return geometry
  }, [nodeId])

  useEffect(() => () => terrain.dispose(), [terrain])

  const grassColor = locked ? GRASS_LOCKED : grass
  const rockColor = locked ? ROCK_LOCKED : ROCK

  return (
    <group>
      {/* Base rocosa que se hunde en el agua */}
      <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
        <primitive object={terrain} attach="geometry" />
        <meshStandardMaterial color={rockColor} roughness={0.9} flatShading />
      </mesh>
      {/* Tapa de pasto */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.12, 1.08, 0.24, 32]} />
        <meshStandardMaterial color={grassColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <cylinderGeometry args={[1.18, 1.13, 0.12, 32]} />
        <meshStandardMaterial color={locked ? '#aaa99a' : '#d8c49c'} roughness={0.95} />
      </mesh>
      {/* Orilla: anillo de agua poco profunda */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.025, 48]} />
        <meshStandardMaterial color="#9fd9f6" transparent opacity={0.18} depthWrite={false} roughness={0.4} />
      </mesh>
      {/* Adornos: arbolitos y rocas */}
      {deco.map((d, i) => d.kind === 'tree' ? (
        <group key={i} position={d.pos} scale={d.s}>
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.06, 0.18, 6]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.34, 0]} castShadow>
            <coneGeometry args={[0.19, 0.48, 12]} />
            <meshStandardMaterial color={locked ? '#7f8c83' : '#3e8e4e'} roughness={0.9} />
          </mesh>
        </group>
      ) : (
        <mesh key={i} position={d.pos} scale={d.s * 0.5}>
          <dodecahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}
