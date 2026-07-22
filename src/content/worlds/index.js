import { mundo3 } from './mundo3-potencias'
import { mundo4 } from './mundo4-algebra'
import { mundo5 } from './mundo5-sistemas'
import { mundo6 } from './mundo6-funciones'
import { mundo7 } from './mundo7-geometria'
import { mundo8 } from './mundo8-datos'

export const worlds = [mundo3, mundo4, mundo5, mundo6, mundo7, mundo8]

export function findWorld(slug) {
  return worlds.find(w => w.slug === slug) ?? null
}
