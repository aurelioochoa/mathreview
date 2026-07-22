import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Line, Theme, Text as MafsText } from 'mafs'
import MathTex from '../components/MathTex'

export default function SistemasGrafica() {
  const [a1, setA1] = useState(1)
  const [b1, setB1] = useState(-1)
  const [c1, setC1] = useState(1)
  const [a2, setA2] = useState(1)
  const [b2, setB2] = useState(1)
  const [c2, setC2] = useState(3)

  const solucion = useMemo(() => {
    const det = a1 * b2 - a2 * b1
    if (Math.abs(det) < 1e-10) return null
    const x = (c1 * b2 - c2 * b1) / det
    const y = (a1 * c2 - a2 * c1) / det
    return { x, y }
  }, [a1, b1, c1, a2, b2, c2])

  const getY1 = (x) => b1 !== 0 ? (c1 - a1 * x) / b1 : null
  const getY2 = (x) => b2 !== 0 ? (c2 - a2 * x) / b2 : null

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <p className="text-sm font-bold text-blue-600">Ecuación 1: <MathTex expr={`${a1}x + (${b1})y = ${c1}`} /></p>
          <div className="flex gap-2">
            <label className="text-xs">a₁<input type="number" value={a1} onChange={e => setA1(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
            <label className="text-xs">b₁<input type="number" value={b1} onChange={e => setB1(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
            <label className="text-xs">c₁<input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-green-600">Ecuación 2: <MathTex expr={`${a2}x + (${b2})y = ${c2}`} /></p>
          <div className="flex gap-2">
            <label className="text-xs">a₂<input type="number" value={a2} onChange={e => setA2(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
            <label className="text-xs">b₂<input type="number" value={b2} onChange={e => setB2(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
            <label className="text-xs">c₂<input type="number" value={c2} onChange={e => setC2(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden border">
        <Mafs viewBox={{ x: [-6, 6], y: [-6, 6] }} height={350}>
          <Coordinates.Cartesian />
          {b1 !== 0 && (
            <Line.ThroughPoints
              point1={[-5, getY1(-5)]}
              point2={[5, getY1(5)]}
              color={Theme.blue}
            />
          )}
          {b2 !== 0 && (
            <Line.ThroughPoints
              point1={[-5, getY2(-5)]}
              point2={[5, getY2(5)]}
              color={Theme.green}
            />
          )}
          {solucion && (
            <MafsText
              x={solucion.x}
              y={solucion.y + 0.6}
              attach="n"
              size={14}
            >
              ({solucion.x.toFixed(1)}, {solucion.y.toFixed(1)})
            </MafsText>
          )}
        </Mafs>
      </div>

      <div className="mt-3 text-center">
        {solucion ? (
          <p className="text-lg font-bold text-blue-700">
            Solución: <MathTex expr={`x = ${solucion.x.toFixed(2)},\\quad y = ${solucion.y.toFixed(2)}`} />
          </p>
        ) : (
          <p className="text-lg font-bold text-red-500">
            Las rectas son paralelas o coincidentes (determinante = 0)
          </p>
        )}
      </div>
    </div>
  )
}
