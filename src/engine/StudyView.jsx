import { Link, useParams } from 'react-router-dom'
import Bloque1 from '../pages/Bloque1'
import Bloque2 from '../pages/Bloque2'
import Bloque3 from '../pages/Bloque3'
import Bloque4 from '../pages/Bloque4'
import Bloque5 from '../pages/Bloque5'
import Bloque6 from '../pages/Bloque6'

const PAGES = {
  'volcan-potencias': Bloque1,
  'castillo-algebra': Bloque2,
  'laberinto-sistemas': Bloque3,
  'estacion-funciones': Bloque4,
  'montanas-geometria': Bloque5,
  'feria-datos': Bloque6,
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
      <Page />
    </div>
  )
}
