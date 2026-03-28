import { useState } from 'react'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import Math from '../components/Math'

function AproximacionSection() {
  const [numero, setNumero] = useState('3.14159265')
  const num = parseFloat(numero) || 0

  const truncar = (n, dec) => {
    const factor = window.Math.pow(10, dec)
    return (n >= 0 ? 1 : -1) * (window.Math.floor(window.Math.abs(n) * factor) / factor)
  }
  const redondear = (n, dec) => {
    const factor = window.Math.pow(10, dec)
    return window.Math.round(n * factor) / factor
  }

  return (
    <TopicCard title="Aproximación y Error" icon="🎯" color="bg-bloque1">
      <p>
        <strong>¿Qué es aproximar?</strong> Imagina que compras algo que cuesta <strong>$6.99</strong>.
        Seguro le dices a tus amigos "me costó como $7". Eso es una <em>aproximación</em>: usar un número
        más simple que está cerca del real.
      </p>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Hay dos formas principales de aproximar:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Truncar</strong>: simplemente "cortas" los decimales que no quieres. Como cortar un video: lo que sobra, se va.</li>
          <li><strong>Redondear</strong>: miras el siguiente dígito. Si es 5 o más, subes; si es menor que 5, dejas igual.</li>
        </ul>
      </div>

      <div className="mt-3">
        <p><strong>Error absoluto</strong> = <Math expr={"|\\text{valor real} - \\text{valor aproximado}|"} /></p>
        <p><strong>Error relativo</strong> = <Math expr={"\\frac{\\text{error absoluto}}{|\\text{valor real}|}"} /></p>
        <p className="text-sm text-gray-500 mt-1">El error relativo te dice <em>qué tan grave</em> fue la aproximación. Un error de $1 no es lo mismo comprando chicles ($1 de $2 = 50%) que comprando una consola ($1 de $500 = 0.2%).</p>
      </div>

      <InteractiveBox title="Prueba la aproximación">
        <label className="block text-sm font-medium mb-2">Escribe un número decimal:</label>
        <input
          type="text"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-lg font-mono focus:ring-2 focus:ring-amber-400 outline-none"
        />
        {!isNaN(num) && num !== 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  <th className="px-3 py-2 text-left">Decimales</th>
                  <th className="px-3 py-2 text-left">Truncado</th>
                  <th className="px-3 py-2 text-left">Redondeado</th>
                  <th className="px-3 py-2 text-left">Error (truncar)</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map(d => {
                  const t = truncar(num, d)
                  const r = redondear(num, d)
                  const err = window.Math.abs(num - t)
                  return (
                    <tr key={d} className="border-t border-amber-100">
                      <td className="px-3 py-2 font-mono">{d}</td>
                      <td className="px-3 py-2 font-mono">{t.toFixed(d)}</td>
                      <td className="px-3 py-2 font-mono">{r.toFixed(d)}</td>
                      <td className="px-3 py-2 font-mono text-red-600">{err.toFixed(d + 2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </InteractiveBox>
    </TopicCard>
  )
}

function PotenciacionSection() {
  const [base, setBase] = useState(2)
  const [exp, setExp] = useState(3)

  const resultado = window.Math.pow(base, exp)

  return (
    <TopicCard title="Potenciación de Números Reales" icon="⚡" color="bg-bloque1">
      <p>
        <strong>Una potencia es una multiplicación repetida.</strong> Es como cuando en un videojuego
        tu daño se multiplica: si tu ataque base es 3 y se multiplica 4 veces:
        <Math expr={"3^4 = 3 \\times 3 \\times 3 \\times 3 = 81"} display />
      </p>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Leyes de exponentes que DEBES saber:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-2"><Math expr={"a^m \\cdot a^n = a^{m+n}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"\\frac{a^m}{a^n} = a^{m-n}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"(a^m)^n = a^{m \\cdot n}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"a^0 = 1 \\text{ (siempre!)}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"a^{-n} = \\frac{1}{a^n}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"(a \\cdot b)^n = a^n \\cdot b^n"} /></div>
        </div>
      </div>

      <InteractiveBox title="Calculadora de potencias">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium mb-1">Base</label>
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Exponente</label>
            <input
              type="number"
              value={exp}
              onChange={(e) => setExp(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
              min={-10}
              max={20}
            />
          </div>
          <div className="text-2xl font-bold text-amber-700">=</div>
          <div className="text-2xl font-mono font-bold text-amber-900">
            {isFinite(resultado) ? (Number.isInteger(resultado) ? resultado : resultado.toFixed(6)) : '∞'}
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          <Math expr={`${base}^{${exp}} = ${isFinite(resultado) ? (Number.isInteger(resultado) ? resultado : resultado.toFixed(6)) : '\\infty'}`} />
          {exp < 0 && <span className="ml-2">(Exponente negativo = fracción: <Math expr={`\\frac{1}{${base}^{${-exp}}}`} />)</span>}
        </p>
      </InteractiveBox>
    </TopicCard>
  )
}

function NotacionCientificaSection() {
  const [decimal, setDecimal] = useState('139000000')

  const convertir = (str) => {
    const n = parseFloat(str)
    if (isNaN(n) || n === 0) return { mantisa: 0, exponente: 0 }
    const exponente = window.Math.floor(window.Math.log10(window.Math.abs(n)))
    const mantisa = n / window.Math.pow(10, exponente)
    return { mantisa: parseFloat(mantisa.toFixed(6)), exponente }
  }

  const { mantisa, exponente } = convertir(decimal)

  return (
    <TopicCard title="Notación Científica" icon="🔬" color="bg-bloque1">
      <p>
        Imagina que quieres escribir la distancia de la Tierra al Sol: <strong>149,600,000,000 metros</strong>.
        ¡Son un montón de ceros! La notación científica es un "atajo" para escribir números muy grandes o muy pequeños.
      </p>

      <div className="text-center my-4 text-xl">
        <Math expr={"\\text{Número} = a \\times 10^n \\quad \\text{donde } 1 \\leq |a| < 10"} display />
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Ejemplos de la vida real:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Diámetro de Júpiter: <Math expr={"1.39 \\times 10^8"} /> m = 139,000,000 m</li>
          <li>Crecimiento del cabello: <Math expr={"1.1 \\times 10^{-8}"} /> m/s = 0.000000011 m/s</li>
          <li>Velocidad de la luz: <Math expr={"3 \\times 10^8"} /> m/s = 300,000,000 m/s</li>
        </ul>
        <p className="text-xs text-amber-600 mt-2">
          💡 Exponente positivo = número grande | Exponente negativo = número pequeñito
        </p>
      </div>

      <InteractiveBox title="Convertidor de notación científica">
        <label className="block text-sm font-medium mb-2">Escribe un número en decimal:</label>
        <input
          type="text"
          value={decimal}
          onChange={(e) => setDecimal(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-sm font-mono text-lg focus:ring-2 focus:ring-amber-400 outline-none"
        />
        {parseFloat(decimal) !== 0 && !isNaN(parseFloat(decimal)) && (
          <div className="mt-4 p-4 bg-white rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">En notación científica:</p>
            <p className="text-2xl font-bold text-amber-700">
              <Math expr={`${mantisa} \\times 10^{${exponente}}`} />
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Se movió la coma {window.Math.abs(exponente)} {window.Math.abs(exponente) === 1 ? 'posición' : 'posiciones'} hacia la {exponente >= 0 ? 'izquierda' : 'derecha'}
            </p>
          </div>
        )}
      </InteractiveBox>
    </TopicCard>
  )
}

function RadicacionSection() {
  const [radicando, setRadicando] = useState(27)
  const [indice, setIndice] = useState(3)

  const resultado = window.Math.pow(radicando, 1 / indice)

  return (
    <TopicCard title="Radicación de Números Reales" icon="√" color="bg-bloque1">
      <p>
        La radicación es <strong>la operación inversa de la potenciación</strong>.
        Si potenciar es "¿cuánto da 3 elevado a 2?" (respuesta: 9),
        la raíz pregunta "¿qué número elevado a 2 da 9?" (respuesta: 3).
      </p>

      <div className="text-center my-4">
        <Math expr={"\\sqrt[n]{a} = b \\quad \\Leftrightarrow \\quad b^n = a"} display />
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Propiedades de radicales:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-2"><Math expr={"\\sqrt[n]{a \\cdot b} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"\\sqrt[n]{\\frac{a}{b}} = \\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"\\sqrt[n]{a^m} = a^{m/n}"} /></div>
          <div className="bg-white rounded p-2"><Math expr={"\\sqrt[m]{\\sqrt[n]{a}} = \\sqrt[m \\cdot n]{a}"} /></div>
        </div>
      </div>

      <InteractiveBox title="Calculadora de raíces">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium mb-1">Índice (n)</label>
            <input
              type="number"
              value={indice}
              onChange={(e) => setIndice(Number(e.target.value) || 2)}
              className="border rounded-lg px-3 py-2 w-20 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
              min={2}
              max={10}
            />
          </div>
          <div className="text-2xl">√</div>
          <div>
            <label className="block text-xs font-medium mb-1">Radicando (a)</label>
            <input
              type="number"
              value={radicando}
              onChange={(e) => setRadicando(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div className="text-2xl font-bold text-amber-700">=</div>
          <div className="text-2xl font-mono font-bold text-amber-900">
            {isNaN(resultado) ? 'No existe' : resultado.toFixed(4)}
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          <Math expr={`\\sqrt[${indice}]{${radicando}} = ${isNaN(resultado) ? '\\text{No existe en } \\mathbb{R}' : resultado.toFixed(4)}`} />
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Verificación: {resultado.toFixed(4)}^{indice} ≈ {window.Math.pow(resultado, indice).toFixed(2)}
        </p>
      </InteractiveBox>
    </TopicCard>
  )
}

export default function Bloque1() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-2">Bloque 1</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Números Reales y Notación Científica</h1>
        <p className="text-gray-500 mt-2">Aproximación, potencias, notación científica y radicales</p>
      </div>

      <AproximacionSection />
      <PotenciacionSection />
      <NotacionCientificaSection />
      <RadicacionSection />
    </div>
  )
}
