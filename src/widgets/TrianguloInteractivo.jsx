import { useState } from 'react'
import { Mafs, Coordinates, Polygon, Text as MafsText, Theme } from 'mafs'

export default function TrianguloInteractivo() {
  const [angulo, setAngulo] = useState(30)
  const rad = angulo * Math.PI / 180
  const sen = Math.sin(rad)
  const cos = Math.cos(rad)
  const tan = angulo === 90 ? Infinity : Math.tan(rad)

  const hip = 5
  const catOp = hip * sen
  const catAd = hip * cos

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-bold text-red-700 mb-1">
          Ángulo α = {angulo}°
        </label>
        <input type="range" min={5} max={85} step={1} value={angulo}
          onChange={e => setAngulo(Number(e.target.value))}
          className="w-full max-w-sm accent-red-500" />
      </div>

      <div className="glass rounded-xl overflow-hidden border">
        <Mafs viewBox={{ x: [-0.5, 6], y: [-0.5, 6] }} height={300}>
          <Coordinates.Cartesian />
          <Polygon
            points={[[0, 0], [catAd, 0], [0, catOp]]}
            color={Theme.red}
          />
          <MafsText x={catAd / 2} y={-0.4} size={14}>
            adyacente = {catAd.toFixed(2)}
          </MafsText>
          <MafsText x={-0.5} y={catOp / 2} size={14}>
            opuesto = {catOp.toFixed(2)}
          </MafsText>
          <MafsText x={catAd / 2 + 0.5} y={catOp / 2 + 0.3} size={14}>
            hip = {hip}
          </MafsText>
          <MafsText x={0.8} y={0.3} size={14}>
            α = {angulo}°
          </MafsText>
        </Mafs>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="font-bold text-red-600">sen({angulo}°)</p>
          <p className="text-xl font-mono">{sen.toFixed(4)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="font-bold text-blue-600">cos({angulo}°)</p>
          <p className="text-xl font-mono">{cos.toFixed(4)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="font-bold text-green-600">tan({angulo}°)</p>
          <p className="text-xl font-mono">{isFinite(tan) ? tan.toFixed(4) : '∞'}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Identidad fundamental: sen²(α) + cos²(α) = {(sen * sen + cos * cos).toFixed(4)} ≈ 1 ✓
      </p>
    </div>
  )
}
