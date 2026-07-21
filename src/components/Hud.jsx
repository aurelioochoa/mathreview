import { Link } from 'react-router-dom'
import { Home, Coins, Star } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useGame } from '../state/gameStore'
import { hudStats } from '../state/hudStats'

export default function Hud() {
  const { state } = useGame()
  const s = hudStats(state)
  const reduce = useReducedMotion()

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary hover:text-primary-dark transition-colors shrink-0">
        <Home size={20} />
        <span className="hidden sm:inline">Math Quest</span>
      </Link>

      {/* Nivel + barra de XP */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display font-bold text-sm text-gray-800 truncate">
            Nv. {s.level} · <span className="text-primary">{s.title}</span>
          </span>
          <span className="text-[11px] text-gray-500 shrink-0 tabular-nums">
            {s.intoLevel}/{s.span} XP
          </span>
        </div>
        <div className="mt-1 h-2.5 rounded-full bg-gray-200/70 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
            initial={false}
            animate={{ width: `${Math.round(s.progress * 100)}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Estrellas totales (dato real) */}
      <motion.div
        key={`stars-${s.totalStars}`}
        initial={reduce ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 15 }}
        className="hidden xs:flex sm:flex items-center gap-1 font-display font-bold text-yellow-500 glass rounded-full px-3 py-1 shrink-0"
      >
        <Star size={16} fill="currentColor" />
        <span className="tabular-nums">{s.totalStars}</span>
      </motion.div>

      {/* Monedas con pop al cambiar */}
      <motion.div
        key={s.coins}
        initial={reduce ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 15 }}
        className="flex items-center gap-1 font-display font-bold text-amber-600 glass rounded-full px-3 py-1 shrink-0"
      >
        <Coins size={16} />
        <span className="tabular-nums">{s.coins}</span>
      </motion.div>
    </div>
  )
}
