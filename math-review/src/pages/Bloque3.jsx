import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Line, Theme, Text as MafsText } from 'mafs'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import Math from '../components/Math'

function MetodoGrafico() {
  const [a1, setA1] = useState(1)
  const [b1, setB1] = useState(-1)
  const [c1, setC1] = useState(1)
  const [a2, setA2] = useState(1)
  const [b2, setB2] = useState(1)
  const [c2, setC2] = useState(3)

  const solucion = useMemo(() => {
    const det = a1 * b2 - a2 * b1
    if (window.Math.abs(det) < 1e-10) return null
    const x = (c1 * b2 - c2 * b1) / det
    const y = (a1 * c2 - a2 * c1) / det
    return { x, y }
  }, [a1, b1, c1, a2, b2, c2])

  const getY1 = (x) => b1 !== 0 ? (c1 - a1 * x) / b1 : null
  const getY2 = (x) => b2 !== 0 ? (c2 - a2 * x) / b2 : null

  return (
    <TopicCard title="Método Gráfico" icon="📊" color="bg-bloque3">
      <p>
        Un <strong>sistema de ecuaciones 2×2</strong> es como un acertijo con dos pistas y dos incógnitas.
        Cada ecuación es una <strong>recta</strong> en el plano. La solución es el <strong>punto donde se cruzan</strong>.
      </p>
      <p className="text-sm text-gray-500">
        Es como cuando en un mapa dos calles se cruzan: el punto exacto del cruce es la respuesta.
      </p>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-3">
        <p className="font-semibold text-blue-800 mb-2">Tres posibles resultados:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="bg-white rounded p-2 text-center">
            <p className="font-bold text-blue-600">Se cruzan en 1 punto</p>
            <p className="text-xs">→ Una solución única</p>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <p className="font-bold text-yellow-600">Son la misma recta</p>
            <p className="text-xs">→ Infinitas soluciones</p>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <p className="font-bold text-red-600">Son paralelas</p>
            <p className="text-xs">→ No hay solución</p>
          </div>
        </div>
      </div>

      <InteractiveBox title="Gráfica interactiva — Mueve los coeficientes">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <p className="text-sm font-bold text-blue-600">Ecuación 1: <Math expr={`${a1}x + (${b1})y = ${c1}`} /></p>
            <div className="flex gap-2">
              <label className="text-xs">a₁<input type="number" value={a1} onChange={e => setA1(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
              <label className="text-xs">b₁<input type="number" value={b1} onChange={e => setB1(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
              <label className="text-xs">c₁<input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-green-600">Ecuación 2: <Math expr={`${a2}x + (${b2})y = ${c2}`} /></p>
            <div className="flex gap-2">
              <label className="text-xs">a₂<input type="number" value={a2} onChange={e => setA2(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
              <label className="text-xs">b₂<input type="number" value={b2} onChange={e => setB2(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
              <label className="text-xs">c₂<input type="number" value={c2} onChange={e => setC2(Number(e.target.value))} className="ml-1 border rounded px-2 py-1 w-16 font-mono text-sm" /></label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden border">
          <Mafs viewBox={{ x: [-6, 6], y: [-6, 6] }} height={350}>
            <Coordinates.Cartesian />
            {b1 !== 0 && (
              <Line.ThroughPoints
                point1={[-5, getY1(-5)]}
                point2={[5, getY1(5)]}
                color={Theme.blue}
              />
            )}
            {b2 !== 0 && (
              <Line.ThroughPoints
                point1={[-5, getY2(-5)]}
                point2={[5, getY2(5)]}
                color={Theme.green}
              />
            )}
            {solucion && (
              <MafsText
                x={solucion.x}
                y={solucion.y + 0.6}
                attach="n"
                size={14}
              >
                ({solucion.x.toFixed(1)}, {solucion.y.toFixed(1)})
              </MafsText>
            )}
          </Mafs>
        </div>

        <div className="mt-3 text-center">
          {solucion ? (
            <p className="text-lg font-bold text-blue-700">
              Solución: <Math expr={`x = ${solucion.x.toFixed(2)},\\quad y = ${solucion.y.toFixed(2)}`} />
            </p>
          ) : (
            <p className="text-lg font-bold text-red-500">
              Las rectas son paralelas o coincidentes (determinante = 0)
            </p>
          )}
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function MetodoReduccion() {
  const [step, setStep] = useState(0)

  const pasos = [
    { titulo: 'Sistema original', expr: '\\begin{cases} 2x + 3y = 12 \\\\ 4x - 3y = 6 \\end{cases}' },
    { titulo: 'Paso 1: Buscar coeficientes opuestos', expr: '\\text{Los coeficientes de } y \\text{ son } +3 \\text{ y } -3 \\text{ → ¡ya son opuestos!}' },
    { titulo: 'Paso 2: Sumar las ecuaciones', expr: '(2x + 3y) + (4x - 3y) = 12 + 6 \\\\[6pt] 6x = 18' },
    { titulo: 'Paso 3: Despejar x', expr: 'x = \\frac{18}{6} = 3' },
    { titulo: 'Paso 4: Sustituir en una ecuación', expr: '2(3) + 3y = 12 \\\\[4pt] 6 + 3y = 12 \\\\[4pt] 3y = 6 \\\\[4pt] y = 2' },
    { titulo: 'Solución', expr: '\\boxed{x = 3, \\quad y = 2}' },
  ]

  return (
    <TopicCard title="Método de Reducción (Eliminación)" icon="✂️" color="bg-bloque3">
      <p>
        La idea es <strong>eliminar una variable</strong> sumando o restando las ecuaciones.
        Es como cuando en una balanza pones lo mismo en ambos lados para cancelar algo.
      </p>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="font-semibold text-blue-800 mb-2">Pasos del método:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Haz que los coeficientes de una variable sean <strong>opuestos</strong> (uno positivo y otro negativo, mismo valor)</li>
          <li><strong>Suma</strong> las ecuaciones para eliminar esa variable</li>
          <li><strong>Resuelve</strong> la ecuación resultante (tiene una sola variable)</li>
          <li><strong>Sustituye</strong> el valor encontrado en cualquier ecuación original</li>
        </ol>
      </div>

      <InteractiveBox title="Ejemplo paso a paso">
        <div className="text-center mb-4 min-h-[100px] flex flex-col items-center justify-center">
          <Math expr={pasos[step].expr} display />
          <p className="text-sm font-semibold text-blue-600 mt-3">{pasos[step].titulo}</p>
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={() => setStep(s => window.Math.max(0, s - 1))} disabled={step === 0}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold disabled:opacity-30 hover:bg-blue-200 transition cursor-pointer">
            ← Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-500">{step + 1} / {pasos.length}</span>
          <button onClick={() => setStep(s => window.Math.min(pasos.length - 1, s + 1))} disabled={step === pasos.length - 1}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold disabled:opacity-30 hover:bg-blue-200 transition cursor-pointer">
            Siguiente →
          </button>
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

function MetodoCramer() {
  const [a1, setA1] = useState(2)
  const [b1, setB1] = useState(3)
  const [c1, setC1] = useState(12)
  const [a2, setA2] = useState(4)
  const [b2, setB2] = useState(-3)
  const [c2, setC2] = useState(6)

  const D = a1 * b2 - a2 * b1
  const Dx = c1 * b2 - c2 * b1
  const Dy = a1 * c2 - a2 * c1

  return (
    <TopicCard title="Método de Cramer (Determinantes)" icon="🔢" color="bg-bloque3">
      <p>
        La <strong>Regla de Cramer</strong> usa <strong>determinantes</strong> (un cálculo con los números de la ecuación)
        para encontrar directamente x e y. Es como una "fórmula mágica" para sistemas 2×2.
      </p>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="font-semibold text-blue-800 mb-2">Las fórmulas:</p>
        <div className="text-center space-y-3">
          <Math expr={"D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix} = a_1 b_2 - a_2 b_1"} display />
          <Math expr={"x = \\frac{D_x}{D} = \\frac{\\begin{vmatrix} c_1 & b_1 \\\\ c_2 & b_2 \\end{vmatrix}}{D}"} display />
          <Math expr={"y = \\frac{D_y}{D} = \\frac{\\begin{vmatrix} a_1 & c_1 \\\\ a_2 & c_2 \\end{vmatrix}}{D}"} display />
        </div>
        <p className="text-xs text-blue-600 mt-2">
          💡 El determinante es "cruzar y restar": diagonal principal menos diagonal secundaria.
        </p>
      </div>

      <InteractiveBox title="Calculadora de Cramer">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-bold mb-1">Ecuación 1:</p>
            <div className="flex gap-1 items-center text-sm">
              <input type="number" value={a1} onChange={e => setA1(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
              <span>x +</span>
              <input type="number" value={b1} onChange={e => setB1(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
              <span>y =</span>
              <input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-1">Ecuación 2:</p>
            <div className="flex gap-1 items-center text-sm">
              <input type="number" value={a2} onChange={e => setA2(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
              <span>x +</span>
              <input type="number" value={b2} onChange={e => setB2(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
              <span>y =</span>
              <input type="number" value={c2} onChange={e => setC2(Number(e.target.value))} className="border rounded px-2 py-1 w-14 font-mono text-center" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-2 text-center">
          <p><Math expr={`D = (${a1})(${b2}) - (${a2})(${b1}) = ${a1*b2} - ${a2*b1} = ${D}`} /></p>
          <p><Math expr={`D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${c1*b2} - ${c2*b1} = ${Dx}`} /></p>
          <p><Math expr={`D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${a1*c2} - ${a2*c1} = ${Dy}`} /></p>
          <hr className="my-3" />
          {D !== 0 ? (
            <div className="text-lg font-bold text-blue-700">
              <Math expr={`x = \\frac{${Dx}}{${D}} = ${(Dx/D).toFixed(2)}, \\quad y = \\frac{${Dy}}{${D}} = ${(Dy/D).toFixed(2)}`} />
            </div>
          ) : (
            <p className="text-lg font-bold text-red-500">D = 0 → El sistema no tiene solución única</p>
          )}
        </div>
      </InteractiveBox>
    </TopicCard>
  )
}

export default function Bloque3() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-2">Bloque 3</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Sistemas de Ecuaciones 2×2</h1>
        <p className="text-gray-500 mt-2">Método gráfico, reducción y determinantes (Cramer)</p>
      </div>

      <MetodoGrafico />
      <MetodoReduccion />
      <MetodoCramer />
    </div>
  )
}
