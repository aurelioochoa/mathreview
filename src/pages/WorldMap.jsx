import WorldMap2D from '../components/WorldMap2D'

export default function WorldMap() {
  return (
    <div>
      <header className="text-center mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-800">
          🗺️ Mapa de Mundos
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-2">
          Explora cada mundo, gana XP y estrellas. Elige por dónde empezar tu aventura matemática.
        </p>
      </header>

      <WorldMap2D />

      <div className="mt-12 text-center glass rounded-[1.75rem] p-6 max-w-2xl mx-auto">
        <h2 className="font-display text-xl font-bold text-gray-700 mb-1">💡 Consejo</h2>
        <p className="text-gray-500 text-sm">
          Estudia un mundo a la vez y juega con los ejemplos interactivos.
          ¡Las matemáticas se aprenden practicando!
        </p>
      </div>
    </div>
  )
}
