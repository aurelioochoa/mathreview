import { Link } from 'react-router-dom'
import { Calculator, Divide, GitBranch, TrendingUp, Triangle, BarChart3 } from 'lucide-react'

const bloques = [
  {
    path: '/bloque1',
    label: 'Bloque 1',
    title: 'Números Reales y Notación Científica',
    desc: 'Aproximación, error, potencias, notación científica y radicales',
    color: 'from-amber-400 to-orange-500',
    border: 'border-amber-300',
    icon: <Calculator size={32} />,
  },
  {
    path: '/bloque2',
    label: 'Bloque 2',
    title: 'Polinomios y Fracciones Algebraicas',
    desc: 'MCD, MCM, fracciones algebraicas y operaciones',
    color: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-300',
    icon: <Divide size={32} />,
  },
  {
    path: '/bloque3',
    label: 'Bloque 3',
    title: 'Sistemas de Ecuaciones 2×2',
    desc: 'Método gráfico, reducción y determinantes (Cramer)',
    color: 'from-blue-400 to-indigo-500',
    border: 'border-blue-300',
    icon: <GitBranch size={32} />,
  },
  {
    path: '/bloque4',
    label: 'Bloque 4',
    title: 'Funciones Lineales y Cuadráticas',
    desc: 'Rectas, parábolas, dominio, recorrido y problemas',
    color: 'from-violet-400 to-purple-500',
    border: 'border-violet-300',
    icon: <TrendingUp size={32} />,
  },
  {
    path: '/bloque5',
    label: 'Bloque 5',
    title: 'Geometría y Trigonometría',
    desc: 'Pitágoras, seno, coseno, tangente, cilindro y prisma',
    color: 'from-red-400 to-rose-500',
    border: 'border-red-300',
    icon: <Triangle size={32} />,
  },
  {
    path: '/bloque6',
    label: 'Bloque 6',
    title: 'Estadística y Probabilidad',
    desc: 'Media, mediana, moda, percentiles, permutaciones y combinaciones',
    color: 'from-pink-400 to-fuchsia-500',
    border: 'border-pink-300',
    icon: <BarChart3 size={32} />,
  },
]

export default function Home() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold mb-4">
          🎮 Matemáticas sin estrés
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          📐 Repaso de Matemáticas
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-4">
          Guía de estudio interactiva para el examen remedial de 10mo.
          Diseñada especialmente para que entiendas cada tema paso a paso.
        </p>
        <p className="text-sm text-indigo-600 font-medium max-w-xl mx-auto">
          💡 Tip: No necesitas ser experto. Cada bloque tiene explicaciones simples, 
          ejemplos de videojuegos y mini-quizzes para practicar sin presión.
        </p>
      </div>

      <Link to="/mundo/volcan-potencias"
        className="block max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
        <p className="text-lg font-extrabold">🌋 NUEVO: Modo Juego (beta)</p>
        <p className="text-sm opacity-90">Gana XP, estrellas y vidas en el Volcán de las Potencias</p>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bloques.map((b) => (
          <Link
            key={b.path}
            to={b.path}
            className={`group relative rounded-2xl overflow-hidden border-2 ${b.border} bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className={`bg-gradient-to-br ${b.color} px-6 py-5 text-white`}>
              <div className="flex items-center gap-3">
                {b.icon}
                <div>
                  <span className="text-sm font-medium opacity-80">{b.label}</span>
                  <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 text-sm">{b.desc}</p>
              <span className="inline-block mt-3 text-sm font-semibold text-primary group-hover:underline">
                Estudiar →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-white rounded-2xl shadow border border-gray-100">
        <h2 className="text-xl font-bold text-gray-700 mb-2">💡 Consejo de estudio</h2>
        <p className="text-gray-500">
          Estudia un bloque a la vez. Juega con los ejemplos interactivos para entender mejor cada concepto.
          ¡Las matemáticas se aprenden practicando!
        </p>
      </div>
    </div>
  )
}
