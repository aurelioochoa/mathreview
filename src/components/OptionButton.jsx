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
  neutro: 'bg-surface border-gray-200 hover:bg-indigo-50',
  correcta: 'bg-green-100 border-green-400 text-green-800',
  fallada: 'bg-red-100 border-red-400 text-red-800',
  elegida: 'bg-indigo-100 border-indigo-400 text-indigo-800',
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
      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${FONDO[estado]}${marco ? ' marco' : ''}`}
    >
      <span className="font-bold mr-2">{String.fromCharCode(65 + index)})</span>
      {children}
    </button>
  )
}
