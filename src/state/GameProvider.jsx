import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { loadSave, persistSave } from './persistence'
import { GameContext, gameReducer, initialState } from './gameStore'
import { evaluateAchievements } from './achievements'
import { findAchievement } from '../content/achievements'
import Toast from '../components/Toast'

// Traduce acciones del reducer al 'event' que consumen algunos checks de logros.
function achievementEvent(action) {
  if (action.type === 'BOSS_DEFEATED') return { type: 'BOSS_DEFEATED', livesLeft: action.livesLeft }
  if (action.type === 'TICK_STREAK') return { type: 'STREAK', hour: action.hour }
  if (action.type === 'LEVEL_COMPLETED') return { type: 'LEVEL_DONE', perfectLives: action.perfectLives, seconds: action.seconds }
  return { type: action.type }
}

// Solo el componente proveedor vive aquí; el contexto, reducer, hook y
// constantes están en gameStore.js (módulo sin componentes) para que
// Fast Refresh funcione (react-refresh/only-export-components).
export function GameProvider({ children }) {
  const [state, baseDispatch] = useReducer(gameReducer, undefined, () => loadSave() ?? initialState)
  const [toast, setToast] = useState(null)
  const pendingEvent = useRef(null)

  useEffect(() => { persistSave(state) }, [state])

  // El dispatch expuesto solo anota el evento de la acción; los logros se
  // evalúan en el efecto de abajo, contra el estado ya aplicado. Recalcular
  // aquí `gameReducer(state, action)` usaría el state capturado en el render,
  // que queda obsoleto si se despachan dos acciones en el mismo tick.
  const dispatch = useCallback((action) => {
    pendingEvent.current = achievementEvent(action)
    baseDispatch(action)
  }, [])

  // Evalúa logros tras cada cambio de estado (también al montar, así un
  // guardado antiguo desbloquea de forma retroactiva lo que ya cumplía).
  // UNLOCK_ACHIEVEMENTS vuelve a disparar el efecto, pero entonces los ids ya
  // están en state.achievements y evaluateAchievements devuelve [], así que no
  // hay bucle.
  useEffect(() => {
    const event = pendingEvent.current
    pendingEvent.current = null
    const nuevos = evaluateAchievements(state, event)
    if (nuevos.length === 0) return
    baseDispatch({ type: 'UNLOCK_ACHIEVEMENTS', ids: nuevos })
    const first = findAchievement(nuevos[0])
    if (first) setToast({ emoji: first.emoji, name: first.name })
  }, [state])

  const dismissToast = useCallback(() => setToast(null), [])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
      <Toast toast={toast} onDismiss={dismissToast} />
    </GameContext.Provider>
  )
}
