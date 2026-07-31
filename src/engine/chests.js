import { COSMETIC_ITEMS } from '../content/shop'

// Tabla ponderada del cofre. Devuelve una recompensa aplicable por OPEN_CHEST.
// Franjas (rng en [0,1)): [0, 0.55) monedas · [0.55, 0.8) token de pista ·
// [0.8, 1) cosmético no poseído (si ya están todos, monedas de consolación).
// Pura: con el mismo rng devuelve siempre lo mismo.
export function rollChest(state, rng = Math.random) {
  const r = rng()
  if (r < 0.55) return { type: 'coins', amount: 15 + Math.floor(rng() * 26) } // 15..40
  if (r < 0.8) return { type: 'hint', amount: 1 }

  const owned = new Set(state?.cosmetics?.owned ?? [])
  const disponibles = COSMETIC_ITEMS.filter(c => !owned.has(c.id))
  if (disponibles.length === 0) return { type: 'coins', amount: 25 }
  return { type: 'cosmetic', id: disponibles[Math.floor(rng() * disponibles.length)].id }
}
