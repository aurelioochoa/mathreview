import { useState, useMemo } from 'react'

export default function BoxPlot() {
  const [input] = useState('4, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10')

  const datos = useMemo(() => {
    return input.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b)
  }, [input])

  const percentil = (p) => {
    const i = (p / 100) * (datos.length - 1)
    const lo = Math.floor(i)
    const hi = Math.ceil(i)
    if (lo === hi) return datos[lo]
    return datos[lo] + (datos[hi] - datos[lo]) * (i - lo)
  }

  const q1 = percentil(25)
  const q2 = percentil(50)
  const q3 = percentil(75)
  const min = datos[0]
  const max = datos[datos.length - 1]

  return (
    <div>
      <p className="text-sm mb-3">Datos: {datos.join(', ')}</p>

      <div className="relative h-24 mx-4 mb-6">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />

        {(() => {
          const range = max - min || 1
          const pos = (v) => `${((v - min) / range) * 100}%`
          return (
            <>
              <div className="absolute top-1/4 h-1/2 bg-pink-200 border-2 border-pink-500 rounded"
                style={{ left: pos(q1), width: `${((q3 - q1) / range) * 100}%` }} />

              <div className="absolute top-1/4 h-1/2 w-0.5 bg-pink-700"
                style={{ left: pos(q2) }} />

              <div className="absolute top-[45%] h-[10%] w-8 border-t-2 border-pink-500"
                style={{ left: `calc(${pos(min)} - 16px)` }} />
              <div className="absolute top-1/2 h-0.5 bg-pink-400"
                style={{ left: pos(min), width: `${((q1 - min) / range) * 100}%` }} />

              <div className="absolute top-[45%] h-[10%] w-8 border-t-2 border-pink-500"
                style={{ left: `calc(${pos(max)} - 16px)` }} />
              <div className="absolute top-1/2 h-0.5 bg-pink-400"
                style={{ left: pos(q3), width: `${((max - q3) / range) * 100}%` }} />

              {[
                { v: min, label: `Min=${min}` },
                { v: q1, label: `Q1=${q1}` },
                { v: q2, label: `Q2=${q2}` },
                { v: q3, label: `Q3=${q3}` },
                { v: max, label: `Max=${max}` },
              ].map(({ v, label }) => (
                <div key={label} className="absolute text-xs text-pink-700 font-semibold -translate-x-1/2"
                  style={{ left: pos(v), top: '85%' }}>
                  {label}
                </div>
              ))}
            </>
          )
        })()}
      </div>

      <div className="glass rounded-md p-3 text-sm mt-4">
        <p><strong>Interpretación del Q1 = {q1}:</strong></p>
        <ul className="list-disc pl-5 text-xs space-y-1 text-gray-600 mt-1">
          <li>El 25% de los datos son ≤ {q1}</li>
          <li>El percentil 25 es {q1}</li>
          <li>Un cuarto de los datos está por debajo de {q1}</li>
        </ul>
      </div>
    </div>
  )
}
