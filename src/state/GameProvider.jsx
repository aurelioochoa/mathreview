import { useEffect, useReducer } from 'react'
import { loadSave, persistSave } from './persistence'
import { GameContext, gameReducer, initialState } from './gameStore'

// Solo el componente proveedor vive aquí; el contexto, reducer, hook y
// constantes están en gameStore.js (módulo sin componentes) para que
// Fast Refresh funcione (react-refresh/only-export-components).
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadSave() ?? initialState)
  useEffect(() => { persistSave(state) }, [state])
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}
