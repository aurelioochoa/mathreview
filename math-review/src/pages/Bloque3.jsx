import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Line, Theme, Text as MafsText } from 'mafs'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import Math from '../components/Math'
import MiniQuiz from '../components/MiniQuiz'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import BlockProgress from '../components/BlockProgress'
import ExpressSummary from '../components/ExpressSummary'
import GlossaryTerm from '../components/GlossaryTerm'

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
      <WhySection>
        Un sistema de ecuaciones te dice dónde se cruzan dos cosas.
        <br />
        Dos streamers cobran diferente: uno cobra $500 base + $2 por viewer, otro $200 + $5 por viewer.
        <br />
        ¿Con cuántos viewers ganan igual? Ese punto de cruce es la solución del sistema.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Si las rectas son paralelas, pensar que hay error en el cálculo — no, significa que no hay solución.",
          "Si son la misma recta, pensar que hay una solución — en realidad hay infinitas.",
          "Confundir x con y en el plano cartesiano: x es horizontal (izquierda-derecha), y es vertical (arriba-abajo)."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Un <GlossaryTerm term="Sistema de ecuaciones 2×2" definition="Dos ecuaciones con dos incógnitas (x e y) que se resuelven simultáneamente">sistema de ecuaciones 2×2</GlossaryTerm> es como un acertijo con dos pistas y dos incógnitas.
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

      <MiniQuiz questions={[
        {
          question: "Si dos rectas se cruzan en un punto, ¿cuántas soluciones tiene el sistema?",
          options: ["0", "1", "Infinitas", "2"],
          correctAnswer: 1,
          hint: "Un punto de cruce = una solución única (x,y)",
          reminder: "Se cruzan en 1 punto → una solución única."
        },
        {
          question: "Dos streamers: A cobra $100 + $3/viewer, B cobra $50 + $5/viewer. ¿Qué resuelves para saber cuándo ganan igual?",
          options: ["100 + 3x = 50 + 5x", "100x + 3 = 50x + 5", "3x + 5x = 100 + 50", "100 - 50 = 5 - 3"],
          correctAnswer: 0,
          hint: "Iguala los ingresos: 100 + 3x (streamer A) = 50 + 5x (streamer B)",
          reminder: "En un sistema, igualas las dos expresiones para encontrar el punto de cruce."
        },
        {
          question: "Si D = 0 en el método de Cramer, ¿qué significa?",
          options: ["Hay una solución única", "No hay solución o hay infinitas", "El sistema está mal planteado", "Hay que usar otro método"],
          correctAnswer: 1,
          hint: "D = 0 significa que las rectas son paralelas (no solución) o coincidentes (infinitas)",
          reminder: "Determinante D = 0 → las rectas no se cruzan en un punto único."
        }
      ]} />
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

  const quizQuestions = [
    {
      question: "En el sistema {2x + 3y = 12, 4x - 3y = 6}, ¿por qué sumar elimina la y?",
      options: ["Porque 3 + 3 = 0", "Porque 3 + (-3) = 0", "Porque 3 × 3 = 9", "No se elimina"],
      correctAnswer: 1,
      hint: "Los coeficientes de y son +3 y -3. Al sumar: 3y + (-3y) = 0",
      reminder: "Para eliminar una variable, necesitas coeficientes opuestos (uno positivo, otro negativo)."
    },
    {
      question: "Después de eliminar una variable y encontrar x = 4, ¿qué haces?",
      options: ["Ya terminaste", "Sustituyes x = 4 en cualquier ecuación original para hallar y", "Eliminas la otra variable", "Divides entre 4"],
      correctAnswer: 1,
      hint: "Con x = 4, reemplazas en una ecuación original (ej: 2(4) + 3y = 12) y despejas y",
      reminder: "Después de encontrar una variable, sustitúyela para hallar la otra."
    },
    {
      question: "¿Cuál es el objetivo del método de reducción?",
      options: ["Sumar todas las ecuaciones", "Eliminar una variable para resolver la otra", "Multiplicar los coeficientes", "Graficar las rectas"],
      correctAnswer: 1,
      hint: "La idea es eliminar una variable sumando/restando, para que solo quede una incógnita",
      reminder: "Reducción = eliminar una variable → resolver la otra → sustituir."
    }
  ]

  return (
    <TopicCard title="Método de Reducción (Eliminación)" icon="✂️" color="bg-bloque3">
      <WhySection>
        Dos amigos quieren comprar el mismo videojuego.
        <br />
        El primero ahorra $20/semana, el segundo $30/semana pero empezó después.
        <br />
        ¿Cuándo tendrán el mismo dinero? La reducción te ayuda a eliminar variables y resolverlo.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "No multiplicar TODA la ecuación cuando igualas coeficientes.",
          "Olvidar sustituir al final para encontrar la segunda variable.",
          "Sumar en vez de restar (o viceversa) cuando los coeficientes ya son opuestos."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
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

      <MiniQuiz questions={quizQuestions} />
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

  const quizQuestions = [
    {
      question: "Para el sistema {2x + 3y = 12, 4x - 3y = 6}, ¿cuánto vale D?",
      options: ["6", "-18", "18", "-12"],
      correctAnswer: 1,
      hint: "D = a₁b₂ - a₂b₁ = (2)(-3) - (4)(3) = -6 - 12 = -18",
      reminder: "D = a₁b₂ - a₂b₁. Cruza y resta."
    },
    {
      question: "Para ese mismo sistema, D = -18 y Dx = -54. ¿Cuánto vale x?",
      options: ["2", "-2", "3", "-3"],
      correctAnswer: 2,
      hint: "x = Dx/D = -54/-18 = 3",
      reminder: "x = Dx/D, y = Dy/D. Divide los determinantes."
    },
    {
      question: "¿Qué significa cuando el determinante D = 0?",
      options: ["Hay una solución única", "El sistema no tiene solución o tiene infinitas", "El cálculo está mal", "x = 0 e y = 0"],
      correctAnswer: 1,
      hint: "D = 0 significa que las rectas son paralelas o coincidentes",
      reminder: "Si D = 0, no puedes dividir → no hay solución única."
    }
  ]

  return (
    <TopicCard title="Método de Cramer (Determinantes)" icon="🔢" color="bg-bloque3">
      <WhySection>
        Necesitas resolver muchos sistemas rápido. Cramer te da una fórmula directa.
        <br />
        Es como tener una calculadora programada: solo metes los números y te da la respuesta.
        <br />
        Útil cuando tienes sistemas 2×2 y quieres la respuesta sin graficar.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir el orden de los coeficientes en el determinante.",
          "Olvidar que si D = 0, no hay solución única (no puedes dividir entre 0).",
          "Calcular mal el determinante: es (a₁)(b₂) - (a₂)(b₁), no (a₁)(b₁) - (a₂)(b₂)."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        La <GlossaryTerm term="Regla de Cramer" definition="Método que usa determinantes para resolver sistemas de ecuaciones lineales">Regla de Cramer</GlossaryTerm> usa <strong>determinantes</strong> (un cálculo con los números de la ecuación)
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

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

export default function Bloque3() {
  const totalTemas = 3

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-2">Bloque 3</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Sistemas de Ecuaciones 2×2</h1>
        <p className="text-gray-500 mt-2">Método gráfico, reducción y determinantes (Cramer)</p>
      </div>

      <BlockProgress current={1} total={totalTemas} blockName="Bloque 3: Sistemas 2×2" />

      <MetodoGrafico />
      
      <BlockProgress current={2} total={totalTemas} blockName="Bloque 3: Sistemas 2×2" />
      
      <MetodoReduccion />
      
      <BlockProgress current={3} total={totalTemas} blockName="Bloque 3: Sistemas 2×2" />
      
      <MetodoCramer />

      <ExpressSummary color="bg-blue-500">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-800 text-sm">📊 Método Gráfico</p>
            <p className="text-xs text-gray-600 mt-1">La solución es el punto donde se cruzan las dos rectas.</p>
            <p className="text-xs text-red-500 mt-1">Paralelas = no hay solución. Misma recta = infinitas soluciones.</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-800 text-sm">✂️ Método de Reducción</p>
            <p className="text-xs text-gray-600 mt-1">Elimina una variable sumando/restando las ecuaciones.</p>
            <p className="text-xs text-blue-600">Necesitas coeficientes opuestos para cancelar una variable.</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-800 text-sm">🔢 Regla de Cramer</p>
            <p className="text-xs text-gray-600 mt-1">x = Dx/D, y = Dy/D</p>
            <p className="text-xs text-blue-600">D = a₁b₂ - a₂b₁ (cruzar y restar)</p>
            <p className="text-xs text-red-500">Si D = 0, no hay solución única.</p>
          </div>
        </div>
      </ExpressSummary>
    </div>
  )
}
