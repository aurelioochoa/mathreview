import { mundo3 } from './mundo3-potencias'

export const worlds = [mundo3]

export function findWorld(slug) {
  return worlds.find(w => w.slug === slug) ?? null
}
