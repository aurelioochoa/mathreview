import { useState } from 'react'
import OptionButton from './OptionButton'

export default function MiniQuiz({ questions }) {
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState({})

  const handleAnswer = (qIndex, selectedIndex) => {
    const question = questions[qIndex]
    const isCorrect = selectedIndex === question.correctAnswer

    setAnswers(prev => ({ ...prev, [qIndex]: selectedIndex }))

    if (isCorrect) {
      setFeedback(prev => ({ ...prev, [qIndex]: { type: 'success', message: getRandomSuccess() } }))
    } else {
      setFeedback(prev => ({ ...prev, [qIndex]: { type: 'hint', message: question.hint } }))
    }
  }

  const getRandomSuccess = () => {
    const responses = [
      '🎉 ¡Eso es! Bien hecho',
      '🔥 ¡Correcto! Lo estás pillando',
      '✨ ¡Justo! Sigue así',
      '🚀 ¡Bien! Un paso más',
      '💪 ¡Perfecto! No es tan difícil, ¿verdad?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
      <h4 className="font-bold text-indigo-800 mb-3 text-sm uppercase tracking-wide">🎯 Mini-quiz</h4>
      
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mb-4 last:mb-0">
          <p className="text-sm font-medium text-gray-800 mb-2">{qIndex + 1}. {q.question}</p>
          
          <div className="space-y-2">
            {q.options.map((opt, optIndex) => {
              const isSelected = answers[qIndex] === optIndex
              const showCorrect = feedback[qIndex]?.type === 'success' && optIndex === q.correctAnswer
              const showWrong = isSelected && feedback[qIndex]?.type === 'hint'
              
              return (
                <OptionButton
                  key={optIndex}
                  index={optIndex}
                  estado={showCorrect ? 'correcta' : showWrong ? 'fallada' : isSelected ? 'elegida' : 'neutro'}
                  disabled={!!answers[qIndex]}
                  onClick={() => !answers[qIndex] && handleAnswer(qIndex, optIndex)}
                >
                  {opt}
                  {showCorrect && <span className="ml-2">✅</span>}
                  {showWrong && <span className="ml-2">❌</span>}
                </OptionButton>
              )
            })}
          </div>
          
          {feedback[qIndex] && (
            <div className={`mt-2 p-2 rounded-lg text-sm ${
              feedback[qIndex].type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {feedback[qIndex].message}
              {feedback[qIndex].type === 'hint' && (
                <p className="mt-1 text-xs italic">
                  💡 Recordatorio: {q.reminder}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
