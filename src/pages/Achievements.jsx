import { useGame } from '../state/gameStore'
import { ACHIEVEMENTS } from '../content/achievements'

export default function Achievements() {
  const { state } = useGame()
  const unlocked = new Set(state.achievements)

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-extrabold text-gray-800 mb-1">🎖️ Logros</h1>
      <p className="text-gray-500 mb-6">{unlocked.size} / {ACHIEVEMENTS.length} desbloqueados</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const got = unlocked.has(a.id)
          const oculto = a.secret && !got
          return (
            <div key={a.id} className={`flex items-center gap-3 rounded-2xl p-3 shadow-sm ${got ? 'glass' : 'bg-gray-50 border border-gray-100 opacity-70'}`}>
              <span className="text-3xl">{oculto ? '❓' : a.emoji}</span>
              <div>
                <p className="font-bold text-gray-800">{oculto ? 'Logro secreto' : a.name}</p>
                <p className="text-xs text-gray-500">{oculto ? '???' : a.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
