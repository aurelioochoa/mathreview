import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const sg = (k) => (k >= 0 ? `+ ${k}` : `- ${-k}`)
const NO_CERO = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]

export function pendienteDe(rng = Math.random) {
  const m = NO_CERO[randInt(rng, 0, NO_CERO.length - 1)]
  const b = randInt(rng, -6, 6)
  return {
    question: `En f(x) = ${m}x ${sg(b)}, ¿cuál es la pendiente?`,
    ...makeOptions(m, [b, -m, m + b]),
    hint: 'En f(x) = mx + b, la pendiente es m (lo que multiplica a x).',
    reminder: 'Pendiente = m. Ordenada al origen = b.',
  }
}

export function corteEjeY(rng = Math.random) {
  const m = NO_CERO[randInt(rng, 0, NO_CERO.length - 1)]
  let b = randInt(rng, 1, 8) // positivo, distinto de 0
  if (Math.abs(m) === b) b += 1
  return {
    question: `¿Dónde corta el eje Y la función f(x) = ${m}x ${sg(b)}?`,
    ...makeOptions(`(0, ${b})`, [`(${b}, 0)`, `(0, ${m})`, `(0, ${-b})`]),
    hint: 'El corte con el eje Y ocurre cuando x = 0 → punto (0, b).',
    reminder: 'Corte con el eje Y = (0, b).',
  }
}

export function verticeParabola(rng = Math.random) {
  const noCero = (min, max) => { const v = randInt(rng, min, max); return v === 0 ? max : v }
  const h = noCero(-4, 4), k = noCero(-5, 5)
  const b = -2 * h, c = h * h + k // f(x) = x² + bx + c, vértice (h,k)
  return {
    question: `En f(x) = x² ${sg(b)}x ${sg(c)}, ¿cuál es el vértice?`,
    ...makeOptions(`(${h}, ${k})`, [`(${-h}, ${k})`, `(${h}, ${-k})`, `(0, ${c})`]),
    hint: `h = -b/2a = ${-b}/2 = ${h}; k = f(h) = ${k}.`,
    reminder: 'Vértice de la parábola: h = -b/2a, k = f(h).',
  }
}

export const mundo6 = {
  id: 'mundo6', slug: 'estacion-funciones', name: 'Estación de Funciones',
  emoji: '🚀', color: 'bg-bloque4',
  description: 'Funciones lineales y cuadráticas',
  levels: [
    {
      id: 'funcion-lineal', title: 'Función Lineal', icon: '📈',
      briefing: [
        { type: 'why', body: <>
          Tu progreso en un juego: ganas XP constante por hora jugada.
          <br />
          Eso es una función lineal: f(horas) = XP_por_hora × horas + XP_inicial.
          <br />
          Sirve para predecir cuándo subirás de nivel, cuánto necesitas farmear, etc.
        </> },
        { type: 'content', body: <>
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
        </> },
        { type: 'mistakes', items: [
          'Confundir pendiente con ordenada al origen: m es la inclinación, b es el corte con Y.',
          'Pensar que m = 0 significa que no hay recta — no, significa que es horizontal.',
          'Olvidar que el dominio de una función lineal es todos los reales (todos los x posibles).',
        ] },
        { type: 'widget', widgetId: 'pendiente-ordenada', title: 'Juega con la pendiente y la ordenada' },
      ],
      reto: { pick: 3, factories: [
        pendienteDe,
        corteEjeY,
        staticQuestion({ question: "Si m = -2, ¿qué tipo de recta es?", options: ["Sube", "Baja", "Horizontal", "Vertical"], correctAnswer: 1, hint: "m negativo → la recta baja (de izquierda a derecha)", reminder: "m > 0: sube, m < 0: baja, m = 0: horizontal." }),
      ] },
    },
    {
      id: 'funcion-cuadratica', title: 'Función Cuadrática', icon: '📉',
      briefing: [
        { type: 'why', body: <>
          En Minecraft, lanzas un objeto en arco: sube, llega a un punto máximo, y cae.
          <br />
          Esa trayectoria es una parábola — una función cuadrática.
          <br />
          También sirve para calcular áreas, tiempos de caída, y optimizar recursos.
        </> },
        { type: 'content', body: <>
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
        </> },
        { type: 'mistakes', items: [
          'Confundir el vértice: h = -b/2a, NO b/2a. El signo menos es importante.',
          'Olvidar que si a < 0, la parábola abre hacia abajo (el vértice es el máximo, no el mínimo).',
          'Calcular mal el discriminante: es b² - 4ac, no b² + 4ac.',
        ] },
        { type: 'widget', widgetId: 'parabola-explorer', title: 'Explora la parábola' },
      ],
      reto: { pick: 3, factories: [
        verticeParabola,
        staticQuestion({ question: "Si a parábola tiene a = -2, ¿hacia dónde abre?", options: ["Arriba (U)", "Abajo (∩)", "A la izquierda", "Es una recta"], correctAnswer: 1, hint: "a < 0 → abre hacia abajo (∩)", reminder: "a > 0: U hacia arriba. a < 0: ∩ hacia abajo." }),
        staticQuestion({ question: "El discriminante es Δ = b² - 4ac. Si Δ < 0, ¿qué pasa?", options: ["Dos raíces reales", "Una raíz doble", "No hay raíces reales", "Infinitas raíces"], correctAnswer: 2, hint: "Δ < 0 significa que no hay solución real (la raíz de negativo no es real)", reminder: "Δ > 0: 2 raíces. Δ = 0: 1 raíz doble. Δ < 0: no hay raíces reales." }),
      ] },
    },
  ],
}
