// XP total necesario para ALCANZAR un nivel: triangular * 100
// L1=0, L2=100, L3=300, L4=600, L5=1000, ...
export function xpForLevel(level) {
  return 100 * ((level - 1) * level) / 2
}

export function levelForXp(xp) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

const TITLES = [
  'Aprendiz',
  'Explorador',
  'Aventurero',
  'Cazador de Números',
  'Mago Numérico',
  'Héroe Algebraico',
  'Leyenda del Álgebra',
  'Gran Maestro Matemático',
]

export function titleForLevel(level) {
  return TITLES[Math.min(level, TITLES.length) - 1]
}
