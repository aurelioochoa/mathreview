import { useState } from 'react'

const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(n) ? Math.round(n) : min))

// Un porcentaje sobre una cantidad, con la barra al lado. El caso del descuento
// es el que más se usa fuera de clase, así que se muestra siempre.
export default function PorcentajeBarra() {
  const [cantidad, setCantidad] = useState(60)
  const [pct, setPct] = useState(25)

  const parte = (cantidad * pct) / 100
  const resto = cantidad - parte
  const bonito = (n) => (Number.isInteger(n) ? n : n.toFixed(2))

  return (
    <div>
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">Cantidad total</label>
          <input type="number" min={1} max={1000} value={cantidad}
            onChange={e => setCantidad(clamp(Number(e.target.value), 1, 1000))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-rose-400 outline-none" />
        </div>
        <div className="flex-1 min-w-[12rem]">
          <label className="block text-xs font-medium mb-1">Porcentaje: {pct}%</label>
          <input type="range" min={0} max={100} step={5} value={pct}
            onChange={e => setPct(Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="mt-4 h-8 rounded-xl bg-gray-200 overflow-hidden flex">
        <div className="h-full bg-rose-500 transition-all flex items-center justify-center" style={{ width: `${pct}%` }}>
          {pct >= 15 && <span className="text-white text-xs font-bold">{pct}%</span>}
        </div>
      </div>

      <div className="mt-4 p-4 glass rounded-xl text-sm">
        <p className="text-lg font-bold text-rose-700 mb-2 tabular-nums">
          El {pct}% de {cantidad} es {bonito(parte)}
        </p>
        <p className="text-gray-600">
          Se calcula así: {cantidad} × {pct} ÷ 100 = <strong>{bonito(parte)}</strong>
        </p>
        <p className="text-gray-600 mt-2">
          🏷️ Si fuera un descuento del {pct}% sobre {cantidad} monedas, te ahorras {bonito(parte)} y pagas{' '}
          <strong className="text-emerald-700">{bonito(resto)}</strong>.
        </p>
        <p className="text-xs text-gray-500 mt-2">💡 Un porcentaje es una fracción con denominador 100: {pct}% = {pct}/100.</p>
      </div>
    </div>
  )
}
