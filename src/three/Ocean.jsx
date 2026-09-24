import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { texture } from './textures'

// Océano: plano con oleaje suave de vértices y dos capas de normal map que se
// desplazan en direcciones distintas, así el brillo del sol "se mueve" sobre el
// agua como en un mar de verdad. Procedural y offline. Estático si animate=false.
export default function Ocean({ animate = true, color = '#3fa7e0', onClick, size = [110, 80], position = [-1, -0.55, -2], segments = [110, 80] }) {
  const geoRef = useRef()
  const normal = useMemo(() => texture('waterNormal', 22), [])
  const normal2 = useMemo(() => texture('waterNormal', 13), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!animate) return
    normal.offset.set(t * 0.012, t * 0.008)
    normal2.offset.set(-t * 0.007, t * 0.011)
    const geo = geoRef.current
    if (!geo) return
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, Math.sin(x * 0.35 + t * 0.7) * Math.cos(y * 0.28 + t * 0.55) * 0.055 + Math.sin(x * 1.3 - y * 0.8 + t * 0.45) * 0.018)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={position} onClick={onClick}>
      <planeGeometry ref={geoRef} args={[...size, ...segments]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.12}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.08}
        clearcoatNormalMap={normal2}
        normalMap={normal}
        normalScale={[0.16, 0.16]}
        clearcoatNormalScale={[0.25, 0.25]}
        transparent
        opacity={0.93}
      />
    </mesh>
  )
}
