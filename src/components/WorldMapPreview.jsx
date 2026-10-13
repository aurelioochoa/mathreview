import { Link } from 'react-router-dom'
import { nodeState, worldProgress } from '../content/worldMap'

export default function WorldMapPreview({ node, gameState }) {
  const state = nodeState(node, gameState)
  const progress = worldProgress(node, gameState)
  return (
    <section aria-label="Mundo seleccionado" className="glass rounded-2xl p-4 shadow-lg">
      <h2 className="font-display font-bold text-gray-800">{node.emoji} {node.title}</h2>
      <p className="text-gray-600 text-xs mt-1">{node.subtitle}</p>
      {progress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-amber-600">⭐ {progress.stars}/{progress.totalStars}</span>
            <span className="text-gray-600">{progress.pct}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Progreso en ${node.title}`}
            aria-valuenow={progress.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-1 h-1.5 rounded-full bg-gray-200 overflow-hidden"
          >
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      )}
      {state === 'locked' && <p className="text-gray-600 text-xs mt-2">🔒 Derrota al jefe anterior o usa el portal.</p>}
      {state === 'completed' && <p className="text-emerald-700 text-xs font-bold mt-2">✔ Completado</p>}
      {state === 'coming-soon' ? <p className="text-gray-500 text-xs mt-2">Próximamente</p> : (
        <Link to={node.target} className="mt-3 inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-display font-bold">
          {state === 'locked' ? 'Ver cómo desbloquear →' : 'Entrar al mundo →'}
        </Link>
      )}
    </section>
  )
}
