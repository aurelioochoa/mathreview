import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass, Maximize2, Minimize2, X } from 'lucide-react'
import { worldMapNodes, nodeState, worldProgress, portalTargetFor, THEME_HEX } from '../../content/worldMap'
import { BOTELLAS } from '../../content/curiosidades'
import { useGame } from '../../state/gameStore'
import { BOUNDS, ISLANDS } from '../../three/explorerLogic'
import { useExplorer, sailToIsland, toggleOverview, closeBottle, live } from '../../three/explorerStore'

// Paneles DOM que rodean la escena 3D del mapa: ficha de la isla atracada,
// minimapa, objetivo actual, ayuda de controles, joystick táctil y el mensaje
// de las botellas. Leen el estado del explorador por suscripción (no a 60 fps).

const byId = Object.fromEntries(worldMapNodes.map(n => [n.id, n]))

const ESTADO = {
  available: { txt: 'Disponible', cls: 'bg-sky-100 text-sky-700' },
  completed: { txt: '✔ Completado', cls: 'bg-emerald-100 text-emerald-700' },
  locked: { txt: '🔒 Cerrado', cls: 'bg-slate-200 text-slate-600' },
  'coming-soon': { txt: '🔒 Próximamente', cls: 'bg-slate-200 text-slate-600' },
}

