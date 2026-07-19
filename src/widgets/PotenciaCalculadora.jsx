import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function PotenciaCalculadora() {
  const [base, setBase] = useState(2)
  const [exp, setExp] = useState(3)

  const resultado = Math.pow(base, exp)

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">Daño base</label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Nivel de potencia</label>
          <input
            type="number"
            value={exp}
            onChange={(e) => setExp(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
            min={-10}
            max={20}
          />
        </div>
        <div className="text-2xl font-bold text-amber-700">=</div>
        <div className="text-2xl font-mono font-bold text-amber-900">
          {isFinite(resultado) ? (Number.isInteger(resultado) ? resultado : resultado.toFixed(6)) : '∞'}
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        <MathTex expr={`${base}^{${exp}} = ${isFinite(resultado) ? (Number.isInteger(resultado) ? resultado : resultado.toFixed(6)) : '\\infty'}`} />
        {exp < 0 && <span className="ml-2">(Exponente negativo = fracción: <MathTex expr={`\\frac{1}{${base}^{${-exp}}}`} />)</span>}
      </p>
    </div>
  )
}
