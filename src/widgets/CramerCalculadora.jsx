import { useState } from 'react'
import MathTex from '../components/MathTex'

export default function CramerCalculadora() {
  const [a1, setA1] = useState(2)
  const [b1, setB1] = useState(3)
  const [c1, setC1] = useState(12)
  const [a2, setA2] = useState(4)
  const [b2, setB2] = useState(-3)
  const [c2, setC2] = useState(6)

  const D = a1 * b2 - a2 * b1
  const Dx = c1 * b2 - c2 * b1
  const Dy = a1 * c2 - a2 * c1

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-bold mb-1">Ecuación 1:</p>
          <div className="flex gap-1 items-center text-sm">
            <input type="number" value={a1} onChange={e => setA1(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
            <span>x +</span>
            <input type="number" value={b1} onChange={e => setB1(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
            <span>y =</span>
            <input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold mb-1">Ecuación 2:</p>
          <div className="flex gap-1 items-center text-sm">
            <input type="number" value={a2} onChange={e => setA2(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
            <span>x +</span>
            <input type="number" value={b2} onChange={e => setB2(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
            <span>y =</span>
            <input type="number" value={c2} onChange={e => setC2(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 space-y-2 text-center">
        <p><MathTex expr={`D = (${a1})(${b2}) - (${a2})(${b1}) = ${a1*b2} - ${a2*b1} = ${D}`} /></p>
        <p><MathTex expr={`D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${c1*b2} - ${c2*b1} = ${Dx}`} /></p>
        <p><MathTex expr={`D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${a1*c2} - ${a2*c1} = ${Dy}`} /></p>
        <hr className="my-3" />
        {D !== 0 ? (
          <div className="text-lg font-bold text-blue-700">
            <MathTex expr={`x = \\frac{${Dx}}{${D}} = ${(Dx/D).toFixed(2)}, \\quad y = \\frac{${Dy}}{${D}} = ${(Dy/D).toFixed(2)}`} />
          </div>
        ) : (
          <p className="text-lg font-bold text-red-500">D = 0 → El sistema no tiene solución única</p>
        )}
      </div>
    </div>
  )
}
