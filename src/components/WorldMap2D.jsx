import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { worldMapNodes, nodeState, worldProgress, portalTargetFor } from '../content/worldMap'
import { useGame } from '../state/gameStore'

// Clases de gradiente LITERALES por tema (Tailwind escanea substrings literales;
// construir `from-${theme}` dinámicamente NO se detecta, por eso el mapa estático).
const THEME_GRADIENT = {
  'world-volcan': 'from-world-volcan to-world-volcan/70',
  'world-castillo': 'from-world-castillo to-world-castillo/70',
  'world-laberinto': 'from-world-laberinto to-world-laberinto/70',
  'world-estacion': 'from-world-estacion to-world-estacion/70',
  'world-montanas': 'from-world-montanas to-world-montanas/70',
  'world-feria': 'from-world-feria to-world-feria/70',
  'world-isla': 'from-world-isla to-world-isla/70',
  'world-reino': 'from-world-reino to-world-reino/70',
}

function WorldCard({ node, state }) {
  const reduce = useReducedMotion()
  const st = nodeState(node, state)
  const proximamente = st === 'coming-soon'
  const cerrado = st === 'locked'          // existe, pero falta el jefe anterior
  const locked = proximamente || cerrado
  const portalSlug = cerrado ? portalTargetFor(node.id) : null
  const superadoPorPortal = (state?.portalPasses ?? []).includes(node.levelKeys?.[0]?.split('/')[0])
  const progress = worldProgress(node, state)

  const inner = (
    <>
      <div className={`text-4xl mb-2 drop-shadow-sm ${locked ? 'grayscale opacity-70' : ''}`}>{node.emoji}</div>
      <h3 className="font-display font-bold text-white text-lg leading-tight">{node.title}</h3>
      <p className="text-white/85 text-sm mt-1">{node.subtitle}</p>
      {st === 'completed' && <span className="inline-block mt-2 text-amber-200 text-sm font-bold">⭐ Completado</span>}
      {superadoPorPortal && st !== 'completed' && <span className="inline-block mt-2 text-white/90 text-sm font-bold">🌀 Superado por portal</span>}
      {progress && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs font-bold text-white/90">
            <span>⭐ {progress.stars}/{progress.totalStars}</span>
            <span>{progress.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface/25 overflow-hidden">
            <div className="h-full rounded-full bg-surface/90" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      )}
      {proximamente && (
        <span className="inline-flex items-center gap-1 mt-2 text-white/90 text-xs font-semibold">
          <Lock size={12} /> Próximamente
        </span>
      )}
      {cerrado && (
        <span className="inline-flex items-center gap-1 mt-2 text-white/90 text-xs font-semibold">
          <Lock size={12} /> Derrota al jefe del mundo anterior
        </span>
      )}
    </>
  )

  const cls = `block rounded-[1.75rem] p-5 shadow-xl bg-gradient-to-br ${THEME_GRADIENT[node.theme]}`
  const hover = reduce || locked ? undefined : { rotateX: 6, rotateY: -6, scale: 1.04 }

  if (locked) {
    return (
      <div>
        <div className={cls} aria-disabled="true" style={{ transformPerspective: 700 }}>{inner}</div>
        {/* Vía de escape para quien ya se sabe el mundo anterior. */}
        {portalSlug && (
          <Link to={`/mundo/${portalSlug}/portal`} className="mt-2 block text-center text-xs font-semibold text-primary underline">
            🌀 Sáltatelo con el portal
          </Link>
        )}
      </div>
    )
  }
  return (
    <motion.div style={{ transformPerspective: 700 }} whileHover={hover} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link to={node.target} className={cls} aria-label={`${node.title}: ${node.subtitle}`}>{inner}</Link>
    </motion.div>
  )
}

export default function WorldMap2D() {
  const { state } = useGame()
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0">
      {worldMapNodes.map((node) => (
        <li key={node.id}><WorldCard node={node} state={state} /></li>
      ))}
    </ul>
  )
}
