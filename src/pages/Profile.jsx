import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import { titleForLevel } from '../state/xpCurve'
import { COSMETIC_ITEMS, EQUIPABLE_SLOTS, findItem } from '../content/shop'
import { ACHIEVEMENTS } from '../content/achievements'
import { worlds } from '../content/worlds'
import SaveTransfer from '../components/SaveTransfer'
import PlayerAvatar from '../components/PlayerAvatar'

// Cómo se presenta cada slot en "Personalizar". `vacio` es la etiqueta del
// botón que desequipa: en título significa "que lo decida el juego", y sale el
// del nivel; en marco, aura y estela no hay automático que valga, simplemente
// no llevas ninguno.
//
// `pista` cuenta lo que no se puede enseñar desde aquí: el marco solo aparece
// mientras respondes, así que sin una línea que lo diga parece que no hace nada.
const SLOTS = {
  avatar: { label: 'Avatar' },
  frame: { label: 'Marco', vacio: 'Ninguno', pista: 'Enciende la opción que señalas' },
  title: { label: 'Título', vacio: 'Automático' },
  aura: { label: 'Aura', vacio: 'Ninguna' },
  cursor: { label: 'Estela del ratón', vacio: 'Ninguna' },
}

function Stat({ label, value }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="font-display font-bold text-lg text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// Columna de un slot cosmético. Solo lista lo que el jugador posee; el resto
// se compra en la tienda.
function Selector({ slot, equipped, owned, onEquip }) {
  const { label, vacio, pista } = SLOTS[slot]
  const opciones = COSMETIC_ITEMS.filter(i => i.slot === slot && owned.has(i.id))
  const clase = (activo) => `w-full px-3 py-1.5 rounded-lg text-sm text-left border ${activo ? 'bg-primary text-white border-primary' : 'bg-surface border-gray-200 text-gray-700'}`
  return (
    // `grow basis-36 min-w-36`: en escritorio las cinco columnas se reparten
    // el ancho; en móvil el mínimo las obliga a desbordar, y la fila se
    // arrastra en vez de partirse.
    <section className="grow basis-36 min-w-36 snap-start glass rounded-2xl p-3">
      <p className={`text-xs font-bold text-gray-500 ${pista ? 'mb-1' : 'mb-2'}`}>{label}</p>
      {pista && <p className="text-[11px] leading-tight text-gray-400 mb-2">{pista}</p>}
      <div className="flex flex-col gap-2">
        {vacio && (
          <button onClick={() => onEquip(slot, null)} aria-pressed={equipped === null} className={clase(equipped === null)}>
            {vacio}
          </button>
        )}
        {opciones.map(i => (
          <button key={i.id} onClick={() => onEquip(slot, i.id)} aria-pressed={equipped === i.id} className={clase(equipped === i.id)}>
            {i.emoji} {i.label}
          </button>
        ))}
        {opciones.length === 0 && <span className="text-xs text-gray-400">Consíguelos en la tienda</span>}
      </div>
    </section>
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
        <PlayerAvatar />
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
      {/* En fila: un slot por columna. En móvil la fila se arrastra en
          horizontal en vez de partirse, que es lo que hace que se lea como
          una estantería de opciones y no como un formulario largo. */}
      <div data-testid="personalizar" className="flex gap-3 overflow-x-auto snap-x pb-3 mb-6 -mx-4 px-4">
        {EQUIPABLE_SLOTS.map(slot => (
          <Selector key={slot} slot={slot} equipped={state.cosmetics[slot]} owned={owned} onEquip={onEquip} />
        ))}
      </div>

      <SaveTransfer />
    </div>
  )
}
