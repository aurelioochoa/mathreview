import { useState } from 'react'
import { EXPERIMENTOS, simulate, emptyRun, eventP } from './logic/probabilidad'

// La probabilidad dice lo que pasa "a la larga". Aquí se lanza de verdad: una
// vez, diez, mil… y se ve cómo la frecuencia de cada resultado se acerca a su
// probabilidad teórica (la raya) y cómo la línea del evento elegido se va
// pegando a P(evento). Con pocas tiradas, cualquier cosa; con muchas, la ley
// de los grandes números.

const pct = (v) => `${(v * 100).toFixed(v < 0.1 && v > 0 ? 1 : 0)}%`

function Convergencia({ history, p }) {
  const W = 600, H = 110, pad = 6
  if (history.length < 2) {
    return <div className="h-[110px] grid place-items-center text-xs text-gray-400">La gráfica aparece al lanzar varias veces</div>
  }
  const maxN = history[history.length - 1][0]
  const X = (n) => pad + ((n - 1) / Math.max(1, maxN - 1)) * (W - 2 * pad)
  const Y = (v) => H - pad - v * (H - 2 * pad)
  const d = history.map(([n, v], i) => `${i ? 'L' : 'M'} ${X(n).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[110px]" role="img" aria-label="Frecuencia del evento frente al número de tiradas">
      {[0, 0.5, 1].map(v => (
        <g key={v}>
          <line x1={pad} x2={W - pad} y1={Y(v)} y2={Y(v)} stroke="#e5e7eb" />
          <text x={W - pad} y={Y(v) - 2} textAnchor="end" fontSize="8" fill="#9ca3af">{v * 100}%</text>
        </g>
      ))}
      <line x1={pad} x2={W - pad} y1={Y(p)} y2={Y(p)} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth="1.5" />
      <path d={d} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={X(history[history.length - 1][0])} cy={Y(history[history.length - 1][1])} r="3.5" fill="#6366f1" />
    </svg>
  )
}

export default function SimuladorProbabilidad({ rng = Math.random }) {
  const [expId, setExpId] = useState('dado')
  const exp = EXPERIMENTOS[expId]
  const [evId, setEvId] = useState(exp.eventos[0].id)
  const ev = exp.eventos.find(e => e.id === evId) ?? exp.eventos[0]
  const [run, setRun] = useState(() => emptyRun(exp))
  const [giro, setGiro] = useState(0)

  const cambiarExp = (id) => {
    const e = EXPERIMENTOS[id]
    setExpId(id); setEvId(e.eventos[0].id); setRun(emptyRun(e))
  }
  const cambiarEv = (id) => {
    setEvId(id); setRun(emptyRun(exp))
  }
  const lanzar = (n) => {
    setRun(r => simulate(exp, r, n, ev.ids, rng))
    setGiro(g => g + 1)
  }

  const p = eventP(exp, ev.ids)
  const freq = run.total ? run.hits / run.total : 0
  const ultimo = run.last[run.last.length - 1]
  const ultimoR = exp.resultados.find(r => r.id === ultimo)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(EXPERIMENTOS).map(([id, e]) => (
          <button key={id} type="button" onClick={() => cambiarExp(id)} className={`btn btn-sm ${id === expId ? '' : 'btn-ghost'}`}>{e.icono} {e.nombre}</button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <span className="font-bold text-gray-600">Evento:</span>
        {exp.eventos.map(e => (
          <button key={e.id} type="button" onClick={() => cambiarEv(e.id)}
            className={`rounded-full px-3 py-1 border-2 font-semibold ${e.id === ev.id ? 'border-amber-400 bg-amber-100 text-amber-800' : 'border-gray-200'}`}>
            {e.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">P teórica = <strong className="text-amber-600">{ev.frac} = {pct(p)}</strong></span>
      </div>

      <div className="grid md:grid-cols-[9rem_1fr] gap-4 items-start">
        <div className="text-center">
          <div key={giro} className={`mx-auto w-28 h-28 rounded-3xl grid place-items-center text-6xl bg-surface border-4 border-indigo-200 shadow-[0_6px_0_var(--panel-ledge)] ${giro ? 'sacudir' : ''}`}>
            {ultimoR ? ultimoR.icon : exp.icono}
          </div>
          <p className="text-xs text-gray-500 mt-2 min-h-4">{ultimoR ? ultimoR.label : 'Lanza para empezar'}</p>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button type="button" onClick={() => lanzar(1)} className="btn btn-sm btn-green col-span-2">🎲 Lanzar</button>
            <button type="button" onClick={() => lanzar(10)} className="btn btn-sm btn-sky">×10</button>
            <button type="button" onClick={() => lanzar(100)} className="btn btn-sm btn-sky">×100</button>
            <button type="button" onClick={() => lanzar(1000)} className="btn btn-sm btn-violet col-span-2">×1000</button>
            <button type="button" onClick={() => setRun(emptyRun(exp))} className="btn btn-sm btn-ghost col-span-2">↺ Borrar</button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            {exp.resultados.map(r => {
              const f = run.total ? run.counts[r.id] / run.total : 0
              const enEvento = ev.ids.includes(r.id)
              return (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="w-24 shrink-0 truncate">{r.icon} {r.label}</span>
                  <div className="relative flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${enEvento ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ width: `${f * 100}%` }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-gray-800/70" style={{ left: `${r.p * 100}%` }} title={`Teórica ${pct(r.p)}`} />
                  </div>
                  <span className="w-20 shrink-0 text-right tabular-nums text-xs">{run.counts[r.id]} · {pct(f)}</span>
                </div>
              )
            })}
            <p className="text-[11px] text-gray-400">La raya negra marca la probabilidad teórica de cada resultado.</p>
          </div>

          <div className="rounded-2xl border-2 border-gray-100 p-2">
            <div className="flex justify-between text-xs font-bold mb-1 px-1">
              <span>Frecuencia de «{ev.label}» tras {run.total} tiradas</span>
              <span className="text-indigo-600 tabular-nums">{run.hits}/{run.total} = {pct(freq)}</span>
            </div>
            <Convergencia history={run.history} p={p} />
          </div>
          <p className="text-xs text-gray-500">
            💡 Con pocas tiradas la línea da bandazos. Pulsa ×1000 y mira cómo se pega a la raya amarilla ({pct(p)}): eso es lo que significa la probabilidad.
          </p>
        </div>
      </div>
    </div>
  )
}
