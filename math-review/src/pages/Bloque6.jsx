import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import Math from '../components/Math'

function MediaMedianaModa() {
  const [input, setInput] = useState('12, 15, 18, 15, 20, 22, 15, 25, 18, 30')

  const datos = useMemo(() => {
    return input.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
  }, [input])

  const stats = useMemo(() => {
    if (datos.length === 0) return null
    const sorted = [...datos].sort((a, b) => a - b)
    const n = sorted.length

    const media = sorted.reduce((a, b) => a + b, 0) / n

    let mediana
    if (n % 2 === 0) {
      mediana = (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    } else {
      mediana = sorted[window.Math.floor(n / 2)]
    }

    const freq = {}
    sorted.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
    const maxFreq = window.Math.max(...Object.values(freq))
    const modas = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v))

    return { media, mediana, modas, sorted, n, freq }
  }, [datos])

  const chartData = useMemo(() => {
    if (!stats) return []
    const freq = {}
    datos.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
    return Object.entries(freq)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([val, count]) => ({ valor: Number(val), frecuencia: count }))
  }, [datos, stats])

  return (
    <TopicCard title="Media, Mediana y Moda" icon="📊" color="bg-bloque6">
      <p>
        Las <strong>medidas de tendencia central</strong> te dicen dónde está el "centro" de un grupo de datos.
        Es como buscar el jugador "promedio" de un equipo de fútbol.
      </p>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-lg font-bold text-pink-600">Media</p>
            <p>El <strong>promedio</strong>: suma todos los valores y divide entre cuántos son.</p>
            <Math expr={"\\bar{x} = \\frac{\\sum x_i}{n}"} />
            <p className="text-xs text-gray-500 mt-1">Como repartir todo en partes iguales</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-lg font-bold text-purple-600">Mediana</p>
            <p>El valor del <strong>medio</strong> cuando ordenas los datos.</p>
            <p className="text-xs text-gray-500 mt-1">Si hay cantidad par, es el promedio de los dos del centro</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-lg font-bold text-orange-600">Moda</p>
            <p>El valor que <strong>más se repite</strong>.</p>
            <p className="text-xs text-gray-500 mt-1">Como la canción más escuchada del playlist</p>
          </div>
        </div>
      </div>

      <InteractiveBox title="Calculadora interactiva">
        <label className="block text-sm font-medium mb-2">Escribe tus datos separados por comas:</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full font-mono focus:ring-2 focus:ring-pink-400 outline-none"
        />

        {stats && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-pink-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-pink-600">MEDIA</p>
                <p className="text-2xl font-bold font-mono">{stats.media.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-600">MEDIANA</p>
                <p className="text-2xl font-bold font-mono">{stats.mediana.toFixed(2)}</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-orange-600">MODA</p>
                <p className="text-2xl font-bold font-mono">{stats.modas.join(', ')}</p>
              </div>
            </div>

            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="valor" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="frecuencia" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={stats.modas.includes(entry.valor) ? '#ec4899' : '#c4b5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center">Las barras rosas son la(s) moda(s)</p>

            <div className="mt-3 bg-white rounded p-3 text-sm">
              <p><strong>Datos ordenados:</strong> {stats.sorted.join(', ')}</p>
              <p><strong>n =</strong> {stats.n} datos</p>
            </div>
          </>
        )}
      </InteractiveBox>
    </TopicCard>
  )
}

