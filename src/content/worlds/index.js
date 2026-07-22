import { mundo3 } from './mundo3-potencias'
import { mundo4 } from './mundo4-algebra'
import { mundo5 } from './mundo5-sistemas'
import { mundo6 } from './mundo6-funciones'

export const worlds = [mundo3, mundo4, mundo5, mundo6]

export function findWorld(slug) {
  return worlds.find(w => w.slug === slug) ?? null
}
