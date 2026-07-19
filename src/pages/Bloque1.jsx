import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import MathTex from '../components/MathTex'
import MiniQuiz from '../components/MiniQuiz'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import BlockProgress from '../components/BlockProgress'
import ExpressSummary from '../components/ExpressSummary'
import GlossaryTerm from '../components/GlossaryTerm'
import AproximacionExplorer from '../widgets/AproximacionExplorer'
import PotenciaCalculadora from '../widgets/PotenciaCalculadora'
import NotacionConversor from '../widgets/NotacionConversor'
import RaizCalculadora from '../widgets/RaizCalculadora'

function AproximacionSection() {
  const quizQuestions = [
    {
      question: "Spotify dice que tu canción favorita tiene 2,450,890 reproducciones. Si la aproximas a 2 decimales usando millones, ¿qué valor es correcto?",
      options: ["2.4 millones", "2.45 millones", "2.5 millones", "2.0 millones"],
      correctAnswer: 1,
      hint: "Mira el tercer decimal después de convertir a millones",
      reminder: "Para redondear a 2 decimales, revisas el tercero. Si es 5 o más, subes el anterior."
    },
    {
      question: "Tienes 899 Robux. Si truncas a centenas (no redondeas), ¿cuántos tienes?",
      options: ["900 Robux", "800 Robux", "899 Robux", "1000 Robux"],
      correctAnswer: 1,
      hint: "Truncar es cortar sin redondear. Solo eliminas lo sobrante.",
      reminder: "Truncar = cortar los dígitos sobrantes sin modificar el anterior."
    },
    {
      question: "Tu K/D ratio es 2.447. El juego lo muestra como 2.4. ¿Qué operación hizo?",
      options: ["Redondeó a 1 decimal", "Truncó a 1 decimal", "Redondeó a enteros", "Truncó a enteros"],
      correctAnswer: 1,
      hint: "Si fuera redondeo sería 2.5, porque 4≥5? No, 4<5",
      reminder: "Truncar a 1 decimal de 2.447 da 2.4. Redondear daría 2.4 también... aquí ambos coinciden, pero truncar siempre corta."
    }
  ]

  return (
    <TopicCard title="Aproximación y Error" icon="🎯" color="bg-bloque1">
      <WhySection>
        Cuando Spotify dice que una canción tiene "1.2 millones de plays", eso es una aproximación.
        <br />
        En Free Fire, tu K/D ratio (kills/deaths) se muestra con 2 decimales, pero el cálculo interno es más preciso.
        <br />
        Esta sección te enseña a redondear y truncar — habilidades útiles cuando trabajas con grandes números de seguidores, visitas o estadísticas de juego.
      </WhySection>

      <p className="text-sm text-gray-600 mb-4">
        <strong>Aproximar</strong> es simplificar un número complejo usando uno más fácil de manejar, pero que esté "cerca" del valor real.
        Piensa en cuando le dices a tus amigos "me costó como $7" cuando en realidad fueron $6.99.
      </p>

      <CommonMistakes
        mistakes={[
          "Confundir truncar con redondear: truncar simplemente corta, redondear revisa el siguiente dígito.",
          "Pensar que error absoluto y relativo son lo mismo: el relativo te dice qué tan grave fue el error proporcionalmente.",
          "Olvidar que un error de $1 no es lo mismo en una compra de $2 que en una de $500."
        ]}
      />

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Dos formas de aproximar:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><GlossaryTerm term="Truncar" definition="Eliminar los decimales sobrantes sin modificar el último dígito conservado">Truncar</GlossaryTerm>: simplemente "cortas" los decimales que no quieres. Como cortar un video: lo que sobra, se va.</li>
          <li><GlossaryTerm term="Redondear" definition="Aproximar al valor más cercano revisando el siguiente dígito. Si es 5 o más, subes; si es menor, dejas igual.">Redondear</GlossaryTerm>: miras el siguiente dígito. Si es 5 o más, subes; si es menor que 5, dejas igual.</li>
        </ul>
      </div>

      <div className="mt-3">
        <p><strong>Error absoluto</strong> = <MathTex expr={"|\\text{valor real} - \\text{valor aproximado}|"} /></p>
        <p><strong>Error relativo</strong> = <MathTex expr={"\\frac{\\text{error absoluto}}{|\\text{valor real}|}"} /></p>
        <p className="text-sm text-gray-500 mt-1">El error relativo te dice <em>qué tan grave</em> fue la aproximación. Un error de $1 no es lo mismo comprando chicles ($1 de $2 = 50%) que comprando una consola ($1 de $500 = 0.2%).</p>
      </div>

      <InteractiveBox title="Prueba la aproximación">
        <AproximacionExplorer />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function PotenciacionSection() {
  const quizQuestions = [
    {
      question: "En Free Fire, tu arma hace 50 de daño base. Con un potenciador de nivel 3 (×2³), ¿cuánto daño haces ahora?",
      options: ["100", "150", "200", "400"],
      correctAnswer: 3,
      hint: "2³ = 2 × 2 × 2 = 8. Luego 50 × 8",
      reminder: "Potencia = multiplicación repetida. aⁿ = a multiplicado n veces."
    },
    {
      question: "¿Cuánto vale 5⁰?",
      options: ["0", "1", "5", "No se puede"],
      correctAnswer: 1,
      hint: "Cualquier número (excepto 0) elevado a la 0 es 1",
      reminder: "a⁰ = 1 siempre, para cualquier a ≠ 0."
    },
    {
      question: "¿Cuál es el resultado de 2⁻³?",
      options: ["-8", "-6", "1/8", "0.125"],
      correctAnswer: 2,
      hint: "Exponente negativo = 1 dividido por la potencia positiva",
      reminder: "a⁻ⁿ = 1/aⁿ. El exponente negativo NO hace negativo el resultado."
    }
  ]

  return (
    <TopicCard title="Potenciación de Números Reales" icon="⚡" color="bg-bloque1">
      <WhySection>
        En Free Fire, cuando tu personaje sube de nivel, su daño se potencia.
        <br />
        Los creadores de contenido también hablan de potencias: "Mi video tuvo 10⁶ views" (1 millón).
        <br />
        Las leyes de exponentes te permiten simplificar cálculos con grandes cantidades de Robux, diamantes o seguidores.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Pensar que exponente negativo da resultado negativo: 2⁻³ = 1/8, NO -8.",
          "Confundir a⁰ con 0: cualquier número (excepto 0) a la 0 es 1.",
          "Olvidar que (aᵐ)ⁿ = a^(m×n), no a^(m+n)."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Una <GlossaryTerm term="Potenciación" definition="Multiplicar un número por sí mismo varias veces. aⁿ = a × a × ... × a (n veces)">potencia</GlossaryTerm> es una multiplicación repetida.
        Es como cuando en un videojuego tu daño se multiplica: si tu ataque base es 3 y se multiplica 4 veces:
        <MathTex expr={"3^4 = 3 \\times 3 \\times 3 \\times 3 = 81"} display />
      </p>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Leyes de exponentes que DEBES saber:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-2"><MathTex expr={"a^m \\cdot a^n = a^{m+n}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"\\frac{a^m}{a^n} = a^{m-n}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"(a^m)^n = a^{m \\cdot n}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"a^0 = 1 \\text{ (siempre!)}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"a^{-n} = \\frac{1}{a^n}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"(a \\cdot b)^n = a^n \\cdot b^n"} /></div>
        </div>
      </div>

      <InteractiveBox title="Calculadora de potencias: prueba con daño de armas">
        <PotenciaCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function NotacionCientificaSection() {
  const quizQuestions = [
    {
      question: "Bad Bunny tiene 45,000,000 de oyentes mensuales. ¿Cómo se escribe en notación científica?",
      options: ["45 × 10⁶", "4.5 × 10⁷", "4.5 × 10⁶", "0.45 × 10⁸"],
      correctAnswer: 1,
      hint: "La mantisa debe estar entre 1 y 10. 4.5 está bien, 45 no.",
      reminder: "En notación científica, la mantisa a cumple: 1 ≤ |a| < 10"
    },
    {
      question: "Un video tiene 8.5 × 10⁶ views. ¿Cuántas visualizaciones reales tiene?",
      options: ["850,000", "8,500,000", "85,000,000", "850,000,000"],
      correctAnswer: 1,
      hint: "10⁶ = 1,000,000 (un millón). Multiplica 8.5 × 1,000,000",
      reminder: "Exponente positivo = número grande. 10⁶ = 1 millón."
    },
    {
      question: "¿Cuál es el exponente cuando escribes 0.0032 en notación científica?",
      options: ["3", "-3", "4", "-4"],
      correctAnswer: 1,
      hint: "0.0032 = 3.2 × 0.001 = 3.2 × 10⁻³",
      reminder: "Exponente negativo = número pequeño. Mueves la coma a la derecha."
    }
  ]

  return (
    <TopicCard title="Notación Científica" icon="🔬" color="bg-bloque1">
      <WhySection>
        Bad Bunny tiene 45,000,000 de oyentes en Spotify. ¿No sería más fácil escribir 4.5 × 10⁷?
        <br />
        TikTok tiene 15.6 millones de usuarios en Ecuador. La notación científica nos ayuda a manejar números enormes (o diminutos) sin perdernos en los ceros.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "La mantisa fuera de rango: 45 × 10⁶ está mal, debe ser 4.5 × 10⁷.",
          "Confundir exponente positivo con negativo: positivo = grande, negativo = pequeño.",
          "Mover la coma al lado contrario: exponente positivo → coma a la izquierda; negativo → derecha."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        La <GlossaryTerm term="Notación científica" definition="Forma de escribir números muy grandes o pequeños como a × 10ⁿ, donde 1 ≤ |a| < 10">notación científica</GlossaryTerm> es un atajo para escribir números como la distancia de la Tierra al Sol (149,600,000,000 m) o el tamaño de un átomo.
      </p>

      <div className="text-center my-4 text-xl">
        <MathTex expr={"\\text{Número} = a \\times 10^n \\quad \\text{donde } 1 \\leq |a| < 10"} display />
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Ejemplos reales con números de redes sociales:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Oyentes de Bad Bunny: <MathTex expr="{4.5 \\times 10^7}" /> = 45,000,000</li>
          <li>Usuarios TikTok Ecuador: <MathTex expr="{1.56 \\times 10^7}" /> = 15,600,000</li>
          <li>Visualizaciones top video: <MathTex expr="{8.5 \\times 10^9}" /> = 8,500,000,000</li>
          <li>Diamantes mínimos en Free Fire: <MathTex expr="{1 \\times 10^1}" /> = 10</li>
        </ul>
        <p className="text-xs text-amber-600 mt-2">
          💡 Exponente positivo = número grande | Exponente negativo = número pequeñito
        </p>
      </div>

      <InteractiveBox title="Convertidor: prueba con números de verdad">
        <NotacionConversor />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function RadicacionSection() {
  const quizQuestions = [
    {
      question: "Tu base cuadrada en Minecraft mide 144 bloques². ¿Cuántos bloques mide cada lado?",
      options: ["12", "72", "24", "144"],
      correctAnswer: 0,
      hint: "√144 = ? Busca el número que multiplicado por sí mismo da 144",
      reminder: "La raíz cuadrada es la inversa del cuadrado: si x² = a, entonces √a = x"
    },
    {
      question: "Si un cubo tiene volumen de 27 unidades³, ¿cuánto mide su arista?",
      options: ["3", "9", "6", "27"],
      correctAnswer: 0,
      hint: "³√27 = ? Busca el número que multiplicado 3 veces da 27",
      reminder: "³√a = b significa que b³ = a"
    },
    {
      question: "¿Cuál es el valor de √(9 + 16)?",
      options: ["5", "7", "25", "3 + 4 = 7"],
      correctAnswer: 0,
      hint: "√(25) = 5. ¡No es √9 + √16!",
      reminder: "√(a+b) ≠ √a + √b. La raíz NO se distribuye sobre sumas."
    }
  ]

  return (
    <TopicCard title="Radicación de Números Reales" icon="√" color="bg-bloque1">
      <WhySection>
        Si en Minecraft tienes un terreno cuadrado de 144 bloques², ¿cuántos bloques mide cada lado? √144 = 12.
        <br />
        En Free Fire, calcular la distancia más corta entre dos puntos del mapa usa raíces (Pitágoras). Las raíces son esenciales para entender áreas y volúmenes.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Distribuir la raíz sobre sumas: √(9+16) = √25 = 5, NO √9 + √16 = 7.",
          "Olvidar que raíz cuadrada de negativo NO existe en reales: √(-4) no es real.",
          "Confundir índice con radicando: ³√27 es diferente de √27 (que sería ²√27)."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        La <GlossaryTerm term="Radicación" definition="Operación inversa de la potenciación. Si bⁿ = a, entonces ⁿ√a = b">radicación</GlossaryTerm> es la operación inversa de la potenciación.
        Si potenciar es "¿cuánto da 3 elevado a 2?" (respuesta: 9),
        la raíz pregunta "¿qué número elevado a 2 da 9?" (respuesta: 3).
      </p>

      <div className="text-center my-4">
        <MathTex expr={"\\sqrt[n]{a} = b \\quad \\Leftrightarrow \\quad b^n = a"} display />
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="font-semibold text-amber-800 mb-2">Propiedades de radicales:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-2"><MathTex expr={"\\sqrt[n]{a \\cdot b} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"\\sqrt[n]{\\frac{a}{b}} = \\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"\\sqrt[n]{a^m} = a^{m/n}"} /></div>
          <div className="bg-white rounded p-2"><MathTex expr={"\\sqrt[m]{\\sqrt[n]{a}} = \\sqrt[m \\cdot n]{a}"} /></div>
        </div>
      </div>

      <InteractiveBox title="Calculadora: áreas de bases en Minecraft">
        <RaizCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

export default function Bloque1() {
  const totalTemas = 4

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-2">Bloque 1</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Números Reales y Notación Científica</h1>
        <p className="text-gray-500 mt-2">Aproximación, potencias, notación científica y radicales</p>
      </div>

      <BlockProgress current={1} total={totalTemas} blockName="Bloque 1: Números Reales" />

      <AproximacionSection />
      
      <BlockProgress current={2} total={totalTemas} blockName="Bloque 1: Números Reales" />
      
      <PotenciacionSection />
      
      <BlockProgress current={3} total={totalTemas} blockName="Bloque 1: Números Reales" />
      
      <NotacionCientificaSection />
      
      <BlockProgress current={4} total={totalTemas} blockName="Bloque 1: Números Reales" />
      
      <RadicacionSection />

      <ExpressSummary color="bg-amber-500">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="font-bold text-amber-800 text-sm">📍 Truncar vs Redondear</p>
            <p className="text-xs text-gray-600 mt-1">Truncar = cortar decimales. Redondear = revisar siguiente dígito (≥5 sube, &lt;5 queda).</p>
            <p className="text-xs text-gray-500 mt-1">Ej: 3.14159 → truncado a 2 dec: 3.14, redondeado: 3.14</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="font-bold text-amber-800 text-sm">⚡ Leyes de exponentes esenciales</p>
            <div className="text-xs text-gray-600 mt-1 grid grid-cols-2 gap-1">
              <span>aᵐ · aⁿ = a^(m+n)</span>
              <span>a⁰ = 1</span>
              <span>(aᵐ)ⁿ = a^(m·n)</span>
              <span>a⁻ⁿ = 1/aⁿ</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="font-bold text-amber-800 text-sm">🔬 Notación científica</p>
            <p className="text-xs text-gray-600 mt-1">a × 10ⁿ donde 1 ≤ |a| &lt; 10</p>
            <p className="text-xs text-gray-500 mt-1">Ej: 45,000,000 = 4.5 × 10⁷</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <p className="font-bold text-amber-800 text-sm">√ Radicación</p>
            <p className="text-xs text-gray-600 mt-1">ⁿ√a = b ↔ bⁿ = a</p>
            <p className="text-xs text-red-500 mt-1">⚠️ √(a+b) ≠ √a + √b</p>
          </div>
        </div>
      </ExpressSummary>
    </div>
  )
}
