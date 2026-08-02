import { Outlet, Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import Hud from './Hud'
import CursorAura from './CursorAura'
import PageTransition from './PageTransition'
import { adjacentBlock } from '../content/worldMap'

export default function Layout() {
  const location = useLocation()
  const { prev, next } = adjacentBlock(location.pathname)
  const onBlockPage = prev !== null || next !== null || location.pathname.startsWith('/bloque')
  // El mapa (home) es full-bleed: llena el viewport bajo el HUD, sin footer.
  const isMap = location.pathname === '/'

  return (
    <div className={isMap ? 'h-dvh flex flex-col' : 'min-h-screen'}>
      {/* Fuera del <main>: la estela cubre toda la ventana, también el HUD. */}
      <CursorAura />

      <nav className="sticky top-0 z-50 glass border-b border-surface/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <Hud />
        </div>
      </nav>

      <main className={isMap ? 'flex-1 min-h-0 overflow-auto' : 'max-w-5xl mx-auto px-4 py-8'}>
        <PageTransition><Outlet /></PageTransition>
      </main>

      {onBlockPage && (
        <div className="max-w-5xl mx-auto px-4 pb-12 flex justify-between">
          {prev ? (
            <Link to={prev.path} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:shadow-md transition-all text-gray-700 hover:text-primary">
              <ChevronLeft size={18} /> {prev.label}
            </Link>
          ) : <div />}
          {next ? (
            <Link to={next.path} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:shadow-md transition-all text-gray-700 hover:text-primary">
              {next.label} <ChevronRight size={18} />
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all">
              <Home size={18} /> Volver al mapa
            </Link>
          )}
        </div>
      )}

      {!isMap && (
        <footer className="text-center py-6 text-gray-400 text-sm">
          Math Quest — repaso matemático gamificado
        </footer>
      )}
    </div>
  )
}
