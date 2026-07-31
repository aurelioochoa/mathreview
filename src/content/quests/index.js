import { mundo3Quests } from './mundo3-quests'
import { mundo4Quests } from './mundo4-quests'
import { mundo5Quests } from './mundo5-quests'
import { mundo6Quests } from './mundo6-quests'

// worldId ('mundoN') -> quest[]. Se irá ampliando en las Tasks 9-10.
export const questsByWorld = {
  mundo3: mundo3Quests,
  mundo4: mundo4Quests,
  mundo5: mundo5Quests,
  mundo6: mundo6Quests,
}

export function questsForWorld(worldId) {
  return questsByWorld[worldId] ?? []
}

export function findQuest(worldId, questId) {
  return questsForWorld(worldId).find(q => q.id === questId) ?? null
}
