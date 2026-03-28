import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, ChevronLeft, ChevronRight } from 'lucide-react'

const bloques = [
  { path: '/bloque1', label: 'Bloque 1', color: 'bg-bloque1' },
  { path: '/bloque2', label: 'Bloque 2', color: 'bg-bloque2' },
  { path: '/bloque3', label: 'Bloque 3', color: 'bg-bloque3' },
  { path: '/bloque4', label: 'Bloque 4', color: 'bg-bloque4' },
  { path: '/bloque5', label: 'Bloque 5', color: 'bg-bloque5' },
  { path: '/bloque6', label: 'Bloque 6', color: 'bg-bloque6' },
]

export default function Layout() {
  const location = useLocation()
  const currentIndex = bloques.findIndex(b => b.path === location.pathname)
  const prev = currentIndex > 0 ? bloques[currentIndex - 1] : null
  const next = currentIndex < bloques.length - 1 ? bloques[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg hover:text-primary-dark transition-colors">
            <Home size={20} />
            <span className="hidden sm:inline">Repaso Matemáticas</span>
          </Link>
          <div className="flex-1 flex items-center gap-1 justify-center overflow-x-auto">
            {bloques.map((b) => (
              <Link
                key={b.path}
                to={b.path}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  location.pathname === b.path
                    ? `${b.color} text-white shadow-md scale-105`
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {b.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {currentIndex >= 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-12 flex justify-between">
          {prev ? (
            <Link to={prev.path} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-primary hover:shadow-md transition-all text-gray-700 hover:text-primary">
              <ChevronLeft size={18} />
              {prev.label}
            </Link>
          ) : <div />}
          {next ? (
            <Link to={next.path} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-primary hover:shadow-md transition-all text-gray-700 hover:text-primary">
              {next.label}
              <ChevronRight size={18} />
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all">
              <Home size={18} />
              Volver al inicio
            </Link>
          )}
        </div>
      )}

      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-200">
        Guía de Estudio Remedial — 10mo Matemáticas
      </footer>
    </div>
  )
}
