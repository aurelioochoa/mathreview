import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

export function cuadrantePunto(rng = Math.random) {
  const casos = [[1, 1, 'I'], [-1, 1, 'II'], [-1, -1, 'III'], [1, -1, 'IV']]
  const [sx, sy, cuad] = casos[randInt(rng, 0, 3)]
  const x = sx * randInt(rng, 1, 9), y = sy * randInt(rng, 1, 9)
  return {
    question: `¿En qué cuadrante está el punto (${x}, ${y})?`,
    ...makeOptions(cuad, ['I', 'II', 'III', 'IV'].filter(c => c !== cuad)),
    hint: `x ${x > 0 ? 'positivo' : 'negativo'}, y ${y > 0 ? 'positivo' : 'negativo'}.`,
    reminder: 'Cuadrantes: I (+,+), II (−,+), III (−,−), IV (+,−).',
  }
}

export function cramerDeterminante(rng = Math.random) {
  const a = randInt(rng, 1, 5), b = randInt(rng, 1, 5), c = randInt(rng, 1, 5)
  let d = randInt(rng, -5, 5)
  if (a * d - c * b === 0) d += 1 // evita D = 0 sin bucle
  const D = a * d - c * b
  const b2 = d >= 0 ? `${d}` : `(${d})`
  return {
    question: `Para el sistema { ${a}x + ${b}y = k₁,  ${c}x + ${b2}y = k₂ }, ¿cuánto vale el determinante D?`,
    ...makeOptions(D, [a * d + c * b, -(a * d - c * b), a * b - c * d]),
    hint: `D = a₁b₂ − a₂b₁ = (${a})(${d}) − (${c})(${b}).`,
    reminder: 'D = a₁b₂ − a₂b₁. Cruza y resta.',
  }
}

