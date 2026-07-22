import { mundo3 } from './mundo3-potencias'
import { mundo4 } from './mundo4-algebra'

export const worlds = [mundo3, mundo4]

export function findWorld(slug) {
  return worlds.find(w => w.slug === slug) ?? null
}
