import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function NotacionConversor() {
  const [decimal, setDecimal] = useState('139000000')

  const convertir = (str) => {
    const n = parseFloat(str)
    if (isNaN(n) || n === 0) return { mantisa: 0, exponente: 0 }
    const exponente = Math.floor(Math.log10(Math.abs(n)))
    const mantisa = n / Math.pow(10, exponente)
    return { mantisa: parseFloat(mantisa.toFixed(6)), exponente }
  }

  const { mantisa, exponente } = convertir(decimal)

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Escribe un número (seguidores, visualizaciones, etc.):</label>
      <input
        type="text"
        value={decimal}
        onChange={(e) => setDecimal(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-sm font-mono text-lg focus:ring-2 focus:ring-amber-400 outline-none"
      />
      {parseFloat(decimal) !== 0 && !isNaN(parseFloat(decimal)) && (
        <div className="mt-4 p-4 bg-surface rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-1">En notación científica:</p>
          <p className="text-2xl font-bold text-amber-700">
            <MathTex expr={`${mantisa} \\times 10^{${exponente}}`} />
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Se movió la coma {Math.abs(exponente)} {Math.abs(exponente) === 1 ? 'posición' : 'posiciones'} hacia la {exponente >= 0 ? 'izquierda' : 'derecha'}
          </p>
        </div>
      )}
    </div>
  )
}
