import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function PermutacionesCalculadora() {
  const [n, setN] = useState(12)
  const [r, setR] = useState(4)

  const factorial = (num) => {
    if (num <= 1) return 1
    let result = 1
    for (let i = 2; i <= num; i++) result *= i
    return result
  }

  const perm = n >= r && r >= 0 ? factorial(n) / factorial(n - r) : 0

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
        <MathTex expr={`P(${n}, ${r}) = \\frac{${n}!}{(${n}-${r})!} = \\frac{${n}!}{${n - r}!}`} />
        <p className="text-2xl font-bold text-pink-600 mt-2 font-mono">{perm.toLocaleString()}</p>
      </div>
    </div>
  )
}
