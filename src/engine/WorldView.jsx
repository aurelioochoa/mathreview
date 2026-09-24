import { Link, useParams } from 'react-router-dom'
import { findWorld } from '../content/worlds'
import { questsForWorld } from '../content/quests'
import { studyTargetFor, isWorldUnlocked, portalTargetFor, worldHex } from '../content/worldMap'
import { useGame } from '../state/gameStore'

// Desplazamiento horizontal de cada parada del camino: zigzag suave, como el
// mapa de niveles de un juego de móvil.
const ZIGZAG = [0, 70, 0, -70]
const offset = (i) => ZIGZAG[i % ZIGZAG.length]

// Piedritas entre dos paradas del camino, interpoladas entre sus desplazamientos.
function Piedras({ from, to, lit }) {
  return (
    <div className="relative h-12" aria-hidden="true">
      {[0.2, 0.5, 0.8].map(t => (
        <span key={t}
          className={`absolute left-1/2 w-3 h-3 -ml-1.5 rounded-full ${lit ? 'bg-amber-300 shadow-[0_2px_0_#d97706]' : 'bg-gray-300/80'}`}
          style={{ top: `${t * 100}%`, transform: `translate(calc(${from + (to - from) * t}px * var(--zz)), -50%)` }} />
      ))}
    </div>
  )
}

function Estrellas({ n, size = 'text-base' }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${n} de 3 estrellas`}>
      {[0, 1, 2].map(i => <span key={i} className={i < n ? '' : 'grayscale opacity-30'}>⭐</span>)}
    </span>
  )
}

// Una parada del camino: la ficha redonda del nivel y su cartel al lado.
function Parada({ i, level, stars, unlocked, current, to, color }) {
  const ficha = (
    <span
      className={`relative grid place-items-center w-20 h-20 rounded-full text-4xl border-4 transition-transform ${
        unlocked ? 'border-white group-hover:scale-105' : 'border-gray-200 bg-gray-200 grayscale opacity-70'
      } ${current ? 'latido' : ''}`}
      style={unlocked ? { background: `radial-gradient(circle at 35% 30%, #fff8, transparent 45%), ${color}`, boxShadow: `0 6px 0 color-mix(in oklab, ${color} 60%, #1e1b4b)` } : { boxShadow: '0 6px 0 #9ca3af' }}
    >
      {unlocked ? level.icon : '🔒'}
      <span className="absolute -top-1 -left-1 w-7 h-7 grid place-items-center rounded-full bg-white text-xs font-display font-bold text-indigo-900 border-2 border-indigo-100">{i + 1}</span>
      {current && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 text-amber-950 text-xs font-display font-bold px-2.5 py-1 shadow-[0_3px_0_#b45309] flotar">
          ¡Te toca!
        </span>
      )}
    </span>
  )
  const cartel = (
    <span className="text-left min-w-0">
      <span className={`block font-display font-bold leading-tight ${unlocked ? '' : 'text-gray-400'}`}>Nivel {i + 1}: {level.title}</span>
      {unlocked
        ? <span className="flex items-center gap-2 mt-0.5">
            <Estrellas n={stars} size="text-sm" />
            <span className="text-xs font-bold text-primary">{stars > 0 ? 'Jugar otra vez →' : 'Jugar →'}</span>
          </span>
        : <span className="block text-xs text-gray-400 mt-0.5">Supera el nivel anterior</span>}
    </span>
  )
  const inner = <span className="flex items-center gap-4">{ficha}{cartel}</span>
  return (
    <div className="flex justify-center" style={{ transform: `translateX(calc(${offset(i)}px * var(--zz)))` }}>
      {unlocked
        ? <Link to={to} className="group panel !rounded-full !border-2 pl-1.5 pr-5 py-1.5 hover:-translate-y-0.5 transition-transform max-w-[20rem]">{inner}</Link>
        : <div className="pl-1.5 pr-5 py-1.5 max-w-[20rem] opacity-80">{inner}</div>}
    </div>
  )
}

