import { Link, useLocation } from 'react-router-dom'
import { Map as MapIcon, Award, ShoppingBag } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'
import PlayerAvatar from './PlayerAvatar'
import ThemeToggle from './ThemeToggle'

// Contador de recurso con "pop" al cambiar. La key fuerza el remontado para
// que la animación se repita cada vez que el número se mueve.
function Recurso({ value, icon, bg, title, className = '' }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={value}
      initial={reduce ? false : { scale: 0.7 }}
      animate={{ scale: 1 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 15 }}
      className={`chip text-sm shrink-0 ${className}`}
      title={title}
    >
      <span className={`chip-ico ${bg}`} aria-hidden="true">{icon}</span>
      <span className="tabular-nums">{value}</span>
    </motion.div>
  )
}

// HUD de juego: placa del jugador a la izquierda (avatar con su nivel, título y
// barra de XP), recursos en fichas y botonera cuadrada a la derecha. En el mapa
// flota sobre la escena 3D; en el resto de pantallas va en una barra fija.
export default function Hud({ floating = false }) {
  const { state } = useGame()
  const s = hudStats(state)
  const reduce = useReducedMotion()
  const { pathname } = useLocation()
  const enMapa = pathname === '/'
  // En el mapa la barra no captura el ratón (para poder arrastrar la cámara
  // por los huecos); cada pieza lo vuelve a capturar por su cuenta.
  const pieza = floating ? 'pointer-events-auto' : ''

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link to="/" title="Mapa" aria-label="Mapa"
        className={`btn btn-sky btn-icon shrink-0 ${enMapa ? 'hidden sm:inline-flex' : ''} ${pieza}`}>
        <MapIcon size={20} />
      </Link>

      {/* Placa del jugador. El avatar hace de acceso al perfil. */}
      <div className={`flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-md panel !rounded-2xl !border-2 px-2 py-1.5 ${pieza}`}
        style={{ boxShadow: '0 4px 0 var(--panel-ledge)' }}>
        <Link to="/perfil" title="Perfil" aria-label="Perfil" className="shrink-0 relative flex items-center">
          <PlayerAvatar size={40} className="text-2xl" />
          <span aria-hidden="true"
            className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-[10px] font-display font-bold text-amber-950 border-2 border-white shadow">
            {s.level}
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display font-bold text-sm truncate">
              Nv. {s.level} · <span className="text-primary">{s.title}</span>
            </span>
            <span className="hidden sm:inline text-[11px] text-gray-500 shrink-0 tabular-nums">
              {s.intoLevel}/{s.span} XP
            </span>
          </div>
          <div className="barra mt-1 !h-2.5">
            <motion.div
              className="relleno"
              initial={false}
              animate={{ width: `${Math.round(s.progress * 100)}%` }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 hidden lg:block" />

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Recurso value={s.totalStars} icon="⭐" bg="bg-yellow-100" title="Estrellas" className={`hidden sm:inline-flex ${pieza}`} />
        {state.streak?.count > 0 && (
          <Recurso value={state.streak.count} icon="🔥" bg="bg-orange-100" title={`Racha de ${state.streak.count} días`} className={`hidden sm:inline-flex ${pieza}`} />
        )}
        <Recurso value={s.coins} icon="🪙" bg="bg-amber-100" title="Monedas" className={pieza} />
      </div>

      {/* Botonera: logros, tienda y tema. El perfil lo lleva el avatar. */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Link to="/logros" title="Logros" aria-label="Logros" className={`btn btn-violet btn-icon ${pieza}`}><Award size={19} /></Link>
        <Link to="/tienda" title="Tienda" aria-label="Tienda" className={`btn btn-amber btn-icon ${pieza}`}><ShoppingBag size={19} /></Link>
        <ThemeToggle className={`btn btn-ghost btn-icon ${pieza}`} />
      </div>
    </div>
  )
}
