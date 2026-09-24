import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { pathOrder } from '../content/worldMap'
import { buildBossPool } from './generators'
import { useGame, XP_PER_CORRECT } from '../state/gameStore'
import OptionButton from '../components/OptionButton'
import { GameHeader, SegmentProgress, QuestionCard, Feedback, ResultCard } from '../components/game/GameUI'
import useAnswerKeys from '../components/game/useAnswerKeys'

const PREGUNTAS = 5
const APROBADO = 4 // 4 de 5

export default function PortalTrial() {
  const { slug } = useParams()
  return <PortalTrialView key={slug} />
}

// Prueba de dominio: demuestra que ya sabes lo de un mundo y te lo saltas. No da
// estrellas ni maestría a propósito — el mundo queda "superado por portal" y el
// jugador puede volver luego a por sus estrellas.
function PortalTrialView() {
  const { slug } = useParams()
  const { dispatch } = useGame()
  const world = findWorld(slug)

  const [phase, setPhase] = useState('intro') // intro | prueba | aprobado | suspendido
  const [intento, setIntento] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [selected, setSelected] = useState(null)
  const [marcas, setMarcas] = useState([])   // 'ok' | 'ko' por pregunta

  const questions = useMemo(
    () => (world ? buildBossPool(world, PREGUNTAS) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, intento],
  )

  const qNow = questions[qIndex]
  useAnswerKeys({
    count: qNow?.options.length ?? 0,
    onPick: (i) => answer(i),
    onContinue: selected !== null ? () => next() : undefined,
    enabled: phase === 'prueba' && !!qNow,
  })

  if (!world) return <p className="text-center py-12">Portal no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const siguienteId = pathOrder[pathOrder.indexOf(world.slug) + 1] ?? null
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    const ok = i === q.correctAnswer
    setMarcas(m => { const n = [...m]; n[qIndex] = ok ? 'ok' : 'ko'; return n })
    if (ok) {
      dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
      setAciertos(a => a + 1)
    }
  }

  const next = () => {
    const acertadas = aciertos // ya contabilizada por answer()
    setSelected(null)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
      return
    }
    if (acertadas >= APROBADO) {
      dispatch({ type: 'PORTAL_PASSED', worldId: world.id })
      setPhase('aprobado')
    } else {
      setPhase('suspendido')
    }
  }

  const reintentar = () => {
    setIntento(n => n + 1)
    setQIndex(0); setAciertos(0); setSelected(null); setMarcas([]); setPhase('prueba')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <GameHeader world={world} backTo={`/mundo/${world.slug}`} backLabel="Volver al mundo" kicker="🌀 Portal de teletransporte" title={`${world.emoji} ${world.name}`}>
        {phase === 'prueba' && <SegmentProgress total={questions.length} current={qIndex} results={marcas} />}
      </GameHeader>

      {phase === 'intro' && (
        <div className="panel p-8 text-center entrar-abajo">
          <p className="text-7xl mb-3 inline-block aura-giro">🌀</p>
          <p className="text-gray-600 mb-2">
            ¿Ya te sabes lo de <strong>{world.name}</strong>? Demuéstralo y sáltatelo.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {PREGUNTAS} preguntas, sin vidas. Necesitas {APROBADO} aciertos.
            Aprobar abre el siguiente mundo, pero <strong>no da estrellas</strong>: puedes volver a por ellas cuando quieras.
          </p>
          <button onClick={() => setPhase('prueba')} className="btn btn-violet btn-lg">🌀 Empezar la prueba</button>
          <p className="mt-4">
            <Link to={`/mundo/${world.slug}`} className="text-sm font-semibold text-primary underline">Mejor lo juego entero</Link>
          </p>
        </div>
      )}

      {phase === 'prueba' && q && (
        <QuestionCard meta={<><span>Pregunta {qIndex + 1} / {questions.length}</span><span className="font-bold text-indigo-600">{aciertos} ✅ · necesitas {APROBADO}</span></>}>
          <p key={qIndex} className="entrar-abajo font-display text-lg sm:text-xl font-bold leading-snug mb-4">{q.question}</p>
          <div className="grid gap-2.5">
            {q.options.map((opt, i) => (
              <OptionButton key={i} index={i} disabled={selected !== null} onClick={() => answer(i)}
                estado={selected !== null && i === q.correctAnswer ? 'correcta' : selected === i ? 'fallada' : 'neutro'}>
                {opt}
              </OptionButton>
            ))}
          </div>
          {selected !== null && (
            <Feedback tone={selected === q.correctAnswer ? 'ok' : 'ko'} title={selected === q.correctAnswer ? '¡Correcto!' : 'Esta no era'}>
              <button onClick={next} className="btn btn-violet">
                {qIndex + 1 < questions.length ? 'Siguiente →' : 'Ver resultado'}
              </button>
            </Feedback>
          )}
        </QuestionCard>
      )}

      {phase === 'aprobado' && (
        <ResultCard icon="🌀✨" title="¡Portal abierto!">
          <p className="text-sm text-gray-500 mb-5">
            {aciertos} de {questions.length}. Superaste {world.name} por portal y el siguiente mundo queda desbloqueado.
            Sus estrellas siguen ahí esperándote.
          </p>
          <Link to="/" className="btn btn-lg">🗺️ Ir al mapa</Link>
          {siguienteId && (
            <p className="mt-3">
              <Link to={`/mundo/${siguienteId}`} className="text-sm font-semibold text-primary underline">Entrar al siguiente mundo →</Link>
            </p>
          )}
        </ResultCard>
      )}

      {phase === 'suspendido' && (
        <ResultCard icon="🚧" title="El portal no se abre… todavía">
          <p className="text-sm text-gray-500 mb-5">
            {aciertos} de {questions.length}, y hacen falta {APROBADO}. El XP que ganaste se queda contigo.
            Puedes reintentarlo con preguntas nuevas o jugar el mundo entero.
          </p>
          <button onClick={reintentar} className="btn btn-lg">🔄 Reintentar</button>
          <p className="mt-4">
            <Link to={`/mundo/${world.slug}`} className="text-sm font-semibold text-primary underline">Jugar {world.name}</Link>
          </p>
        </ResultCard>
      )}
    </div>
  )
}
