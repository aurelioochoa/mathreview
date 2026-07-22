import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function McmCalculadora() {
  const [a, setA] = useState(12)
  const [b, setB] = useState(18)

  const gcd = (x, y) => {
    x = Math.abs(x); y = Math.abs(y)
    while (y) { [x, y] = [y, x % y] }
    return x
  }

  const mcmVal = a && b ? Math.abs(a * b) / gcd(a, b) : 0

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">Evento A (horas)</label>
          <input type="number" value={a} onChange={e => setA(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Evento B (horas)</label>
          <input type="number" value={b} onChange={e => setB(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
        </div>
      </div>
      <div className="mt-4 p-4 glass rounded-xl">
        <p className="text-sm text-gray-600">Fórmula rápida: <MathTex expr={`\\text{MCM}(a,b) = \\frac{|a \\times b|}{\\text{MCD}(a,b)}`} /></p>
        <p className="text-sm mt-1"><MathTex expr={`\\frac{|${a} \\times ${b}|}{${gcd(a, b)}} = \\frac{${Math.abs(a * b)}}{${gcd(a, b)}}`} /></p>
        <p className="text-lg font-bold text-emerald-700 mt-2">MCM({a}, {b}) = {mcmVal}</p>
        <p className="text-xs text-emerald-600 mt-1">
          💡 Los eventos coinciden cada {mcmVal} horas
        </p>
      </div>
    </div>
  )
}
