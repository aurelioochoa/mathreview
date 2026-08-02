import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { findQuest } from '../content/quests'
import { shuffleOptions } from './generators'
import { useGame, XP_PER_CORRECT, COINS_QUEST, XP_QUEST } from '../state/gameStore'
import OptionButton from '../components/OptionButton'

export default function QuestPlayer() {
  const { questId } = useParams()
  return <QuestPlayerView key={questId} />
}

function QuestPlayerView() {
  const { slug, questId } = useParams()
  const { state, dispatch } = useGame()
  const world = findWorld(slug)
  const quest = world ? findQuest(world.id, questId) : null

  const [phase, setPhase] = useState('intro')  // intro | preguntas | fin
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)

  const questions = useMemo(
    () => (quest ? quest.questions.map(f => shuffleOptions(f())) : []),
    [quest],
  )

  if (!world || !quest) return <p className="text-center py-12">Misión no encontrada. <Link className="text-primary underline" to="/">Volver</Link></p>

  const questKey = `${world.id}/${quest.id}`
  const yaCompletada = state.questsCompleted.includes(questKey)
  const q = questions[qIndex]

  const answer = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctAnswer) dispatch({ type: 'ANSWER_CORRECT', xp: XP_PER_CORRECT })
  }
  const next = () => {
    setSelected(null)
    if (qIndex + 1 < questions.length) setQIndex(qIndex + 1)
    else {
      dispatch({ type: 'QUEST_COMPLETED', questKey, coins: COINS_QUEST, xp: XP_QUEST })
      setPhase('fin')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 ${world.color} text-white rounded-full text-sm font-semibold mb-2`}>{world.emoji} {world.name} · Sidequest</span>
        <h1 className="font-display text-2xl font-extrabold text-gray-800">{quest.emoji} {quest.title}</h1>
      </div>

      {phase === 'intro' && (
        <div className="glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-gray-600 mb-6">{quest.intro}</p>
          {yaCompletada && <p className="text-xs text-amber-600 mb-3">Ya completaste esta misión: puedes rejugarla por práctica (sin monedas nuevas).</p>}
          <button onClick={() => setPhase('preguntas')} className="px-6 py-3 rounded-xl font-display bg-primary text-white font-bold">📋 Aceptar misión</button>
        </div>
      )}

      {phase === 'preguntas' && q && (
        <div className="glass rounded-[1.75rem] shadow-lg p-6">
          <p className="text-xs text-gray-400 mb-2">Pregunta {qIndex + 1} / {questions.length} · sin vidas</p>
          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
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
              💡 {q.hint}<p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={() => setSelected(null)} className="mt-2 px-3 py-1.5 rounded bg-yellow-400 text-white text-xs font-bold">Intentar de nuevo</button>
            </div>
          )}
          {selected === q.correctAnswer && (
            <button onClick={next} className="mt-4 px-4 py-2 rounded-xl font-display bg-green-500 text-white font-bold">✅ Continuar</button>
          )}
        </div>
      )}

      {phase === 'fin' && (
        <div className="text-center glass rounded-[1.75rem] shadow-lg p-8">
          <p className="text-4xl mb-2">🎁</p>
          <h2 className="font-display text-xl font-bold mb-1">¡Misión cumplida!</h2>
          <p className="text-gray-500 text-sm mb-2">{quest.outro}</p>
          {!yaCompletada && <p className="text-sm text-gray-500 mb-4">+{XP_QUEST} XP · +{COINS_QUEST} 🪙</p>}
          <Link to={`/mundo/${world.slug}`} className="px-6 py-3 rounded-xl bg-primary text-white font-display font-bold inline-block">Volver al mundo</Link>
        </div>
      )}
    </div>
  )
}