export default function WorldView() {
  const { slug } = useParams()
  const { state } = useGame()
  const world = findWorld(slug)
  if (!world) return <p className="text-center py-12">Mundo no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>

  // La puerta también aquí, no solo en el mapa: si no, basta con teclear la URL.
  if (!isWorldUnlocked(world.slug, state)) {
    const portalSlug = portalTargetFor(world.slug)
    return (
      <div className="max-w-xl mx-auto text-center panel p-8 entrar-abajo">
        <p className="text-6xl mb-2 flotar inline-block">🔒</p>
        <h1 className="font-display text-2xl font-extrabold mb-1">{world.emoji} {world.name} está cerrado</h1>
        <p className="text-sm text-gray-500 mb-5">
          Derrota al jefe del mundo anterior para abrirlo. Y si ya te sabes ese mundo, sáltatelo con el portal.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn btn-ghost">🗺️ Volver al mapa</Link>
          {portalSlug && (
            <Link to={`/mundo/${portalSlug}/portal`} className="btn btn-violet">🌀 Probar el portal</Link>
          )}
        </div>
      </div>
    )
  }

  const color = worldHex(world.slug)
  const keyOf = (l) => `${world.id}/${l.id}`
  const unlockedAt = (i) => i === 0 || state.completedLevels.includes(keyOf(world.levels[i - 1]))
  const allLevelsDone = world.levels.every(l => state.completedLevels.includes(keyOf(l)))
  const mastered = state.bossDefeats.includes(world.id)
  const quests = questsForWorld(world.id)
  const current = world.levels.findIndex((l, i) => unlockedAt(i) && !state.completedLevels.includes(keyOf(l)))
  const stars = world.levels.reduce((s, l) => s + (state.stars[keyOf(l)] ?? 0), 0)
  const done = world.levels.filter(l => state.completedLevels.includes(keyOf(l))).length

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cabecera del mundo */}
      <div className="panel overflow-hidden mb-8 entrar-abajo" style={{ '--mundo': color }}>
        <div className="panel-banda px-5 py-5 sm:px-6 flex items-center gap-4">
          <span className="text-6xl drop-shadow-lg flotar">{world.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest opacity-90">Mundo {world.id.replace('mundo', '')}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">{world.name}{mastered && ' ⭐'}</h1>
            <p className="text-sm opacity-90">{world.description}</p>
          </div>
        </div>
        <div className="px-5 py-3 sm:px-6 flex flex-wrap items-center gap-3">
          <span className="chip text-sm"><span className="chip-ico bg-yellow-100">⭐</span>{stars}/{world.levels.length * 3}</span>
          <span className="chip text-sm"><span className="chip-ico bg-emerald-100">🏁</span>{done}/{world.levels.length} niveles</span>
          <div className="flex-1" />
          <Link to="/" className="btn btn-ghost btn-sm">🗺️ Mapa</Link>
          {/* Solo los mundos migrados de un Bloque tienen modo estudio. */}
          {studyTargetFor(world.slug) && (
            <Link to={`/mundo/${world.slug}/estudio`} className="btn btn-sky btn-sm">📖 Modo estudio</Link>
          )}
        </div>
      </div>

      {/* Camino de niveles */}
      <div className="relative pt-6 zigzag">
        {world.levels.map((level, i) => (
          <div key={level.id}>
            {i > 0 && <Piedras from={offset(i - 1)} to={offset(i)} lit={unlockedAt(i)} />}
            <Parada
              i={i}
              level={level}
              stars={state.stars[keyOf(level)] ?? 0}
              unlocked={unlockedAt(i)}
              current={i === current}
              to={`/mundo/${world.slug}/nivel/${level.id}`}
              color={color}
            />
          </div>
        ))}

        <Piedras from={offset(world.levels.length - 1)} to={0} lit={allLevelsDone} />

        {/* Jefe al final del camino */}
        <div className="flex justify-center">
          {allLevelsDone ? (
            <Link to={`/mundo/${world.slug}/jefe`}
              className={`group panel !border-4 px-6 py-5 text-center w-full max-w-sm hover:-translate-y-1 transition-transform ${mastered ? '!border-amber-300' : '!border-red-300'}`}>
              <span className={`text-6xl inline-block ${mastered ? '' : 'flotar'}`}>{world.boss.emoji}</span>
              <p className="font-display font-extrabold text-lg mt-1">Jefe: {world.boss.name}</p>
              <p className="text-sm text-amber-500 font-semibold">{mastered ? '⭐ Mundo dominado' : 'Derrota al jefe para dominar el mundo'}</p>
              <span className={`btn ${mastered ? 'btn-amber' : 'btn-red'} btn-sm mt-3`}>{mastered ? 'Rejugar →' : '⚔️ ¡Pelear! →'}</span>
            </Link>
          ) : (
            <div className="panel !border-dashed !shadow-none px-6 py-5 text-center w-full max-w-sm opacity-75">
              <span className="text-5xl inline-block grayscale opacity-60">{world.boss.emoji}</span>
              <p className="font-display font-bold text-gray-400 mt-1">Jefe: completa todos los niveles para desafiarlo</p>
            </div>
          )}
        </div>
      </div>

      {quests.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-extrabold mb-3">📋 Sidequests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quests.map(quest => {
              const hecho = state.questsCompleted.includes(`${world.id}/${quest.id}`)
              return (
                <Link key={quest.id} to={`/mundo/${world.slug}/quest/${quest.id}`}
                  className="panel !rounded-2xl !border-2 flex items-center gap-3 p-3 hover:-translate-y-0.5 transition-transform">
                  <span className="text-3xl w-12 h-12 grid place-items-center rounded-xl bg-indigo-50">{quest.emoji}</span>
                  <span className="flex-1 font-display font-bold leading-tight">{quest.title}</span>
                  <span className={`text-xs font-bold rounded-full px-2 py-1 ${hecho ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {hecho ? '✅ Hecha' : '➕ XP'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
