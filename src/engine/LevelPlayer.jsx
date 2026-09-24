import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { widgets } from '../widgets'
import { buildReto } from './generators'
import { rutaMundo } from '../state/vistaMundo'
import { useGame, XP_PER_CORRECT, XP_LEVEL_COMPLETE, coinsForCompletion } from '../state/gameStore'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import InteractiveBox from '../components/InteractiveBox'
import OptionButton from '../components/OptionButton'
import Chest from './Chest'
import { GameHeader, Hearts, SegmentProgress, QuestionCard, Feedback, ResultCard, Rewards } from '../components/game/GameUI'
import useAnswerKeys from '../components/game/useAnswerKeys'
import { useDeviceTier } from '../three/useDeviceTier'

const Celebration = lazy(() => import('../three/Celebration'))

// Pestañas del briefing: cada paso con su icono, para que se vea de un vistazo
// cuánto falta y se pueda saltar a cualquiera.
const PASO = {
  why: { icon: '🤔', label: 'Para qué' },
  content: { icon: '📘', label: 'Teoría' },
  widget: { icon: '🧪', label: 'Laboratorio' },
  mistakes: { icon: '⚠️', label: 'Trampas' },
}

function BriefingStep({ step }) {
  if (step.type === 'why') return <WhySection>{step.body}</WhySection>
  if (step.type === 'mistakes') return <CommonMistakes mistakes={step.items} />
  if (step.type === 'widget') {
    const Widget = widgets[step.widgetId]
    return (
      <InteractiveBox title={step.title}>
        <Suspense fallback={<p className="h-40 grid place-items-center text-sm font-display font-bold text-indigo-400">Preparando el laboratorio…</p>}>
          {Widget ? <Widget /> : <p>Widget no encontrado: {step.widgetId}</p>}
        </Suspense>
      </InteractiveBox>
    )
  }
  return (
    <div className="panel p-5 sm:p-6">
      <h4 className="font-display font-bold text-indigo-700 mb-3 flex items-center gap-2">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-indigo-100 text-lg" aria-hidden="true">📘</span>
        Lo que necesitas saber
      </h4>
      {step.body}
    </div>
  )
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
  const [results, setResults] = useState([])   // 'ok' | 'meh' por pregunta, para la barra de segmentos
  const startRef = useRef(null)                // inicio del reto, para el logro Speedrunner

  const questions = useMemo(
    () => (level ? buildReto(level.reto.factories, level.reto.pick) : []),
    // `attempt` es intencional: al reintentar (setAttempt) regenera preguntas nuevas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, attempt],
  )

  const { use3D } = useDeviceTier()

  const qNow = questions[qIndex]
  const acertada = qNow && selected === qNow.correctAnswer
  useAnswerKeys({
    count: qNow?.options.length ?? 0,
    onPick: (i) => answer(i),
    onContinue: acertada ? () => nextQuestion() : selected !== null ? () => setSelected(null) : undefined,
    enabled: phase === 'reto' && !!qNow,
  })

  if (!world || !level) return <p className="text-center py-12">Nivel no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const levelKey = `${world.id}/${level.id}`
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) {
      dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
      if (!failedThis) setFirstTryHits(h => h + 1)
      setResults(r => { const n = [...r]; n[qIndex] = failedThis ? 'meh' : 'ok'; return n })
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
    setQIndex(0); setLives(3); setFirstTryHits(0); setSelected(null); setFailedThis(false); setHintShown(false); setResults([])
    startRef.current = Date.now()
    setPhase('reto')
  }

  const paso = level.briefing[stepIndex]

  return (
    <div className="max-w-3xl mx-auto">
      <GameHeader world={world} backTo={rutaMundo(world.slug)} backLabel="Volver al mundo" title={`${level.icon} ${level.title}`}>
        {phase === 'briefing' && (
          <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Pasos del briefing">
            {level.briefing.map((st, i) => {
              const meta = PASO[st.type] ?? PASO.content
              return (
                <button key={i} type="button" role="tab" aria-selected={i === stepIndex} onClick={() => setStepIndex(i)}
                  className={`shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-display font-bold border-2 transition-colors ${
                    i === stepIndex ? 'bg-indigo-500 border-indigo-500 text-white' : i < stepIndex ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'border-gray-200 text-gray-400'
                  }`}>
                  <span aria-hidden="true">{meta.icon}</span>{meta.label}
                </button>
              )
            })}
          </div>
        )}
        {phase === 'reto' && q && (
          <div className="flex items-center gap-4">
            <div className="flex-1"><SegmentProgress total={questions.length} current={qIndex} results={results} /></div>
            <Hearts lives={lives} max={3} />
          </div>
        )}
      </GameHeader>

      {phase === 'briefing' && (
        <div>
          <div key={stepIndex} className="entrar-abajo"><BriefingStep step={paso} /></div>
          <div className="flex items-center justify-between gap-2 mt-5">
            <button disabled={stepIndex === 0} onClick={() => setStepIndex(i => i - 1)} className="btn btn-ghost">← Anterior</button>
            <span className="text-sm font-display font-bold text-gray-400 tabular-nums">{stepIndex + 1} / {level.briefing.length}</span>
            {stepIndex + 1 < level.briefing.length
              ? <button onClick={() => setStepIndex(i => i + 1)} className="btn">Siguiente →</button>
              : <button onClick={() => { startRef.current = Date.now(); setPhase('reto') }} className="btn btn-green latido">⚔️ ¡Al reto!</button>}
          </div>
        </div>
      )}

      {phase === 'reto' && q && (
        <QuestionCard meta={<><span>Pregunta {qIndex + 1} / {questions.length}</span><span className="text-xs">+{XP_PER_CORRECT} XP por acierto</span></>}>
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
          {selected !== null && selected !== q.correctAnswer && (
            <Feedback tone="ko" title="¡Casi! Pierdes una vida">
              💡 {q.hint}
              <p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={() => setSelected(null)} className="btn btn-amber btn-sm mt-3">Intentar de nuevo</button>
            </Feedback>
          )}
          {selected === q.correctAnswer && (
            <Feedback tone="ok" title={failedThis ? '¡Bien! A la segunda' : '¡Perfecto!'}>
              <button onClick={nextQuestion} className="btn btn-green">✅ +{XP_PER_CORRECT} XP — Continuar</button>
            </Feedback>
          )}
        </QuestionCard>
      )}

      {phase === 'fallado' && (
        <ResultCard icon="💀" title="¡Sin vidas!">
          <p className="text-gray-500 mb-5 text-sm">Tranquilo: el XP que ganaste se queda contigo. El reto se regenera con preguntas nuevas.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={retry} className="btn btn-lg">🔄 Reintentar</button>
            <button onClick={() => { setPhase('briefing'); setStepIndex(0) }} className="btn btn-ghost btn-lg">📘 Repasar</button>
          </div>
        </ResultCard>
      )}

      {phase === 'completado' && (
        <ResultCard
          icon="🎉"
          title="¡Nivel superado!"
          overlay={use3D && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <Suspense fallback={null}><Celebration variant="nivel" /></Suspense>
            </div>
          )}
        >
          <p className="text-4xl my-2" aria-label={`${result?.stars ?? 1} estrellas`}>
            {[0, 1, 2].map(i => <span key={i} className={`inline-block entrar-abajo ${i < (result?.stars ?? 1) ? '' : 'grayscale opacity-30'}`} style={{ animationDelay: `${i * 150}ms` }}>⭐</span>)}
          </p>
          <Rewards items={[{ icon: '✨', text: `+${XP_LEVEL_COMPLETE} XP` }, { icon: '🪙', text: `+${result?.coins ?? 0}` }]} />
          {result?.primeraVez && <Chest />}
          <Link to={rutaMundo(world.slug)} className="btn btn-lg mt-2">Volver al mundo</Link>
        </ResultCard>
      )}
    </div>
  )
}
