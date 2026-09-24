import { useGame } from '../state/gameStore'
import { estiloMarco } from './marco'

// Una opción de respuesta. Estaba copiada letra por letra en los cuatro modos
// de juego y, con una variante, en el mini-quiz de los estudios; el marco tenía
// que entrar en todas, así que ahora vive aquí una sola vez.
//
// `estado` es en qué punto está la opción: 'neutro' mientras se puede pulsar,
// y después la correcta, la fallada, o la elegida cuando aún no hay veredicto
// (esta última solo la usa el mini-quiz).
const FONDO = {
  neutro: 'bg-surface border-indigo-100 hover:border-indigo-300 hover:-translate-y-0.5 shadow-[0_4px_0_var(--panel-ledge)] active:translate-y-1 active:shadow-none',
  correcta: 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-[0_4px_0_#34d399]',
  fallada: 'bg-red-100 border-red-400 text-red-900 shadow-[0_4px_0_#f87171] sacudir',
  elegida: 'bg-indigo-100 border-indigo-400 text-indigo-900 shadow-[0_4px_0_#818cf8]',
}

// La letra de la opción va en una ficha redonda; al resolver, la ficha cambia
// a ✓ o ✗ para que el veredicto se lea sin depender solo del color.
const FICHA = {
  neutro: 'bg-indigo-100 text-indigo-700',
  correcta: 'bg-emerald-500 text-white',
  fallada: 'bg-red-500 text-white',
  elegida: 'bg-indigo-500 text-white',
}

export default function OptionButton({ index, estado = 'neutro', disabled = false, onClick, children }) {
  const { state } = useGame()
  // El hover lo resuelve el CSS y no un estado de React: son cuatro botones que
  // se repintarían enteros cada vez que el puntero entra y sale de uno, para no
  // cambiar más que un borde.
  //
  // Solo se enciende lo que sigue en juego. Una opción ya resuelta no lleva
  // marco ni aunque el modo la deje pulsable, porque el color del acierto o del
  // fallo es la respuesta a lo que acabas de hacer y no se le discute.
  const marco = estado === 'neutro' ? estiloMarco(state.cosmetics?.frame) : null
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={marco ?? undefined}
      className={`w-full flex items-center gap-3 text-left px-3 py-3 rounded-2xl border-2 text-[15px] font-semibold transition-all duration-100 disabled:cursor-default ${FONDO[estado]}${marco ? ' marco' : ''}`}
    >
      <span aria-hidden="true" className={`shrink-0 grid place-items-center w-8 h-8 rounded-xl font-display font-bold text-sm ${FICHA[estado]}`}>
        {estado === 'correcta' ? '✓' : estado === 'fallada' ? '✗' : String.fromCharCode(65 + index)}
      </span>
      <span className="sr-only">{String.fromCharCode(65 + index)})</span>
      <span className="flex-1">{children}</span>
    </button>
  )
}
