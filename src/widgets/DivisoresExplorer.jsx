import { useState } from 'react'

const clamp = (n) => Math.min(120, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1))

function divisores(n) {
  const out = []
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d)
  return out
}

// Muestra todos los divisores de un número y si es primo. Ver la lista completa
// hace evidente la definición: primo = solo se puede dividir entre 1 y él mismo.
export default function DivisoresExplorer() {
  const [n, setN] = useState(12)

  const divs = divisores(n)
  const esPrimo = n > 1 && divs.length === 2
  const primerosMultiplos = Array.from({ length: 6 }, (_, i) => n * (i + 1))

  return (
    <div>
      <div>
        <label className="block text-xs font-medium mb-1">Elige un número (1 a 120)</label>
        <input type="number" min={1} max={120} value={n} onChange={e => setN(clamp(Number(e.target.value)))}
          className="border rounded-lg px-3 py-2 w-32 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
      </div>

      <div className="mt-4 p-4 glass rounded-xl">
        <p className="text-sm font-semibold text-gray-700 mb-2">Divisores de {n} — lo divide sin que sobre nada:</p>
        <div className="flex flex-wrap gap-1.5">
          {divs.map(d => (
            <span key={d} className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold tabular-nums">{d}</span>
          ))}
        </div>
        <p className="mt-3 text-sm font-bold">
          {n === 1
            ? '1️⃣ El 1 no es primo: solo tiene un divisor, él mismo.'
            : esPrimo
              ? `✅ ${n} es PRIMO: solo lo dividen 1 y ${n}.`
              : `❌ ${n} no es primo: tiene ${divs.length} divisores.`}
        </p>

        <p className="text-sm font-semibold text-gray-700 mt-4 mb-2">Y estos son múltiplos de {n} — la tabla del {n}:</p>
        <div className="flex flex-wrap gap-1.5">
          {primerosMultiplos.map(m => (
            <span key={m} className="px-2 py-1 rounded-lg bg-sky-100 text-sky-800 text-sm font-bold tabular-nums">{m}</span>
          ))}
          <span className="px-2 py-1 text-sm text-gray-400">…</span>
        </div>
        <p className="text-xs text-gray-600 mt-3">💡 Divisores: caben dentro. Múltiplos: salen de multiplicarlo.</p>
      </div>
    </div>
  )
}
