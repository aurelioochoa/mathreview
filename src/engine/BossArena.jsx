import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { buildBossPool } from './generators'
import { useGame, XP_PER_CORRECT, COINS_BOSS, XP_BOSS } from '../state/gameStore'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))
const BOSS_QUESTIONS = 8
const BOSS_LIVES = 5

export default function BossArena() {
  const { slug } = useParams()
  return <BossArenaView key={slug} />
}

function BossArenaView() {
  const { slug } = useParams()
  const { state, dispatch } = useGame()
  const world = findWorld(slug)

  const [phase, setPhase] = useState('intro')   // intro | pelea | derrota | victoria
  const [attempt, setAttempt] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [lives, setLives] = useState(BOSS_LIVES)
  const [hits, setHits] = useState(0)           // golpes acertados (vida del jefe)
  const [selected, setSelected] = useState(null)
  const { use3D } = useDeviceTier()

  const questions = useMemo(
    () => (world ? buildBossPool(world, BOSS_QUESTIONS) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, attempt],
  )

  if (!world) return <p className="text-center py-12">Jefe no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const allDone = world.levels.every(l => state.completedLevels.includes(`${world.id}/${l.id}`))
  const q = questions[qIndex]
  const bossHpPct = Math.round(((questions.length - hits) / questions.length) * 100)

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) {
      dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
      setHits(h => h + 1)
    } else {
      const remaining = lives - 1
      setLives(remaining)
      if (remaining <= 0) setPhase('derrota')
    }
  }

  const next = () => {
    setSelected(null)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      dispatch({ type: 'BOSS_DEFEATED', worldId: world.id, coins: COINS_BOSS, xp: XP_BOSS })
      setPhase('victoria')
    }
  }

  const retry = () => {
    setAttempt(a => a + 1)
    setQIndex(0); setLives(BOSS_LIVES); setHits(0); setSelected(null); setPhase('pelea')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <span className={`inline-block px-3 py-1 ${world.color} text-white rounded-full text-sm font-semibold mb-2`}>{world.emoji} {world.name}</span>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">{world.boss.emoji} {world.boss.name}</h1>
      </div>

      {phase === 'intro' && (
        <div className="glass rounded-[1.75rem] shadow-lg p-8 text-center">
          <p className="text-6xl mb-3">{world.boss.emoji}</p>
          <p className="text-gray-600 mb-6">{world.boss.intro}</p>
          {allDone ? (
            <button onClick={() => setPhase('pelea')} className="px-6 py-3 rounded-xl font-display bg-red-500 text-white font-bold">⚔️ ¡Enfrentar al jefe!</button>
          ) : (
            <div>
              <p className="text-sm text-amber-600 mb-3">Completa todos los niveles del mundo para desafiar al jefe.</p>
              <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
            </div>
          )}
        </div>
      )}

      {phase === 'pelea' && q && (
        <div className="glass rounded-[1.75rem] shadow-lg p-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>{world.boss.emoji} Vida del jefe</span>
            <span>{'❤️'.repeat(lives)}{'🖤'.repeat(BOSS_LIVES - lives)}</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
            <div className="h-full bg-red-500 transition-all" style={{ width: `${bossHpPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mb-2">Golpe {qIndex + 1} / {questions.length}</p>
          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = selected !== null && i === q.correctAnswer
              const isWrong = selected === i && i !== q.correctAnswer
              return (
                <button key={i} disabled={selected !== null} onClick={() => answer(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${isCorrect ? 'bg-green-100 border-green-400' : isWrong ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200 hover:bg-indigo-50'}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)})</span>{opt}
                </button>
              )
            })}
          </div>
          {selected !== null && selected !== q.correctAnswer && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
              💡 {q.hint}
              <p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={next} className="mt-2 px-3 py-1.5 rounded bg-yellow-400 text-white text-xs font-bold">Continuar</button>
            </div>
          )}
          {selected === q.correctAnswer && (
            <button onClick={next} className="mt-4 px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">🗡️ ¡Golpe! Continuar</button>
          )}
        </div>
      )}

      {phase === 'derrota' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-5xl mb-2">💥</p>
          <h2 className="font-display text-xl font-bold mb-2">El jefe te venció</h2>
          <p className="text-gray-500 mb-4 text-sm">El XP que ganaste se queda contigo. Inténtalo otra vez con preguntas nuevas.</p>
          <button onClick={retry} className="px-6 py-3 rounded-xl font-display bg-primary text-white font-bold">🔄 Reintentar</button>
        </div>
      )}

      {phase === 'victoria' && (
        <div className="relative text-center glass rounded-[1.75rem] shadow-lg p-8 overflow-hidden">
          {use3D && <div className="absolute inset-0 pointer-events-none" aria-hidden="true"><Suspense fallback={null}><Celebration /></Suspense></div>}
          <div className="relative">
            <p className="text-5xl mb-2">🏆</p>
            <h2 className="font-display text-xl font-bold mb-1">¡{world.boss.name} derrotado!</h2>
            <p className="text-sm text-gray-500 mb-4">+{XP_BOSS} XP · +{COINS_BOSS} 🪙 · ⭐ Maestría del mundo</p>
            <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
          </div>
        </div>
      )}
    </div>
  )
}
