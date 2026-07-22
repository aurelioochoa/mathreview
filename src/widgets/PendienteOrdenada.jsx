import { useState } from 'react'
import { Mafs, Coordinates, Plot, Theme, Point } from 'mafs'
import MathTex from '../components/MathTex'

export default function PendienteOrdenada() {
  const [m, setM] = useState(2)
  const [b, setB] = useState(-1)

  return (
    <div>
      <div className="flex gap-6 mb-4 flex-wrap">
        <div>
          <label className="block text-sm font-bold text-violet-700 mb-1">
            Pendiente (m) = {m}
          </label>
          <input type="range" min={-5} max={5} step={0.5} value={m}
            onChange={e => setM(Number(e.target.value))}
            className="w-48 accent-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-violet-700 mb-1">
            Ordenada (b) = {b}
          </label>
          <input type="range" min={-5} max={5} step={0.5} value={b}
            onChange={e => setB(Number(e.target.value))}
            className="w-48 accent-violet-500" />
        </div>
      </div>

      <div className="text-center mb-3">
        <MathTex expr={`f(x) = ${m === 0 ? '' : (m === 1 ? '' : (m === -1 ? '-' : m))}${m === 0 ? '' : 'x'}${b === 0 ? (m === 0 ? '0' : '') : (b > 0 && m !== 0 ? ' + ' + b : (b < 0 ? ' - ' + Math.abs(b) : b))}`} />
      </div>

      <div className="glass rounded-xl overflow-hidden border">
        <Mafs viewBox={{ x: [-8, 8], y: [-8, 8] }} height={350}>
          <Coordinates.Cartesian />
          <Plot.OfX y={(x) => m * x + b} color={Theme.violet} />
          <Point x={0} y={b} color={Theme.violet} />
          {m !== 0 && <Point x={-b / m} y={0} color={Theme.pink} />}
        </Mafs>
      </div>

      <div className="mt-3 text-sm text-center text-gray-600">
        <p>Corte con eje Y: <strong>(0, {b})</strong></p>
        {m !== 0 && <p>Corte con eje X: <strong>({(-b / m).toFixed(2)}, 0)</strong></p>}
      </div>
    </div>
  )
}
