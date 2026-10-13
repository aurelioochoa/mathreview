import { mathHistory } from '../content/mathHistory'

export default function MathHistory({ concept }) {
  const history = mathHistory[concept]
  return (
    <details className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <summary className="cursor-pointer font-semibold text-sm text-indigo-800 min-h-8">
        Historia de las matemáticas · {history.title}
      </summary>
      <p className="text-xs font-semibold text-indigo-700 mt-3">{history.place}</p>
      <p className="text-sm text-gray-700 mt-2">{history.body}</p>
      <p className="text-sm text-gray-700 mt-2"><strong>Prueba la idea:</strong> {history.connection}</p>
      <a href={history.source} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-indigo-700 underline underline-offset-4 mt-3 py-2">
        Fuente: MacTutor · Universidad de St Andrews (en inglés, abre otra pestaña)
      </a>
    </details>
  )
}
