import { mundo3Quests } from './mundo3-quests'

// worldId ('mundoN') -> quest[]. Se irá ampliando en las Tasks 6-10.
export const questsByWorld = {
  mundo3: mundo3Quests,
}

export function questsForWorld(worldId) {
  return questsByWorld[worldId] ?? []
}

export function findQuest(worldId, questId) {
  return questsForWorld(worldId).find(q => q.id === questId) ?? null
}
