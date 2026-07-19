import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { findWorld } from '../content/worlds'
import { widgets } from '../widgets'
import { buildReto } from './generators'
import { useGame, XP_PER_CORRECT, XP_LEVEL_COMPLETE, COINS_PER_STAR } from '../state/gameStore'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import InteractiveBox from '../components/InteractiveBox'

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

export default function LevelPlayer() {
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
  const [result, setResult] = useState(null)   // { stars, coins } de esta partida

  const questions = useMemo(
    () => (level ? buildReto(level.reto.factories, level.reto.pick) : []),
    [level, attempt],
  )

  const reduceMotion = useReducedMotion()

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
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      const ratio = firstTryHits / questions.length
      const stars = ratio >= 1 ? 3 : ratio >= 0.66 ? 2 : 1
      const coins = stars * COINS_PER_STAR
      dispatch({ type: 'LEVEL_COMPLETED', levelKey, stars, xp: XP_LEVEL_COMPLETE, coins })
      setResult({ stars, coins })
      setPhase('completado')
    }
  }

  const retry = () => {
    setAttempt(a => a + 1)
    setQIndex(0); setLives(3); setFirstTryHits(0); setSelected(null); setFailedThis(false)
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
              : <button onClick={() => setPhase('reto')} className="px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">⚔️ ¡Al reto!</button>}
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
          {!reduceMotion && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <Suspense fallback={null}><Celebration /></Suspense>
            </div>
          )}
          <div className="relative">
            <p className="text-4xl mb-2">🎉</p>
            <h2 className="font-display text-xl font-bold mb-1">¡Nivel superado!</h2>
            <p className="text-2xl my-2">{'⭐'.repeat(result?.stars ?? 1)}</p>
            <p className="text-sm text-gray-500 mb-4">+{XP_LEVEL_COMPLETE} XP · +{result?.coins ?? 0} 🪙</p>
            <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
          </div>
        </div>
      )}
    </div>
  )
}