export const mundo5 = {
  id: 'mundo5', slug: 'laberinto-sistemas', name: 'Laberinto de Sistemas',
  emoji: '🌀', color: 'bg-bloque3',
  description: 'Sistemas 2×2: introducción, método gráfico, reducción y Cramer',
  boss: { name: 'El Minotauro del Laberinto', emoji: '🐂', intro: 'Sin resolver sus sistemas, no hay salida del laberinto.' },
  levels: [
    {
      id: 'intro-sistemas', title: 'Introducción a los Sistemas 2×2', icon: '🔀',
      briefing: [
        { type: 'why', body: <>
          Cuando juegas con tu squad, dos jugadores suben de nivel a diferente velocidad.
          <br />
          ¿Cuándo alcanzan el mismo nivel? ¡Eso es un sistema lineal!
          <br />
          Los sistemas 2×2 aparecen en balanzas, economías, y cualquier situación con dos cantidades que cambian.
        </> },
        { type: 'content', body: <>
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
        </> },
        { type: 'mistakes', items: [
          "Confundir 'no hay solución' con 'la solución es cero' — no, significa que las rectas nunca se cruzan.",
          'Olvidar que el punto de intersección tiene coordenadas (x, y), no solo x.',
          'Pensar que todas las soluciones están en el primer cuadrante — pueden estar en cualquiera.',
        ] },
      ],
      reto: { pick: 3, factories: [
        cuadrantePunto,
        staticQuestion({ question: "Si dos rectas son paralelas en el plano cartesiano, ¿qué pasa con el sistema?", options: ["Tiene una solución", "No tiene solución", "Tiene infinitas soluciones", "Se vuelven perpendiculares"], correctAnswer: 1, hint: "Paralelas nunca se cruzan → no hay punto de intersección", reminder: "Paralelas = no hay solución. Misma recta = infinitas soluciones." }),
        staticQuestion({ question: "Dos jugadores de Free Fire: A gana 50 puntos por kill, B gana 30 por kill pero empezó con 100 puntos extra. ¿Qué sistema representa esto?", options: ["50x = 30x + 100", "50 + x = 30 + x", "50x + 30y = 100", "x = 50, y = 30"], correctAnswer: 0, hint: "Jugador A: 50x, Jugador B: 30x + 100. Iguala: 50x = 30x + 100", reminder: "Iguala las dos expresiones para encontrar cuándo tienen lo mismo." }),
      ] },
    },
    {
      id: 'metodo-grafico', title: 'Método Gráfico', icon: '📊',
      briefing: [
        { type: 'why', body: <>
          Un sistema de ecuaciones te dice dónde se cruzan dos cosas.
          <br />
          Dos streamers cobran diferente: uno cobra $500 base + $2 por viewer, otro $200 + $5 por viewer.
          <br />
          ¿Con cuántos viewers ganan igual? Ese punto de cruce es la solución del sistema.
        </> },
        { type: 'content', body: <>
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
              <div className="glass rounded-md p-2 text-center">
                <p className="font-bold text-blue-600">Se cruzan en 1 punto</p>
                <p className="text-xs">→ Una solución única</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className="font-bold text-yellow-600">Son la misma recta</p>
                <p className="text-xs">→ Infinitas soluciones</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className="font-bold text-red-600">Son paralelas</p>
                <p className="text-xs">→ No hay solución</p>
              </div>
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Si las rectas son paralelas, pensar que hay error en el cálculo — no, significa que no hay solución.',
          'Si son la misma recta, pensar que hay una solución — en realidad hay infinitas.',
          'Confundir x con y en el plano cartesiano: x es horizontal (izquierda-derecha), y es vertical (arriba-abajo).',
        ] },
        { type: 'widget', widgetId: 'sistemas-grafica', title: 'Gráfica interactiva — Mueve los coeficientes' },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({ question: "Si dos rectas se cruzan en un punto, ¿cuántas soluciones tiene el sistema?", options: ["0", "1", "Infinitas", "2"], correctAnswer: 1, hint: "Un punto de cruce = una solución única (x,y)", reminder: "Se cruzan en 1 punto → una solución única." }),
        staticQuestion({ question: "Dos streamers: A cobra $100 + $3/viewer, B cobra $50 + $5/viewer. ¿Qué resuelves para saber cuándo ganan igual?", options: ["100 + 3x = 50 + 5x", "100x + 3 = 50x + 5", "3x + 5x = 100 + 50", "100 - 50 = 5 - 3"], correctAnswer: 0, hint: "Iguala los ingresos: 100 + 3x (streamer A) = 50 + 5x (streamer B)", reminder: "En un sistema, igualas las dos expresiones para encontrar el punto de cruce." }),
        staticQuestion({ question: "Si D = 0 en el método de Cramer, ¿qué significa?", options: ["Hay una solución única", "No hay solución o hay infinitas", "El sistema está mal planteado", "Hay que usar otro método"], correctAnswer: 1, hint: "D = 0 significa que las rectas son paralelas (no solución) o coincidentes (infinitas)", reminder: "Determinante D = 0 → las rectas no se cruzan en un punto único." }),
      ] },
    },
    {
      id: 'reduccion', title: 'Método de Reducción', icon: '➖',
      briefing: [
        { type: 'why', body: <>
          Dos amigos quieren comprar el mismo videojuego.
          <br />
          El primero ahorra $20/semana, el segundo $30/semana pero empezó después.
          <br />
          ¿Cuándo tendrán el mismo dinero? La reducción te ayuda a eliminar variables y resolverlo.
        </> },
        { type: 'content', body: <>
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
        </> },
        { type: 'mistakes', items: [
          'No multiplicar TODA la ecuación cuando igualas coeficientes.',
          'Olvidar sustituir al final para encontrar la segunda variable.',
          'Sumar en vez de restar (o viceversa) cuando los coeficientes ya son opuestos.',
        ] },
        { type: 'content', body: <>
          <p className="font-semibold mb-2">Ejemplo paso a paso:</p>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>
              <p className="font-medium">Sistema original</p>
              <MathTex expr={'\\begin{cases} 2x + 3y = 12 \\\\ 4x - 3y = 6 \\end{cases}'} display />
            </li>
            <li>
              <p className="font-medium">Paso 1: Buscar coeficientes opuestos</p>
              <MathTex expr={'\\text{Los coeficientes de } y \\text{ son } +3 \\text{ y } -3 \\text{ → ¡ya son opuestos!}'} display />
            </li>
            <li>
              <p className="font-medium">Paso 2: Sumar las ecuaciones</p>
              <MathTex expr={'(2x + 3y) + (4x - 3y) = 12 + 6 \\\\[6pt] 6x = 18'} display />
            </li>
            <li>
              <p className="font-medium">Paso 3: Despejar x</p>
              <MathTex expr={'x = \\frac{18}{6} = 3'} display />
            </li>
            <li>
              <p className="font-medium">Paso 4: Sustituir en una ecuación</p>
              <MathTex expr={'2(3) + 3y = 12 \\\\[4pt] 6 + 3y = 12 \\\\[4pt] 3y = 6 \\\\[4pt] y = 2'} display />
            </li>
            <li>
              <p className="font-medium">Solución</p>
              <MathTex expr={'\\boxed{x = 3, \\quad y = 2}'} display />
            </li>
          </ol>
        </> },
      ],
      reto: { pick: 3, factories: [
        staticQuestion({ question: "En el sistema {2x + 3y = 12, 4x - 3y = 6}, ¿por qué sumar elimina la y?", options: ["Porque 3 + 3 = 0", "Porque 3 + (-3) = 0", "Porque 3 × 3 = 9", "No se elimina"], correctAnswer: 1, hint: "Los coeficientes de y son +3 y -3. Al sumar: 3y + (-3y) = 0", reminder: "Para eliminar una variable, necesitas coeficientes opuestos (uno positivo, otro negativo)." }),
        staticQuestion({ question: "Después de eliminar una variable y encontrar x = 4, ¿qué haces?", options: ["Ya terminaste", "Sustituyes x = 4 en cualquier ecuación original para hallar y", "Eliminas la otra variable", "Divides entre 4"], correctAnswer: 1, hint: "Con x = 4, reemplazas en una ecuación original (ej: 2(4) + 3y = 12) y despejas y", reminder: "Después de encontrar una variable, sustitúyela para hallar la otra." }),
        staticQuestion({ question: "¿Cuál es el objetivo del método de reducción?", options: ["Sumar todas las ecuaciones", "Eliminar una variable para resolver la otra", "Multiplicar los coeficientes", "Graficar las rectas"], correctAnswer: 1, hint: "La idea es eliminar una variable sumando/restando, para que solo quede una incógnita", reminder: "Reducción = eliminar una variable → resolver la otra → sustituir." }),
      ] },
    },
    {
      id: 'cramer', title: 'Método de Cramer', icon: '🎯',
      briefing: [
        { type: 'why', body: <>
          Necesitas resolver muchos sistemas rápido. Cramer te da una fórmula directa.
          <br />
          Es como tener una calculadora programada: solo metes los números y te da la respuesta.
          <br />
          Útil cuando tienes sistemas 2×2 y quieres la respuesta sin graficar.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            La <GlossaryTerm term="Regla de Cramer" definition="Método que usa determinantes para resolver sistemas de ecuaciones lineales">Regla de Cramer</GlossaryTerm> usa <strong>determinantes</strong> (un cálculo con los números de la ecuación)
            para encontrar directamente x e y. Es como una "fórmula mágica" para sistemas 2×2.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="font-semibold text-blue-800 mb-2">Las fórmulas:</p>
            <div className="text-center space-y-3">
              <MathTex expr={"D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix} = a_1 b_2 - a_2 b_1"} display />
              <MathTex expr={"x = \\frac{D_x}{D} = \\frac{\\begin{vmatrix} c_1 & b_1 \\\\ c_2 & b_2 \\end{vmatrix}}{D}"} display />
              <MathTex expr={"y = \\frac{D_y}{D} = \\frac{\\begin{vmatrix} a_1 & c_1 \\\\ a_2 & c_2 \\end{vmatrix}}{D}"} display />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 El determinante es "cruzar y restar": diagonal principal menos diagonal secundaria.
            </p>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Confundir el orden de los coeficientes en el determinante.',
          'Olvidar que si D = 0, no hay solución única (no puedes dividir entre 0).',
          'Calcular mal el determinante: es (a₁)(b₂) - (a₂)(b₁), no (a₁)(b₁) - (a₂)(b₂).',
        ] },
        { type: 'widget', widgetId: 'cramer-calculadora', title: 'Calculadora de Cramer' },
      ],
      reto: { pick: 3, factories: [
        cramerDeterminante,
        staticQuestion({ question: "Para ese mismo sistema, D = -18 y Dx = -54. ¿Cuánto vale x?", options: ["2", "-2", "3", "-3"], correctAnswer: 2, hint: "x = Dx/D = -54/-18 = 3", reminder: "x = Dx/D, y = Dy/D. Divide los determinantes." }),
        staticQuestion({ question: "¿Qué significa cuando el determinante D = 0?", options: ["Hay una solución única", "El sistema no tiene solución o tiene infinitas", "El cálculo está mal", "x = 0 e y = 0"], correctAnswer: 1, hint: "D = 0 significa que las rectas son paralelas o coincidentes", reminder: "Si D = 0, no puedes dividir → no hay solución única." }),
      ] },
    },
  ],
}
