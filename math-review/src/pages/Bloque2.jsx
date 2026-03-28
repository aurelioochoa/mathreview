import { useState } from 'react'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import Math from '../components/Math'

function MCDSection() {
  const [a, setA] = useState(36)
  const [b, setB] = useState(24)

  const gcd = (x, y) => {
    x = window.Math.abs(x); y = window.Math.abs(y)
    while (y) { [x, y] = [y, x % y] }
    return x
  }

  const mcdVal = gcd(a, b)

  const factorizar = (n) => {
    n = window.Math.abs(n)
    if (n <= 1) return [[n, 1]]
    const factors = []
    let d = 2
    while (d * d <= n) {
      let count = 0
      while (n % d === 0) { count++; n /= d }
      if (count > 0) factors.push([d, count])
      d++
    }
    if (n > 1) factors.push([n, 1])
    return factors
  }

  return (
    <TopicCard title="Máximo Común Divisor (MCD)" icon="🔗" color="bg-bloque2">
      <p>
        El <strong>MCD</strong> es el número más grande que divide exactamente a dos o más números.
        Piénsalo así: si tú y tu amigo tienen chocolates y quieren repartirlos en grupos iguales
        lo más grandes posible, el MCD te dice cuántos poner en cada grupo.
      </p>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <p className="font-semibold text-emerald-800 mb-2">Para polinomios, el proceso es similar:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Factoriza cada polinomio completamente</li>
          <li>Toma los factores <strong>comunes</strong> con el <strong>menor exponente</strong></li>
        </ol>
        <div className="mt-3 bg-white rounded p-3 text-sm">
          <p className="font-medium">Ejemplo con monomios:</p>
          <Math expr={"\\text{MCD}(18x^2yz,\\ 36xy^2z^3,\\ 54x^2y^3z)"} display />
          <p className="mt-1">Coeficientes: MCD(18, 36, 54) = 18</p>
          <p>Variables: <Math expr={"x^1 \\cdot y^1 \\cdot z^1"} /> (menor exponente de cada una)</p>
          <p className="font-bold text-emerald-700 mt-1"><Math expr={"\\text{MCD} = 18xyz"} /></p>
        </div>
      </div>

      <InteractiveBox title="Calculadora de MCD (números)">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium mb-1">Número A</label>
            <input type="number" value={a} onChange={e => setA(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Número B</label>
            <input type="number" value={b} onChange={e => setB(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
          </div>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg">
          <p className="text-sm"><strong>Factorización de {window.Math.abs(a)}:</strong> {factorizar(a).map(([f, e]) => `${f}${e > 1 ? `^${e}` : ''}`).join(' × ') || '—'}</p>
          <p className="text-sm"><strong>Factorización de {window.Math.abs(b)}:</strong> {factorizar(b).map(([f, e]) => `${f}${e > 1 ? `^${e}` : ''}`).join(' × ') || '—'}</p>
          <p className="text-lg font-bold text-emerald-700 mt-2">MCD({a}, {b}) = {mcdVal}</p>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function MCMSection() {
  const [a, setA] = useState(12)
  const [b, setB] = useState(18)

  const gcd = (x, y) => {
    x = window.Math.abs(x); y = window.Math.abs(y)
    while (y) { [x, y] = [y, x % y] }
    return x
  }

  const mcmVal = a && b ? window.Math.abs(a * b) / gcd(a, b) : 0

  return (
    <TopicCard title="Mínimo Común Múltiplo (MCM)" icon="🔄" color="bg-bloque2">
      <p>
        El <strong>MCM</strong> es el número más pequeño que es múltiplo de dos o más números a la vez.
        Imagina que un bus pasa cada 12 minutos y otro cada 18 minutos. Los dos coinciden cada
        <strong> MCM(12,18) = 36 minutos</strong>.
      </p>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <p className="font-semibold text-emerald-800 mb-2">Para polinomios:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Factoriza cada polinomio completamente</li>
          <li>Toma <strong>todos</strong> los factores con el <strong>mayor exponente</strong></li>
        </ol>
        <div className="mt-2 text-sm text-emerald-600">
          💡 Truco: MCD usa el menor exponente, MCM usa el mayor. ¡Son opuestos!
        </div>
      </div>

      <InteractiveBox title="Calculadora de MCM">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium mb-1">Número A</label>
            <input type="number" value={a} onChange={e => setA(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Número B</label>
            <input type="number" value={b} onChange={e => setB(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-28 font-mono text-center focus:ring-2 focus:ring-emerald-400 outline-none" />
          </div>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-600">Fórmula rápida: <Math expr={`\\text{MCM}(a,b) = \\frac{|a \\times b|}{\\text{MCD}(a,b)}`} /></p>
          <p className="text-sm mt-1"><Math expr={`\\frac{|${a} \\times ${b}|}{${gcd(a,b)}} = \\frac{${window.Math.abs(a*b)}}{${gcd(a,b)}}`} /></p>
          <p className="text-lg font-bold text-emerald-700 mt-2">MCM({a}, {b}) = {mcmVal}</p>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function FraccionesAlgebraicasSection() {
  return (
    <TopicCard title="Fracciones Algebraicas" icon="➗" color="bg-bloque2">
      <p>
        Una <strong>fracción algebraica</strong> es igual que una fracción normal, pero con letras (variables)
        en vez de solo números. Es como una fracción con "ingredientes secretos".
      </p>

      <div className="text-center my-4">
        <Math expr={"\\frac{x^2 - 4}{x^2 - 4x + 4} = \\frac{(x-2)(x+2)}{(x-2)^2} = \\frac{x+2}{x-2}"} display />
      </div>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <p className="font-semibold text-emerald-800 mb-2">Para simplificar fracciones algebraicas:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li><strong>Factoriza</strong> el numerador y el denominador</li>
          <li><strong>Cancela</strong> los factores comunes (los que aparecen arriba y abajo)</li>
          <li><strong>Escribe</strong> lo que queda</li>
        </ol>
        <p className="mt-2 text-xs text-emerald-600">⚠️ Solo puedes cancelar factores (multiplicaciones), ¡NUNCA sumas o restas!</p>
      </div>

      <div className="mt-4 bg-white rounded-lg p-4 border">
        <p className="font-semibold mb-2">Factorizaciones que más vas a usar:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Factor común</p>
            <Math expr={"ax + ay = a(x + y)"} />
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Diferencia de cuadrados</p>
            <Math expr={"a^2 - b^2 = (a+b)(a-b)"} />
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Trinomio cuadrado perfecto</p>
            <Math expr={"a^2 + 2ab + b^2 = (a+b)^2"} />
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Trinomio de la forma x² + bx + c</p>
            <Math expr={"x^2 + bx + c = (x+p)(x+q)"} />
          </div>
        </div>
      </div>
    </TopicCard>
  )
}

function OperacionesSection() {
  const [step, setStep] = useState(0)

  const pasos = [
    { titulo: 'Problema', contenido: '\\frac{2}{x+1} + \\frac{3}{x-1}' },
    { titulo: 'Paso 1: Encontrar MCM de denominadores', contenido: '\\text{MCM} = (x+1)(x-1)' },
    { titulo: 'Paso 2: Multiplicar cada fracción', contenido: '\\frac{2(x-1)}{(x+1)(x-1)} + \\frac{3(x+1)}{(x+1)(x-1)}' },
    { titulo: 'Paso 3: Expandir numeradores', contenido: '\\frac{2x - 2 + 3x + 3}{(x+1)(x-1)}' },
    { titulo: 'Paso 4: Simplificar', contenido: '\\frac{5x + 1}{x^2 - 1}' },
  ]

  return (
    <TopicCard title="Operaciones con Fracciones Algebraicas" icon="🧮" color="bg-bloque2">
      <p>
        Las operaciones con fracciones algebraicas funcionan <strong>igual que con fracciones numéricas</strong>:
      </p>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 space-y-2">
        <div className="bg-white rounded p-2 text-sm">
          <strong>Suma/Resta:</strong> Necesitas denominador común (MCM), luego sumas/restas los numeradores
        </div>
        <div className="bg-white rounded p-2 text-sm">
          <strong>Multiplicación:</strong> <Math expr={"\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}"} /> (numerador × numerador, denominador × denominador)
        </div>
        <div className="bg-white rounded p-2 text-sm">
          <strong>División:</strong> <Math expr={"\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}"} /> (multiplicas por el inverso, "flip" la segunda)
        </div>
      </div>

      <InteractiveBox title="Ejemplo paso a paso — Suma de fracciones">
        <div className="text-center mb-4">
          <div className="text-lg">
            <Math expr={pasos[step].contenido} display />
          </div>
          <p className="text-sm font-semibold text-indigo-600 mt-2">{pasos[step].titulo}</p>
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setStep(s => window.Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold disabled:opacity-30 hover:bg-emerald-200 transition cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-500">{step + 1} / {pasos.length}</span>
          <button
            onClick={() => setStep(s => window.Math.min(pasos.length - 1, s + 1))}
            disabled={step === pasos.length - 1}
            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold disabled:opacity-30 hover:bg-emerald-200 transition cursor-pointer"
          >
            Siguiente →
          </button>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

export default function Bloque2() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-2">Bloque 2</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Polinomios y Fracciones Algebraicas</h1>
        <p className="text-gray-500 mt-2">MCD, MCM, fracciones algebraicas y operaciones</p>
      </div>

      <MCDSection />
      <MCMSection />
      <FraccionesAlgebraicasSection />
      <OperacionesSection />
    </div>
  )
}
