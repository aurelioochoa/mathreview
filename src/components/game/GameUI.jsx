import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { worldHex } from '../../content/worldMap'

// Piezas de interfaz compartidas por los cuatro modos de juego (nivel, jefe,
// sidequest y portal). Antes cada modo pintaba su cabecera, sus vidas y su
// progreso a su manera; ahora todos hablan el mismo idioma visual.

// Cabecera de pantalla de juego: botón de volver, chip del mundo y título.
// `--mundo` tiñe la banda con el color del mundo.
export function GameHeader({ world, backTo, backLabel = 'Volver', kicker, title, children }) {
  return (
    <div className="panel overflow-hidden mb-5" style={{ '--mundo': worldHex(world?.slug) }}>
      <div className="panel-banda px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
        {backTo && (
          <Link to={backTo} aria-label={backLabel} title={backLabel}
            className="btn btn-ghost btn-icon shrink-0 !text-[var(--ink)]">
            <ChevronLeft size={22} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-90 truncate">
            {kicker ?? `${world?.emoji ?? ''} ${world?.name ?? ''}`}
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold leading-tight truncate">{title}</h1>
        </div>
      </div>
      {children && <div className="px-4 py-3 sm:px-5">{children}</div>}
    </div>
  )
}

// Vidas como corazones que se vacían. Con aria-label para lectores de pantalla.
export function Hearts({ lives, max }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-lg" aria-label={`${lives} de ${max} vidas`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden="true"
          className={`transition-all duration-300 ${i < lives ? '' : 'grayscale opacity-40 scale-75'}`}>
          ❤️
        </span>
      ))}
    </span>
  )
}

// Progreso por segmentos: uno por pregunta, verde el acertado a la primera,
// ámbar el que costó, y el actual latiendo.
export function SegmentProgress({ total, current, results = [] }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}>
      {Array.from({ length: total }, (_, i) => {
        const r = results[i]
        const color = r === 'ok' ? 'bg-emerald-400' : r === 'meh' ? 'bg-amber-400' : r === 'ko' ? 'bg-red-400'
          : i === current ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-100'
        return <span key={i} className={`h-2.5 flex-1 rounded-full ${color} transition-colors`} />
      })}
    </div>
  )
}

// Barra de vida / progreso genérica.
export function Bar({ pct, gradient, label }) {
  return (
    <div className="barra" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="relleno" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, ...(gradient ? { background: gradient } : {}) }} />
    </div>
  )
}

// Aviso de resultado debajo de las opciones: verde si acertaste, ámbar si no.
export function Feedback({ tone, title, children }) {
  const styles = tone === 'ok'
    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
    : 'bg-amber-50 border-amber-300 text-amber-900'
  return (
    <div role="status" className={`entrar-abajo mt-4 rounded-2xl border-2 p-4 ${styles} ${tone === 'ok' ? '' : 'sacudir'}`}>
      {title && <p className="font-display font-bold text-lg mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  )
}

// Pantalla de resultado (victoria, derrota, fin de misión).
export function ResultCard({ icon, title, children, overlay }) {
  return (
    <div className="relative panel text-center p-8 overflow-hidden entrar-abajo">
      {overlay}
      <div className="relative">
        <p className="text-6xl mb-3 flotar inline-block">{icon}</p>
        <h2 className="font-display text-2xl font-extrabold mb-2">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// Recompensas como fichas grandes: +XP, +monedas, estrellas.
export function Rewards({ items }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 my-4">
      {items.filter(Boolean).map((it, i) => (
        <span key={i} className="chip text-base entrar-abajo" style={{ animationDelay: `${i * 90}ms` }}>
          <span className="chip-ico bg-amber-100">{it.icon}</span>{it.text}
        </span>
      ))}
    </div>
  )
}

// Tarjeta de la pregunta: enunciado grande y la ayuda de teclado.
export function QuestionCard({ children, meta }) {
  return (
    <div className="panel p-5 sm:p-6">
      {meta && <div className="flex items-center justify-between gap-3 mb-4 text-sm font-semibold text-gray-500">{meta}</div>}
      {children}
      <p className="hidden md:block mt-4 text-[11px] text-gray-400 text-right">
        Atajo: <span className="tecla">1</span>–<span className="tecla">4</span> para responder · <span className="tecla">Enter</span> para seguir
      </p>
    </div>
  )
}
