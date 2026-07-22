import { useState } from 'react'

export default function McdCalculadora() {
  const [a, setA] = useState(36)
  const [b, setB] = useState(24)

  const gcd = (x, y) => {
    x = Math.abs(x); y = Math.abs(y)
    while (y) { [x, y] = [y, x % y] }
    return x
  }

  const mcdVal = gcd(a, b)

  const factorizar = (n) => {
    n = Math.abs(n)
    if (n <= 1) return [[n, 1]]
    const factors = []
    let d = 2
    while (d * d <= n) {
      let count = 0
      while (n % d === 0) { count++; n /= d }
      if (count > 0) factors.push([d, count])
      d++
    }
    if (n > 1) factors.push([n, 1])
    return factors
  }

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">Ítems tipo A</label>
          <input type="number" value={a} onChange={e => setA(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Ítems tipo B</label>
          <input type="number" value={b} onChange={e => setB(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
        </div>
      </div>
      <div className="mt-4 p-4 glass rounded-xl">
        <p className="text-sm"><strong>Factorización de {Math.abs(a)}:</strong> {factorizar(a).map(([f, e]) => `${f}${e > 1 ? `^${e}` : ''}`).join(' × ') || '—'}</p>
        <p className="text-sm"><strong>Factorización de {Math.abs(b)}:</strong> {factorizar(b).map(([f, e]) => `${f}${e > 1 ? `^${e}` : ''}`).join(' × ') || '—'}</p>
        <p className="text-lg font-bold text-emerald-700 mt-2">MCD({a}, {b}) = {mcdVal}</p>
        <p className="text-xs text-emerald-600 mt-1">
          💡 Puedes repartir {mcdVal} ítems a cada uno del squad
        </p>
      </div>
    </div>
  )
}
