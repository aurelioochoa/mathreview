import { useState } from 'react'
import { Mafs, Coordinates, Polygon, Text as MafsText, Theme } from 'mafs'
import MathTex from '../components/MathTex'

export default function PitagorasCalculadora() {
  const [catA, setCatA] = useState(3)
  const [catB, setCatB] = useState(4)
  const hip = Math.sqrt(catA * catA + catB * catB)

  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <div>
          <label className="block text-xs font-medium mb-1">Cateto a</label>
          <input type="number" value={catA} onChange={e => setCatA(Number(e.target.value) || 1)}
            className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-red-400 outline-none" min={0.1} step={0.5} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Cateto b</label>
          <input type="number" value={catB} onChange={e => setCatB(Number(e.target.value) || 1)}
            className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-red-400 outline-none" min={0.1} step={0.5} />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium mb-1">Hipotenusa c</p>
          <p className="text-2xl font-bold text-red-600 font-mono">{hip.toFixed(3)}</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden border">
        <Mafs viewBox={{ x: [-1, Math.max(catA, catB) + 2], y: [-1, Math.max(catA, catB) + 2] }} height={300}>
          <Coordinates.Cartesian />
          <Polygon
            points={[[0, 0], [catA, 0], [0, catB]]}
            color={Theme.red}
          />
          <MafsText x={catA / 2} y={-0.5} size={16}>a = {catA}</MafsText>
          <MafsText x={-0.7} y={catB / 2} size={16}>b = {catB}</MafsText>
          <MafsText x={catA / 2 + 0.3} y={catB / 2 + 0.3} size={16}>c = {hip.toFixed(2)}</MafsText>
        </Mafs>
      </div>

      <div className="mt-3 text-center text-sm">
        <MathTex expr={`${catA}^2 + ${catB}^2 = ${(catA*catA).toFixed(1)} + ${(catB*catB).toFixed(1)} = ${(catA*catA + catB*catB).toFixed(1)}`} />
        <br />
        <MathTex expr={`c = \\sqrt{${(catA*catA + catB*catB).toFixed(1)}} = ${hip.toFixed(3)}`} />
      </div>

      <div className="mt-4 bg-red-50 rounded p-3 text-sm">
        <p className="font-semibold">Áreas de los cuadrados:</p>
        <div className="flex gap-4 justify-center mt-1">
          <span>a²= <strong>{(catA * catA).toFixed(1)}</strong></span>
          <span>+</span>
          <span>b² = <strong>{(catB * catB).toFixed(1)}</strong></span>
          <span>=</span>
          <span>c² = <strong>{(hip * hip).toFixed(1)}</strong></span>
        </div>
      </div>
    </div>
  )
}
