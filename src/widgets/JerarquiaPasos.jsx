import { useState } from 'react'

const clamp = (n) => Math.min(20, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1))

// Compara la MISMA expresión con y sin paréntesis, paso a paso. Ponerlas lado a
// lado es lo que hace evidente que el orden cambia el resultado — mucho más que
// enunciar la regla.
export default function JerarquiaPasos() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)
  const [c, setC] = useState(4)

  const sinParentesis = a + b * c
  const conParentesis = (a + b) * c

  const campo = (label, valor, set) => (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <input type="number" min={1} max={20} value={valor} onChange={e => set(clamp(Number(e.target.value)))}
        className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-violet-400 outline-none" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        {campo('a', a, setA)}
        {campo('b', b, setB)}
        {campo('c', c, setC)}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 glass rounded-xl">
          <p className="font-mono font-bold text-center text-gray-800 mb-2">{a} + {b} × {c}</p>
          <ol className="text-sm space-y-1">
            <li>1️⃣ Primero la multiplicación: <strong className="text-violet-700">{b} × {c} = {b * c}</strong></li>
            <li>2️⃣ Después la suma: {a} + {b * c}</li>
          </ol>
          <p className="text-lg font-bold text-violet-700 mt-2 text-center tabular-nums">= {sinParentesis}</p>
        </div>

        <div className="p-4 glass rounded-xl">
          <p className="font-mono font-bold text-center text-gray-800 mb-2">({a} + {b}) × {c}</p>
          <ol className="text-sm space-y-1">
            <li>1️⃣ Primero el paréntesis: <strong className="text-emerald-700">{a} + {b} = {a + b}</strong></li>
            <li>2️⃣ Después la multiplicación: {a + b} × {c}</li>
          </ol>
          <p className="text-lg font-bold text-emerald-700 mt-2 text-center tabular-nums">= {conParentesis}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-3 text-center">
        {sinParentesis === conParentesis
          ? '😮 Con estos números salen iguales. Cambia alguno y verás que casi nunca pasa.'
          : `💡 Mismos números, resultados distintos (${sinParentesis} y ${conParentesis}): los paréntesis mandan.`}
      </p>
    </div>
  )
}
