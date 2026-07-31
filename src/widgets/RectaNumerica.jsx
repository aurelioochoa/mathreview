import { useState } from 'react'

const MIN = 0
const MAX = 20
const clamp = (n) => Math.min(MAX, Math.max(MIN, Number.isFinite(n) ? Math.round(n) : MIN))
const pct = (n) => ((n - MIN) / (MAX - MIN)) * 100

// Coloca dos números en la recta y los compara. La recta hace visible por qué
// "más a la derecha" significa "mayor".
export default function RectaNumerica() {
  const [a, setA] = useState(4)
  const [b, setB] = useState(11)

  const signo = a < b ? '<' : a > b ? '>' : '='
  const frase = a === b
    ? `${a} y ${b} son el mismo número: están en el mismo punto.`
    : `${Math.max(a, b)} está más a la derecha, así que es el mayor.`

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">Primer número 🔵</label>
          <input type="number" min={MIN} max={MAX} value={a} onChange={e => setA(clamp(Number(e.target.value)))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-sky-400 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Segundo número 🟠</label>
          <input type="number" min={MIN} max={MAX} value={b} onChange={e => setB(clamp(Number(e.target.value)))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-sky-400 outline-none" />
        </div>
      </div>

      <div className="mt-8 mb-6 relative h-16">
        <div className="absolute left-0 right-0 top-8 h-1 rounded-full bg-gray-300" />
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => i + MIN).map(n => (
          <div key={n} className="absolute top-8 -translate-x-1/2" style={{ left: `${pct(n)}%` }}>
            <div className="w-px h-2 bg-gray-400" />
            {n % 5 === 0 && <span className="absolute left-1/2 -translate-x-1/2 top-3 text-[10px] text-gray-500 tabular-nums">{n}</span>}
          </div>
        ))}
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${pct(a)}%` }}>
          <span className="block text-lg">🔵</span>
          <span className="text-xs font-bold text-sky-600 tabular-nums">{a}</span>
        </div>
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${pct(b)}%` }}>
          <span className="block text-lg">🟠</span>
          <span className="text-xs font-bold text-orange-600 tabular-nums">{b}</span>
        </div>
      </div>

      <div className="p-4 glass rounded-xl">
        <p className="text-2xl font-bold text-center text-sky-700 tabular-nums">{a} {signo} {b}</p>
        <p className="text-xs text-gray-600 mt-2 text-center">💡 {frase}</p>
      </div>
    </div>
  )
}
