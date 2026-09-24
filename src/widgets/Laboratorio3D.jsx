import { lazy, Suspense, useState } from 'react'

// Envoltorio ligero de los laboratorios 3D: three.js va en su propio chunk y
// solo se descarga al abrir el paso del briefing que lo usa. Sin WebGL se
// avisa en vez de romper la página.
const Solido3D = lazy(() => import('./Solido3D'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Lab(props) {
  const [ok] = useState(hasWebGL)
  if (!ok) {
    return (
      <p className="text-sm text-gray-500 rounded-xl bg-gray-50 border p-4">
        Este laboratorio 3D necesita WebGL, y tu navegador no lo tiene activado. Las fórmulas del paso anterior siguen valiendo igual.
      </p>
    )
  }
  return (
    <Suspense fallback={<div className="h-72 grid place-items-center text-sm font-display font-bold text-indigo-400">Cargando laboratorio 3D…</div>}>
      <Solido3D {...props} />
    </Suspense>
  )
}

export function PrismaLab() {
  return <Lab kinds={['rect', 'tri', 'hex']} initial="rect" />
}

export function CilindroLab() {
  return <Lab kinds={['cyl']} initial="cyl" />
}
