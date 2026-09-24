import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { List, Map as MapIcon, X } from 'lucide-react'
import { findWorld } from '../content/worlds'
import { questsForWorld } from '../content/quests'
import { isWorldUnlocked, worldHex, worldMapNodes } from '../content/worldMap'
import { findItem } from '../content/shop'
import { useGame } from '../state/gameStore'
import { setVistaMundo } from '../state/vistaMundo'
import { useDeviceTier } from '../three/useDeviceTier'
import { layoutFor, propsFor, obstaclesFor, spawnPoint, hashSeed, AMBIENTE, WALK_R } from '../three/walk/walkLogic'
import { live, initWalker, useWalk } from '../three/walk/walkStore'
import { Joystick } from '../components/map/MapOverlays'
import useCoarsePointer from '../components/map/useCoarsePointer'

const WalkCanvas = lazy(() => import('../three/walk/WalkCanvas'))

// Exploración a pie dentro de un mundo: desembarcas en su isla y caminas entre
// los niveles (pedestales con gema), el jefe (puerta al fondo) y las
// sidequests (personajes con "!"). Al acercarte a algo, un panel te deja
// entrar. La lista clásica de niveles sigue a un botón de distancia.

const caminar = (x, y) => { live.stick = { x, y } }
const saltar = () => { live.jumpPad = true }

const TIPO = { level: 'Nivel', boss: 'Jefe', quest: 'Sidequest', dock: 'Embarcadero' }

