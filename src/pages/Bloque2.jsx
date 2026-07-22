import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import MathTex from '../components/MathTex'
import MiniQuiz from '../components/MiniQuiz'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import BlockProgress from '../components/BlockProgress'
import ExpressSummary from '../components/ExpressSummary'
import GlossaryTerm from '../components/GlossaryTerm'
import McdCalculadora from '../widgets/McdCalculadora'
import McmCalculadora from '../widgets/McmCalculadora'
import FraccionesEjemplo from '../widgets/FraccionesEjemplo'

function MCDSection() {
  const quizQuestions = [
    {
      question: "Tienes 48 diamantes y 36 potions para repartir en grupos iguales entre tu squad de Free Fire. ¿Cuál es el máximo número de jugadores que pueden recibir la misma cantidad de ambos?",
      options: ["6", "12", "24", "48"],
      correctAnswer: 1,
      hint: "Busca el MCD de 48 y 36",
      reminder: "MCD = mayor número que divide exactamente a ambos. Factoriza: 48=16×3, 36=12×3. MCD=12"
    },
    {
      question: "¿Cuál es el MCD de 18x³y² y 12x²y⁴?",
      options: ["6x³y⁴", "6x²y²", "36x²y²", "6xy"],
      correctAnswer: 1,
      hint: "MCD de coeficientes: 6. Variables: x² (menor exponente), y² (menor exponente)",
      reminder: "Para polinomios, toma coeficientes MCD y variables con menor exponente."
    },
    {
      question: "Si MCD(a,b) = 12 y a = 36, ¿qué valores puede tener b?",
      options: ["Cualquier múltiplo de 12", "Solo 24", "24 o 48", "Imposible saber"],
      correctAnswer: 2,
      hint: "b debe ser divisible por 12, y 36 también debe ser divisible por el MCD (12). Prueba 24: MCD(36,24)=12 ✓",
      reminder: "Ambos números deben ser divisibles por el MCD."
    }
  ]

  return (
    <TopicCard title="Máximo Común Divisor (MCD)" icon="🔗" color="bg-bloque2">
      <WhySection>
        Tienes 48 diamantes y 36 potions para repartir en partes iguales entre tu squad de Free Fire.
        <br />
        ¿Cuál es el máximo de jugadores que pueden recibir la misma cantidad de ambos? ¡Eso es el MCD!
        <br />
        El MCD también sirve para simplificar fracciones y encontrar combinaciones perfectas en tu inventario.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Pensar que MCD siempre es el número más pequeño — no, es el divisor más grande que les queda exacto a ambos.",
          "Para polinomios: confundir y tomar el MAYOR exponente en vez del menor. El MCD toma el menor.",
          "Olvidar que MCD se calcula con números positivos; con negativos se toma el valor absoluto."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        El <GlossaryTerm term="MCD (Máximo Común Divisor)" definition="El número más grande que divide exactamente a dos o más números">MCD</GlossaryTerm> es el número más grande que divide exactamente a dos o más números.
        Piénsalo así: si tú y tu amigo tienen chocolates y quieren repartirlos en grupos iguales
        lo más grandes posible, el MCD te dice cuántos poner en cada grupo.
      </p>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <p className="font-semibold text-emerald-800 mb-2">Para polinomios, el proceso es similar:</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Factoriza cada polinomio completamente</li>
          <li>Toma los factores <strong>comunes</strong> con el <strong>menor exponente</strong></li>
        </ol>
        <div className="mt-3 glass rounded-md p-3 text-sm">
          <p className="font-medium">Ejemplo con monomios:</p>
          <MathTex expr={"\\text{MCD}(18x^2yz,\\ 36xy^2z^3,\\ 54x^2y^3z)"} display />
          <p className="mt-1">Coeficientes: MCD(18, 36, 54) = 18</p>
          <p>Variables: <MathTex expr={"x^1 \\cdot y^1 \\cdot z^1"} /> (menor exponente de cada una)</p>
          <p className="font-bold text-emerald-700 mt-1"><MathTex expr={"\\text{MCD} = 18xyz"} /></p>
        </div>
      </div>

      <InteractiveBox title="Calculadora de MCD: repartiendo loot del squad">
        <McdCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function MCMSection() {
  const quizQuestions = [
    {
      question: "Un evento especial en Roblox se repite cada 12 horas y otro cada 18 horas. ¿Cada cuántas horas coinciden?",
      options: ["6 horas", "36 horas", "30 horas", "216 horas"],
      correctAnswer: 1,
      hint: "MCM(12, 18) = ? Factoriza: 12=2²×3, 18=2×3². MCM = 2²×3² = 36",
      reminder: "MCM = todos los factores con el MAYOR exponente."
    },
    {
      question: "Para sumar 1/4 + 1/6, ¿qué denominador común necesitas?",
      options: ["10", "12", "24", "2"],
      correctAnswer: 1,
      hint: "MCM(4, 6) = ? 4=2², 6=2×3. MCM = 2²×3 = 12",
      reminder: "El MCM te da el denominador común más pequeño."
    },
    {
      question: "¿Cuál es el MCM de 8x²y y 12xy³?",
      options: ["4xy", "24x²y³", "96x²y³", "24xy"],
      correctAnswer: 1,
      hint: "MCM coeficientes: MCM(8,12)=24. Variables: x² (mayor), y³ (mayor)",
      reminder: "Para MCM de polinomios: mayor exponente de cada variable."
    }
  ]

  return (
    <TopicCard title="Mínimo Común Múltiplo (MCM)" icon="🔄" color="bg-bloque2">
      <WhySection>
        Un evento especial en Roblox se repite cada 12 horas y otro cada 18 horas. ¿Cada cuándo coinciden?
        <br />
        <strong>MCM(12, 18) = 36 horas</strong>.
        <br />
        El MCM también te sirve para sumar fracciones: necesitas el denominador común más pequeño.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir MCM con MCD: MCM es el múltiplo más pequeño, MCD es el divisor más grande.",
          "Para polinomios: tomar el MENOR exponente en vez del mayor. El MCM toma el mayor.",
          "Olvidar que MCM siempre es mayor o igual que los números originales."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        El <GlossaryTerm term="MCM (Mínimo Común Múltiplo)" definition="El número más pequeño que es múltiplo de dos o más números a la vez">MCM</GlossaryTerm> es el número más pequeño que es múltiplo de dos o más números a la vez.
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

      <InteractiveBox title="Calculadora de MCM: sincronizando eventos">
        <McmCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function FraccionesAlgebraicasSection() {
  const quizQuestions = [
    {
      question: "¿Cuál es la fracción simplificada de (x² - 4)/(x² - 4x + 4)?",
      options: ["(x+2)/(x-2)", "(x-2)/(x+2)", "(x+2)/(x+2)", "1"],
      correctAnswer: 0,
      hint: "x²-4 = (x+2)(x-2). x²-4x+4 = (x-2)². Cancela (x-2)",
      reminder: "Diferencia de cuadrados: a²-b² = (a+b)(a-b). Trinomio cuadrado: a²-2ab+b² = (a-b)²."
    },
    {
      question: "En la fracción (2x+6)/(4x+8), ¿qué puedes factorizar arriba y abajo?",
      options: ["Nada", "Factor común 2 arriba y 4 abajo", "Factor común 2 en ambos", "2(x+3)/4(x+2)"],
      correctAnswer: 2,
      hint: "2x+6 = 2(x+3). 4x+8 = 4(x+2) = 2·2(x+2). El 2 es común.",
      reminder: "Busca el MCD de los coeficientes como factor común."
    },
    {
      question: "¿Cuál es el resultado de (x²-9)/(x+3)?",
      options: ["x-3", "x+3", "(x-3)/(x+3)", "x²-3"],
      correctAnswer: 0,
      hint: "x²-9 = (x+3)(x-3). Divide por (x+3).",
      reminder: "Diferencia de cuadrados: x²-9 = x²-3² = (x+3)(x-3)."
    }
  ]

  return (
    <TopicCard title="Fracciones Algebraicas" icon="➗" color="bg-bloque2">
      <WhySection>
        Tu K/D ratio en Free Fire es kills/deaths — eso es una fracción algebraica cuando usas variables.
        <br />
        Simplificar fracciones algebraicas = entender ratios de manera más simple.
        <br />
        Esto te ayuda a comparar estadísticas de jugadores, calcular porcentajes de victoria, y más.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Cancelar TÉRMINOS en vez de FACTORES: (x+2)/(x+3) NO se simplifica a 2/3.",
          "Olvidar que a²-b² = (a+b)(a-b), no (a-b)².",
          "Distribuir la raíz: √(a+b) ≠ √a + √b (esto es radicación, pero ocurre en fracciones también)."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Una <GlossaryTerm term="Fracción algebraica" definition="Cociente de dos expresiones algebraicas, donde el denominador no es cero">fracción algebraica</GlossaryTerm> es igual que una fracción normal, pero con letras (variables)
        en vez de solo números. Es como una fracción con "ingredientes secretos".
      </p>

      <div className="text-center my-4">
        <MathTex expr={"\\frac{x^2 - 4}{x^2 - 4x + 4} = \\frac{(x-2)(x+2)}{(x-2)^2} = \\frac{x+2}{x-2}"} display />
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

      <div className="mt-4 glass rounded-xl p-4 border">
        <p className="font-semibold mb-2">Factorizaciones que más vas a usar:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Factor común</p>
            <MathTex expr={"ax + ay = a(x + y)"} />
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Diferencia de cuadrados</p>
            <MathTex expr={"a^2 - b^2 = (a+b)(a-b)"} />
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Trinomio cuadrado perfecto</p>
            <MathTex expr={"a^2 + 2ab + b^2 = (a+b)^2"} />
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">Trinomio de la forma x² + bx + c</p>
            <MathTex expr={"x^2 + bx + c = (x+p)(x+q)"} />
          </div>
        </div>
      </div>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function OperacionesSection() {
  const quizQuestions = [
    {
      question: "¿Cuál es el resultado de 1/x + 1/(x+1)?",
      options: ["2/(2x+1)", "(2x+1)/(x²+x)", "2/(x²+x)", "2x+1"],
      correctAnswer: 1,
      hint: "MCM(x, x+1) = x(x+1). Luego: (x+1 + x)/[x(x+1)]",
      reminder: "Para sumar fracciones, necesitas el MCM de los denominadores."
    },
    {
      question: "Para multiplicar (3/x) × (x²/9), ¿qué haces primero?",
      options: ["Sumar numeradores y denominadores", "Multiplicar numeradores y denominadores", "Encontrar MCM", "Dividir cruzado"],
      correctAnswer: 1,
      hint: "Multiplicación: numerador × numerador, denominador × denominador. Luego simplifica.",
      reminder: "(a/b) × (c/d) = (ac)/(bd)"
    },
    {
      question: "Para dividir (2/x) ÷ (4/x²), ¿qué haces?",
      options: ["Multiplicar por la inversa: (2/x) × (x²/4)", "Multiplicar directo", "Sumar fracciones", "Nada, no se puede"],
      correctAnswer: 0,
      hint: "Dividir por una fracción = multiplicar por su inversa (dar vuelta la segunda).",
      reminder: "(a/b) ÷ (c/d) = (a/b) × (d/c)"
    }
  ]

  return (
    <TopicCard title="Operaciones con Fracciones Algebraicas" icon="🧮" color="bg-bloque2">
      <WhySection>
        Cuando calculas tu ratio de victorias (wins/games), estás trabajando con fracciones.
        <br />
        Sumar ratios de jugadores, calcular promedios de estadísticas — todo usa operaciones con fracciones.
        <br />
        Las fracciones algebraicas funcionan igual que las numéricas, solo que con letras.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Para sumar fracciones, intentar sumar numeradores y denominadores directamente.",
          "Para dividir, olvidar 'dar vuelta' la segunda fracción (multiplicar por el inverso).",
          "No simplificar al final: siempre busca factores comunes para reducir la fracción."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Las operaciones con fracciones algebraicas funcionan <strong>igual que con fracciones numéricas</strong>:
      </p>

      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 space-y-2">
        <div className="glass rounded-md p-2 text-sm">
          <strong>Suma/Resta:</strong> Necesitas denominador común (MCM), luego sumas/restas los numeradores
        </div>
        <div className="glass rounded-md p-2 text-sm">
          <strong>Multiplicación:</strong> <MathTex expr={"\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}"} /> (numerador × numerador, denominador × denominador)
        </div>
        <div className="glass rounded-md p-2 text-sm">
          <strong>División:</strong> <MathTex expr={"\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}"} /> (multiplicas por el inverso, "flip" la segunda)
        </div>
      </div>

      <InteractiveBox title="Ejemplo paso a paso — Suma de fracciones">
        <FraccionesEjemplo />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

export default function Bloque2() {
  const totalTemas = 4

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-2">Bloque 2</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-800">Polinomios y Fracciones Algebraicas</h1>
        <p className="text-gray-500 mt-2">MCD, MCM, fracciones algebraicas y operaciones</p>
      </div>

      <BlockProgress current={1} total={totalTemas} blockName="Bloque 2: Polinomios" />

      <MCDSection />
      
      <BlockProgress current={2} total={totalTemas} blockName="Bloque 2: Polinomios" />
      
      <MCMSection />
      
      <BlockProgress current={3} total={totalTemas} blockName="Bloque 2: Polinomios" />
      
      <FraccionesAlgebraicasSection />
      
      <BlockProgress current={4} total={totalTemas} blockName="Bloque 2: Polinomios" />
      
      <OperacionesSection />

      <ExpressSummary color="bg-emerald-500">
        <div className="space-y-4">
          <div className="glass rounded-xl p-3 border border-emerald-200">
            <p className="font-bold text-emerald-800 text-sm">🔗 MCD (Máximo Común Divisor)</p>
            <p className="text-xs text-gray-600 mt-1">Mayor número que divide exactamente a ambos.</p>
            <p className="text-xs text-emerald-600 mt-1">Para polinomios: toma el MENOR exponente de cada variable.</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-emerald-200">
            <p className="font-bold text-emerald-800 text-sm">🔄 MCM (Mínimo Común Múltiplo)</p>
            <p className="text-xs text-gray-600 mt-1">Menor número que es múltiplo de ambos.</p>
            <p className="text-xs text-emerald-600 mt-1">Fórmula: MCM(a,b) = |a×b| / MCD(a,b)</p>
            <p className="text-xs text-emerald-600">Para polinomios: toma el MAYOR exponente.</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-emerald-200">
            <p className="font-bold text-emerald-800 text-sm">➗ Fracciones Algebraicas</p>
            <p className="text-xs text-gray-600 mt-1">Simplificar: factoriza y cancela factores comunes.</p>
            <p className="text-xs text-red-500 mt-1">⚠️ Solo cancelas FACTORES, nunca términos sueltos.</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-emerald-200">
            <p className="font-bold text-emerald-800 text-sm">🧮 Operaciones</p>
            <p className="text-xs text-gray-600 mt-1">Suma/Resta: MCM de denominadores.</p>
            <p className="text-xs text-gray-600">Multiplicación: (a/b)×(c/d) = (ac)/(bd).</p>
            <p className="text-xs text-gray-600">División: multiplica por el inverso.</p>
          </div>
        </div>
      </ExpressSummary>
    </div>
  )
}
