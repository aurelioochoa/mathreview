import { useMemo } from 'react'

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

const GRASS = ['#5cb85c', '#67c26f', '#54b06a']
const GRASS_LOCKED = '#9fb3a9'
const ROCK = '#8d7b6a'
const ROCK_LOCKED = '#8a8580'

export default function Island({ nodeId, locked = false }) {
  const { grass, deco } = useMemo(() => {
    const rand = mulberry32(hashSeed(nodeId))
    const grassColor = GRASS[Math.floor(rand() * GRASS.length)]
    const items = []
    const n = 2 + Math.floor(rand() * 2) // 2-3 adornos por isla
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const r = 0.72 + rand() * 0.3
      items.push({
        kind: rand() < 0.6 ? 'tree' : 'rock',
        pos: [Math.cos(a) * r, 0.27, Math.sin(a) * r],
        s: 0.7 + rand() * 0.5,
      })
    }
    return { grass: grassColor, deco: items }
  }, [nodeId])

  const grassColor = locked ? GRASS_LOCKED : grass
  const rockColor = locked ? ROCK_LOCKED : ROCK

  return (
    <group>
      {/* Base rocosa que se hunde en el agua */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[1.06, 0.62, 0.9, 7]} />
        <meshStandardMaterial color={rockColor} roughness={0.9} flatShading />
      </mesh>
      {/* Tapa de pasto */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.18, 1.02, 0.3, 7]} />
        <meshStandardMaterial color={grassColor} roughness={0.8} flatShading />
      </mesh>
      {/* Orilla: anillo de agua poco profunda */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.05, 20]} />
        <meshStandardMaterial color="#9fd9f6" transparent opacity={0.5} roughness={0.4} />
      </mesh>
      {/* Adornos: arbolitos y rocas */}
      {deco.map((d, i) => d.kind === 'tree' ? (
        <group key={i} position={d.pos} scale={d.s}>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.045, 0.06, 0.18, 6]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <coneGeometry args={[0.16, 0.42, 6]} />
            <meshStandardMaterial color={locked ? '#7f8c83' : '#3e8e4e'} roughness={0.8} flatShading />
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
