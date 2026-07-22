import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function EstadisticaCalculadora() {
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
      mediana = sorted[Math.floor(n / 2)]
    }

    const freq = {}
    sorted.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
    const maxFreq = Math.max(...Object.values(freq))
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
    <div>
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

          <div className="mt-3 glass rounded-md p-3 text-sm">
            <p><strong>Datos ordenados:</strong> {stats.sorted.join(', ')}</p>
            <p><strong>n =</strong> {stats.n} datos</p>
          </div>
        </>
      )}
    </div>
  )
}
