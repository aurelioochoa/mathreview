import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Theme, Point, Line } from 'mafs'
import MathTex from '../components/MathTex'

export default function ParabolaExplorer() {
  const [a, setA] = useState(1)
  const [bCoef, setBCoef] = useState(6)
  const [c, setC] = useState(2)

  const vertice = useMemo(() => {
    const h = -bCoef / (2 * a)
    const k = a * h * h + bCoef * h + c
    return { h, k }
  }, [a, bCoef, c])

  const discriminante = bCoef * bCoef - 4 * a * c
  const raices = useMemo(() => {
    if (a === 0) return []
    if (discriminante < 0) return []
    const sqrtD = Math.sqrt(discriminante)
    const x1 = (-bCoef + sqrtD) / (2 * a)
    const x2 = (-bCoef - sqrtD) / (2 * a)
    if (discriminante === 0) return [x1]
    return [x1, x2]
    // `c` ya está contenido en `discriminante`; no hace falta como dependencia.
  }, [a, bCoef, discriminante])

  return (
    <div>
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-xs font-bold text-violet-700 mb-1">a = {a}</label>
          <input type="range" min={-3} max={3} step={0.5} value={a}
            onChange={e => setA(Number(e.target.value) || 0.5)}
            className="w-36 accent-violet-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-violet-700 mb-1">b = {bCoef}</label>
          <input type="range" min={-10} max={10} step={1} value={bCoef}
            onChange={e => setBCoef(Number(e.target.value))}
            className="w-36 accent-violet-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-violet-700 mb-1">c = {c}</label>
          <input type="range" min={-10} max={10} step={1} value={c}
            onChange={e => setC(Number(e.target.value))}
            className="w-36 accent-violet-500" />
        </div>
      </div>

      <div className="text-center mb-3 text-sm">
        <MathTex expr={`f(x) = ${a === 1 ? '' : (a === -1 ? '-' : a)}x^2 ${bCoef >= 0 ? '+' : '-'} ${Math.abs(bCoef)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`} />
      </div>

      {a !== 0 && (
        <div className="glass rounded-xl overflow-hidden border">
          <Mafs viewBox={{ x: [-10, 10], y: [-10, 10] }} height={400}>
            <Coordinates.Cartesian />
            <Plot.OfX y={(x) => a * x * x + bCoef * x + c} color={Theme.violet} />
            <Point x={vertice.h} y={vertice.k} color={Theme.red} />
            <Line.Segment point1={[vertice.h, -10]} point2={[vertice.h, 10]} color={Theme.red} opacity={0.3} style="dashed" />
            {raices.map((r, i) => (
              <Point key={i} x={r} y={0} color={Theme.green} />
            ))}
          </Mafs>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-center">
        <div className="bg-red-50 rounded p-2">
          <strong>Vértice</strong><br />
          ({vertice.h.toFixed(2)}, {vertice.k.toFixed(2)})
        </div>
        <div className="bg-blue-50 rounded p-2">
          <strong>Eje de simetría</strong><br />
          x = {vertice.h.toFixed(2)}
        </div>
        <div className="bg-green-50 rounded p-2">
          <strong>Raíces</strong><br />
          {raices.length === 0 ? 'No tiene (Δ < 0)' :
           raices.length === 1 ? `x = ${raices[0].toFixed(2)} (doble)` :
           `x₁ = ${raices[0].toFixed(2)}, x₂ = ${raices[1].toFixed(2)}`}
        </div>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">
        Discriminante: Δ = {discriminante.toFixed(2)} → {discriminante > 0 ? '2 raíces reales' : discriminante === 0 ? '1 raíz doble' : 'sin raíces reales'}
      </p>
    </div>
  )
}
