import { useState } from 'react'
import MathTex from '../components/MathTex'
import { randomEquation, available, apply, isSolved, solution, weights, tilt, toTex } from './logic/balanza'

// Una ecuación como balanza de verdad: cajas "x" y pesas de 1 en cada platillo.
// Dos formas de jugar con ella:
//  - Probar valores de x con el deslizador: la balanza se inclina hacia el lado
//    que pesa más y solo se equilibra con la solución.
//  - Resolver quitando o dividiendo lo mismo en los dos platillos: la balanza
//    no se mueve, porque hacer lo mismo a los dos lados mantiene la igualdad.

const OPS = [
  { id: 'menos1', label: '−1 pesa', title: 'Quitar una pesa de cada platillo' },
  { id: 'menosTodas', label: '−todas las pesas posibles', title: 'Quitar de los dos platillos las pesas que tengan en común' },
  { id: 'menosX', label: '−x', title: 'Quitar cajas x de los dos platillos' },
  { id: 'dividir', label: '÷ en partes iguales', title: 'Dividir los dos platillos entre el mismo número' },
]

function Platillo({ cx, cy, x, u, color }) {
  // Cajas x y pesas en filas encima del platillo.
  const items = [...Array(x).fill('x'), ...Array(u).fill('u')]
  const porFila = 6
  return (
    <g>
      <line x1={cx - 50} y1={cy - 2} x2={cx} y2={cy - 95} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={cx + 50} y1={cy - 2} x2={cx} y2={cy - 95} stroke="#94a3b8" strokeWidth="1.5" />
      <path d={`M ${cx - 52} ${cy - 2} Q ${cx} ${cy + 18} ${cx + 52} ${cy - 2} Z`} fill={color} stroke="#475569" strokeWidth="1.5" />
      {items.map((it, i) => {
        const fila = Math.floor(i / porFila)
        const col = i % porFila
        const enFila = Math.min(porFila, items.length - fila * porFila)
        const px = cx - (enFila * 15) / 2 + col * 15 + 7.5
        const py = cy - 10 - fila * 15
        return it === 'x' ? (
          <g key={i}>
            <rect x={px - 7} y={py - 7} width="14" height="14" rx="3" fill="#8b5cf6" stroke="#5b21b6" />
            <text x={px} y={py + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">x</text>
          </g>
        ) : (
          <g key={i}>
            <circle cx={px} cy={py} r="6.5" fill="#94a3b8" stroke="#475569" />
            <text x={px} y={py + 3.5} textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">1</text>
          </g>
        )
      })}
    </g>
  )
}

export default function BalanzaEcuaciones({ rng = Math.random }) {
  const [inicial, setInicial] = useState(() => ({ a: 3, b: 2, c: 1, d: 10 }))
  const [eq, setEq] = useState(inicial)
  const [pasos, setPasos] = useState([])
  const [prueba, setPrueba] = useState(1)

  const ops = available(eq)
  const resuelta = isSolved(eq)
  const ang = tilt(eq, prueba)
  const { left, right } = weights(eq, prueba)
  const rad = (-ang * Math.PI) / 180
  const L = 125
  const pivot = { x: 180, y: 70 }
  const izq = { x: pivot.x - L * Math.cos(rad), y: pivot.y - L * Math.sin(rad) }
  const der = { x: pivot.x + L * Math.cos(rad), y: pivot.y + L * Math.sin(rad) }

  const hacer = (op) => {
    const r = apply(eq, op)
    if (!r) return
    setPasos(p => [...p, { txt: r.txt, tex: toTex(r.eq) }])
    setEq(r.eq)
  }
  const nueva = () => {
    const e = randomEquation(rng)
    setInicial(e); setEq(e); setPasos([]); setPrueba(1)
  }
  const reiniciar = () => { setEq(inicial); setPasos([]) }

  return (
    <div>
      <div className="text-center mb-2 text-lg"><MathTex expr={toTex(eq)} /></div>

      <svg viewBox="0 0 360 215" className="w-full max-w-md mx-auto block" role="img"
        aria-label={`Balanza: izquierda pesa ${left}, derecha pesa ${right} si x vale ${prueba}`}>
        {/* Pie */}
        <polygon points="180,72 158,200 202,200" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
        <rect x="130" y="198" width="100" height="10" rx="4" fill="#94a3b8" />
        {/* Brazo */}
        <line x1={izq.x} y1={izq.y} x2={der.x} y2={der.y} stroke="#475569" strokeWidth="6" strokeLinecap="round" style={{ transition: 'all 400ms cubic-bezier(.3,1.4,.5,1)' }} />
        <circle cx={pivot.x} cy={pivot.y} r="7" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <g style={{ transition: 'transform 400ms cubic-bezier(.3,1.4,.5,1)' }} transform={`translate(${izq.x - 55} ${izq.y + 95 - 150})`}>
          <Platillo cx={55} cy={150} x={eq.a} u={eq.b} color="#bfdbfe" />
        </g>
        <g style={{ transition: 'transform 400ms cubic-bezier(.3,1.4,.5,1)' }} transform={`translate(${der.x - 55} ${der.y + 95 - 150})`}>
          <Platillo cx={55} cy={150} x={eq.c} u={eq.d} color="#fde68a" />
        </g>
      </svg>

      <div className="rounded-2xl bg-indigo-50 border-2 border-indigo-100 p-3 mt-2">
        <label className="block text-sm font-bold text-indigo-800">
          🔍 Prueba un valor: x = <span className="tabular-nums">{prueba}</span>
          <input type="range" min={0} max={12} step={1} value={prueba} onChange={e => setPrueba(Number(e.target.value))} className="w-full accent-indigo-500" />
        </label>
        <p className="text-sm text-center tabular-nums">
          Izquierda pesa <strong>{left}</strong> · derecha pesa <strong>{right}</strong>
          {' → '}
          {left === right
            ? <strong className="text-emerald-600">¡Equilibrio! x = {prueba} es la solución</strong>
            : <span className="text-amber-700">{left > right ? 'baja la izquierda' : 'baja la derecha'}</span>}
        </p>
      </div>

      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">⚖️ Resuelve haciendo lo mismo a los dos lados</p>
        <div className="flex flex-wrap gap-2">
          {OPS.map(o => (
            <button key={o.id} type="button" title={o.title} disabled={!ops.includes(o.id) || resuelta} onClick={() => hacer(o.id)} className="btn btn-sm btn-sky">{o.label}</button>
          ))}
          <button type="button" onClick={reiniciar} className="btn btn-sm btn-ghost">↺ Reiniciar</button>
          <button type="button" onClick={nueva} className="btn btn-sm btn-violet">🎲 Nueva ecuación</button>
        </div>
      </div>

      {pasos.length > 0 && (
        <ol className="mt-3 space-y-1 text-sm">
          {pasos.map((p, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl bg-surface border px-3 py-1.5 entrar-abajo">
              <span className="shrink-0 w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] font-bold grid place-items-center">{i + 1}</span>
              <span className="flex-1 text-gray-600">{p.txt}</span>
              <MathTex expr={p.tex} />
            </li>
          ))}
        </ol>
      )}
      {resuelta && (
        <p className="mt-3 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-display font-bold text-center p-3 entrar-abajo">
          🎉 ¡Resuelta! x = {solution(eq)}. Compruébalo con el deslizador: la balanza se equilibra.
        </p>
      )}
    </div>
  )
}
