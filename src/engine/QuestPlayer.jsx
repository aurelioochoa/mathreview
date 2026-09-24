import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { findQuest } from '../content/quests'
import { shuffleOptions } from './generators'
import { useGame, XP_PER_CORRECT, COINS_QUEST, XP_QUEST } from '../state/gameStore'
import OptionButton from '../components/OptionButton'
import { GameHeader, SegmentProgress, QuestionCard, Feedback, ResultCard, Rewards } from '../components/game/GameUI'
import useAnswerKeys from '../components/game/useAnswerKeys'

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

  const qNow = questions[qIndex]
  const acertada = qNow && selected === qNow.correctAnswer
  useAnswerKeys({
    count: qNow?.options.length ?? 0,
    onPick: (i) => answer(i),
    onContinue: acertada ? () => next() : selected !== null ? () => setSelected(null) : undefined,
    enabled: phase === 'preguntas' && !!qNow,
  })

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
      <GameHeader world={world} backTo={`/mundo/${world.slug}`} backLabel="Volver al mundo" kicker={`${world.emoji} ${world.name} · Sidequest`} title={`${quest.emoji} ${quest.title}`}>
        {phase === 'preguntas' && <SegmentProgress total={questions.length} current={qIndex} results={questions.map((_, i) => (i < qIndex ? 'ok' : undefined))} />}
      </GameHeader>

      {phase === 'intro' && (
        <div className="panel p-6 sm:p-8 entrar-abajo">
          <div className="flex gap-4 items-start">
            <span className="text-5xl shrink-0 flotar inline-block">{quest.emoji}</span>
            <div className="relative flex-1 rounded-2xl bg-indigo-50 border-2 border-indigo-100 p-4">
              <p className="text-gray-700">{quest.intro}</p>
            </div>
          </div>
          {yaCompletada && <p className="text-xs text-amber-600 mt-4">Ya completaste esta misión: puedes rejugarla por práctica (sin monedas nuevas).</p>}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button onClick={() => setPhase('preguntas')} className="btn btn-lg">📋 Aceptar misión</button>
            {!yaCompletada && <span className="chip text-sm"><span className="chip-ico bg-amber-100">🎁</span>+{XP_QUEST} XP · +{COINS_QUEST} 🪙</span>}
          </div>
        </div>
      )}

      {phase === 'preguntas' && q && (
        <QuestionCard meta={<span>Pregunta {qIndex + 1} / {questions.length} · sin vidas</span>}>
          <p key={qIndex} className="entrar-abajo font-display text-lg sm:text-xl font-bold leading-snug mb-4">{q.question}</p>
          <div className="grid gap-2.5">
            {q.options.map((opt, i) => (
              <OptionButton key={i} index={i} disabled={selected !== null} onClick={() => answer(i)}
                estado={selected !== null && i === q.correctAnswer ? 'correcta' : selected === i ? 'fallada' : 'neutro'}>
                {opt}
              </OptionButton>
            ))}
          </div>
          {selected !== null && selected !== q.correctAnswer && (
            <Feedback tone="ko" title="Todavía no">
              💡 {q.hint}<p className="text-xs italic mt-1">{q.reminder}</p>
              <button onClick={() => setSelected(null)} className="btn btn-amber btn-sm mt-3">Intentar de nuevo</button>
            </Feedback>
          )}
          {selected === q.correctAnswer && (
            <Feedback tone="ok" title="¡Bien hecho!">
              <button onClick={next} className="btn btn-green">✅ Continuar</button>
            </Feedback>
          )}
        </QuestionCard>
      )}

      {phase === 'fin' && (
        <ResultCard icon="🎁" title="¡Misión cumplida!">
          <p className="text-gray-500 text-sm mb-2">{quest.outro}</p>
          {!yaCompletada && <Rewards items={[{ icon: '✨', text: `+${XP_QUEST} XP` }, { icon: '🪙', text: `+${COINS_QUEST}` }]} />}
          <Link to={`/mundo/${world.slug}`} className="btn btn-lg mt-2">Volver al mundo</Link>
        </ResultCard>
      )}
    </div>
  )
}
