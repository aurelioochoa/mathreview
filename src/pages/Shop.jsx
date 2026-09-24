import { Link } from 'react-router-dom'
import { useGame } from '../state/gameStore'
import { SHOP_ITEMS } from '../content/shop'
import AuraRing from '../components/AuraRing'
import { estiloMarco } from '../components/marco'

const SLOT_LABEL = {
  avatar: 'Avatares',
  frame: 'Marcos',
  title: 'Títulos',
  aura: 'Auras del perfil',
  cursor: 'Estelas del ratón',
  hint: 'Pistas',
}
const GRUPOS = ['avatar', 'frame', 'title', 'aura', 'cursor', 'hint']

// Cómo se enseña un ítem en su tarjeta. Auras y marcos van encendidos -- y el
// marco además fijo, sin esperar al ratón -- porque el emoji solo no dice de
// qué color es lo que estás comprando. El resto se enseña tal cual.
function Vista({ item }) {
  if (item.slot === 'frame') {
    return (
      <span data-testid={`marco-${item.id}`} style={estiloMarco(item.id)}
        className="marco marco-encendido inline-flex items-center justify-center w-14 h-14 rounded-xl">
        {item.emoji}
      </span>
    )
  }
  return <AuraRing auraId={item.id} size={56}>{item.emoji}</AuraRing>
}

export default function Shop() {
  const { state, dispatch } = useGame()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="panel overflow-hidden mb-6" style={{ '--mundo': '#f59e0b' }}>
        <div className="panel-banda px-5 py-4 flex items-center gap-4">
          <span className="text-5xl flotar drop-shadow" aria-hidden="true">🛒</span>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-extrabold">🛒 Tienda</h1>
            <p className="text-sm opacity-90">Gasta tus monedas en avatares, marcos, títulos, auras y estelas.</p>
          </div>
          <span className="chip text-lg !pl-3">{state.coins} 🪙</span>
        </div>
      </div>

      {GRUPOS.map(slot => (
        <div key={slot} className="mb-6">
          <h2 className="font-display text-lg font-extrabold mb-2">{SLOT_LABEL[slot]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SHOP_ITEMS.filter(i => i.slot === slot).map(item => {
              const owned = slot !== 'hint' && state.cosmetics.owned.includes(item.id)
              const afford = state.coins >= item.price
              return (
                <div key={item.id} className="panel !rounded-2xl !border-2 p-3 text-center hover:-translate-y-0.5 transition-transform">
                  <p className="text-3xl mb-1 flex justify-center items-center h-14">
                    <Vista item={item} />
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  {owned ? (
                    <p className="text-xs text-green-600 font-bold mt-1">✅ En tu colección</p>
                  ) : (
                    <button disabled={!afford} onClick={() => dispatch({ type: 'BUY_ITEM', item })}
                      aria-label={`Comprar ${item.label} por ${item.price} monedas`}
                      className={`btn btn-sm w-full mt-2 ${afford ? 'btn-amber' : 'btn-ghost'}`}>
                      {item.price} 🪙
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {state.hints > 0 && <p className="text-sm text-gray-500 mb-2">Tienes {state.hints} 💡 token(s) de pista para gastar en los retos.</p>}
      <Link to="/perfil" className="text-sm text-primary underline">Equipar lo comprado en tu perfil →</Link>
    </div>
  )
}
