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
    <div className={isMap ? 'h-dvh relative overflow-hidden' : 'min-h-screen'}>
      {/* Fuera del <main>: la estela cubre toda la ventana, también el HUD. */}
      <CursorAura />

      {/* En el mapa el HUD flota sobre la escena 3D, como en un juego; en el
          resto va en una barra fija con vidrio. */}
      <nav className={isMap
        ? 'absolute top-0 inset-x-0 z-50 pointer-events-none'
        : 'sticky top-0 z-50 glass border-b border-surface/50 shadow-sm'}>
        <div className={isMap ? 'px-3 sm:px-5 pt-3' : 'max-w-6xl mx-auto px-3 sm:px-4 py-2'}>
          <Hud floating={isMap} />
        </div>
      </nav>

      <main className={isMap ? 'absolute inset-0' : 'max-w-5xl mx-auto px-4 py-6 sm:py-8'}>
        <PageTransition><Outlet /></PageTransition>
      </main>

      {onBlockPage && (
        <div className="max-w-5xl mx-auto px-4 pb-12 flex justify-between">
          {prev ? (
            <Link to={prev.path} className="btn btn-ghost btn-sm">
              <ChevronLeft size={18} /> {prev.label}
            </Link>
          ) : <div />}
          {next ? (
            <Link to={next.path} className="btn btn-ghost btn-sm">
              {next.label} <ChevronRight size={18} />
            </Link>
          ) : (
            <Link to="/" className="btn btn-sm">
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
