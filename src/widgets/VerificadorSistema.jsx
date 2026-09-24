import { useState } from 'react'
import { Mafs, Coordinates, Line, Theme, useMovablePoint } from 'mafs'
import MathTex from '../components/MathTex'
import { eqTex } from './logic/reduccion'

// ¿Qué significa "la solución de un sistema"? Un punto que cumple LAS DOS
// ecuaciones a la vez. Aquí arrastras un punto por el plano y cada ecuación te
// dice en directo si lo cumple (se enciende su recta). Solo en el cruce se
// encienden las dos. Con los casos especiales se ve por qué a veces no hay
// cruce (paralelas) o hay infinitos (la misma recta).

const CASOS = {
  unica: { label: '✳️ Una solución', e1: { a: 1, b: 1, c: 5 }, e2: { a: 2, b: -1, c: 1 }, nota: 'Las rectas se cortan en un solo punto: el sistema tiene una única solución.' },
  paralelas: { label: '∥ Paralelas', e1: { a: 1, b: -1, c: -1 }, e2: { a: 1, b: -1, c: 3 }, nota: 'Misma inclinación, distinta altura: nunca se cortan. Ningún punto cumple las dos → sin solución.' },
  misma: { label: '≡ La misma recta', e1: { a: 1, b: 2, c: 4 }, e2: { a: 2, b: 4, c: 8 }, nota: 'La segunda es la primera multiplicada por 2: es la misma recta. Todos sus puntos cumplen las dos → infinitas soluciones.' },
}

const cumple = (e, x, y) => Math.abs(e.a * x + e.b * y - e.c) < 1e-9

// Dos puntos de la recta ax + by = c, dentro de la vista.
function puntos(e) {
  if (e.b !== 0) return [[-10, (e.c - e.a * -10) / e.b], [10, (e.c - e.a * 10) / e.b]]
  return [[e.c / e.a, -10], [e.c / e.a, 10]]
}

function Sustitucion({ e, x, y, color, nombre }) {
  const ok = cumple(e, x, y)
  const izq = e.a * x + e.b * y
  return (
    <div className={`rounded-xl border-2 p-2.5 text-sm transition-colors ${ok ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-surface'}`}>
      <p className="font-bold text-xs mb-1" style={{ color }}>{nombre}: <MathTex expr={eqTex(e)} /></p>
      <p className="tabular-nums">
        <MathTex expr={`${e.a}(${x}) ${e.b < 0 ? '-' : '+'} ${Math.abs(e.b)}(${y}) = ${izq}`} />
        {' '}{ok ? <span className="text-emerald-600 font-bold">= {e.c} ✓</span> : <span className="text-red-500 font-bold">≠ {e.c} ✗</span>}
      </p>
    </div>
  )
}

export default function VerificadorSistema() {
  const [caso, setCaso] = useState('unica')
  const { e1, e2, nota } = CASOS[caso]
  const p = useMovablePoint([0, 0], {
    constrain: ([x, y]) => [Math.max(-8, Math.min(8, Math.round(x))), Math.max(-8, Math.min(8, Math.round(y)))],
    color: Theme.orange,
  })
  const [x, y] = p.point
  const ok1 = cumple(e1, x, y)
  const ok2 = cumple(e2, x, y)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(CASOS).map(([k, c]) => (
          <button key={k} type="button" onClick={() => setCaso(k)} className={`btn btn-sm ${caso === k ? '' : 'btn-ghost'}`}>{c.label}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_15rem] gap-3">
        <div className="rounded-2xl overflow-hidden border-2 border-indigo-100">
          <Mafs viewBox={{ x: [-8, 8], y: [-8, 8] }} height={320} pan={false}>
            <Coordinates.Cartesian />
            <Line.ThroughPoints point1={puntos(e1)[0]} point2={puntos(e1)[1]} color={Theme.blue} weight={ok1 ? 5 : 2} opacity={ok1 ? 1 : 0.55} />
            <Line.ThroughPoints point1={puntos(e2)[0]} point2={puntos(e2)[1]} color={Theme.green} weight={ok2 ? 5 : 2} opacity={ok2 ? 1 : 0.55} style={caso === 'misma' ? 'dashed' : 'solid'} />
            {p.element}
          </Mafs>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold">🟠 Arrastra el punto: <span className="tabular-nums">({x}, {y})</span></p>
          <Sustitucion e={e1} x={x} y={y} color="#2563eb" nombre="Ecuación 1" />
          <Sustitucion e={e2} x={x} y={y} color="#16a34a" nombre="Ecuación 2" />
          <p className={`rounded-xl p-2.5 text-sm font-display font-bold text-center ${ok1 && ok2 ? 'bg-emerald-500 text-white latido' : 'bg-gray-100 text-gray-500'}`}>
            {ok1 && ok2 ? `🎯 ¡(${x}, ${y}) es solución!` : ok1 || ok2 ? 'Cumple solo una… sigue buscando' : 'No cumple ninguna'}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">💡 {nota}</p>
    </div>
  )
}
