import { useId } from 'react'
import MathHistory from './MathHistory'

export default function ConceptLab({ concept, title, question, children, goal, achieved, explanation }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="glass rounded-2xl p-4 sm:p-5 border border-indigo-200 my-4 min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Laboratorio visual</p>
      <h3 id={titleId} className="font-display font-bold text-xl text-gray-800 mt-1">{title}</h3>
      <p className="text-sm text-gray-600 mt-2"><strong>Antes de mover:</strong> {question}</p>
      <div className="mt-4 space-y-4">{children}</div>
      <div className="mt-4 rounded-xl border border-indigo-200 p-3 text-sm">
        <p className="font-semibold">Misión: {goal}</p>
        <p role="status" aria-label="Resultado de la misión" className={`mt-1 ${achieved ? 'text-emerald-700' : 'text-gray-600'}`}>
          {achieved ? '¡Lo lograste! ' : 'Sigue explorando. '}{explanation}
        </p>
      </div>
      <MathHistory concept={concept} />
    </section>
  )
}
