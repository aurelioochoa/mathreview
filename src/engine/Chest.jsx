import { useState } from 'react'
import { useGame } from '../state/gameStore'
import { rollChest } from './chests'
import { findItem } from '../content/shop'

function describir(reward) {
  if (reward.type === 'coins') return `+${reward.amount} 🪙`
  if (reward.type === 'hint') return `+${reward.amount} 💡 token de pista`
  const item = findItem(reward.id)
  return `¡Cosmético nuevo! ${item?.emoji ?? '🎁'} ${item?.label ?? reward.id}`
}

// Cofre sorpresa: tira la recompensa una sola vez al abrirlo y la despacha.
export default function Chest({ onDone }) {
  const { state, dispatch } = useGame()
  const [reward, setReward] = useState(null)

  const abrir = () => {
    const r = rollChest(state)
    dispatch({ type: 'OPEN_CHEST', reward: r })
    setReward(r)
  }

  return (
    <div className="text-center my-4">
      {reward === null ? (
        <div>
          <button onClick={abrir} className="text-5xl hover:scale-110 transition-transform" aria-label="Abrir cofre sorpresa">📦</button>
          <p className="text-xs text-gray-400 mt-1">¡Un cofre sorpresa! Tócalo para abrirlo.</p>
        </div>
      ) : (
        <div>
          <p className="text-4xl mb-1">🎁</p>
          <p className="font-display font-bold text-amber-600">{describir(reward)}</p>
          {onDone && <button onClick={onDone} className="mt-2 text-sm text-primary underline">Continuar</button>}
        </div>
      )}
    </div>
  )
}
