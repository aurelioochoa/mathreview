import { useState } from 'react'

export default function AproximacionExplorer() {
  const [numero, setNumero] = useState('3.14159265')
  const num = parseFloat(numero) || 0

  const truncar = (n, dec) => {
    const factor = Math.pow(10, dec)
    return (n >= 0 ? 1 : -1) * (Math.floor(Math.abs(n) * factor) / factor)
  }
  const redondear = (n, dec) => {
    const factor = Math.pow(10, dec)
    return Math.round(n * factor) / factor
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Escribe un número decimal:</label>
      <input
        type="text"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-lg font-mono focus:ring-2 focus:ring-amber-400 outline-none"
      />
      {!isNaN(num) && num !== 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-amber-100">
                <th className="px-3 py-2 text-left">Decimales</th>
                <th className="px-3 py-2 text-left">Truncado</th>
                <th className="px-3 py-2 text-left">Redondeado</th>
                <th className="px-3 py-2 text-left">Error (truncar)</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map(d => {
                const t = truncar(num, d)
                const r = redondear(num, d)
                const err = Math.abs(num - t)
                return (
                  <tr key={d} className="border-t border-amber-100">
                    <td className="px-3 py-2 font-mono">{d}</td>
                    <td className="px-3 py-2 font-mono">{t.toFixed(d)}</td>
                    <td className="px-3 py-2 font-mono">{r.toFixed(d)}</td>
                    <td className="px-3 py-2 font-mono text-red-600">{err.toFixed(d + 2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
