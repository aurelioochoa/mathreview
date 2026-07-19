import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { useGame } from '../state/gameStore'
import { levelForXp, titleForLevel } from '../state/xpCurve'

export default function WorldView() {
  const { slug } = useParams()
  const { state } = useGame()
  const world = findWorld(slug)
  if (!world) return <p className="text-center py-12">Mundo no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const playerLevel = levelForXp(state.xp)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">{world.emoji} {world.name}</h1>
          <p className="text-gray-500">{world.description}</p>
        </div>
        <div className="text-right text-sm bg-white rounded-xl border px-4 py-2 shadow-sm">
          <p className="font-bold text-primary">Nv. {playerLevel} — {titleForLevel(playerLevel)}</p>
          <p className="text-gray-500">{state.xp} XP · {state.coins} 🪙</p>
        </div>
      </div>

      <div className="space-y-3">
        {world.levels.map((level, i) => {
          const key = `${world.id}/${level.id}`
          const prevKey = i > 0 ? `${world.id}/${world.levels[i - 1].id}` : null
          const unlocked = i === 0 || state.completedLevels.includes(prevKey)
          const stars = state.stars[key] ?? 0
          return unlocked ? (
            <Link key={key} to={`/mundo/${world.slug}/nivel/${level.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className="text-3xl">{level.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Nivel {i + 1}: {level.title}</p>
                <p className="text-amber-500">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
              </div>
              <span className="text-primary font-semibold text-sm">Jugar →</span>
            </Link>
          ) : (
            <div key={key} className="flex items-center gap-4 bg-gray-50 rounded-2xl border-2 border-gray-100 p-4 opacity-60">
              <span className="text-3xl">🔒</span>
              <p className="font-bold text-gray-400">Nivel {i + 1}: {level.title}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
