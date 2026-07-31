import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { pathOrder } from '../content/worldMap'
import { buildBossPool } from './generators'
import { useGame, XP_PER_CORRECT } from '../state/gameStore'

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

  const questions = useMemo(
    () => (world ? buildBossPool(world, PREGUNTAS) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, intento],
  )

  if (!world) return <p className="text-center py-12">Portal no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  const siguienteId = pathOrder[pathOrder.indexOf(world.slug) + 1] ?? null
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) {
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
    setQIndex(0); setAciertos(0); setSelected(null); setPhase('prueba')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <span className="inline-block px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-semibold mb-2">🌀 Portal de teletransporte</span>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">{world.emoji} {world.name}</h1>
      </div>

      {phase === 'intro' && (
        <div className="glass rounded-[1.75rem] shadow-lg p-8 text-center">
          <p className="text-6xl mb-3">🌀</p>
          <p className="text-gray-600 mb-2">
            ¿Ya te sabes lo de <strong>{world.name}</strong>? Demuéstralo y sáltatelo.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {PREGUNTAS} preguntas, sin vidas. Necesitas {APROBADO} aciertos.
            Aprobar abre el siguiente mundo, pero <strong>no da estrellas</strong>: puedes volver a por ellas cuando quieras.
          </p>
          <button onClick={() => setPhase('prueba')} className="px-6 py-3 rounded-xl font-display bg-indigo-500 text-white font-bold">🌀 Empezar la prueba</button>
          <p className="mt-4">
            <Link to={`/mundo/${world.slug}`} className="text-sm text-primary underline">Mejor lo juego entero</Link>
          </p>
        </div>
      )}

      {phase === 'prueba' && q && (
        <div className="glass rounded-[1.75rem] shadow-lg p-6">
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-gray-400">Pregunta {qIndex + 1} / {questions.length}</span>
            <span className="font-bold text-indigo-600">{aciertos} ✅</span>
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
          {selected !== null && (
            <button onClick={next} className="mt-4 px-4 py-2 rounded-xl font-display bg-indigo-500 text-white font-bold">
              {qIndex + 1 < questions.length ? 'Siguiente →' : 'Ver resultado'}
            </button>
          )}
        </div>
      )}

      {phase === 'aprobado' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-5xl mb-2">🌀✨</p>
          <h2 className="font-display text-xl font-bold mb-1">¡Portal abierto!</h2>
          <p className="text-sm text-gray-500 mb-4">
            {aciertos} de {questions.length}. Superaste {world.name} por portal y el siguiente mundo queda desbloqueado.
            Sus estrellas siguen ahí esperándote.
          </p>
          <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Ir al mapa</Link>
          {siguienteId && (
            <p className="mt-3">
              <Link to={`/mundo/${siguienteId}`} className="text-sm text-primary underline">Entrar al siguiente mundo →</Link>
            </p>
          )}
        </div>
      )}

      {phase === 'suspendido' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-5xl mb-2">🚧</p>
          <h2 className="font-display text-xl font-bold mb-1">El portal no se abre… todavía</h2>
          <p className="text-sm text-gray-500 mb-4">
            {aciertos} de {questions.length}, y hacen falta {APROBADO}. El XP que ganaste se queda contigo.
            Puedes reintentarlo con preguntas nuevas o jugar el mundo entero.
          </p>
          <button onClick={reintentar} className="px-6 py-3 rounded-xl font-display bg-primary text-white font-bold">🔄 Reintentar</button>
          <p className="mt-4">
            <Link to={`/mundo/${world.slug}`} className="text-sm text-primary underline">Jugar {world.name}</Link>
          </p>
        </div>
      )}
    </div>
  )
}
