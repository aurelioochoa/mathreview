import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { texture } from '../textures'

// Los rasgos que hacen única a cada isla: ríos de lava que laten, setos
// recortados, cristales en los bordes de los cráteres, carpas de feria a
// rayas y farolas. La laguna no necesita malla: el terreno baja por debajo del
// nivel del mar y el océano la llena solo.

function Lava({ rios, terrain }) {
  const mat = useRef()
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 1.6 + Math.sin(clock.getElapsedTime() * 2.2) * 0.5
  })
  const geos = useMemo(() => rios.map(rio => {
    const curve = new THREE.CatmullRomCurve3(rio.pts.map(p => new THREE.Vector3(p.x, terrain.height(p.x, p.z) + 0.04, p.z)))
    return new THREE.TubeGeometry(curve, rio.pts.length * 4, 0.38, 6, false)
  }), [rios, terrain])
  return geos.map((g, i) => (
    <mesh key={i} geometry={g}>
      <meshStandardMaterial ref={i === 0 ? mat : undefined} color="#ff7a1a" emissive="#ff3d00" emissiveIntensity={1.8} roughness={0.4} />
    </mesh>
  ))
}

function Setos({ setos, terrain }) {
  const map = useMemo(() => texture('grass', 1), [])
  return setos.map((s, i) => (
    <mesh key={i} position={[s.x, terrain.height(s.x, s.z) + 0.65, s.z]} rotation={[0, s.rot, 0]} castShadow receiveShadow>
      <boxGeometry args={[s.len, 1.3, 0.7]} />
      <meshStandardMaterial map={map} color="#3f8f47" roughness={0.9} />
    </mesh>
  ))
}

function Cristales({ cristales, terrain }) {
  return cristales.map((c, i) => (
    <group key={i} position={[c.x, terrain.height(c.x, c.z), c.z]} rotation={[0, c.rot, 0]} scale={c.s}>
      {[[0, 0.45, 0, 0.18, 0.9, 0], [0.16, 0.3, 0.05, 0.12, 0.6, 0.35], [-0.14, 0.28, -0.04, 0.1, 0.55, -0.4]].map(([x, y, z, r, h, tilt], k) => (
        <mesh key={k} position={[x, y, z]} rotation={[0, 0, tilt]} castShadow>
          <cylinderGeometry args={[0, r, h, 6]} />
          <meshPhysicalMaterial color="#c4b5fd" emissive="#7c3aed" emissiveIntensity={0.9} roughness={0.1} clearcoat={1} transmission={0.2} thickness={0.4} />
        </mesh>
      ))}
    </group>
  ))
}

// Textura de rayas para las carpas (una por color, cacheada).
const rayas = new Map()
function texRayas(color) {
  if (!rayas.has(color)) {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 8
    const ctx = c.getContext('2d')
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#fff7ed' : color; ctx.fillRect(i * 16, 0, 16, 8) }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = THREE.RepeatWrapping
    rayas.set(color, t)
  }
  return rayas.get(color)
}

function Carpas({ carpas, terrain }) {
  return carpas.map((c, i) => {
    const t = texRayas(c.color)
    return (
      <group key={i} position={[c.x, terrain.height(c.x, c.z), c.z]} rotation={[0, i * 1.3, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 1.3, 1.4, 16, 1, true]} />
          <meshStandardMaterial map={t} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.95, 0]} castShadow>
          <coneGeometry args={[1.55, 1.1, 16]} />
          <meshStandardMaterial map={t} roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#44403c" />
        </mesh>
        <mesh position={[0.14, 2.85, 0]}>
          <boxGeometry args={[0.28, 0.16, 0.01]} />
          <meshStandardMaterial color={c.color} />
        </mesh>
        {/* Entrada oscura */}
        <mesh position={[0, 0.55, 1.31]}>
          <planeGeometry args={[0.7, 1.1]} />
          <meshStandardMaterial color="#1f1b2e" />
        </mesh>
      </group>
    )
  })
}

function Farolas({ farolas, terrain }) {
  const colores = ['#fde68a', '#fbcfe8', '#bae6fd']
  return farolas.map((f, i) => (
    <group key={i} position={[f.x, terrain.height(f.x, f.z), f.z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.2, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.18, 14, 10]} />
        <meshStandardMaterial color={colores[i % 3]} emissive={colores[i % 3]} emissiveIntensity={1.5} />
      </mesh>
      {/* Guirnalda de banderines hacia la siguiente */}
      <mesh position={[0, 2.05, 0]} rotation={[0, i, 0]}>
        <torusGeometry args={[0.28, 0.015, 6, 16]} />
        <meshStandardMaterial color="#f472b6" />
      </mesh>
    </group>
  ))
}

export default function Rasgos({ terrain }) {
  const f = terrain.features
  return (
    <>
      {f.lava.length > 0 && <Lava rios={f.lava} terrain={terrain} />}
      {f.setos.length > 0 && <Setos setos={f.setos} terrain={terrain} />}
      {f.cristales.length > 0 && <Cristales cristales={f.cristales} terrain={terrain} />}
      {f.carpas.length > 0 && <Carpas carpas={f.carpas} terrain={terrain} />}
      {f.farolas.length > 0 && <Farolas farolas={f.farolas} terrain={terrain} />}
    </>
  )
}
