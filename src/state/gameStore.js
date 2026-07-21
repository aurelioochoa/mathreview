import { createContext, useContext } from 'react'

export const XP_PER_CORRECT = 10
export const XP_LEVEL_COMPLETE = 50
export const COINS_PER_STAR = 10

export const initialState = {
  version: 1,
  xp: 0,
  coins: 0,
  stars: {},            // levelKey -> 1..3
  completedLevels: [],  // levelKey[]
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT':
      return { ...state, xp: state.xp + action.xp }
    case 'LEVEL_COMPLETED': {
      const prev = state.stars[action.levelKey] ?? 0
      return {
        ...state,
        xp: state.xp + action.xp,
        coins: state.coins + action.coins,
        stars: { ...state.stars, [action.levelKey]: Math.max(prev, action.stars) },
        completedLevels: state.completedLevels.includes(action.levelKey)
          ? state.completedLevels
          : [...state.completedLevels, action.levelKey],
      }
    }
    default:
      return state
  }
}

export const GameContext = createContext(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>')
  return ctx
}
