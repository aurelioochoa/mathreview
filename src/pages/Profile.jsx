import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import { titleForLevel } from '../state/xpCurve'
import { COSMETIC_ITEMS, findItem } from '../content/shop'
import { ACHIEVEMENTS } from '../content/achievements'
import { worlds } from '../content/worlds'
import SaveTransfer from '../components/SaveTransfer'

const emojiDe = (id) => findItem(id)?.emoji ?? '🙂'

function Stat({ label, value }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="font-display font-bold text-lg text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// Selector de un slot cosmético. Solo lista lo que el jugador posee; el resto
// se compra en la tienda.
function Selector({ slot, label, allowAuto, equipped, owned, onEquip }) {
  const opciones = COSMETIC_ITEMS.filter(i => i.slot === slot && owned.has(i.id))
  const clase = (activo) => `px-3 py-1.5 rounded-lg text-sm border ${activo ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'}`
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-2">
        {allowAuto && (
          <button onClick={() => onEquip(slot, null)} aria-pressed={equipped === null} className={clase(equipped === null)}>
            Automático
          </button>
        )}
        {opciones.map(i => (
          <button key={i.id} onClick={() => onEquip(slot, i.id)} aria-pressed={equipped === i.id} className={clase(equipped === i.id)}>
            {i.emoji} {i.label}
          </button>
        ))}
        {opciones.length === 0 && <span className="text-xs text-gray-400 self-center">Consíguelos en la tienda</span>}
      </div>
    </div>
  )
}

export default function Profile() {
  const { state, dispatch } = useGame()
  const s = hudStats(state)
  const owned = new Set(state.cosmetics.owned)
  const onEquip = (slot, id) => dispatch({ type: 'EQUIP_COSMETIC', slot, id })

  // El título comprado manda; si no hay ninguno equipado, se usa el del nivel.
  const titulo = state.cosmetics.title ? findItem(state.cosmetics.title)?.label : titleForLevel(s.level)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">{emojiDe(state.cosmetics.avatar)}</span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-gray-800">Perfil</h1>
          <p className="text-primary font-bold">Nv. {s.level} · {titulo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="XP" value={s.xp} />
        <Stat label="Estrellas" value={s.totalStars} />
        <Stat label="Monedas" value={`${s.coins} 🪙`} />
        <Stat label="Racha" value={`🔥 ${state.streak.count} (máx ${state.streak.best})`} />
        <Stat label="Mundos dominados" value={`${state.bossDefeats.length} / ${worlds.length}`} />
        <Stat label="Logros" value={`${state.achievements.length} / ${ACHIEVEMENTS.length}`} />
        <Stat label="Sidequests" value={state.questsCompleted.length} />
        <Stat label="Pistas" value={`${state.hints} 💡`} />
      </div>

      <h2 className="font-display font-bold text-gray-700 mb-2">Personalizar</h2>
      <Selector slot="avatar" label="Avatar" equipped={state.cosmetics.avatar} owned={owned} onEquip={onEquip} />
      <Selector slot="frame" label="Marco" allowAuto equipped={state.cosmetics.frame} owned={owned} onEquip={onEquip} />
      <Selector slot="title" label="Título" allowAuto equipped={state.cosmetics.title} owned={owned} onEquip={onEquip} />

      <SaveTransfer />
    </div>
  )
}
