import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { buildBossPool } from './generators'
import { rutaMundo } from '../state/vistaMundo'
import { useGame, XP_PER_CORRECT, COINS_BOSS, XP_BOSS } from '../state/gameStore'
import { useDeviceTier } from '../three/useDeviceTier'
import Chest from './Chest'
import OptionButton from '../components/OptionButton'
import { GameHeader, Hearts, Bar, QuestionCard, Feedback, ResultCard, Rewards } from '../components/game/GameUI'
import useAnswerKeys from '../components/game/useAnswerKeys'

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
  const [cofre, setCofre] = useState(false)   // solo en la primera victoria del mundo
  const [hintShown, setHintShown] = useState(false)  // pista comprada en el golpe actual
  const { use3D } = useDeviceTier()

  const questions = useMemo(
    () => (world ? buildBossPool(world, BOSS_QUESTIONS) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, attempt],
  )

  const qNow = questions[qIndex]
  useAnswerKeys({
    count: qNow?.options.length ?? 0,
    onPick: (i) => answer(i),
    onContinue: selected !== null ? () => next() : undefined,
    enabled: phase === 'pelea' && !!qNow,
  })

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
    setHintShown(false)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      // El cofre solo cae la primera vez que se derrota a este jefe: rejugarlo
      // sigue pagando XP y monedas, pero no es una fuente infinita de cosméticos.
      setCofre(!state.bossDefeats.includes(world.id))
      dispatch({ type: 'BOSS_DEFEATED', worldId: world.id, coins: COINS_BOSS, xp: XP_BOSS, livesLeft: lives })
      setPhase('victoria')
    }
  }

  const retry = () => {
    setAttempt(a => a + 1)
    setQIndex(0); setLives(BOSS_LIVES); setHits(0); setSelected(null); setHintShown(false); setPhase('pelea')
  }

  const golpeado = selected !== null && selected === q?.correctAnswer
  const herido = selected !== null && selected !== q?.correctAnswer

  return (
    <div className="max-w-3xl mx-auto">
      <GameHeader world={world} backTo={rutaMundo(world.slug)} backLabel="Volver al mundo" kicker={`${world.emoji} ${world.name} · Jefe`} title={`${world.boss.emoji} ${world.boss.name}`} />

      {phase === 'intro' && (
        <div className="panel p-8 text-center entrar-abajo">
          <p className="text-8xl mb-3 flotar inline-block drop-shadow-xl">{world.boss.emoji}</p>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">{world.boss.intro}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6 text-sm">
            <span className="chip"><span className="chip-ico bg-red-100">⚔️</span>{BOSS_QUESTIONS} golpes para vencerlo</span>
            <span className="chip"><span className="chip-ico bg-pink-100">❤️</span>{BOSS_LIVES} vidas</span>
          </div>
          {allDone ? (
            <button onClick={() => setPhase('pelea')} className="btn btn-red btn-lg latido">⚔️ ¡Enfrentar al jefe!</button>
          ) : (
            <div>
              <p className="text-sm text-amber-600 mb-3">Completa todos los niveles del mundo para desafiar al jefe.</p>
              <Link to={`/mundo/${world.slug}`} className="btn">Volver al mundo</Link>
            </div>
          )}
        </div>
      )}

      {phase === 'pelea' && q && (
        <div className="space-y-4">
          {/* Arena: el jefe con su barra de vida, frente a tus corazones */}
          <div className="panel p-4 sm:p-5 flex items-center gap-4 overflow-hidden">
            <span key={`${qIndex}-${selected}`}
              className={`text-6xl sm:text-7xl shrink-0 inline-block ${golpeado ? 'sacudir' : herido ? 'latido' : 'flotar'}`}>
              {world.boss.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1 text-sm font-display font-bold">
                <span className="truncate">{world.boss.emoji} Vida del jefe</span>
                <span className="text-red-500 tabular-nums">{bossHpPct}%</span>
              </div>
              <Bar pct={bossHpPct} label="Vida del jefe" gradient="linear-gradient(90deg,#f87171,#dc2626)" />
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-xs font-semibold text-gray-500">Golpe {qIndex + 1} / {questions.length}</span>
                <Hearts lives={lives} max={BOSS_LIVES} />
              </div>
            </div>
          </div>

          <QuestionCard>
            <p key={qIndex} className="entrar-abajo font-display text-lg sm:text-xl font-bold leading-snug mb-4">{q.question}</p>
            {selected === null && !hintShown && (
              state.hints > 0
                ? <button onClick={() => { dispatch({ type: 'USE_HINT' }); setHintShown(true) }}
                    className="btn btn-amber btn-sm mb-4">
                    💡 Pedir pista ({state.hints} {state.hints === 1 ? 'token' : 'tokens'})
                  </button>
                : <p className="mb-4"><Link to="/tienda" className="text-xs font-semibold text-primary underline">Consigue pistas en la tienda</Link></p>
            )}
            {hintShown && selected === null && (
              <div className="mb-4 p-3 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-sm entrar-abajo">💡 {q.hint}</div>
            )}
            <div className="grid gap-2.5">
              {q.options.map((opt, i) => (
                <OptionButton key={i} index={i} disabled={selected !== null} onClick={() => answer(i)}
                  estado={selected !== null && i === q.correctAnswer ? 'correcta' : selected === i ? 'fallada' : 'neutro'}>
                  {opt}
                </OptionButton>
              ))}
            </div>
            {herido && (
              <Feedback tone="ko" title="¡El jefe te golpea!">
                💡 {q.hint}
                <p className="text-xs italic mt-1">{q.reminder}</p>
                <button onClick={next} className="btn btn-amber btn-sm mt-3">Continuar</button>
              </Feedback>
            )}
            {golpeado && (
              <Feedback tone="ok" title="¡Golpe crítico!">
                <button onClick={next} className="btn btn-green">🗡️ ¡Golpe! Continuar</button>
              </Feedback>
            )}
          </QuestionCard>
        </div>
      )}

      {phase === 'derrota' && (
        <ResultCard icon="💥" title="El jefe te venció">
          <p className="text-gray-500 mb-5 text-sm">El XP que ganaste se queda contigo. Inténtalo otra vez con preguntas nuevas.</p>
          <button onClick={retry} className="btn btn-lg">🔄 Reintentar</button>
        </ResultCard>
      )}

      {phase === 'victoria' && (
        <ResultCard
          icon="🏆"
          title={`¡${world.boss.name} derrotado!`}
          overlay={use3D && <div className="absolute inset-0 pointer-events-none" aria-hidden="true"><Suspense fallback={null}><Celebration variant="jefe" /></Suspense></div>}
        >
          <p className="text-sm font-semibold text-gray-500 mb-2">💀 {world.boss.emoji} Jefe derrotado</p>
          <div className="max-w-xs mx-auto"><Bar pct={0} label="Vida del jefe" /></div>
          <Rewards items={[{ icon: '✨', text: `+${XP_BOSS} XP` }, { icon: '🪙', text: `+${COINS_BOSS}` }, { icon: '⭐', text: 'Maestría del mundo' }]} />
          {cofre && <Chest />}
          <Link to={rutaMundo(world.slug)} className="btn btn-lg mt-2">Volver al mundo</Link>
        </ResultCard>
      )}
    </div>
  )
}
