import { Outlet, Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import Hud from './Hud'
import { adjacentBlock } from '../content/worldMap'

export default function Layout() {
  const location = useLocation()
  const { prev, next } = adjacentBlock(location.pathname)
  const onBlockPage = prev !== null || next !== null || location.pathname.startsWith('/bloque')

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <Hud />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
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

      <footer className="text-center py-6 text-gray-400 text-sm">
        Math Quest — repaso matemático gamificado
      </footer>
    </div>
  )
}
