import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Cúpula de cielo procedural: degradado de cénit a horizonte, halo del sol y,
// de noche, estrellas. Sustituye al degradado CSS que se veía detrás del canvas
// transparente: así el cielo gira con la cámara y la niebla se funde con él.

const vertex = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
  }
`

const fragment = /* glsl */`
  uniform vec3 top;
  uniform vec3 horizon;
  uniform vec3 bottom;
  uniform vec3 sunColor;
  uniform vec3 sunDir;
  uniform float sunSize;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 col = h > 0.0 ? mix(horizon, top, pow(h, 0.6)) : mix(horizon, bottom, pow(-h, 0.4));
    float s = max(dot(vDir, normalize(sunDir)), 0.0);
    col += sunColor * (pow(s, 800.0 / sunSize) * 1.2 + pow(s, 12.0) * 0.25);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function Estrellas({ n = 700, r = 90 }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(n * 3)
    let seed = 7
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    for (let i = 0; i < n; i++) {
      const th = rand() * Math.PI * 2
      const y = 0.08 + rand() * 0.92
      const k = Math.sqrt(1 - y * y)
      pos.set([Math.cos(th) * k * r, y * r, Math.sin(th) * k * r], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [n, r])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.35} sizeAttenuation fog={false} transparent opacity={0.85} depthWrite={false} />
    </points>
  )
}

export default function SkyDome({ cielo, sunDir = [5, 14, 5], radius = 95 }) {
  const ref = useRef()
  // La cúpula viaja con la cámara: nunca se llega a su borde.
  useFrame(({ camera }) => { if (ref.current) ref.current.position.copy(camera.position) })
  const uniforms = useMemo(() => ({
    top: { value: new THREE.Color(cielo.cenit) },
    horizon: { value: new THREE.Color(cielo.horizonte) },
    bottom: { value: new THREE.Color(cielo.suelo) },
    sunColor: { value: new THREE.Color(cielo.sol) },
    sunDir: { value: new THREE.Vector3(...sunDir) },
    sunSize: { value: cielo.tamSol },
  }), [cielo, sunDir])
  return (
    <group ref={ref}>
      <mesh renderOrder={-1}>
        <sphereGeometry args={[radius, 32, 16]} />
        <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment}
          side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      {cielo.estrellas && <Estrellas r={radius * 0.95} />}
    </group>
  )
}
