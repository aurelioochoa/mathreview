import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import MathTex from '../components/MathTex'
import { SOLIDOS, base, medidas, cadena, tapa, fmt } from './logic/solidos'

// Laboratorio 3D de sólidos: el prisma (o el cilindro) se gira con el ratón y
// se despliega en su red para VER de dónde salen las fórmulas: el área lateral
// es un rectángulo de perímetro × altura, y las dos bases van pegadas.

const COL_LAT_A = new THREE.Color('#818cf8')
const COL_LAT_B = new THREE.Color('#6366f1')
const COL_BASE = '#fbbf24'

function Solido({ kind, dims, h, target }) {
  const lados = useMemo(() => base(kind, dims).lados, [kind, dims])
  const n = lados.length
  const tRef = useRef(target)
  const lateral = useRef()
  const bottom = useRef()
  const top = useRef()
  const root = useRef()

  // Geometría lateral: 2 triángulos por cara, sin índices para que cada cara
  // tenga su normal plana y su color.
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 18), 3))
    const colors = new Float32Array(n * 18)
    const liso = kind === 'cyl'
    for (let i = 0; i < n; i++) {
      const c = liso ? COL_LAT_A : i % 2 ? COL_LAT_B : COL_LAT_A
      for (let v = 0; v < 6; v++) colors.set([c.r, c.g, c.b], (i * 6 + v) * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [n, kind])

  const capGeo = useMemo(() => {
    const pts = tapa(lados)
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))
    return new THREE.ShapeGeometry(shape)
  }, [lados])

  useEffect(() => () => { geo.dispose(); capGeo.dispose() }, [geo, capGeo])

  const profundidad = useMemo(() => Math.max(...tapa(lados).map(p => p[1])), [lados])
  const perimetro = lados.reduce((s, x) => s + x, 0)

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 5)
    tRef.current += (target - tRef.current) * k
    if (Math.abs(target - tRef.current) < 1e-3) tRef.current = target
    const t = tRef.current
    const pts = cadena(lados, t)
    const pos = geo.attributes.position
    for (let i = 0; i < n; i++) {
      const [x0, z0] = pts[i]
      const [x1, z1] = pts[i + 1]
      const quad = [
        [x0, 0, z0], [x1, 0, z1], [x1, h, z1],
        [x0, 0, z0], [x1, h, z1], [x0, h, z0],
      ]
      quad.forEach((p, v) => pos.setXYZ(i * 6 + v, p[0], p[1], p[2]))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    geo.computeBoundingSphere()
    if (bottom.current) bottom.current.rotation.x = -Math.PI / 2 - (Math.PI / 2) * t
    if (top.current) top.current.rotation.x = -(Math.PI / 2) * (1 - t)
    if (root.current) {
      // Centrado y escala para que quepa entero, plegado o desplegado.
      const ancho = perimetro * t + Math.max(lados[0], profundidad) * (1 - t)
      const alto = h + 2 * profundidad * t
      const s = 5 / Math.max(ancho, alto, 1e-6)
      root.current.scale.setScalar(s)
      root.current.position.set(
        -(perimetro / 2 - lados[0] / 2) * t * s,
        -(h / 2) * s,
        (profundidad / 2) * (1 - t) * s,
      )
    }
  })

  return (
    <group ref={root}>
      <mesh ref={lateral} geometry={geo} castShadow>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.55} flatShading={kind !== 'cyl'} />
      </mesh>
      <group ref={bottom}>
        <mesh geometry={capGeo}>
          <meshStandardMaterial color={COL_BASE} side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
      </group>
      <group position={[0, h, 0]}>
        <group ref={top}>
          <mesh geometry={capGeo}>
            <meshStandardMaterial color={COL_BASE} side={THREE.DoubleSide} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Slider({ label, value, min, max, step = 0.5, onChange, color = 'accent-indigo-500' }) {
  return (
    <label className="block text-xs font-bold text-gray-600">
      <span className="flex justify-between"><span>{label}</span><span className="tabular-nums text-indigo-600">{fmt(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className={`w-full ${color}`} />
    </label>
  )
}

const FORMULAS = {
  rect: { base: 'A_b = l \\cdot w', perim: 'P = 2l + 2w' },
  tri: { base: 'A_b = \\tfrac{\\sqrt{3}}{4}a^2', perim: 'P = 3a' },
  hex: { base: 'A_b = \\tfrac{3\\sqrt{3}}{2}a^2', perim: 'P = 6a' },
  cyl: { base: 'A_b = \\pi r^2', perim: 'P = 2\\pi r' },
}

export default function Solido3D({ kinds = ['rect', 'tri', 'hex'], initial = 'rect' }) {
  const [kind, setKind] = useState(initial)
  const [l, setL] = useState(4)
  const [w, setW] = useState(2.5)
  const [a, setA] = useState(3)
  const [r, setR] = useState(1.5)
  const [h, setH] = useState(3)
  const [target, setTarget] = useState(0)
  const dims = useMemo(() => ({ l, w, a, r }), [l, w, a, r])
  const m = medidas(kind, dims, h)
  const f = FORMULAS[kind]

  return (
    <div>
      {kinds.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Tipo de sólido">
          {kinds.map(k => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
              className={`btn btn-sm ${kind === k ? '' : 'btn-ghost'}`}>
              {SOLIDOS[k].icono} {SOLIDOS[k].nombre}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_16rem] gap-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-50 to-sky-100 border-2 border-indigo-100 h-72 sm:h-80">
          <Canvas camera={{ position: [4.5, 3.6, 6], fov: 45 }} dpr={[1, 1.75]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 6]} intensity={1.4} />
            <directionalLight position={[-6, 3, -4]} intensity={0.4} color="#c7d2fe" />
            <Solido kind={kind} dims={dims} h={h} target={target} />
            <gridHelper args={[12, 12, '#a5b4fc', '#e0e7ff']} position={[0, -2.3, 0]} />
            <OrbitControls enablePan={false} minDistance={4} maxDistance={14} />
          </Canvas>
          <p className="absolute top-2 left-3 text-[11px] font-semibold text-indigo-900/60 pointer-events-none">🖱️ Arrastra para girar · rueda para acercar</p>
          <div className="absolute bottom-3 inset-x-3 flex items-center gap-3">
            <button type="button" onClick={() => setTarget(target > 0.5 ? 0 : 1)} className="btn btn-sm btn-violet shrink-0">
              {target > 0.5 ? '📦 Plegar' : '📐 Desplegar red'}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={target} onChange={e => setTarget(Number(e.target.value))}
              aria-label="Grado de despliegue" className="flex-1 accent-violet-500" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="panel !rounded-2xl !border-2 p-3 space-y-2">
            {kind === 'rect' && <>
              <Slider label="Largo l" value={l} min={1} max={6} onChange={setL} />
              <Slider label="Ancho w" value={w} min={1} max={6} onChange={setW} />
            </>}
            {(kind === 'tri' || kind === 'hex') && <Slider label="Lado a" value={a} min={1} max={5} onChange={setA} />}
            {kind === 'cyl' && <Slider label="Radio r" value={r} min={0.5} max={3} step={0.25} onChange={setR} />}
            <Slider label="Altura h" value={h} min={1} max={6} onChange={setH} />
          </div>
          <div className="text-sm space-y-1.5">
            <p className="flex justify-between gap-2"><span><span className="inline-block w-3 h-3 rounded-sm bg-amber-400 mr-1 align-middle" />Área de cada base</span><strong className="tabular-nums">{fmt(m.areaBase, 2)}</strong></p>
            <p className="flex justify-between gap-2"><span>Perímetro de la base</span><strong className="tabular-nums">{fmt(m.perimetro, 2)}</strong></p>
            <p className="flex justify-between gap-2"><span><span className="inline-block w-3 h-3 rounded-sm bg-indigo-400 mr-1 align-middle" />Área lateral</span><strong className="tabular-nums">{fmt(m.lateral, 2)}</strong></p>
            <p className="flex justify-between gap-2 border-t pt-1.5"><span>Área total</span><strong className="tabular-nums text-indigo-600">{fmt(m.total, 2)}</strong></p>
            <p className="flex justify-between gap-2"><span>Volumen</span><strong className="tabular-nums text-emerald-600">{fmt(m.volumen, 2)}</strong></p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2 text-center"><MathTex expr={`${f.perim},\\quad ${f.base}`} /></div>
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2 text-center"><MathTex expr={'A_L = P\\cdot h,\\quad A_T = A_L + 2A_b,\\quad V = A_b\\cdot h'} /></div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        💡 Despliega la red: las caras laterales forman <strong>un solo rectángulo</strong> de base {fmt(m.perimetro, 2)} (el perímetro) y altura {fmt(h)}. Por eso el área lateral es perímetro × altura.
      </p>
    </div>
  )
}
