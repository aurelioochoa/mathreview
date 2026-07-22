import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import MathTex from '../components/MathTex'
import MiniQuiz from '../components/MiniQuiz'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import BlockProgress from '../components/BlockProgress'
import ExpressSummary from '../components/ExpressSummary'
import GlossaryTerm from '../components/GlossaryTerm'
import EstadisticaCalculadora from '../widgets/EstadisticaCalculadora'
import BoxPlot from '../widgets/BoxPlot'
import PermutacionesCalculadora from '../widgets/PermutacionesCalculadora'
import CombinacionesCalculadora from '../widgets/CombinacionesCalculadora'
import AtuendosEjemplo from '../widgets/AtuendosEjemplo'

function MediaMedianaModa() {
  const quizQuestions = [
    {
      question: "¿Cuál es la media de: 10, 20, 30, 40, 50?",
      options: ["20", "25", "30", "40"],
      correctAnswer: 2,
      hint: "Suma = 150, n = 5. Media = 150/5 = 30",
      reminder: "Media = suma de todos los valores / número de valores"
    },
    {
      question: "¿Cuál es la mediana de: 3, 7, 1, 9, 5?",
      options: ["3", "5", "7", "9"],
      correctAnswer: 1,
      hint: "Ordenados: 1, 3, 5, 7, 9. El del medio es 5",
      reminder: "Mediana = valor del medio cuando los datos están ordenados"
    },
    {
      question: "En los datos: 2, 3, 3, 4, 5, 5, 5, ¿cuál es la moda?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 3,
      hint: "El 5 aparece 3 veces, más que cualquier otro",
      reminder: "Moda = valor que más se repite"
    }
  ]

  return (
    <TopicCard title="Media, Mediana y Moda" icon="📊" color="bg-bloque6">
      <WhySection>
        Ves las estadísticas de tu cuenta de Free Fire: kills promedio por partida, puntuación máxima frecuente.
        <br />
        Eso es estadística: entender tus datos para mejorar tu juego.
        <br />
        La media te da el promedio, la mediana el valor central, la moda lo más común.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Calcular la mediana sin ordenar los datos primero — siempre ordena de menor a mayor.",
          "Confundir moda con media: la moda es el valor más frecuente, no el promedio.",
          "Olvidar que si hay cantidad par de datos, la mediana es el promedio de los dos del centro."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Las <GlossaryTerm term="Medidas de tendencia central" definition="Valores que representan el centro de un conjunto de datos: media, mediana y moda">medidas de tendencia central</GlossaryTerm> te dicen dónde está el "centro" de un grupo de datos.
        Es como buscar el jugador "promedio" de un equipo de fútbol.
      </p>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-bold text-pink-600">Media</p>
            <p>El <strong>promedio</strong>: suma todos los valores y divide entre cuántos son.</p>
            <MathTex expr={"\\bar{x} = \\frac{\\sum x_i}{n}"} />
            <p className="text-xs text-gray-500 mt-1">Como repartir todo en partes iguales</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-bold text-purple-600">Mediana</p>
            <p>El valor del <strong>medio</strong> cuando ordenas los datos.</p>
            <p className="text-xs text-gray-500 mt-1">Si hay cantidad par, es el promedio de los dos del centro</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-lg font-bold text-orange-600">Moda</p>
            <p>El valor que <strong>más se repite</strong>.</p>
            <p className="text-xs text-gray-500 mt-1">Como la canción más escuchada del playlist</p>
          </div>
        </div>
      </div>

      <InteractiveBox title="Calculadora interactiva">
        <EstadisticaCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function PercentilesSection() {
  const quizQuestions = [
    {
      question: "Si estás en el percentil 75 de una clase, ¿qué significa?",
      options: ["Sacaste 75 puntos", "Le ganaste al 75% de la clase", "Estás en el lugar 75", "El 75% sacó más que tú"],
      correctAnswer: 1,
      hint: "Percentil 75 = le ganaste al 75% de los estudiantes",
      reminder: "Percentil P = le ganas al P% de los datos."
    },
    {
      question: "¿Qué cuartil es igual a la mediana?",
      options: ["Q1", "Q2", "Q3", "Ninguno"],
      correctAnswer: 1,
      hint: "Q2 = Percentil 50 = mediana (el valor del medio)",
      reminder: "Q2 divide los datos en dos mitades iguales, igual que la mediana."
    },
    {
      question: "En los datos ordenados: 2, 4, 6, 8, 10, ¿cuál es Q1 (percentil 25)?",
      options: ["2", "4", "6", "8"],
      correctAnswer: 0,
      hint: "Q1 es el valor en el 25% de los datos. Con 5 datos, está cerca del primer valor.",
      reminder: "Q1 = percentil 25, aproximadamente el valor que deja 1/4 de los datos debajo."
    }
  ]

  return (
    <TopicCard title="Percentiles, Deciles y Cuartiles" icon="📉" color="bg-bloque6">
      <WhySection>
        En tu ranking de Free Fire, estás en el top 10% de jugadores.
        <br />
        Eso significa que le ganas al 90% de los jugadores — estás en el percentil 90.
        <br />
        Los percentiles te dicen dónde te posicionas respecto a otros.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir percentil 80 con 'sacaste 80 puntos' — no, significa que le ganaste al 80%.",
          "Olvidar que Q2 (cuartil 2) es la mediana, no Q1.",
          "Pensar que hay 4 cuartiles — en realidad son 3 puntos que dividen en 4 partes."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Los <GlossaryTerm term="Cuartiles" definition="Valores que dividen un conjunto de datos en 4 partes iguales: Q1 (25%), Q2 (50% = mediana), Q3 (75%)">cuartiles</GlossaryTerm> dividen tus datos en <strong>4 partes iguales</strong>.
        Los <strong>deciles</strong> en 10 partes y los <strong>percentiles</strong> en 100 partes.
        Es como cuando en un examen te dicen "estás en el percentil 80": quiere decir que le ganaste al 80% de los estudiantes.
      </p>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <p className="font-semibold text-pink-800 mb-2">Relación entre ellos:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="glass rounded-md p-2 text-center">
            <strong>Cuartil 1 (Q1)</strong><br />= Percentil 25<br />= Decil 2.5
          </div>
          <div className="glass rounded-md p-2 text-center">
            <strong>Cuartil 2 (Q2)</strong><br />= Mediana<br />= Percentil 50
          </div>
          <div className="glass rounded-md p-2 text-center">
            <strong>Cuartil 3 (Q3)</strong><br />= Percentil 75<br />= Decil 7.5
          </div>
        </div>
      </div>

      <InteractiveBox title="Diagrama de caja (Box Plot)">
        <BoxPlot />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function PermutacionesSection() {
  const quizQuestions = [
    {
      question: "¿De cuántas formas puedes ordenar 3 libros en un estante de 5?",
      options: ["10", "20", "60", "120"],
      correctAnswer: 2,
      hint: "P(5,3) = 5!/(5-3)! = 120/2 = 60",
      reminder: "Permutación: orden SÍ importa. P(n,r) = n!/(n-r)!"
    },
    {
      question: "¿Qué es 5! (factorial de 5)?",
      options: ["25", "120", "5", "15"],
      correctAnswer: 1,
      hint: "5! = 5 × 4 × 3 × 2 × 1 = 120",
      reminder: "n! = n × (n-1) × (n-2) × ... × 1"
    },
    {
      question: "¿Cuándo usas permutaciones en vez de combinaciones?",
      options: ["Cuando el orden no importa", "Cuando el orden SÍ importa", "Cuando hay menos elementos", "Nunca"],
      correctAnswer: 1,
      hint: "Permutaciones cuando el orden importa (pódium, contraseñas, PIN)",
      reminder: "Permutación: orden importa. Combinación: orden no importa."
    }
  ]

  return (
    <TopicCard title="Permutaciones" icon="🔢" color="bg-bloque6">
      <WhySection>
        Creando un código PIN para tu celular: 4 dígitos donde cada orden es diferente.
        <br />
        1234 es diferente de 4321 — eso es permutación.
        <br />
        Las permutaciones cuentan todas las formas posibles de ordenar cosas cuando el orden importa.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Usar permutaciones cuando el orden no importa — ahí se usa combinación.",
          "Olvidar que 0! = 1 (no es cero).",
          "Confundir n con r: n es el total disponible, r es cuántos vas a elegir."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Una <GlossaryTerm term="Permutación" definition="Número de formas de ordenar r elementos de un conjunto de n, cuando el orden SÍ importa: P(n,r) = n!/(n-r)!">permutación</GlossaryTerm> es cuando el <strong>orden SÍ importa</strong>.
        Piensa en los puestos de una carrera: no es lo mismo quedar 1°-2°-3° que 3°-2°-1°.
        ¡Son resultados diferentes!
      </p>

      <div className="text-center my-4">
        <MathTex expr={"P(n, r) = \\frac{n!}{(n-r)!}"} display />
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
        <PermutacionesCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function CombinacionesSection() {
  const quizQuestions = [
    {
      question: "¿De cuántas formas puedes elegir 3 amigos de un grupo de 8 para tu equipo?",
      options: ["24", "56", "336", "512"],
      correctAnswer: 1,
      hint: "C(8,3) = 8!/(3! × 5!) = 56. El orden no importa en un equipo.",
      reminder: "Combinación: orden NO importa. C(n,r) = n!/(r!(n-r)!)"
    },
    {
      question: "Una banda tiene 10 canciones y elige 5 para un álbum. ¿Cuántas formas?",
      options: ["252", "120", "50", "30240"],
      correctAnswer: 0,
      hint: "C(10,5) = 10!/(5! × 5!) = 252. El orden de las canciones en el álbum no importa para la selección.",
      reminder: "Para elegir elementos donde el orden no importa, usa combinaciones."
    },
    {
      question: "¿Cuál es la diferencia entre permutación y combinación?",
      options: ["No hay diferencia", "Permutación: orden importa. Combinación: orden no importa", "Combinación usa división, permutación no", "Permutación es solo para números pequeños"],
      correctAnswer: 1,
      hint: "Permutación cuenta ordenes diferentes como distintos. Combinación los trata como iguales.",
      reminder: "PIN (permutación): 1234 ≠ 4321. Equipo (combinación): {Ana, Beto} = {Beto, Ana}"
    }
  ]

  return (
    <TopicCard title="Combinaciones" icon="🎲" color="bg-bloque6">
      <p>
        Una <strong>combinación</strong> es cuando el <strong>orden NO importa</strong>.
        Si eliges 3 amigos para tu equipo, no importa en qué orden los elegiste — el equipo es el mismo.
      </p>

      <div className="text-center my-4">
        <MathTex expr={"C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}"} display />
      </div>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <p className="font-semibold text-pink-800 mb-2">¿Cuándo uso cada una?</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="glass rounded-md p-3 border-l-4 border-purple-400">
            <p className="font-bold">Permutación</p>
            <p>Orden <strong>SÍ</strong> importa</p>
            <p className="text-xs text-gray-500 mt-1">Contraseñas, podio, PIN</p>
          </div>
          <div className="glass rounded-md p-3 border-l-4 border-pink-400">
            <p className="font-bold">Combinación</p>
            <p>Orden <strong>NO</strong> importa</p>
            <p className="text-xs text-gray-500 mt-1">Equipos, canciones, lotería</p>
          </div>
        </div>
      </div>

      <InteractiveBox title="Calculadora de combinaciones">
        <CombinacionesCalculadora />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function PrincipioConteoSection() {
  const quizQuestions = [
    {
      question: "Tienes 4 camisas, 3 pantalones y 2 zapatos. ¿Cuántos atuendos diferentes puedes formar?",
      options: ["9", "12", "20", "24"],
      correctAnswer: 3,
      hint: "4 × 3 × 2 = 24. Multiplica las opciones de cada decisión.",
      reminder: "Principio de conteo: Total = n₁ × n₂ × n₃ × ..."
    },
    {
      question: "Un menú tiene 3 entradas, 5 platos principales y 2 postres. ¿Cuántos menús completos?",
      options: ["10", "15", "30", "25"],
      correctAnswer: 2,
      hint: "3 × 5 × 2 = 30 menús diferentes.",
      reminder: "Multiplica las opciones de cada elección independiente."
    },
    {
      question: "¿Cuándo usas el principio de conteo?",
      options: ["Cuando sumas cantidades", "Cuando tienes decisiones independientes seguidas", "Cuando restas valores", "Cuando divides números"],
      correctAnswer: 1,
      hint: "El principio de conteo aplica cuando tomas decisiones independientes una tras otra.",
      reminder: "Principio de conteo: para decisiones seguidas, multiplica las opciones."
    }
  ]

  return (
    <TopicCard title="Principio de Conteo" icon="👕" color="bg-bloque6">
      <p>
        El <strong>principio fundamental de conteo</strong> dice que si tienes que tomar varias decisiones
        seguidas, el total de posibilidades es <strong>multiplicar</strong> las opciones de cada decisión.
      </p>

      <div className="text-center my-4">
        <MathTex expr={"\\text{Total} = n_1 \\times n_2 \\times n_3 \\times \\ldots"} display />
      </div>

      <InteractiveBox title="Ejemplo: ¿Cuántos atuendos puedes formar?">
        <AtuendosEjemplo />
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

export default function Bloque6() {
  const totalTemas = 5

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-2">Bloque 6</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-gray-800">Estadística y Probabilidad</h1>
        <p className="text-gray-500 mt-2">Media, mediana, moda, percentiles, permutaciones y combinaciones</p>
      </div>

      <BlockProgress current={1} total={totalTemas} blockName="Bloque 6: Estadística" />
      <MediaMedianaModa />
      
      <BlockProgress current={2} total={totalTemas} blockName="Bloque 6: Estadística" />
      <PercentilesSection />
      
      <BlockProgress current={3} total={totalTemas} blockName="Bloque 6: Estadística" />
      <PrincipioConteoSection />
      
      <BlockProgress current={4} total={totalTemas} blockName="Bloque 6: Estadística" />
      <PermutacionesSection />
      
      <BlockProgress current={5} total={totalTemas} blockName="Bloque 6: Estadística" />
      <CombinacionesSection />

      <ExpressSummary color="bg-pink-500">
        <div className="space-y-4">
          <div className="glass rounded-xl p-3 border border-pink-200">
            <p className="font-bold text-pink-800 text-sm">📊 Media, Mediana y Moda</p>
            <p className="text-xs text-gray-600 mt-1">Media: promedio (suma/n)</p>
            <p className="text-xs text-gray-600">Mediana: valor del medio (datos ordenados)</p>
            <p className="text-xs text-gray-600">Moda: valor más frecuente</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-pink-200">
            <p className="font-bold text-pink-800 text-sm">📉 Percentiles y Cuartiles</p>
            <p className="text-xs text-gray-600 mt-1">Q1 = P25 (25% debajo), Q2 = Mediana = P50, Q3 = P75</p>
            <p className="text-xs text-pink-500">Percentil 80 = le ganas al 80% de los datos</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-pink-200">
            <p className="font-bold text-pink-800 text-sm">👕 Principio de Conteo</p>
            <p className="text-xs text-gray-600 mt-1">Decisiones seguidas: multiplica las opciones</p>
            <p className="text-xs text-gray-600">Total = n₁ × n₂ × n₃ × ...</p>
          </div>
          
          <div className="glass rounded-xl p-3 border border-pink-200">
            <p className="font-bold text-pink-800 text-sm">🎲 Permutaciones vs Combinaciones</p>
            <p className="text-xs text-gray-600 mt-1">Permutación: orden SÍ importa → P(n,r) = n!/(n-r)!</p>
            <p className="text-xs text-gray-600">Combinación: orden NO importa → C(n,r) = n!/(r!(n-r)!)</p>
          </div>
        </div>
      </ExpressSummary>
    </div>
  )
}
