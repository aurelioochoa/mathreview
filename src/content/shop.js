// Catálogo de la tienda. Cada ítem: { id, slot, label, emoji, price }.
// slot: 'avatar' | 'frame' | 'title' | 'aura' | 'cursor' | 'hint'. Los de slot
// 'hint' se consumen (suman tokens de pista); el resto son cosméticos que se
// poseen y se equipan.
//
// Los de 'aura' (halo del perfil), 'cursor' (estela del ratón) y 'frame'
// (borde de la opción que señalas al responder) llevan además `colors`: la
// paleta que pintan AuraRing, CursorAura y el marco. Va en el catálogo y no en
// el componente porque es dato del ítem, como el emoji o el precio, y así
// añadir un aura nueva es tocar una sola línea.
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
  { id: 'aura-fuego', slot: 'aura', label: 'Aura de fuego', emoji: '🔥', price: 140, colors: ['#f97316', '#ef4444', '#fbbf24'] },
  { id: 'aura-hielo', slot: 'aura', label: 'Aura de hielo', emoji: '🧊', price: 140, colors: ['#38bdf8', '#818cf8', '#a5f3fc'] },
  { id: 'aura-toxica', slot: 'aura', label: 'Aura tóxica', emoji: '☢️', price: 170, colors: ['#84cc16', '#22c55e', '#bef264'] },
  { id: 'aura-arcoiris', slot: 'aura', label: 'Aura arcoíris', emoji: '🌈', price: 220, colors: ['#f43f5e', '#facc15', '#22c55e', '#38bdf8', '#a855f7'] },
  { id: 'cursor-chispas', slot: 'cursor', label: 'Estela de chispas', emoji: '✨', price: 120, efecto: 'chispas', colors: ['#fbbf24', '#fde68a', '#f59e0b'] },
  { id: 'cursor-burbujas', slot: 'cursor', label: 'Estela de burbujas', emoji: '🫧', price: 120, efecto: 'burbujas', colors: ['#7dd3fc', '#bae6fd', '#38bdf8'] },
  { id: 'cursor-nieve', slot: 'cursor', label: 'Estela de nieve', emoji: '❄️', price: 140, efecto: 'nieve', colors: ['#e0f2fe', '#bae6fd', '#ffffff'] },
  { id: 'cursor-corazones', slot: 'cursor', label: 'Estela de corazones', emoji: '💖', price: 140, efecto: 'corazones', colors: ['#fb7185', '#f472b6', '#fda4af'] },
  { id: 'cursor-cometa', slot: 'cursor', label: 'Estela de cometa', emoji: '☄️', price: 160, efecto: 'cometa', colors: ['#fb923c', '#f97316', '#fda4af'] },
  { id: 'cursor-confeti', slot: 'cursor', label: 'Estela de confeti', emoji: '🎉', price: 170, efecto: 'confeti', colors: ['#f43f5e', '#facc15', '#22c55e', '#38bdf8', '#a855f7'] },
  { id: 'cursor-monedas', slot: 'cursor', label: 'Estela de monedas', emoji: '🪙', price: 180, efecto: 'monedas', colors: ['#fbbf24', '#f59e0b', '#fde047'] },
  { id: 'cursor-neon', slot: 'cursor', label: 'Estela neón', emoji: '💜', price: 200, efecto: 'neon', colors: ['#d946ef', '#a855f7', '#22d3ee'] },
  { id: 'hint-pack', slot: 'hint', label: 'Token de pista', emoji: '💡', price: 20, amount: 1 },
]

// Slots que se equipan en el perfil. El reducer valida contra esta lista, así
// que un slot nuevo aquí queda equipable sin tocar el estado.
export const EQUIPABLE_SLOTS = ['avatar', 'frame', 'title', 'aura', 'cursor']

// Lo que puede soltar un cofre: solo cosméticos (los tokens de pista tienen su
// propia franja en la tabla del cofre).
export const COSMETIC_ITEMS = SHOP_ITEMS.filter(i => i.slot !== 'hint')

export function findItem(id) {
  return SHOP_ITEMS.find(i => i.id === id) ?? null
}
