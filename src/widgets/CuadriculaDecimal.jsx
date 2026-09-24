import { useState } from 'react'

// Una cuadrícula de 10 × 10 es "una unidad" partida en 100 centésimas; cada
// columna entera es una décima. Pintando casillas se ve a la vez la fracción,
// el decimal y el porcentaje. Debajo, un comparador en la recta de 0 a 1
// desmonta la trampa de "0,45 es mayor que 0,5 porque tiene más cifras".

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const dec = (n) => (n / 100).toFixed(2).replace('.', ',')

const PRESETS = [
  { label: '1/2', n: 50 }, { label: '1/4', n: 25 }, { label: '3/4', n: 75 },
  { label: '1/10', n: 10 }, { label: '0,45', n: 45 }, { label: '0,05', n: 5 },
]

// Casillas pintadas por columnas: primero décimas completas, luego sueltas.
const pintada = (n, fila, col) => col * 10 + fila < n

export default function CuadriculaDecimal() {
  const [n, setN] = useState(35)
  const [arrastrando, setArrastrando] = useState(false)
  const [a, setA] = useState(0.45)
  const [b, setB] = useState(0.5)

  const g = gcd(n, 100) || 1
  const decimas = Math.floor(n / 10)
  const centesimas = n % 10
  const fijar = (fila, col) => setN(col * 10 + fila + 1)

  return (
    <div>
      <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-start">
        <div>
          <div
            className="grid grid-cols-10 gap-[3px] p-2 rounded-2xl bg-indigo-100 border-2 border-indigo-200 w-[15.5rem] select-none touch-none"
            onPointerLeave={() => setArrastrando(false)}
            onPointerUp={() => setArrastrando(false)}
            role="grid"
            aria-label={`Cuadrícula de cien casillas con ${n} pintadas`}
          >
            {/* Filas de arriba abajo, columnas de izquierda a derecha; se pinta por columnas */}
            {[...Array(10)].map((_, fila) => [...Array(10)].map((_, col) => {
              const on = pintada(n, fila, col)
              const colLlena = col < decimas
              return (
                <button
                  key={`${fila}-${col}`}
                  type="button"
                  aria-label={`Hasta ${dec(col * 10 + fila + 1)}`}
                  onPointerDown={() => { setArrastrando(true); fijar(fila, col) }}
                  onPointerEnter={() => arrastrando && fijar(fila, col)}
                  className={`aspect-square rounded-[3px] transition-colors ${on ? (colLlena ? 'bg-indigo-500' : 'bg-orange-400') : 'bg-white hover:bg-indigo-50'}`}
                />
              )
            }))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 max-w-[15.5rem]">
            {PRESETS.map(p => <button key={p.label} type="button" onClick={() => setN(p.n)} className="btn btn-sm btn-ghost !px-2 !py-1 !text-xs">{p.label}</button>)}
            <button type="button" onClick={() => setN(0)} className="btn btn-sm btn-ghost !px-2 !py-1 !text-xs">0</button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface border-2 border-indigo-100 p-2">
              <p className="text-[11px] font-bold text-gray-500">Fracción</p>
              <p className="font-display font-bold text-xl tabular-nums">{n}/100</p>
              {g > 1 && n > 0 && <p className="text-xs text-emerald-600 font-bold">= {n / g}/{100 / g}</p>}
            </div>
            <div className="rounded-xl bg-surface border-2 border-indigo-100 p-2">
              <p className="text-[11px] font-bold text-gray-500">Decimal</p>
              <p className="font-display font-bold text-xl tabular-nums">{dec(n)}</p>
            </div>
            <div className="rounded-xl bg-surface border-2 border-indigo-100 p-2">
              <p className="text-[11px] font-bold text-gray-500">Porcentaje</p>
              <p className="font-display font-bold text-xl tabular-nums">{n}%</p>
            </div>
          </div>
          {/* Tabla de valor posicional */}
          <div className="grid grid-cols-4 text-center rounded-xl overflow-hidden border-2 border-indigo-100 text-sm">
            {['Unidades', ',', 'Décimas', 'Centésimas'].map(h => <div key={h} className="bg-indigo-50 text-[11px] font-bold py-1 text-indigo-700">{h}</div>)}
            <div className="py-1.5 font-display font-bold text-lg">{n === 100 ? 1 : 0}</div>
            <div className="py-1.5 font-display font-bold text-lg">,</div>
            <div className="py-1.5 font-display font-bold text-lg text-indigo-600">{n === 100 ? 0 : decimas}</div>
            <div className="py-1.5 font-display font-bold text-lg text-orange-500">{n === 100 ? 0 : centesimas}</div>
          </div>
          <p className="text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500 align-middle" /> Cada columna llena es <strong>una décima</strong> (10 casillas).{' '}
            <span className="inline-block w-3 h-3 rounded-sm bg-orange-400 align-middle" /> Cada casilla suelta es <strong>una centésima</strong>. Arrastra por la cuadrícula para pintar.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-2 border-gray-100 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">⚖️ ¿Cuál es mayor? Colócalos en la recta</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex-1 min-w-[8rem] text-sm font-bold text-sky-700">A = {a.toFixed(2).replace('.', ',')}
            <input type="range" min={0} max={1} step={0.01} value={a} onChange={e => setA(Number(e.target.value))} className="w-full accent-sky-500" />
          </label>
          <label className="flex-1 min-w-[8rem] text-sm font-bold text-pink-700">B = {b.toFixed(2).replace('.', ',')}
            <input type="range" min={0} max={1} step={0.01} value={b} onChange={e => setB(Number(e.target.value))} className="w-full accent-pink-500" />
          </label>
        </div>
        <svg viewBox="0 0 320 50" className="w-full mt-1" aria-hidden="true">
          <line x1="10" x2="310" y1="30" y2="30" stroke="#94a3b8" strokeWidth="2" />
          {[...Array(11)].map((_, i) => (
            <g key={i}>
              <line x1={10 + i * 30} x2={10 + i * 30} y1="24" y2="36" stroke="#94a3b8" />
              <text x={10 + i * 30} y="48" textAnchor="middle" fontSize="8" fill="#64748b">{i === 10 ? '1' : `0,${i}`}</text>
            </g>
          ))}
          <circle cx={10 + a * 300} cy="30" r="6" fill="#0ea5e9" />
          <text x={10 + a * 300} y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0369a1">A</text>
          <circle cx={10 + b * 300} cy="30" r="6" fill="#ec4899" opacity="0.85" />
          <text x={10 + b * 300} y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#be185d">B</text>
        </svg>
        <p className="text-center font-display font-bold">
          {a.toFixed(2).replace('.', ',')} {a > b ? '>' : a < b ? '<' : '='} {b.toFixed(2).replace('.', ',')}
        </p>
        <p className="text-xs text-center text-gray-500">Compara cifra a cifra desde la izquierda: primero las décimas ({Math.floor(a * 10 + 1e-9)} contra {Math.floor(b * 10 + 1e-9)}), y solo si empatan, las centésimas.</p>
      </div>
    </div>
  )
}