function PercentilesSection() {
  const [input] = useState('4, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10')

  const datos = useMemo(() => {
    return input.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b)
  }, [input])

  const percentil = (p) => {
    const i = (p / 100) * (datos.length - 1)
    const lo = window.Math.floor(i)
    const hi = window.Math.ceil(i)
    if (lo === hi) return datos[lo]
    return datos[lo] + (datos[hi] - datos[lo]) * (i - lo)
  }

  const q1 = percentil(25)
  const q2 = percentil(50)
  const q3 = percentil(75)
  const min = datos[0]
  const max = datos[datos.length - 1]

  return (
    <TopicCard title="Percentiles, Deciles y Cuartiles" icon="📉" color="bg-bloque6">
      <p>
        Los <strong>cuartiles</strong> dividen tus datos en <strong>4 partes iguales</strong>.
        Los <strong>deciles</strong> en 10 partes y los <strong>percentiles</strong> en 100 partes.
        Es como cuando en un examen te dicen "estás en el percentil 80": quiere decir que le ganaste al 80% de los estudiantes.
      </p>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <p className="font-semibold text-pink-800 mb-2">Relación entre ellos:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="bg-white rounded p-2 text-center">
            <strong>Cuartil 1 (Q1)</strong><br />= Percentil 25<br />= Decil 2.5
          </div>
          <div className="bg-white rounded p-2 text-center">
            <strong>Cuartil 2 (Q2)</strong><br />= Mediana<br />= Percentil 50
          </div>
          <div className="bg-white rounded p-2 text-center">
            <strong>Cuartil 3 (Q3)</strong><br />= Percentil 75<br />= Decil 7.5
          </div>
        </div>
      </div>

      <InteractiveBox title="Diagrama de caja (Box Plot)">
        <p className="text-sm mb-3">Datos: {datos.join(', ')}</p>

        <div className="relative h-24 mx-4 mb-6">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />

          {(() => {
            const range = max - min || 1
            const pos = (v) => `${((v - min) / range) * 100}%`
            return (
              <>
                <div className="absolute top-1/4 h-1/2 bg-pink-200 border-2 border-pink-500 rounded"
                  style={{ left: pos(q1), width: `${((q3 - q1) / range) * 100}%` }} />

                <div className="absolute top-1/4 h-1/2 w-0.5 bg-pink-700"
                  style={{ left: pos(q2) }} />

                <div className="absolute top-[45%] h-[10%] w-8 border-t-2 border-pink-500"
                  style={{ left: `calc(${pos(min)} - 16px)` }} />
                <div className="absolute top-1/2 h-0.5 bg-pink-400"
                  style={{ left: pos(min), width: `${((q1 - min) / range) * 100}%` }} />

                <div className="absolute top-[45%] h-[10%] w-8 border-t-2 border-pink-500"
                  style={{ left: `calc(${pos(max)} - 16px)` }} />
                <div className="absolute top-1/2 h-0.5 bg-pink-400"
                  style={{ left: pos(q3), width: `${((max - q3) / range) * 100}%` }} />

                {[
                  { v: min, label: `Min=${min}` },
                  { v: q1, label: `Q1=${q1}` },
                  { v: q2, label: `Q2=${q2}` },
                  { v: q3, label: `Q3=${q3}` },
                  { v: max, label: `Max=${max}` },
                ].map(({ v, label }) => (
                  <div key={label} className="absolute text-xs text-pink-700 font-semibold -translate-x-1/2"
                    style={{ left: pos(v), top: '85%' }}>
                    {label}
                  </div>
                ))}
              </>
            )
          })()}
        </div>

        <div className="bg-white rounded p-3 text-sm mt-4">
          <p><strong>Interpretación del Q1 = {q1}:</strong></p>
          <ul className="list-disc pl-5 text-xs space-y-1 text-gray-600 mt-1">
            <li>El 25% de los datos son ≤ {q1}</li>
            <li>El percentil 25 es {q1}</li>
            <li>Un cuarto de los datos está por debajo de {q1}</li>
          </ul>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function PermutacionesSection() {
  const [n, setN] = useState(12)
  const [r, setR] = useState(4)

  const factorial = (num) => {
    if (num <= 1) return 1
    let result = 1
    for (let i = 2; i <= num; i++) result *= i
    return result
  }

  const perm = n >= r && r >= 0 ? factorial(n) / factorial(n - r) : 0

  return (
    <TopicCard title="Permutaciones" icon="🔢" color="bg-bloque6">
      <p>
        Una <strong>permutación</strong> es cuando el <strong>orden SÍ importa</strong>.
        Piensa en los puestos de una carrera: no es lo mismo quedar 1°-2°-3° que 3°-2°-1°.
        ¡Son resultados diferentes!
      </p>

      <div className="text-center my-4">
        <Math expr={"P(n, r) = \\frac{n!}{(n-r)!}"} display />
      </div>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <p className="text-sm">
          <strong>n</strong> = total de elementos disponibles<br />
          <strong>r</strong> = cuántos vas a elegir/ordenar<br />
          <strong>n!</strong> (factorial) = n × (n-1) × (n-2) × ... × 1
        </p>
        <p className="text-xs text-pink-600 mt-2">
          Ejemplo: ¿De cuántas formas puedes acomodar 3 libros de un estante de 5?
          P(5,3) = 5!/(5-3)! = 120/2 = 60 formas
        </p>
      </div>

      <InteractiveBox title="Calculadora de permutaciones">
        <div className="flex gap-4 items-end flex-wrap mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">n (total)</label>
            <input type="number" value={n} onChange={e => setN(window.Math.max(0, Number(e.target.value)))}
              className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-pink-400 outline-none" min={0} max={20} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">r (elegir)</label>
            <input type="number" value={r} onChange={e => setR(window.Math.max(0, Number(e.target.value)))}
              className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-pink-400 outline-none" min={0} max={20} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <Math expr={`P(${n}, ${r}) = \\frac{${n}!}{(${n}-${r})!} = \\frac{${n}!}{${n - r}!}`} />
          <p className="text-2xl font-bold text-pink-600 mt-2 font-mono">{perm.toLocaleString()}</p>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function CombinacionesSection() {
  const [n, setN] = useState(12)
  const [r, setR] = useState(4)

  const factorial = (num) => {
    if (num <= 1) return 1
    let result = 1
    for (let i = 2; i <= num; i++) result *= i
    return result
  }

  const comb = n >= r && r >= 0 ? factorial(n) / (factorial(r) * factorial(n - r)) : 0

  return (
    <TopicCard title="Combinaciones" icon="🎲" color="bg-bloque6">
      <p>
        Una <strong>combinación</strong> es cuando el <strong>orden NO importa</strong>.
        Si eliges 3 amigos para tu equipo, no importa en qué orden los elegiste — el equipo es el mismo.
      </p>

      <div className="text-center my-4">
        <Math expr={"C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}"} display />
      </div>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <p className="font-semibold text-pink-800 mb-2">¿Cuándo uso cada una?</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded p-3 border-l-4 border-purple-400">
            <p className="font-bold">Permutación</p>
            <p>Orden <strong>SÍ</strong> importa</p>
            <p className="text-xs text-gray-500 mt-1">Contraseñas, podio, PIN</p>
          </div>
          <div className="bg-white rounded p-3 border-l-4 border-pink-400">
            <p className="font-bold">Combinación</p>
            <p>Orden <strong>NO</strong> importa</p>
            <p className="text-xs text-gray-500 mt-1">Equipos, canciones, lotería</p>
          </div>
        </div>
      </div>

      <InteractiveBox title="Calculadora de combinaciones">
        <div className="flex gap-4 items-end flex-wrap mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">n (total)</label>
            <input type="number" value={n} onChange={e => setN(window.Math.max(0, Number(e.target.value)))}
              className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-pink-400 outline-none" min={0} max={20} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">r (elegir)</label>
            <input type="number" value={r} onChange={e => setR(window.Math.max(0, Number(e.target.value)))}
              className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-pink-400 outline-none" min={0} max={20} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <Math expr={`C(${n}, ${r}) = \\frac{${n}!}{${r}! \\cdot ${n - r}!}`} />
          <p className="text-2xl font-bold text-pink-600 mt-2 font-mono">{comb.toLocaleString()}</p>
        </div>

        <div className="mt-4 bg-white rounded p-3 text-sm">
          <p className="font-semibold">Ejemplo del examen:</p>
          <p className="text-gray-700 mt-1">
            Una banda tiene <strong>12 canciones</strong> y debe elegir <strong>4</strong> para su álbum. ¿De cuántas formas?
          </p>
          <div className="mt-2 bg-pink-50 rounded p-2">
            <Math expr={`C(12, 4) = \\frac{12!}{4! \\cdot 8!} = \\frac{12 \\times 11 \\times 10 \\times 9}{4 \\times 3 \\times 2 \\times 1} = 495`} />
            <p className="font-bold text-pink-700 mt-1">495 formas diferentes</p>
          </div>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function PrincipioConteoSection() {
  const camisas = ['🔴', '🔵', '🟢']
  const pantalones = ['👖', '👖', '👖', '👖']
  const zapatos = ['👟', '👞']

  const total = camisas.length * pantalones.length * zapatos.length

  return (
    <TopicCard title="Principio de Conteo" icon="👕" color="bg-bloque6">
      <p>
        El <strong>principio fundamental de conteo</strong> dice que si tienes que tomar varias decisiones
        seguidas, el total de posibilidades es <strong>multiplicar</strong> las opciones de cada decisión.
      </p>

      <div className="text-center my-4">
        <Math expr={"\\text{Total} = n_1 \\times n_2 \\times n_3 \\times \\ldots"} display />
      </div>

      <InteractiveBox title="Ejemplo: ¿Cuántos atuendos puedes formar?">
        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="font-bold mb-2">Camisas</p>
            <p className="text-3xl">{camisas.join(' ')}</p>
            <p className="text-pink-600 font-bold mt-1">{camisas.length} opciones</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="font-bold mb-2">Pantalones</p>
            <p className="text-3xl">👖×4</p>
            <p className="text-pink-600 font-bold mt-1">{pantalones.length} opciones</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="font-bold mb-2">Zapatos</p>
            <p className="text-3xl">{zapatos.join(' ')}</p>
            <p className="text-pink-600 font-bold mt-1">{zapatos.length} opciones</p>
          </div>
        </div>

        <div className="text-center bg-white rounded-lg p-4">
          <Math expr={`${camisas.length} \\times ${pantalones.length} \\times ${zapatos.length} = ${total}`} />
          <p className="text-xl font-bold text-pink-600 mt-2">¡{total} atuendos diferentes!</p>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

export default function Bloque6() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-2">Bloque 6</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Estadística y Probabilidad</h1>
        <p className="text-gray-500 mt-2">Media, mediana, moda, percentiles, permutaciones y combinaciones</p>
      </div>

      <MediaMedianaModa />
      <PercentilesSection />
      <PrincipioConteoSection />
      <PermutacionesSection />
      <CombinacionesSection />
    </div>
  )
}
