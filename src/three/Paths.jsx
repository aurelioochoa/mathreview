import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { worldMapNodes, pathOrder } from '../content/worldMap'
import { SPREAD } from './explorerLogic'

// Caminos punteados entre islas (piedritas sobre el agua), con waypoints de
// estrella dorada entre mundos y candado en el ramal a los teasers.

const byId = Object.fromEntries(worldMapNodes.map(n => [n.id, n]))
const DOT_Y = -0.3

function v3(id) {
  const [x, , z] = byId[id].position
  return new THREE.Vector3(x * SPREAD, DOT_Y, z * SPREAD)
}

// Midpoints rectos entre mundos consecutivos de una cadena.
function midpoints(ids) {
  const pts = []
  for (let i = 0; i < ids.length - 1; i++) {
    const a = v3(ids[i])
    const b = v3(ids[i + 1])
    pts.push([(a.x + b.x) / 2, DOT_Y + 0.03, (a.z + b.z) / 2])
  }
  return pts
}

// Puntos a lo largo de la cadena, saltando los que caen sobre una isla o waypoint.
function dotsFor(ids, avoid, gap = 0.75, clearIsland = 2.2, clearAvoid = 0.6) {
  const curve = new THREE.CatmullRomCurve3(ids.map(v3), false, 'catmullrom', 0.5)
  const count = Math.max(2, Math.floor(curve.getLength() / gap))
  const centers = ids.map(v3)
  const dots = []
  for (let i = 0; i <= count; i++) {
    const p = curve.getPoint(i / count)
    if (centers.some(c => Math.hypot(p.x - c.x, p.z - c.z) < clearIsland)) continue
    if (avoid.some(([ax, , az]) => Math.hypot(p.x - ax, p.z - az) < clearAvoid)) continue
    dots.push([p.x, p.y, p.z])
  }
  return dots
}

// Estrella de 5 puntas plana (THREE.Shape procedural, sin assets).
function starGeometry() {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.2 : 0.085
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  shape.closePath()
  return new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false })
}

function Waypoint({ position, locked = false, starGeo }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.36, 0.09, 18]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>
      {locked ? (
        <Html center distanceFactor={10} position={[0, 0.16, 0]} zIndexRange={[30, 0]}>
          <div className="pointer-events-none select-none text-base" aria-hidden="true">🔒</div>
        </Html>
      ) : (
        <mesh geometry={starGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.35} roughness={0.3} metalness={0.2} />
        </mesh>
      )}
    </group>
  )
}

export default function Paths() {
  // Ya no hay ramal bloqueado: los ocho mundos están en el camino principal.
  const { mainDots, waypoints, starGeo } = useMemo(() => {
    const wps = midpoints(pathOrder)
    return { mainDots: dotsFor(pathOrder, [...wps]), waypoints: wps, starGeo: starGeometry() }
  }, [])

  return (
    <group>
      {mainDots.map((p, i) => (
        <mesh key={`m${i}`} position={p}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
      {waypoints.map((p, i) => <Waypoint key={`w${i}`} position={p} starGeo={starGeo} />)}
    </group>
  )
}
