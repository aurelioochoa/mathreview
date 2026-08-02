import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { widgets } from '../widgets'
import { buildReto } from './generators'
import { useGame, XP_PER_CORRECT, XP_LEVEL_COMPLETE, coinsForCompletion } from '../state/gameStore'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import InteractiveBox from '../components/InteractiveBox'
import OptionButton from '../components/OptionButton'
import Chest from './Chest'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))

function BriefingStep({ step }) {
  if (step.type === 'why') return <WhySection>{step.body}</WhySection>
  if (step.type === 'mistakes') return <CommonMistakes mistakes={step.items} />
  if (step.type === 'widget') {
    const Widget = widgets[step.widgetId]
    return <InteractiveBox title={step.title}>{Widget ? <Widget /> : <p>Widget no encontrado: {step.widgetId}</p>}</InteractiveBox>
  }
  return <div>{step.body}</div>
}

// Envoltorio que fuerza el remount al cambiar de nivel (resetea phase/attempt/
// lives/…), evitando estado obsoleto si se añade navegación nivel→nivel. Hoy el
// fin de nivel solo enlaza de vuelta al mundo, así que es preventivo.
export default function LevelPlayer() {
  const { levelId } = useParams()
  return <LevelPlayerView key={levelId} />
}

function LevelPlayerView() {
  const { slug, levelId } = useParams()
  const { state, dispatch } = useGame()
  const world = findWorld(slug)
  const level = world?.levels.find(l => l.id === levelId)

  const [phase, setPhase] = useState('briefing')   // briefing | reto | fallado | completado
  const [stepIndex, setStepIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [firstTryHits, setFirstTryHits] = useState(0)
  const [selected, setSelected] = useState(null)   // índice elegido en la pregunta actual
  const [failedThis, setFailedThis] = useState(false)
  const [hintShown, setHintShown] = useState(false)  // pista comprada en la pregunta actual
  const [result, setResult] = useState(null)   // { stars, coins, primeraVez } de esta partida
  const startRef = useRef(null)                // inicio del reto, para el logro Speedrunner

  const questions = useMemo(
    () => (level ? buildReto(level.reto.factories, level.reto.pick) : []),
    // `attempt` es intencional: al reintentar (setAttempt) regenera preguntas nuevas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, attempt],
  )

  const { use3D } = useDeviceTier()

  if (!world || !level) return <p className="text-center py-12">Nivel no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const levelKey = `${world.id}/${level.id}`
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) {
      dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
      if (!failedThis) setFirstTryHits(h => h + 1)
    } else {
      setFailedThis(true)
      const remaining = lives - 1
      setLives(remaining)
      if (remaining <= 0) setPhase('fallado')
    }
  }

  const nextQuestion = () => {
    setSelected(null)
    setFailedThis(false)
    setHintShown(false)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      const ratio = firstTryHits / questions.length
      const stars = ratio >= 1 ? 3 : ratio >= 0.66 ? 2 : 1
      const coins = coinsForCompletion(state.stars[levelKey], stars)
      // Se calcula antes del dispatch: después, stars[levelKey] ya existe.
      const primeraVez = state.stars[levelKey] === undefined
      const seconds = startRef.current ? (Date.now() - startRef.current) / 1000 : null
      dispatch({
        type: 'LEVEL_COMPLETED', levelKey, stars, xp: XP_LEVEL_COMPLETE,
        perfectLives: lives === 3, seconds,   // datos para los logros
      })
      setResult({ stars, coins, primeraVez })
      setPhase('completado')
    }
  }

  const retry = () => {
    setAttempt(a => a + 1)
    setQIndex(0); setLives(3); setFirstTryHits(0); setSelected(null); setFailedThis(false); setHintShown(false)
    startRef.current = Date.now()
    setPhase('reto')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 ${world.color} text-white rounded-full text-sm font-semibold mb-2`}>{world.emoji} {world.name}</span>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">{level.icon} {level.title}</h1>
      </div>

      {phase === 'briefing' && (
        <div>
          <BriefingStep step={level.briefing[stepIndex]} />
          <div className="flex justify-between mt-4">
            <button disabled={stepIndex === 0} onClick={() => setStepIndex(i => i - 1)} className="px-4 py-2 rounded-xl font-display glass disabled:opacity-40">← Anterior</button>
            <span className="text-sm text-gray-400 self-center">{stepIndex + 1} / {level.briefing.length}</span>
            {stepIndex + 1 < level.briefing.length
              ? <button onClick={() => setStepIndex(i => i + 1)} className="px-4 py-2 rounded-xl font-display bg-primary text-white">Siguiente →</button>
              : <button onClick={() => { startRef.current = Date.now(); setPhase('reto') }} className="px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">⚔️ ¡Al reto!</button>}
          </div>
        </div>
      )}

      {phase === 'reto' && q && (
        <div className="glass rounded-[1.75rem] shadow-lg p-6">
          <div className="flex justify-between mb-4 text-sm">
            <span>Pregunta {qIndex + 1} / {questions.length}</span>
            <span>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
          </div>
          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
          {selected === null && !hintShown && (
            state.hints > 0
              ? <button onClick={() => { dispatch({ type: 'USE_HINT' }); setHintShown(true) }}
                  className="mb-3 px-3 py-1.5 rounded-lg bg-yellow-100 border border-yellow-300 text-xs font-bold text-yellow-700">
                  💡 Pedir pista ({state.hints} {state.hints === 1 ? 'token' : 'tokens'})
                </button>
              : <p className="mb-3"><Link to="/tienda" className="text-xs text-primary underline">Consigue pistas en la tienda</Link></p>
          )}
          {hintShown && selected === null && (
            <div className="mb-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">💡 {q.hint}</div>
          )}
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <OptionButton key={i} index={i} disabled={selected !== null} onClick={() => answer(i)}
                estado={selected !== null && i === q.correctAnswer ? 'correcta' : selected === i ? 'fallada' : 'neutro'}>
                {opt}
              </OptionButton>
            ))}
          </div>
          {selected !== null && selected !== q.correctAnswer && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
              💡 {q.hint}
              <p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={() => setSelected(null)} className="mt-2 px-3 py-1.5 rounded bg-yellow-400 text-white text-xs font-bold">Intentar de nuevo</button>
            </div>
          )}
          {selected === q.correctAnswer && (
            <button onClick={nextQuestion} className="mt-4 px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">✅ +{XP_PER_CORRECT} XP — Continuar</button>
          )}
        </div>
      )}

      {phase === 'fallado' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-4xl mb-2">💀</p>
          <h2 className="font-display text-xl font-bold mb-2">¡Sin vidas!</h2>
          <p className="text-gray-500 mb-4 text-sm">Tranquilo: el XP que ganaste se queda contigo. El reto se regenera con preguntas nuevas.</p>
          <button onClick={retry} className="px-6 py-3 rounded-xl font-display bg-primary text-white font-bold">🔄 Reintentar</button>
        </div>
      )}

      {phase === 'completado' && (
        <div className="relative text-center glass rounded-[1.75rem] shadow-lg p-8 overflow-hidden">
          {use3D && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <Suspense fallback={null}><Celebration variant="nivel" /></Suspense>
            </div>
          )}
          <div className="relative">
            <p className="text-4xl mb-2">🎉</p>
            <h2 className="font-display text-xl font-bold mb-1">¡Nivel superado!</h2>
            <p className="text-2xl my-2">{'⭐'.repeat(result?.stars ?? 1)}</p>
            <p className="text-sm text-gray-500 mb-4">+{XP_LEVEL_COMPLETE} XP · +{result?.coins ?? 0} 🪙</p>
            {result?.primeraVez && <Chest />}
            <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
          </div>
        </div>
      )}
    </div>
  )
}
