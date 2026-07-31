import { mundo1Quests } from './mundo1-quests'
import { mundo2Quests } from './mundo2-quests'
import { mundo3Quests } from './mundo3-quests'
import { mundo4Quests } from './mundo4-quests'
import { mundo5Quests } from './mundo5-quests'
import { mundo6Quests } from './mundo6-quests'
import { mundo7Quests } from './mundo7-quests'
import { mundo8Quests } from './mundo8-quests'

// worldId ('mundoN') -> quest[]. Los seis mundos con contenido tienen sidequests;
// validateContent exige al menos una por mundo.
export const questsByWorld = {
  mundo1: mundo1Quests,
  mundo2: mundo2Quests,
  mundo3: mundo3Quests,
  mundo4: mundo4Quests,
  mundo5: mundo5Quests,
  mundo6: mundo6Quests,
  mundo7: mundo7Quests,
  mundo8: mundo8Quests,
}

export function questsForWorld(worldId) {
  return questsByWorld[worldId] ?? []
}

export function findQuest(worldId, questId) {
  return questsForWorld(worldId).find(q => q.id === questId) ?? null
}