function PanelEstacion({ stations, color }) {
  const id = useWalk(s => s.nearby)
  const navigate = useNavigate()
  const s = stations.find(x => x.id === id)

  useEffect(() => {
    if (!s?.unlocked) return undefined
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') { e.preventDefault(); navigate(s.to) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s, navigate])

  if (!s) return null
  const motivo = s.kind === 'boss' ? 'Completa todos los niveles para abrir la puerta.' : 'Supera el nivel anterior para activar esta gema.'
  return (
    <div key={s.id} className="entrar-abajo panel !rounded-3xl overflow-hidden w-[min(94vw,24rem)] pointer-events-auto" style={{ '--mundo': s.kind === 'boss' ? '#dc2626' : color }}>
      <div className="panel-banda px-4 py-3 flex items-center gap-3">
        <span className={`text-4xl ${s.unlocked ? '' : 'grayscale'}`}>{s.unlocked ? s.icon : '🔒'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">{TIPO[s.kind]}</p>
          <h2 className="font-display text-lg font-extrabold leading-tight">{s.label}</h2>
        </div>
        {s.done && <span className="shrink-0 text-xs font-bold rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">✔ Hecho</span>}
      </div>
      <div className="px-4 py-3">
        {s.kind === 'level' && s.unlocked && (
          <p className="text-lg mb-2" aria-label={`${s.stars} de 3 estrellas`}>
            {[0, 1, 2].map(i => <span key={i} className={i < s.stars ? '' : 'grayscale opacity-30'}>⭐</span>)}
          </p>
        )}
        {!s.unlocked && <p className="text-sm text-gray-500 mb-2">{motivo}</p>}
        {s.unlocked && (
          <Link to={s.to} className={`btn w-full ${s.kind === 'boss' ? 'btn-red' : s.kind === 'dock' ? 'btn-sky' : 'btn-green'}`}>
            {s.kind === 'dock' ? '⛵ Zarpar' : s.kind === 'boss' ? '⚔️ Entrar a la arena' : s.kind === 'quest' ? '📋 Hablar' : s.done ? '🔁 Jugar otra vez' : '▶️ Jugar'}
            <span className="tecla !bg-white/25 !text-white !border-white/40 !shadow-none">E</span>
          </Link>
        )}
      </div>
    </div>
  )
}

function MiniIsla({ stations, color }) {
  const pos = useWalk(s => s.pos)
  const R = WALK_R + 1.5
  const ang = (Math.atan2(Math.cos(pos.heading), Math.sin(pos.heading)) * 180) / Math.PI
  const fill = { level: color, boss: '#dc2626', quest: '#f59e0b', dock: '#0ea5e9' }
  return (
    <div className="panel !rounded-2xl p-2 w-32 sm:w-44 pointer-events-auto">
      <svg viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`} className="w-full" role="img" aria-label="Minimapa de la isla">
        <circle r={R} fill="#38bdf8" />
        <circle r={WALK_R + 0.6} fill="#fde68a" />
        <circle r={WALK_R - 0.8} fill="#86efac" />
        <circle r="3.3" fill="#a8a29e" />
        {stations.map(s => (
          <circle key={s.id} cx={s.x} cy={s.z} r={s.kind === 'boss' ? 1.6 : 1.1} fill={s.unlocked ? fill[s.kind] : '#94a3b8'} stroke="#fff" strokeWidth="0.3" />
        ))}
        <g transform={`translate(${pos.x} ${pos.z}) rotate(${ang})`}>
          <polygon points="1.4,0 -0.9,0.9 -0.5,0 -0.9,-0.9" fill="#fff" stroke="#1e1b4b" strokeWidth="0.25" />
        </g>
      </svg>
    </div>
  )
}

function Ayuda() {
  const [open, setOpen] = useState(true)
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm pointer-events-auto">🎮 Controles</button>
  return (
    <div className="panel !rounded-2xl px-3 py-2 text-xs pointer-events-auto max-w-[15rem]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-display font-bold">🎮 Controles</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Ocultar controles" className="text-gray-400 hover:text-gray-700"><X size={14} /></button>
      </div>
      <ul className="space-y-1 text-gray-600">
        <li><span className="tecla">W</span><span className="tecla">A</span><span className="tecla">S</span><span className="tecla">D</span> caminar · <span className="tecla">⇧</span> correr</li>
        <li><span className="tecla">Espacio</span> saltar</li>
        <li>🖱️ Arrastrar: girar cámara · rueda: zoom</li>
        <li><span className="tecla">E</span> entrar en lo que tengas cerca</li>
      </ul>
    </div>
  )
}

function Exploracion({ world }) {
  const { state } = useGame()
  const coarse = useCoarsePointer()
  const quests = useMemo(() => questsForWorld(world.id), [world.id])
  const node = worldMapNodes.find(n => n.id === world.slug)
  const color = worldHex(world.slug)
  const seed = hashSeed(world.slug)
  const amb = AMBIENTE[world.id] ?? AMBIENTE.mundo4
  const stations = useMemo(() => layoutFor(world, quests, state), [world, quests, state])
  // La vegetación depende solo de las posiciones, no del progreso: así no se
  // replanta el bosque cada vez que cambia la partida.
  const props = useMemo(() => propsFor(seed, layoutFor(world, quests, {}), amb.mix), [seed, world, quests, amb])
  const obstacles = useMemo(() => obstaclesFor(stations, props), [stations, props])
  const avatar = findItem(state.cosmetics?.avatar)?.emoji ?? '🙂'
  useState(() => initWalker(world.slug, spawnPoint(stations)))
  useEffect(() => setVistaMundo('pie'), [])

  return (
    <div className="relative h-full overflow-hidden">
      <h1 className="sr-only">{world.name}: exploración a pie</h1>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<div className="h-full grid place-items-center font-display font-bold text-sky-900/70"><span><span className="text-5xl block text-center flotar">🚶</span>Desembarcando…</span></div>}>
          <WalkCanvas world={world} shape={node?.shape} color={color} stations={stations} props={props}
            obstacles={obstacles} seed={seed} tint={amb.hierba} avatar={avatar} />
        </Suspense>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-3 sm:left-5 top-[4.6rem] sm:top-20 flex flex-col gap-2 items-start">
          <div className="panel !rounded-2xl px-3 py-2 pointer-events-auto" style={{ '--mundo': color }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Explorando</p>
            <p className="font-display font-extrabold leading-tight">{world.emoji} {world.name}</p>
            <div className="flex gap-1.5 mt-2">
              <Link to="/" className="btn btn-sky btn-sm !px-2.5" title="Volver al mapa"><MapIcon size={14} /> Mapa</Link>
              <Link to={`/mundo/${world.slug}`} className="btn btn-ghost btn-sm !px-2.5" title="Ver la lista de niveles"><List size={14} /> Lista</Link>
            </div>
          </div>
        </div>
        <div className="absolute right-3 sm:right-5 top-[4.6rem] sm:top-20"><MiniIsla stations={stations} color={color} /></div>
        {!coarse && <div className="absolute left-3 sm:left-5 bottom-4 hidden md:block"><Ayuda /></div>}
        {coarse && (
          <>
            <div className="absolute left-5 bottom-6"><Joystick onMove={caminar} label="Joystick para caminar" /></div>
            <button type="button" onPointerDown={saltar} aria-label="Saltar"
              className="absolute right-6 bottom-8 pointer-events-auto btn btn-violet !rounded-full w-16 h-16 text-2xl">⤴</button>
          </>
        )}
        <div className={`absolute left-1/2 -translate-x-1/2 ${coarse ? 'bottom-40' : 'bottom-4'}`}>
          <PanelEstacion stations={stations} color={color} />
        </div>
      </div>
    </div>
  )
}

export default function WorldExplore() {
  const { slug } = useParams()
  const { state } = useGame()
  const { use3D } = useDeviceTier()
  const world = findWorld(slug)
  if (!world) return <p className="text-center py-24">Mundo no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>
  // Sin 3D, o con el mundo cerrado, la vista de siempre (que explica la puerta).
  if (!use3D || !isWorldUnlocked(world.slug, state)) return <Navigate to={`/mundo/${world.slug}`} replace />
  return <Exploracion key={world.slug} world={world} />
}
