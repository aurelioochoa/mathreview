import { useGame } from '../state/gameStore'
import { findItem } from '../content/shop'
import AuraRing from './AuraRing'

// El avatar equipado con su aura. Vive en un componente propio porque sale en
// dos sitios con dos tamaños -- la barra superior y la cabecera del perfil --
// y así la identidad del jugador se pinta igual en los dos.
export default function PlayerAvatar({ size = 88, className = 'text-5xl' }) {
  const { state } = useGame()
  const emoji = findItem(state.cosmetics?.avatar)?.emoji ?? '🙂'
  return (
    <AuraRing auraId={state.cosmetics?.aura} size={size}>
      <span className={className}>{emoji}</span>
    </AuraRing>
  )
}
