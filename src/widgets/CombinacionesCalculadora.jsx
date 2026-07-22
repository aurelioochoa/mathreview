import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function CombinacionesCalculadora() {
  const [n, setN] = useState(12)
  const [r, setR] = useState(4)

  const factorial = (num) => {
    if (num <= 1) return 1
    let result = 1
    for (let i = 2; i <= num; i++) result *= i
    return result
  }

  const comb = n >= r && r >= 0 ? factorial(n) / (factorial(r) * factorial(n - r)) : 0

  return (
    <div>
      <div className="flex gap-4 items-end flex-wrap mb-4">
        <div>
          <label className="block text-xs font-medium mb-1">n (total)</label>
          <input type="number" value={n} onChange={e => setN(Math.max(0, Number(e.target.value)))}
            className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-pink-400 outline-none" min={0} max={20} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">r (elegir)</label>
          <input type="number" value={r} onChange={e => setR(Math.max(0, Number(e.target.value)))}
            className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-pink-400 outline-none" min={0} max={20} />
        </div>
      </div>
      <div className="glass rounded-xl p-4 text-center">
        <MathTex expr={`C(${n}, ${r}) = \\frac{${n}!}{${r}! \\cdot ${n - r}!}`} />
        <p className="text-2xl font-bold text-pink-600 mt-2 font-mono">{comb.toLocaleString()}</p>
      </div>

      <div className="mt-4 glass rounded-md p-3 text-sm">
        <p className="font-semibold">Ejemplo del examen:</p>
        <p className="text-gray-700 mt-1">
          Una banda tiene <strong>12 canciones</strong> y debe elegir <strong>4</strong> para su álbum. ¿De cuántas formas?
        </p>
        <div className="mt-2 bg-pink-50 rounded p-2">
          <MathTex expr={`C(12, 4) = \\frac{12!}{4! \\cdot 8!} = \\frac{12 \\times 11 \\times 10 \\times 9}{4 \\times 3 \\times 2 \\times 1} = 495`} />
          <p className="font-bold text-pink-700 mt-1">495 formas diferentes</p>
        </div>
      </div>
    </div>
  )
}
