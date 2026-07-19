import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function RaizCalculadora() {
  const [radicando, setRadicando] = useState(27)
  const [indice, setIndice] = useState(3)

  const resultado = Math.pow(radicando, 1 / indice)

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">Índice (n)</label>
          <input
            type="number"
            value={indice}
            onChange={(e) => setIndice(Number(e.target.value) || 2)}
            className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
            min={2}
            max={10}
          />
        </div>
        <div className="text-2xl">√</div>
        <div>
          <label className="block text-xs font-medium mb-1">Área/Volumen (a)</label>
          <input
            type="number"
            value={radicando}
            onChange={(e) => setRadicando(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div className="text-2xl font-bold text-amber-700">=</div>
        <div className="text-2xl font-mono font-bold text-amber-900">
          {isNaN(resultado) ? 'No existe' : Number.isInteger(resultado) ? resultado : resultado.toFixed(4)}
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        <MathTex expr={`{\\sqrt[${indice}]{${radicando}} = ${isNaN(resultado) ? '\\text{No existe en } \\mathbb{R}' : Number.isInteger(resultado) ? resultado : resultado.toFixed(4)}}`} />
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Verificación: {isNaN(resultado) ? 'N/A' : `${Number.isInteger(resultado) ? resultado : resultado.toFixed(4)}^${indice} ≈ ${Math.pow(resultado, indice).toFixed(2)}`}
      </p>
      <p className="text-xs text-amber-600 mt-2">
        💡 Ejemplo: Área 144, índice 2 → lado 12 (terreno 12×12 en Minecraft)
      </p>
    </div>
  )
}
