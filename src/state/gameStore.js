import { createContext, useContext } from 'react'
import { EQUIPABLE_SLOTS } from '../content/shop'

export const XP_PER_CORRECT = 10
export const XP_LEVEL_COMPLETE = 50
export const COINS_PER_STAR = 10
export const BASE_FIRST_CLEAR = 15
export const COINS_BOSS = 60
export const XP_BOSS = 120
export const COINS_QUEST = 25
export const XP_QUEST = 40

// Fuente única de defaults del estado v2. La migración de persistencia reusa esto.
export function defaultState() {
  return {
    version: 3,
    xp: 0,
    coins: 0,
    stars: {},            // levelKey -> 1..3 (mejor marca)
    completedLevels: [],  // levelKey[]
    bossDefeats: [],      // worldId[]
    portalPasses: [],     // worldId[] superados por la prueba del portal
    questsCompleted: [],  // questKey[]
    achievements: [],     // achievementId[]
    hints: 0,             // tokens de pista
    cosmetics: { owned: ['avatar-default'], avatar: 'avatar-default', frame: null, title: null, aura: null, cursor: null },
    streak: { count: 0, best: 0, lastDate: null },
  }
}

export const initialState = defaultState()

// Regla de monedas por estrellas nuevas. previaRaw = state.stars[levelKey] (puede ser undefined).
export function coinsForCompletion(previaRaw, nuevas) {
  const primeraVez = previaRaw === undefined
  const previa = previaRaw ?? 0
  const delta = Math.max(0, nuevas - previa)
  return delta * COINS_PER_STAR + (primeraVez ? BASE_FIRST_CLEAR : 0)
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT':
      return { ...state, xp: state.xp + action.xp }

    case 'LEVEL_COMPLETED': {
      const previaRaw = state.stars[action.levelKey]
      const previa = previaRaw ?? 0
      return {
        ...state,
        xp: state.xp + action.xp,
        coins: state.coins + coinsForCompletion(previaRaw, action.stars),
        stars: { ...state.stars, [action.levelKey]: Math.max(previa, action.stars) },
        completedLevels: state.completedLevels.includes(action.levelKey)
          ? state.completedLevels
          : [...state.completedLevels, action.levelKey],
      }
    }

    case 'BOSS_DEFEATED':
      return {
        ...state,
        xp: state.xp + (action.xp ?? 0),
        coins: state.coins + (action.coins ?? 0),
        bossDefeats: state.bossDefeats.includes(action.worldId)
          ? state.bossDefeats
          : [...state.bossDefeats, action.worldId],
      }

    case 'PORTAL_PASSED':
      // Abre paso al siguiente mundo, sin estrellas ni maestría: el jugador
      // puede volver luego a por ellas.
      if (state.portalPasses.includes(action.worldId)) return state
      return { ...state, portalPasses: [...state.portalPasses, action.worldId] }

    case 'QUEST_COMPLETED':
      if (state.questsCompleted.includes(action.questKey)) return state
      return {
        ...state,
        xp: state.xp + (action.xp ?? 0),
        coins: state.coins + (action.coins ?? 0),
        questsCompleted: [...state.questsCompleted, action.questKey],
      }

    case 'OPEN_CHEST': {
      const r = action.reward
      if (!r) return state
      if (r.type === 'coins') return { ...state, coins: state.coins + (r.amount ?? 0) }
      if (r.type === 'hint') return { ...state, hints: state.hints + (r.amount ?? 1) }
      if (r.type === 'cosmetic') {
        if (state.cosmetics.owned.includes(r.id)) return state
        return { ...state, cosmetics: { ...state.cosmetics, owned: [...state.cosmetics.owned, r.id] } }
      }
      return state
    }

    case 'BUY_ITEM': {
      const { item } = action
      if (!item || state.coins < item.price) return state
      if (item.slot === 'hint')
        return { ...state, coins: state.coins - item.price, hints: state.hints + (item.amount ?? 1) }
      if (state.cosmetics.owned.includes(item.id)) return state
      return {
        ...state,
        coins: state.coins - item.price,
        cosmetics: { ...state.cosmetics, owned: [...state.cosmetics.owned, item.id] },
      }
    }

    case 'EQUIP_COSMETIC': {
      const { slot, id } = action
      if (!EQUIPABLE_SLOTS.includes(slot)) return state
      if (id !== null && !state.cosmetics.owned.includes(id)) return state
      return { ...state, cosmetics: { ...state.cosmetics, [slot]: id } }
    }

    case 'USE_HINT':
      return { ...state, hints: Math.max(0, state.hints - 1) }

    case 'TICK_STREAK':
      // Idempotente por día: si ya se cobró el bono de esa fecha, no se repite.
      // Sin esto, el doble montaje de React.StrictMode en desarrollo pagaba el
      // bono dos veces (el efecto se reejecuta con el mismo state capturado).
      if (state.streak.lastDate === action.streak?.lastDate) return state
      return { ...state, streak: action.streak, coins: state.coins + (action.bonus ?? 0) }

    case 'UNLOCK_ACHIEVEMENTS': {
      const nuevos = action.ids.filter(id => !state.achievements.includes(id))
      if (nuevos.length === 0) return state
      return { ...state, achievements: [...state.achievements, ...nuevos] }
    }

    case 'IMPORT_SAVE':
      // Sustituye el estado entero. No valida: de eso se encarga decodeSave,
      // y tener la validación en dos sitios es tener dos sitios donde
      // equivocarse.
      return action.save ?? state

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
