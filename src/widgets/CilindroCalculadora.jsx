import { useState } from 'react'

export default function CilindroCalculadora() {
  const [radio, setRadio] = useState(3)
  const [altura, setAltura] = useState(5)

  const areaLateral = 2 * Math.PI * radio * altura
  const areaBase = Math.PI * radio * radio
  const areaTotal = areaLateral + 2 * areaBase

  return (
    <div>
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-xs font-bold text-red-700 mb-1">Radio = {radio}</label>
          <input type="range" min={1} max={8} step={0.5} value={radio}
            onChange={e => setRadio(Number(e.target.value))}
            className="w-40 accent-red-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-red-700 mb-1">Altura = {altura}</label>
          <input type="range" min={1} max={12} step={0.5} value={altura}
            onChange={e => setAltura(Number(e.target.value))}
            className="w-40 accent-red-500" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="relative w-32 flex flex-col items-center">
          <div className="w-full bg-red-200 rounded-t-full h-6 border-2 border-red-400" />
          <div className="w-full bg-red-100 border-l-2 border-r-2 border-red-400" style={{ height: `${altura * 15}px` }} />
          <div className="w-full bg-red-200 rounded-b-full h-6 border-2 border-red-400" />
          <p className="text-xs text-gray-500 mt-1">r={radio}, h={altura}</p>
        </div>
        <div className="text-3xl text-gray-400">→</div>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-red-100 border-2 border-red-400 rounded-full" style={{ width: `${radio * 16}px`, height: `${radio * 16}px` }} />
          <div className="bg-red-50 border-2 border-red-400 rounded" style={{ width: `${radio * 2 * 16}px`, height: `${altura * 12}px` }}>
            <p className="text-xs text-center mt-1 text-red-600">Lateral</p>
          </div>
          <div className="bg-red-100 border-2 border-red-400 rounded-full" style={{ width: `${radio * 16}px`, height: `${radio * 16}px` }} />
          <p className="text-xs text-gray-500">Red desplegada</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-red-50 rounded p-2">
          <strong>A. Lateral</strong><br />{areaLateral.toFixed(2)}
        </div>
        <div className="bg-red-50 rounded p-2">
          <strong>A. Base</strong><br />{areaBase.toFixed(2)}
        </div>
        <div className="bg-red-100 rounded p-2">
          <strong>A. Total</strong><br />{areaTotal.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
