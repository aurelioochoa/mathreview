import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <p className="text-6xl mb-3">🧭</p>
      <h1 className="font-display text-2xl font-extrabold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-6">Esa ruta no existe en el mapa.</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-white font-bold inline-block">🗺️ Ir al mapa de mundos</Link>
    </div>
  )
}
