import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Theme, Point, Line, Text as MafsText } from 'mafs'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import MathTex from '../components/MathTex'
import MiniQuiz from '../components/MiniQuiz'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import BlockProgress from '../components/BlockProgress'
import ExpressSummary from '../components/ExpressSummary'
import GlossaryTerm from '../components/GlossaryTerm'

function SistemasLinealesSection() {
  const quizQuestions = [
    {
      question: "Si dos rectas son paralelas en el plano cartesiano, ¿qué pasa con el sistema?",
      options: ["Tiene una solución", "No tiene solución", "Tiene infinitas soluciones", "Se vuelven perpendiculares"],
      correctAnswer: 1,
      hint: "Paralelas nunca se cruzan → no hay punto de intersección",
      reminder: "Paralelas = no hay solución. Misma recta = infinitas soluciones."
    },
    {
      question: "¿En qué cuadrante está el punto (-3, 4)?",
      options: ["I", "II", "III", "IV"],
      correctAnswer: 1,
      hint: "x negativo, y positivo → Cuadrante II",
      reminder: "Cuadrante I (+,+), II (-,+), III (-,-), IV (+,-)"
    },
    {
      question: "Dos jugadores de Free Fire: A gana 50 puntos por kill, B gana 30 por kill pero empezó con 100 puntos extra. ¿Qué sistema representa esto?",
      options: ["50x = 30x + 100", "50 + x = 30 + x", "50x + 30y = 100", "x = 50, y = 30"],
      correctAnswer: 0,
      hint: "Jugador A: 50x, Jugador B: 30x + 100. Iguala: 50x = 30x + 100",
      reminder: "Iguala las dos expresiones para encontrar cuándo tienen lo mismo."
    }
  ]

  return (
    <TopicCard title="Sistemas Lineales 2×2" icon="🔀" color="bg-bloque4">
      <WhySection>
        Cuando juegas con tu squad, dos jugadores suben de nivel a diferente velocidad.
        <br />
        ¿Cuándo alcanzan el mismo nivel? ¡Eso es un sistema lineal!
        <br />
        Los sistemas 2×2 aparecen en balanzas, economías, y cualquier situación con dos cantidades que cambian.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir 'no hay solución' con 'la solución es cero' — no, significa que las rectas nunca se cruzan.",
          "Olvidar que el punto de intersección tiene coordenadas (x, y), no solo x.",
          "Pensar que todas las soluciones están en el primer cuadrante — pueden estar en cualquiera."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Ya viste en el Bloque 3 cómo resolver sistemas de ecuaciones. Aquí vamos a conectar eso con el
        concepto de <GlossaryTerm term="Función lineal" definition="Función cuya gráfica es una línea recta, de la forma f(x) = mx + b">función lineal</GlossaryTerm>. Cada ecuación lineal con dos incógnitas se puede graficar
        como una <strong>recta</strong> en el plano cartesiano.
      </p>

      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
        <p className="font-semibold text-violet-800 mb-2">Recuerda:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>La solución de un sistema 2×2 es el <strong>punto de intersección</strong> de las dos rectas</li>
          <li>Si las rectas son <strong>paralelas</strong>: no hay solución</li>
          <li>Si las rectas son <strong>la misma</strong>: infinitas soluciones</li>
          <li>La solución se puede encontrar en cualquier <strong>cuadrante</strong> del plano cartesiano</li>
        </ul>
      </div>

      <div className="mt-4 glass rounded-xl p-4 border">
        <p className="font-semibold mb-2">Los 4 cuadrantes del plano cartesiano:</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-center max-w-xs mx-auto">
          <div className="bg-blue-50 rounded p-2">
            <strong>II</strong><br />x &lt; 0, y &gt; 0<br />(-,+)
          </div>
          <div className="bg-green-50 rounded p-2">
            <strong>I</strong><br />x &gt; 0, y &gt; 0<br />(+,+)
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <strong>III</strong><br />x &lt; 0, y &lt; 0<br />(-,-)
          </div>
          <div className="bg-red-50 rounded p-2">
            <strong>IV</strong><br />x &gt; 0, y &lt; 0<br />(+,-)
          </div>
        </div>
      </div>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function FuncionLinealSection() {
  const [m, setM] = useState(2)
  const [b, setB] = useState(-1)

  const quizQuestions = [
    {
      question: "En f(x) = 3x + 5, ¿cuál es la pendiente?",
      options: ["3", "5", "x", "3x"],
      correctAnswer: 0,
      hint: "En f(x) = mx + b, m es la pendiente",
      reminder: "Pendiente (m) = 'velocidad' de la recta. Ordenada al origen (b) = donde cruza el eje Y."
    },
    {
      question: "Si m = -2, ¿qué tipo de recta es?",
      options: ["Sube", "Baja", "Horizontal", "Vertical"],
      correctAnswer: 1,
      hint: "m negativo → la recta baja (de izquierda a derecha)",
      reminder: "m > 0: sube, m < 0: baja, m = 0: horizontal."
    },
    {
      question: "¿Dónde corta el eje Y la función f(x) = 2x - 3?",
      options: ["En y = 2", "En y = -3", "En x = 2", "En x = -3"],
      correctAnswer: 1,
      hint: "Ordenada al origen (b) = -3, es donde x = 0",
      reminder: "El corte con el eje Y es el punto (0, b)."
    }
  ]

  return (
    <TopicCard title="Función Lineal" icon="📈" color="bg-bloque4">
      <WhySection>
        Tu progreso en un juego: ganas XP constante por hora jugada.
        <br />
        Eso es una función lineal: f(horas) = XP_por_hora × horas + XP_inicial.
        <br />
        Sirve para predecir cuándo subirás de nivel, cuánto necesitas farmear, etc.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir pendiente con ordenada al origen: m es la inclinación, b es el corte con Y.",
          "Pensar que m = 0 significa que no hay recta — no, significa que es horizontal.",
          "Olvidar que el dominio de una función lineal es todos los reales (todos los x posibles)."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Una <GlossaryTerm term="Función lineal" definition="Función de la forma f(x) = mx + b, cuya gráfica es una línea recta">función lineal</GlossaryTerm> es la más sencilla de todas las funciones: su gráfica es una <strong>línea recta</strong>.
        Es como una regla que te dice "por cada paso que des hacia la derecha, sube (o baja) una cantidad fija".
      </p>

      <div className="text-center my-4">
        <MathTex expr={"f(x) = mx + b"} display />
      </div>

      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
        <p className="font-semibold text-violet-800 mb-2">¿Qué significan m y b?</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            <strong>m = pendiente</strong>: Qué tan inclinada está la recta. 
            Piénsalo como la "velocidad" de la recta.
            <ul className="list-disc pl-5 mt-1 text-xs text-gray-500">
              <li>m &gt; 0 → la recta sube (como subir una colina)</li>
              <li>m &lt; 0 → la recta baja (como bajar una rampa)</li>
              <li>m = 0 → la recta es horizontal (plana)</li>
            </ul>
          </li>
          <li>
            <strong>b = ordenada al origen</strong>: Dónde la recta cruza el eje Y. 
            Es el valor de f(x) cuando x = 0 (tu punto de partida).
          </li>
        </ul>
      </div>

      <div className="mt-3 glass rounded-xl p-4 border">
        <p className="font-semibold mb-2">Dominio y recorrido:</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Dominio</strong>: todos los valores que puede tomar x → <MathTex expr={"D = \\mathbb{R} = (-\\infty, +\\infty)"} /></li>
          <li><strong>Recorrido</strong> (o rango): todos los valores que puede dar f(x) → <MathTex expr={"R = \\mathbb{R} = (-\\infty, +\\infty)"} /></li>
        </ul>
        <p className="text-xs text-gray-500 mt-1">Piensa en el dominio como "las preguntas que puedes hacer" y el recorrido como "las respuestas posibles".</p>
      </div>

      <InteractiveBox title="Juega con la pendiente y la ordenada">
        <div className="flex gap-6 mb-4 flex-wrap">
          <div>
            <label className="block text-sm font-bold text-violet-700 mb-1">
              Pendiente (m) = {m}
            </label>
            <input type="range" min={-5} max={5} step={0.5} value={m}
              onChange={e => setM(Number(e.target.value))}
              className="w-48 accent-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-violet-700 mb-1">
              Ordenada (b) = {b}
            </label>
            <input type="range" min={-5} max={5} step={0.5} value={b}
              onChange={e => setB(Number(e.target.value))}
              className="w-48 accent-violet-500" />
          </div>
        </div>

        <div className="text-center mb-3">
          <MathTex expr={`f(x) = ${m === 0 ? '' : (m === 1 ? '' : (m === -1 ? '-' : m))}${m === 0 ? '' : 'x'}${b === 0 ? (m === 0 ? '0' : '') : (b > 0 && m !== 0 ? ' + ' + b : (b < 0 ? ' - ' + Math.abs(b) : b))}`} />
        </div>

        <div className="glass rounded-xl overflow-hidden border">
          <Mafs viewBox={{ x: [-8, 8], y: [-8, 8] }} height={350}>
            <Coordinates.Cartesian />
            <Plot.OfX y={(x) => m * x + b} color={Theme.violet} />
            <Point x={0} y={b} color={Theme.violet} />
            {m !== 0 && <Point x={-b / m} y={0} color={Theme.pink} />}
          </Mafs>
        </div>

        <div className="mt-3 text-sm text-center text-gray-600">
          <p>Corte con eje Y: <strong>(0, {b})</strong></p>
          {m !== 0 && <p>Corte con eje X: <strong>({(-b / m).toFixed(2)}, 0)</strong></p>}
        </div>
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function EcuacionesLinealesSection() {
  const [step, setStep] = useState(0)

  const pasos = [
    { titulo: 'Problema', expr: '3x + 7 = 2x - 5' },
    { titulo: 'Paso 1: Pasar las x a un lado', expr: '3x - 2x = -5 - 7' },
    { titulo: 'Paso 2: Simplificar', expr: 'x = -12' },
    { titulo: 'Verificación', expr: '3(-12) + 7 = -36 + 7 = -29 \\\\[4pt] 2(-12) - 5 = -24 - 5 = -29 \\quad \\checkmark' },
  ]

  const quizQuestions = [
    {
      question: "Resuelve: 5x - 3 = 2x + 6",
      options: ["x = 1", "x = 3", "x = -3", "x = 9/7"],
      correctAnswer: 1,
      hint: "5x - 2x = 6 + 3 → 3x = 9 → x = 3",
      reminder: "Pasa las x a un lado y los números al otro. Luego divide."
    },
    {
      question: "Si 2(x + 4) = 3x - 2, ¿cuánto vale x?",
      options: ["x = 6", "x = 10", "x = 8", "x = -10"],
      correctAnswer: 1,
      hint: "Expande: 2x + 8 = 3x - 2 → 8 + 2 = 3x - 2x → 10 = x",
      reminder: "Primero distribuye, luego agrupa términos semejantes."
    },
    {
      question: "Después de resolver una ecuación, ¿qué debes hacer?",
      options: ["Nada, ya terminaste", "Verificar sustituyendo tu respuesta en la ecuación original", "Multiplicar por 2", "Dividir entre 0"],
      correctAnswer: 1,
      hint: "Siempre verifica: reemplaza x con tu respuesta y comprueba que ambos lados sean iguales.",
      reminder: "La verificación te asegura que no cometiste errores de signo."
    }
  ]

  return (
    <TopicCard title="Ecuaciones Lineales" icon="⚖️" color="bg-bloque4">
      <WhySection>
        Un juego te da 100 monedas base + 50 por nivel completado. Necesitas 400 para comprar una skin.
        <br />
        ¿Cuántos niveles debes completar? Eso es resolver: 100 + 50x = 400.
        <br />
        Las ecuaciones lineales aparecen en economías de juegos, progresos de misiones, y más.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Cambiar de lado pero olvidar cambiar el signo (lo que suma pasa restando, etc.).",
          "Distribuir mal: 2(x + 3) ≠ 2x + 3, es 2x + 6.",
          "No verificar la respuesta: siempre sustituye tu x en la ecuación original."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Una <GlossaryTerm term="Ecuación lineal" definition="Ecuación donde la variable x aparece con exponente 1, de la forma ax + b = c">ecuación lineal</GlossaryTerm> es como una balanza: lo que está a la izquierda del "=" 
        pesa lo mismo que lo de la derecha. Tu trabajo es encontrar qué valor de x mantiene la balanza equilibrada.
      </p>

      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
        <p className="font-semibold text-violet-800 mb-2">Reglas de oro para resolver ecuaciones:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Lo que <strong>suma</strong> de un lado, pasa <strong>restando</strong> al otro</li>
          <li>Lo que <strong>multiplica</strong> de un lado, pasa <strong>dividiendo</strong> al otro</li>
          <li>Junta todas las x de un lado y los números del otro</li>
          <li>¡Siempre verifica sustituyendo tu respuesta!</li>
        </ol>
      </div>

      <InteractiveBox title="Ejemplo resuelto paso a paso">
        <div className="text-center mb-4 min-h-[80px] flex flex-col items-center justify-center">
          <MathTex expr={pasos[step].expr} display />
          <p className="text-sm font-semibold text-violet-600 mt-3">{pasos[step].titulo}</p>
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-4 py-2 rounded-lg bg-violet-100 text-violet-700 font-semibold disabled:opacity-30 hover:bg-violet-200 transition cursor-pointer">
            ← Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-500">{step + 1} / {pasos.length}</span>
          <button onClick={() => setStep(s => Math.min(pasos.length - 1, s + 1))} disabled={step === pasos.length - 1}
            className="px-4 py-2 rounded-lg bg-violet-100 text-violet-700 font-semibold disabled:opacity-30 hover:bg-violet-200 transition cursor-pointer">
            Siguiente →
          </button>
        </div>
      </InteractiveBox>

      <div className="glass rounded-xl p-4 border mt-4">
        <p className="font-semibold mb-2">Problema tipo examen:</p>
        <p className="text-sm text-gray-700">
          Ana y Luis trabajan en un proyecto. Ana ha completado el <strong>triple</strong> de páginas que Luis. 
          Juntos han completado <strong>56 páginas</strong>. ¿Cuántas hizo cada uno?
        </p>
        <div className="mt-3 bg-violet-50 rounded p-3 text-sm">
          <p>Sea x = páginas de Luis → Ana = 3x</p>
          <p><MathTex expr={"x + 3x = 56 \\implies 4x = 56 \\implies x = 14"} /></p>
          <p className="font-bold text-violet-700 mt-1">Luis: 14 páginas, Ana: 42 páginas</p>
        </div>
      </div>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function FuncionCuadraticaSection() {
  const [a, setA] = useState(1)
  const [bCoef, setBCoef] = useState(6)
  const [c, setC] = useState(2)

  const vertice = useMemo(() => {
    const h = -bCoef / (2 * a)
    const k = a * h * h + bCoef * h + c
    return { h, k }
  }, [a, bCoef, c])

  const discriminante = bCoef * bCoef - 4 * a * c
  const raices = useMemo(() => {
    if (a === 0) return []
    if (discriminante < 0) return []
    const sqrtD = Math.sqrt(discriminante)
    const x1 = (-bCoef + sqrtD) / (2 * a)
    const x2 = (-bCoef - sqrtD) / (2 * a)
    if (discriminante === 0) return [x1]
    return [x1, x2]
  }, [a, bCoef, c, discriminante])

  const quizQuestions = [
    {
      question: "En f(x) = x² - 6x + 9, ¿cuál es el vértice?",
      options: ["(3, 0)", "(0, 9)", "(-3, 0)", "(6, 9)"],
      correctAnswer: 0,
      hint: "h = -b/2a = 6/2 = 3. k = f(3) = 9 - 18 + 9 = 0",
      reminder: "Vértice: h = -b/2a, k = f(h). Es el punto más alto o más bajo."
    },
    {
      question: "Si a parábola tiene a = -2, ¿hacia dónde abre?",
      options: ["Arriba (U)", "Abajo (∩)", "A la izquierda", "Es una recta"],
      correctAnswer: 1,
      hint: "a < 0 → abre hacia abajo (∩)",
      reminder: "a > 0: U hacia arriba. a < 0: ∩ hacia abajo."
    },
    {
      question: "El discriminante es Δ = b² - 4ac. Si Δ < 0, ¿qué pasa?",
      options: ["Dos raíces reales", "Una raíz doble", "No hay raíces reales", "Infinitas raíces"],
      correctAnswer: 2,
      hint: "Δ < 0 significa que no hay solución real (la raíz de negativo no es real)",
      reminder: "Δ > 0: 2 raíces. Δ = 0: 1 raíz doble. Δ < 0: no hay raíces reales."
    }
  ]

  return (
    <TopicCard title="Función Cuadrática" icon="🎢" color="bg-bloque4">
      <WhySection>
        En Minecraft, lanzas un objeto en arco: sube, llega a un punto máximo, y cae.
        <br />
        Esa trayectoria es una parábola — una función cuadrática.
        <br />
        También sirve para calcular áreas, tiempos de caída, y optimizar recursos.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir el vértice: h = -b/2a, NO b/2a. El signo menos es importante.",
          "Olvidar que si a < 0, la parábola abre hacia abajo (el vértice es el máximo, no el mínimo).",
          "Calcular mal el discriminante: es b² - 4ac, no b² + 4ac."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        La <GlossaryTerm term="Función cuadrática" definition="Función de la forma f(x) = ax² + bx + c, cuya gráfica es una parábola">función cuadrática</GlossaryTerm> tiene un <MathTex expr={"x^2"} /> y su gráfica es una <strong>parábola</strong> 
        (tiene forma de U o de U invertida). Es como la trayectoria de una pelota cuando la lanzas al aire.
      </p>

      <div className="text-center my-4">
        <MathTex expr={"f(x) = ax^2 + bx + c"} display />
      </div>

      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
        <p className="font-semibold text-violet-800 mb-2">Elementos clave de una parábola:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="glass rounded-md p-2">
            <strong>Vértice</strong>: El punto más alto o más bajo<br />
            <MathTex expr={"h = \\frac{-b}{2a}, \\quad k = f(h)"} />
          </div>
          <div className="glass rounded-md p-2">
            <strong>Eje de simetría</strong>: La línea vertical que pasa por el vértice<br />
            <MathTex expr={"x = \\frac{-b}{2a}"} />
          </div>
          <div className="glass rounded-md p-2">
            <strong>Dirección</strong>:<br />
            a &gt; 0 → abre hacia arriba (U)<br />
            a &lt; 0 → abre hacia abajo (∩)
          </div>
          <div className="glass rounded-md p-2">
            <strong>Raíces</strong> (cortes con eje X):<br />
            <MathTex expr={"x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"} />
          </div>
        </div>
      </div>

      <InteractiveBox title="Explora la parábola">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-violet-700 mb-1">a = {a}</label>
            <input type="range" min={-3} max={3} step={0.5} value={a}
              onChange={e => setA(Number(e.target.value) || 0.5)}
              className="w-36 accent-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-violet-700 mb-1">b = {bCoef}</label>
            <input type="range" min={-10} max={10} step={1} value={bCoef}
              onChange={e => setBCoef(Number(e.target.value))}
              className="w-36 accent-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-violet-700 mb-1">c = {c}</label>
            <input type="range" min={-10} max={10} step={1} value={c}
              onChange={e => setC(Number(e.target.value))}
              className="w-36 accent-violet-500" />
          </div>
        </div>

        <div className="text-center mb-3 text-sm">
          <MathTex expr={`f(x) = ${a === 1 ? '' : (a === -1 ? '-' : a)}x^2 ${bCoef >= 0 ? '+' : '-'} ${Math.abs(bCoef)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`} />
        </div>

        {a !== 0 && (
          <div className="glass rounded-xl overflow-hidden border">
            <Mafs viewBox={{ x: [-10, 10], y: [-10, 10] }} height={400}>
              <Coordinates.Cartesian />
              <Plot.OfX y={(x) => a * x * x + bCoef * x + c} color={Theme.violet} />
              <Point x={vertice.h} y={vertice.k} color={Theme.red} />
              <Line.Segment point1={[vertice.h, -10]} point2={[vertice.h, 10]} color={Theme.red} opacity={0.3} style="dashed" />
              {raices.map((r, i) => (
                <Point key={i} x={r} y={0} color={Theme.green} />
              ))}
            </Mafs>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-center">
          <div className="bg-red-50 rounded p-2">
            <strong>Vértice</strong><br />
            ({vertice.h.toFixed(2)}, {vertice.k.toFixed(2)})
          </div>
          <div className="bg-blue-50 rounded p-2">
            <strong>Eje de simetría</strong><br />
            x = {vertice.h.toFixed(2)}
          </div>
          <div className="bg-green-50 rounded p-2">
            <strong>Raíces</strong><br />
            {raices.length === 0 ? 'No tiene (Δ < 0)' : 
             raices.length === 1 ? `x = ${raices[0].toFixed(2)} (doble)` :
             `x₁ = ${raices[0].toFixed(2)}, x₂ = ${raices[1].toFixed(2)}`}
          </div>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          Discriminante: Δ = {discriminante.toFixed(2)} → {discriminante > 0 ? '2 raíces reales' : discriminante === 0 ? '1 raíz doble' : 'sin raíces reales'}
        </p>
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

export default function Bloque4() {
  const totalTemas = 4

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-2">Bloque 4</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-800">Funciones Lineales y Cuadráticas</h1>
        <p className="text-gray-500 mt-2">Rectas, parábolas, dominio, recorrido y problemas de aplicación</p>
      </div>

      <BlockProgress current={1} total={totalTemas} blockName="Bloque 4: Funciones" />

      <SistemasLinealesSection />
      
      <BlockProgress current={2} total={totalTemas} blockName="Bloque 4: Funciones" />
      
      <FuncionLinealSection />
      
      <BlockProgress current={3} total={totalTemas} blockName="Bloque 4: Funciones" />
      
      <EcuacionesLinealesSection />
      
      <BlockProgress current={4} total={totalTemas} blockName="Bloque 4: Funciones" />
      
      <FuncionCuadraticaSection />

      <ExpressSummary color="bg-violet-500">
        <div className="space-y-4">
          <div className="glass rounded-xl p-3 border border-violet-200">
            <p className="font-bold text-violet-800 text-sm">📊 Sistemas Lineales</p>
            <p className="text-xs text-gray-600 mt-1">Solución = punto de intersección de las dos rectas.</p>
            <p className="text-xs text-red-500">Paralelas = no hay solución. Misma recta = infinitas.</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-violet-200">
            <p className="font-bold text-violet-800 text-sm">📈 Función Lineal f(x) = mx + b</p>
            <p className="text-xs text-gray-600 mt-1">m = pendiente (inclinación), b = corte con eje Y.</p>
            <p className="text-xs text-violet-600">m &gt; 0: sube, m &lt; 0: baja, m = 0: horizontal.</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-violet-200">
            <p className="font-bold text-violet-800 text-sm">⚖️ Ecuaciones Lineales</p>
            <p className="text-xs text-gray-600 mt-1">Pasa términos cambiando signo. Verifica al final.</p>
            <p className="text-xs text-violet-600">Lo que suma → pasa restando. Lo que multiplica → pasa dividiendo.</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-violet-200">
            <p className="font-bold text-violet-800 text-sm">🎢 Función Cuadrática f(x) = ax² + bx + c</p>
            <p className="text-xs text-gray-600 mt-1">Vértice: h = -b/2a. Raíces: fórmula cuadrática.</p>
            <p className="text-xs text-violet-600">a &gt; 0: U arriba. a &lt; 0: ∩ abajo. Δ = b² - 4ac.</p>
          </div>
        </div>
      </ExpressSummary>
    </div>
  )
}
