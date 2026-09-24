import { useGame } from '../state/gameStore'
import { ACHIEVEMENTS } from '../content/achievements'

export default function Achievements() {
  const { state } = useGame()
  const unlocked = new Set(state.achievements)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="panel overflow-hidden mb-6" style={{ '--mundo': '#8b5cf6' }}>
        <div className="panel-banda px-5 py-4 flex items-center gap-4">
          <span className="text-5xl flotar drop-shadow" aria-hidden="true">🏆</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-extrabold">🎖️ Logros</h1>
            <p className="text-sm opacity-90">{unlocked.size} / {ACHIEVEMENTS.length} desbloqueados</p>
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="barra"><div className="relleno" style={{ width: `${(unlocked.size / ACHIEVEMENTS.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const got = unlocked.has(a.id)
          const oculto = a.secret && !got
          return (
            <div key={a.id} className={`flex items-center gap-3 rounded-2xl p-3 ${got ? 'panel !rounded-2xl !border-2 !border-amber-300' : 'bg-gray-50 border-2 border-dashed border-gray-200 opacity-70'}`}>
              <span className={`text-3xl w-12 h-12 grid place-items-center rounded-xl shrink-0 ${got ? 'bg-amber-100' : 'bg-gray-100 grayscale'}`}>{oculto ? '❓' : a.emoji}</span>
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
