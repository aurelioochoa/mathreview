// Catálogo de la tienda. Cada ítem: { id, slot, label, emoji, price }.
// slot: 'avatar' | 'frame' | 'title' | 'hint'. Los de slot 'hint' se consumen
// (suman tokens de pista); el resto son cosméticos que se poseen y se equipan.
//
// Los de 'frame' (borde de la opción que señalas al responder) llevan además
// `colors`: la paleta que pinta el marco. Va en el catálogo y no en el
// componente porque es dato del ítem, como el emoji o el precio.
export const SHOP_ITEMS = [
  { id: 'avatar-mago', slot: 'avatar', label: 'Mago', emoji: '🧙', price: 60 },
  { id: 'avatar-astro', slot: 'avatar', label: 'Astronauta', emoji: '🧑‍🚀', price: 60 },
  { id: 'avatar-dragon', slot: 'avatar', label: 'Dragón', emoji: '🐲', price: 90 },
  { id: 'avatar-robot', slot: 'avatar', label: 'Robot', emoji: '🤖', price: 90 },
  { id: 'avatar-ninja', slot: 'avatar', label: 'Ninja', emoji: '🥷', price: 120 },
  { id: 'avatar-corona', slot: 'avatar', label: 'Realeza', emoji: '👑', price: 150 },
  { id: 'frame-fuego', slot: 'frame', label: 'Marco de fuego', emoji: '🔥', price: 80, colors: ['#f97316', '#ef4444', '#fbbf24'] },
  { id: 'frame-hielo', slot: 'frame', label: 'Marco de hielo', emoji: '❄️', price: 80, colors: ['#38bdf8', '#818cf8', '#a5f3fc'] },
  { id: 'frame-oro', slot: 'frame', label: 'Marco de oro', emoji: '🟡', price: 130, colors: ['#fbbf24', '#f59e0b', '#fde047'] },
  { id: 'title-speedrunner', slot: 'title', label: 'Speedrunner', emoji: '⚡', price: 100 },
  { id: 'title-cazajefes', slot: 'title', label: 'Cazajefes', emoji: '🗡️', price: 100 },
  { id: 'title-leyenda', slot: 'title', label: 'Leyenda', emoji: '🌟', price: 150 },
  { id: 'hint-pack', slot: 'hint', label: 'Token de pista', emoji: '💡', price: 20, amount: 1 },
]

// Lo que puede soltar un cofre: solo cosméticos (los tokens de pista tienen su
// propia franja en la tabla del cofre).
export const COSMETIC_ITEMS = SHOP_ITEMS.filter(i => i.slot !== 'hint')

export function findItem(id) {
  return SHOP_ITEMS.find(i => i.id === id) ?? null
}
