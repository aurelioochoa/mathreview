import { useState } from 'react'
import MathTex from '../components/MathTex'
import { FRACCIONES, evalFactors, evalOriginal, pendingPairs, restricted, texOf } from './logic/simplificador'

// Simplificar es tachar factores iguales arriba y abajo. Aquí se hace con las
// manos: primero se factoriza, luego se pincha un factor del numerador y su
// pareja del denominador. Y un deslizador demuestra que la fracción
// simplificada vale lo mismo que la original… salvo donde la original divide
// entre cero.

const fmt = (v) => (v === null ? '÷ 0' : Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/\.?0+$/, ''))

function Ficha({ f, tachada, elegida, onClick, sacude }) {
  return (
    <button type="button" onClick={onClick} disabled={tachada}
      className={`relative px-3 py-1.5 rounded-xl border-2 font-semibold transition-all ${
        tachada ? 'opacity-35 border-gray-200 bg-gray-50 cursor-default'
          : elegida ? 'border-violet-500 bg-violet-100 -translate-y-0.5 shadow-[0_3px_0_#8b5cf6]'
            : 'border-indigo-200 bg-surface hover:border-indigo-400 shadow-[0_3px_0_var(--panel-ledge)]'
      } ${sacude ? 'sacudir' : ''}`}>
      <MathTex expr={f.tex} />
      {tachada && <span className="absolute inset-x-1 top-1/2 h-0.5 bg-red-500 -rotate-12" aria-hidden="true" />}
    </button>
  )
}

export default function SimplificadorAlgebraico() {
  const [idx, setIdx] = useState(0)
  const [factorizada, setFactorizada] = useState(false)
  const [cNum, setCNum] = useState(() => new Set())
  const [cDen, setCDen] = useState(() => new Set())
  const [elegida, setElegida] = useState(null)
  const [error, setError] = useState(null)
  const [x, setX] = useState(1)
  const frac = FRACCIONES[idx]

  const elegir = (i) => {
    setIdx(i); setFactorizada(false); setCNum(new Set()); setCDen(new Set()); setElegida(null); setError(null)
  }
  const pinchaNum = (i) => { setElegida(i); setError(null) }
  const pinchaDen = (j) => {
    if (elegida === null) { setError({ j, msg: 'Primero elige un factor de arriba (numerador).' }); return }
    if (frac.numF[elegida].key !== frac.denF[j].key) {
      setError({ j, msg: `(${frac.numF[elegida].key}) y (${frac.denF[j].key}) no son iguales: no se pueden tachar.` })
      return
    }
    setCNum(s => new Set(s).add(elegida))
    setCDen(s => new Set(s).add(j))
    setElegida(null); setError(null)
  }

  const pendientes = factorizada ? pendingPairs(frac, cNum, cDen) : null
  const lista = factorizada && pendientes === 0
  const prohibidos = restricted(frac)
  const vOrig = evalOriginal(frac, x)
  const dSimp = evalFactors(frac.denF, x, cDen)
  const vSimp = dSimp === 0 ? null : evalFactors(frac.numF, x, cNum) / dSimp

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {FRACCIONES.map((f, i) => (
          <button key={f.id} type="button" onClick={() => elegir(i)} className={`btn btn-sm ${i === idx ? '' : 'btn-ghost'}`}>Fracción {i + 1}</button>
        ))}
      </div>

      <div className="text-center text-xl mb-3"><MathTex expr={`\\frac{${frac.num}}{${frac.den}}`} display /></div>

      {!factorizada ? (
        <div className="text-center">
          <button type="button" onClick={() => setFactorizada(true)} className="btn btn-violet">🔍 Paso 1: Factorizar</button>
        </div>
      ) : (
        <div className="rounded-2xl bg-indigo-50/70 border-2 border-indigo-100 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-3 text-center">
            Paso 2: pincha un factor de arriba y luego su gemelo de abajo para tacharlos
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {frac.numF.map((f, i) => (
              <Ficha key={i} f={f} tachada={cNum.has(i)} elegida={elegida === i} onClick={() => pinchaNum(i)} />
            ))}
          </div>
          <div className="h-1 rounded-full bg-indigo-900/70 my-3 mx-auto max-w-xs" />
          <div className="flex flex-wrap justify-center gap-2">
            {frac.denF.map((f, j) => (
              <Ficha key={j} f={f} tachada={cDen.has(j)} sacude={error?.j === j} onClick={() => pinchaDen(j)} />
            ))}
          </div>
          {error && <p className="text-center text-sm text-amber-700 mt-3" role="status">{error.msg}</p>}
          {!lista && <p className="text-center text-xs text-gray-500 mt-3">Quedan {pendientes} {pendientes === 1 ? 'pareja' : 'parejas'} por tachar.</p>}
          {lista && (
            <div className="mt-3 text-center entrar-abajo">
              <p className="font-display font-bold text-emerald-700">🎉 ¡Simplificada!</p>
              <MathTex expr={`\\frac{${frac.num}}{${frac.den}} = \\frac{${texOf(frac.numF, cNum)}}{${texOf(frac.denF, cDen)}}`} display />
              {prohibidos.length > 0 && (
                <p className="text-xs text-gray-600">⚠️ Pero ojo: siempre con <MathTex expr={prohibidos.map(p => `x \\neq ${p}`).join(',\\ ')} />, que anulan el denominador original.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 rounded-2xl border-2 border-gray-100 p-3">
        <label className="block text-sm font-bold text-gray-700">
          🧮 Comprueba con números: x = <span className="tabular-nums">{x}</span>
          <input type="range" min={-6} max={6} step={1} value={x} onChange={e => setX(Number(e.target.value))} className="w-full accent-violet-500" />
        </label>
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-xl bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Original</p>
            <p className={`font-display font-bold text-lg tabular-nums ${vOrig === null ? 'text-red-500' : ''}`}>{fmt(vOrig)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-2">
            <p className="text-xs text-gray-500">{factorizada ? 'Tras tachar' : 'Factorizada'}</p>
            <p className={`font-display font-bold text-lg tabular-nums ${vSimp === null ? 'text-red-500' : ''}`}>{fmt(vSimp)}</p>
          </div>
        </div>
        <p className="text-xs text-center mt-2 text-gray-500">
          {vOrig === null
            ? <>⚠️ Con x = {x} la original divide entre cero: por eso ese valor queda prohibido aunque la simplificada sí dé un número.</>
            : 'Mismo valor: tachar factores iguales no cambia la fracción.'}
        </p>
      </div>
    </div>
  )
}
