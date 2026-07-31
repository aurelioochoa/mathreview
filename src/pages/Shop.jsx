import { Link } from 'react-router-dom'
import { useGame } from '../state/gameStore'
import { SHOP_ITEMS } from '../content/shop'

const SLOT_LABEL = { avatar: 'Avatares', frame: 'Marcos', title: 'Títulos', hint: 'Pistas' }
const GRUPOS = ['avatar', 'frame', 'title', 'hint']

export default function Shop() {
  const { state, dispatch } = useGame()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-800">🛒 Tienda</h1>
        <span className="glass rounded-full px-4 py-2 font-display font-bold text-amber-600">{state.coins} 🪙</span>
      </div>

      {GRUPOS.map(slot => (
        <div key={slot} className="mb-6">
          <h2 className="font-display font-bold text-gray-700 mb-2">{SLOT_LABEL[slot]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SHOP_ITEMS.filter(i => i.slot === slot).map(item => {
              const owned = slot !== 'hint' && state.cosmetics.owned.includes(item.id)
              const afford = state.coins >= item.price
              return (
                <div key={item.id} className="glass rounded-2xl p-3 text-center shadow-sm">
                  <p className="text-3xl mb-1">{item.emoji}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  {owned ? (
                    <p className="text-xs text-green-600 font-bold mt-1">✅ En tu colección</p>
                  ) : (
                    <button disabled={!afford} onClick={() => dispatch({ type: 'BUY_ITEM', item })}
                      aria-label={`Comprar ${item.label} por ${item.price} monedas`}
                      className={`mt-2 w-full px-2 py-1.5 rounded-lg text-xs font-bold ${afford ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
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