// Ficha de la isla en la que está atracado el barco. Sustituye a las tarjetas
// que antes flotaban sobre todas las islas a la vez.
export function IslandPanel() {
  const id = useExplorer(s => s.nearby)
  const { state } = useGame()
  const navigate = useNavigate()
  const node = id ? byId[id] : null
  const st = node ? nodeState(node, state) : null
  const enterable = node && st !== 'coming-soon' && node.target
  // Abierto: se desembarca a pie en la isla. Cerrado: a la vista que explica la puerta.
  const destino = enterable ? (st === 'locked' ? node.target : `${node.target}/explorar`) : null

  useEffect(() => {
    if (!enterable) return undefined
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') { e.preventDefault(); navigate(destino) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enterable, destino, navigate])

  if (!node) return null
  const progress = worldProgress(node, state)
  const locked = st === 'locked' || st === 'coming-soon'
  const portalSlug = st === 'locked' ? portalTargetFor(node.id) : null
  const e = ESTADO[st]

  return (
    <div key={node.id} className="entrar-abajo panel !rounded-3xl overflow-hidden w-[min(94vw,26rem)] pointer-events-auto"
      style={{ '--mundo': THEME_HEX[node.theme] }}>
      <div className="panel-banda px-4 py-3 flex items-center gap-3">
        <span className={`text-4xl drop-shadow ${locked ? 'grayscale' : ''}`}>{node.emoji}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-extrabold leading-tight truncate">{node.title}</h2>
          <p className="text-xs font-semibold opacity-90 truncate">{node.subtitle}</p>
        </div>
        <span className={`shrink-0 text-[11px] font-bold rounded-full px-2 py-0.5 ${e.cls}`}>{e.txt}</span>
      </div>
      <div className="px-4 py-3">
        {progress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-amber-500">⭐ {progress.stars}/{progress.totalStars}</span>
              <span className="text-gray-500">{progress.done}/{progress.total} niveles · {progress.pct}%</span>
            </div>
            <div className="barra"><div className="relleno" style={{ width: `${progress.pct}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' }} /></div>
          </div>
        )}
        {st === 'locked' && <p className="text-xs text-gray-500 mb-3">Derrota al jefe del mundo anterior para abrirlo, o demuestra que ya lo dominas en el portal.</p>}
        <div className="flex flex-wrap gap-2">
          {enterable && (
            <Link to={destino} className={`btn ${locked ? 'btn-ghost' : 'btn-green'} flex-1`}>
              {locked ? 'Ver la puerta' : '⚓ Desembarcar'} <span className="tecla !bg-white/25 !text-white !border-white/40 !shadow-none">E</span>
            </Link>
          )}
          {node.studyTarget && !locked && (
            <Link to={node.studyTarget} className="btn btn-ghost">📖 Estudio</Link>
          )}
          {portalSlug && (
            <Link to={`/mundo/${portalSlug}/portal`} className="btn btn-violet">🌀 Portal</Link>
          )}
        </div>
      </div>
    </div>
  )
}

// Minimapa: islas, barco y faro. Clic en una isla = piloto automático.
export function Minimap({ recommended }) {
  const boat = useExplorer(s => s.boat)
  const overview = useExplorer(s => s.overview)
  const sailingTo = useExplorer(s => s.sailingTo)
  const found = useExplorer(s => s.found)
  const { state } = useGame()
  const w = BOUNDS.maxX - BOUNDS.minX, h = BOUNDS.maxZ - BOUNDS.minZ
  const ang = (Math.atan2(Math.cos(boat.heading), Math.sin(boat.heading)) * 180) / Math.PI

  return (
    <div className="panel !rounded-2xl p-2 w-36 sm:w-56 pointer-events-auto">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="font-display font-bold text-xs flex items-center gap-1"><Compass size={14} /> Mapa</span>
        <span className="text-[11px] font-bold text-emerald-600" title="Botellas con mensaje encontradas">🍾 {found.length}/{BOTELLAS.length}</span>
      </div>
      <svg viewBox={`${BOUNDS.minX} ${BOUNDS.minZ} ${w} ${h}`} className="w-full rounded-xl bg-sky-400/80 dark:bg-sky-900" role="group" aria-label="Minimapa">
        <defs>
          <pattern id="olas" width="2" height="2" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.12" fill="rgba(255,255,255,0.35)" />
          </pattern>
        </defs>
        <rect x={BOUNDS.minX} y={BOUNDS.minZ} width={w} height={h} fill="url(#olas)" />
        {ISLANDS.map(is => {
          const node = byId[is.id]
          const st = nodeState(node, state)
          const locked = st === 'locked' || st === 'coming-soon'
          return (
            <g key={is.id} className="cursor-pointer" onClick={() => sailToIsland(is.id)}>
              <title>{node.title}</title>
              {recommended === is.id && (
                <circle cx={is.x} cy={is.z} r="2.2" fill="none" stroke="#fde047" strokeWidth="0.3" className="animate-pulse" />
              )}
              {sailingTo === is.id && (
                <line x1={boat.x} y1={boat.z} x2={is.x} y2={is.z} stroke="white" strokeWidth="0.18" strokeDasharray="0.5 0.4" />
              )}
              <circle cx={is.x} cy={is.z} r="1.45" fill={locked ? '#94a3b8' : THEME_HEX[node.theme]} stroke="#fef3c7" strokeWidth="0.35" />
              <text x={is.x} y={is.z + 0.55} textAnchor="middle" fontSize="1.5">{locked ? '🔒' : node.emoji}</text>
            </g>
          )
        })}
        <g transform={`translate(${boat.x} ${boat.z}) rotate(${ang})`}>
          <polygon points="0.9,0 -0.6,0.55 -0.35,0 -0.6,-0.55" fill="#fff" stroke="#1e1b4b" strokeWidth="0.15" />
        </g>
      </svg>
      <button type="button" onClick={toggleOverview} className="btn btn-ghost btn-sm w-full mt-2 !text-xs">
        {overview ? <><Minimize2 size={14} /> Volver al barco</> : <><Maximize2 size={14} /> Vista general</>}
        <span className="tecla hidden sm:inline-grid">M</span>
      </button>
    </div>
  )
}

// El siguiente paso de la aventura, como en el rastreador de misiones.
export function Objective({ recommended }) {
  const { state } = useGame()
  const nearby = useExplorer(s => s.nearby)
  const node = recommended ? byId[recommended] : null
  if (!node) return null
  const progress = worldProgress(node, state)
  const done = nodeState(node, state) === 'completed'
  return (
    <div className="panel !rounded-2xl px-3 py-2 w-[min(80vw,17rem)] pointer-events-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">🎯 {done ? 'Aventura completada' : 'Objetivo actual'}</p>
      <p className="font-display font-bold leading-tight">{node.emoji} {node.title}</p>
      {progress && <p className="text-xs text-gray-500">{progress.done}/{progress.total} niveles · ⭐ {progress.stars}</p>}
      {nearby !== node.id && (
        <button type="button" onClick={() => sailToIsland(node.id)} className="btn btn-amber btn-sm mt-2 w-full">⛵ Navegar hasta allí</button>
      )}
    </div>
  )
}

export function ControlsHint() {
  const [open, setOpen] = useState(true)
  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm pointer-events-auto">🎮 Controles</button>
  }
  return (
    <div className="panel !rounded-2xl px-3 py-2 text-xs pointer-events-auto max-w-[15rem]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-display font-bold">🎮 Controles</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Ocultar controles" className="text-gray-400 hover:text-gray-700"><X size={14} /></button>
      </div>
      <ul className="space-y-1 text-gray-600">
        <li><span className="tecla">W</span><span className="tecla">A</span><span className="tecla">S</span><span className="tecla">D</span> o flechas: navegar</li>
        <li>🖱️ Clic en el mar o en una isla: ir allí</li>
        <li>🖱️ Arrastrar: girar · rueda: zoom</li>
        <li><span className="tecla">E</span> desembarcar · <span className="tecla">M</span> vista general</li>
      </ul>
    </div>
  )
}

// Joystick virtual para pantallas táctiles. Avisa del eje con `onMove` (por
// defecto mueve el barco del mapa; la exploración a pie pasa el suyo).
const moverBarco = (x, y) => { live.stick = { x, y } }
export function Joystick({ onMove = moverBarco, label = 'Joystick para mover el barco' }) {
  const base = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef(null)
  const R = 44

  const update = (e) => {
    const r = base.current.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
    setKnob({ x: dx, y: dy })
    onMove(dx / R, -dy / R)
  }
  const end = () => {
    active.current = null
    setKnob({ x: 0, y: 0 })
    onMove(0, 0)
  }

  return (
    <div
      ref={base}
      className="pointer-events-auto relative w-28 h-28 rounded-full bg-white/30 border-4 border-white/70 backdrop-blur-sm shadow-lg touch-none select-none"
      onPointerDown={(e) => { active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e) }}
      onPointerMove={(e) => { if (active.current === e.pointerId) update(e) }}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label={label}
      role="application"
    >
      <div className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-gradient-to-b from-white to-indigo-100 border-2 border-indigo-200 shadow-[0_4px_0_rgba(49,46,129,0.35)]"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  )
}

// Mensaje de la botella recién pescada.
export function BottleMessage() {
  const id = useExplorer(s => s.bottle)
  const found = useExplorer(s => s.found)
  const b = BOTELLAS.find(x => x.id === id)
  if (!b) return null
  return (
    <div className="pointer-events-auto entrar-abajo panel !rounded-3xl w-[min(92vw,24rem)] p-5 text-center"
      role="dialog" aria-label={`Botella con mensaje: ${b.titulo}`}>
      <p className="text-4xl mb-1 flotar inline-block">🍾</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Botella con mensaje · {found.length}/{BOTELLAS.length}</p>
      <h2 className="font-display text-xl font-extrabold mt-1">{b.titulo}</h2>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{b.texto}</p>
      <button type="button" onClick={closeBottle} className="btn btn-green mt-4">¡Genial! Seguir navegando</button>
    </div>
  )
}
