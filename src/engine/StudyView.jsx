import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'

const PAGES = {
  'volcan-potencias': lazy(() => import('../pages/Bloque1')),
  'castillo-algebra': lazy(() => import('../pages/Bloque2')),
  'laberinto-sistemas': lazy(() => import('../pages/Bloque3')),
  'estacion-funciones': lazy(() => import('../pages/Bloque4')),
  'montanas-geometria': lazy(() => import('../pages/Bloque5')),
  'feria-datos': lazy(() => import('../pages/Bloque6')),
}

export default function StudyView() {
  const { slug } = useParams()
  const Page = PAGES[slug]
  if (!Page) return <p className="text-center py-12">Modo estudio no encontrado. <Link className="text-primary underline" to="/">Volver</Link></p>
  return (
    <div>
      <div className="max-w-3xl mx-auto mb-4">
        <Link to={`/mundo/${slug}`} className="text-primary font-semibold text-sm">← Volver al mundo (modo juego)</Link>
      </div>
      <Suspense fallback={<p role="status" className="text-center py-12 text-gray-500">Cargando estudio…</p>}>
        <Page />
      </Suspense>
    </div>
  )
}
