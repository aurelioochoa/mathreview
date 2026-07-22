import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function FraccionesEjemplo() {
  const [step, setStep] = useState(0)

  const pasos = [
    { titulo: 'Problema', contenido: '\\frac{2}{x+1} + \\frac{3}{x-1}' },
    { titulo: 'Paso 1: Encontrar MCM de denominadores', contenido: '\\text{MCM} = (x+1)(x-1)' },
    { titulo: 'Paso 2: Multiplicar cada fracción', contenido: '\\frac{2(x-1)}{(x+1)(x-1)} + \\frac{3(x+1)}{(x+1)(x-1)}' },
    { titulo: 'Paso 3: Expandir numeradores', contenido: '\\frac{2x - 2 + 3x + 3}{(x+1)(x-1)}' },
    { titulo: 'Paso 4: Simplificar', contenido: '\\frac{5x + 1}{x^2 - 1}' },
  ]

  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-lg">
          <MathTex expr={pasos[step].contenido} display />
        </div>
        <p className="text-sm font-semibold text-indigo-600 mt-2">{pasos[step].titulo}</p>
      </div>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold disabled:opacity-30 hover:bg-emerald-200 transition cursor-pointer"
        >
          ← Anterior
        </button>
        <span className="px-3 py-2 text-sm text-gray-500">{step + 1} / {pasos.length}</span>
        <button
          onClick={() => setStep(s => Math.min(pasos.length - 1, s + 1))}
          disabled={step === pasos.length - 1}
          className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold disabled:opacity-30 hover:bg-emerald-200 transition cursor-pointer"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
