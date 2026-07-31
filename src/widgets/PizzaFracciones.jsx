import { useState } from 'react'

const R = 46
const CX = 50
const CY = 50

// Punto del borde para un ángulo dado (empezando arriba y girando en sentido horario).
function borde(fraccion) {
  const ang = fraccion * 2 * Math.PI - Math.PI / 2
  return [CX + R * Math.cos(ang), CY + R * Math.sin(ang)]
}

function porcion(i, total) {
  const [x1, y1] = borde(i / total)
  const [x2, y2] = borde((i + 1) / total)
  const largo = 1 / total > 0.5 ? 1 : 0
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largo} 1 ${x2} ${y2} Z`
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

// Una fracción dibujada como pizza: ver los trozos hace concreto lo que el
// numerador y el denominador significan, y que 2/4 y 1/2 son lo mismo.
export default function PizzaFracciones() {
  const [den, setDen] = useState(8)
  const [num, setNum] = useState(3)

  const numClamp = Math.min(num, den)
  const divisor = gcd(numClamp, den) || 1
  const simplificada = `${numClamp / divisor}/${den / divisor}`
  const decimal = (numClamp / den).toFixed(2).replace(/\.?0+$/, '')

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-40 h-40 shrink-0" role="img" aria-label={`Pizza con ${numClamp} de ${den} porciones`}>
        {Array.from({ length: den }, (_, i) => (
          <path key={i} d={porcion(i, den)}
            fill={i < numClamp ? '#f59e0b' : '#f3f4f6'}
            stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="flex-1 w-full">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium mb-1">Trozos que te comes</label>
            <input type="number" min={0} max={den} value={numClamp}
              onChange={e => setNum(Math.max(0, Math.min(den, Math.round(Number(e.target.value)) || 0)))}
              className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Trozos en total</label>
            <input type="number" min={2} max={12} value={den}
              onChange={e => { const d = Math.max(2, Math.min(12, Math.round(Number(e.target.value)) || 2)); setDen(d); setNum(n => Math.min(n, d)) }}
              className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none" />
          </div>
        </div>

        <div className="mt-4 p-4 glass rounded-xl">
          <p className="text-2xl font-bold text-amber-700 text-center tabular-nums">{numClamp}/{den}</p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>{numClamp}</strong> (numerador) es lo que te comes.<br />
            <strong>{den}</strong> (denominador) es en cuántos trozos partiste la pizza.
          </p>
          <p className="text-sm mt-2">
            Es lo mismo que <strong className="text-emerald-700">{simplificada}</strong>
            {simplificada !== `${numClamp}/${den}` && <span className="text-gray-500"> (la misma pizza, contada con trozos más grandes)</span>}
            {' · '}en decimal: <strong>{decimal}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
