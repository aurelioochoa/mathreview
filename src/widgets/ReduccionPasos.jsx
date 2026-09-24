import { useState } from 'react'
import MathTex from '../components/MathTex'
import { PRESETS, scale, add, eliminated, suggest, solve, eqTex } from './logic/reduccion'

// Reducción paso a paso: eliges por cuánto multiplicar cada ecuación y ves en
// directo la suma. Cuando los coeficientes de una incógnita quedan opuestos, la
// suma la hace desaparecer (se tacha) y el sistema pasa a tener una sola
// incógnita.

function Paso({ label, value, onChange, color }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(value - 1 === 0 ? -1 : value - 1)} className="btn btn-sm btn-ghost !px-2.5" aria-label={`Bajar ${label}`}>−</button>
      <span className={`w-12 text-center font-display font-bold text-lg tabular-nums ${color}`}>×{value}</span>
      <button type="button" onClick={() => onChange(value + 1 === 0 ? 1 : value + 1)} className="btn btn-sm btn-ghost !px-2.5" aria-label={`Subir ${label}`}>+</button>
    </div>
  )
}

// Fila de una ecuación con cada término en su columna, para que se vea qué se
// suma con qué. `tachar` marca la columna eliminada.
function Fila({ e, tachar, tone = '' }) {
  const t = (k, v) => {
    const abs = Math.abs(k)
    return `${k < 0 ? '-' : '+'}\\,${abs === 1 ? '' : abs}${v}`
  }
  return (
    <div className={`grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-2 text-center ${tone}`}>
      <span className={`relative ${tachar === 'x' ? 'opacity-40' : ''}`}>
        <MathTex expr={e.a === 0 ? '0x' : t(e.a, 'x').replace(/^\+\\,/, '')} />
        {tachar === 'x' && <span className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500 -rotate-6" />}
      </span>
      <span className={`relative ${tachar === 'y' ? 'opacity-40' : ''}`}>
        <MathTex expr={e.b === 0 ? '+\\,0y' : t(e.b, 'y')} />
        {tachar === 'y' && <span className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500 -rotate-6" />}
      </span>
      <span>=</span>
      <span><MathTex expr={String(e.c)} /></span>
    </div>
  )
}

export default function ReduccionPasos() {
  const [idx, setIdx] = useState(0)
  const [k1, setK1] = useState(1)
  const [k2, setK2] = useState(1)
  const { e1, e2 } = PRESETS[idx]
  const s1 = scale(e1, k1)
  const s2 = scale(e2, k2)
  const suma = add(s1, s2)
  const fuera = eliminated(e1, e2, k1, k2)
  const sol = solve(e1, e2)

  const cambiar = (i) => { setIdx(i); setK1(1); setK2(1) }
  const sugerir = (v) => { const s = suggest(e1, e2, v); setK1(s.k1); setK2(s.k2) }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESETS.map((_, i) => (
          <button key={i} type="button" onClick={() => cambiar(i)} className={`btn btn-sm ${i === idx ? '' : 'btn-ghost'}`}>Sistema {i + 1}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mb-3 text-center">
        <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-2"><span className="text-xs font-bold text-blue-700">E₁ </span><MathTex expr={eqTex(e1)} /></div>
        <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-2"><span className="text-xs font-bold text-emerald-700">E₂ </span><MathTex expr={eqTex(e2)} /></div>
      </div>

      <div className="rounded-2xl border-2 border-indigo-100 bg-surface p-3">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
          <Paso label="multiplicador de E₁" value={k1} onChange={setK1} color="text-blue-600" />
          <Fila e={s1} tachar={fuera} tone="text-blue-800" />
          <Paso label="multiplicador de E₂" value={k2} onChange={setK2} color="text-emerald-600" />
          <Fila e={s2} tachar={fuera} tone="text-emerald-800" />
          <span className="text-right font-display font-bold text-gray-500 pr-2">Suma</span>
          <div className="border-t-2 border-gray-800/60 pt-2">
            <Fila e={suma} tachar={fuera} tone="font-bold" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" onClick={() => sugerir('y')} className="btn btn-sm btn-sky">💡 Eliminar y</button>
        <button type="button" onClick={() => sugerir('x')} className="btn btn-sm btn-sky">💡 Eliminar x</button>
      </div>

      {fuera ? (
        <div className="mt-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-3 text-sm entrar-abajo" role="status">
          <p className="font-display font-bold text-emerald-800 mb-1">✂️ ¡{fuera} eliminada! Queda una ecuación con una sola incógnita:</p>
          {fuera === 'y' ? (
            <MathTex expr={`${suma.a}x = ${suma.c} \\;\\Rightarrow\\; x = ${sol.x}`} display />
          ) : (
            <MathTex expr={`${suma.b}y = ${suma.c} \\;\\Rightarrow\\; y = ${sol.y}`} display />
          )}
          <p className="text-gray-600">
            Sustituye en E₁ para sacar la otra: <strong>x = {sol.x}, y = {sol.y}</strong>.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          Busca multiplicadores que dejen los coeficientes de <strong>x</strong> (o de <strong>y</strong>) con el mismo número y signo contrario: al sumar, esa incógnita desaparece.
        </p>
      )}
    </div>
  )
}
