import MathTex from '../../components/MathTex'
import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]]
const NOMBRE_POLIGONO = { 3: 'triangular', 4: 'rectangular', 5: 'pentagonal', 6: 'hexagonal', 7: 'heptagonal', 8: 'octagonal', 9: 'eneagonal', 10: 'decagonal' }

export function hipotenusa(rng = Math.random) {
  const [a, b, c] = TRIPLES[randInt(rng, 0, TRIPLES.length - 1)]
  return {
    question: `Un triángulo rectángulo tiene catetos de ${a} y ${b}. ¿Cuánto mide la hipotenusa?`,
    ...makeOptions(c, [a + b, a * a + b * b, Math.max(a, b)]),
    hint: `c = √(${a}² + ${b}²) = √${a * a + b * b}.`,
    reminder: 'a² + b² = c². La hipotenusa es el lado más largo.',
  }
}

export function catetoFaltante(rng = Math.random) {
  const [a, b, c] = TRIPLES[randInt(rng, 0, TRIPLES.length - 1)]
  return {
    question: `La hipotenusa mide ${c} y un cateto mide ${a}. ¿Cuánto mide el otro cateto?`,
    ...makeOptions(b, [c - a, c * c - a * a, c]),
    hint: `b = √(${c}² − ${a}²) = √${c * c - a * a}.`,
    reminder: 'Despeja: b² = c² − a².',
  }
}

export function senOpuesto(rng = Math.random) {
  const hyp = randInt(rng, 2, 12) * 2 // par → opuesto entero
  const op = hyp / 2 // sen(30°) = 0.5
  return {
    question: `En un triángulo rectángulo con un ángulo de 30° y una hipotenusa de ${hyp}, ¿cuánto mide el cateto opuesto?`,
    ...makeOptions(op, [hyp, hyp * 2, op + 1]),
    hint: 'sen(30°) = 0.5 → opuesto = hipotenusa × 0.5.',
    reminder: 'sen(α) = opuesto/hipotenusa → opuesto = hipotenusa × sen(α).',
  }
}

export function cosAdyacente(rng = Math.random) {
  const hyp = randInt(rng, 2, 12) * 2
  const adj = hyp / 2 // cos(60°) = 0.5
  return {
    question: `Con un ángulo de 60° y una hipotenusa de ${hyp}, ¿cuánto mide el cateto adyacente?`,
    ...makeOptions(adj, [hyp, hyp * 2, adj + 1]),
    hint: 'cos(60°) = 0.5 → adyacente = hipotenusa × 0.5.',
    reminder: 'cos(α) = adyacente/hipotenusa → adyacente = hipotenusa × cos(α).',
  }
}

export function areaLateralCilindro(rng = Math.random) {
  const r = randInt(rng, 2, 9), h = randInt(rng, 2, 12)
  const coef = 2 * r * h // A_L = 2πrh
  // Distractores como múltiplos distintos de rh (coefs {1,3,4} vs correcto 2) →
  // 4 opciones "kπ" siempre distintas; el correcto es string y makeOptions no
  // puede rellenar numéricamente, así que los distractores deben venir distintos.
  return {
    question: `Un cilindro tiene radio ${r} y altura ${h}. ¿Cuál es su área lateral?`,
    ...makeOptions(`${coef}π`, [`${r * h}π`, `${3 * r * h}π`, `${4 * r * h}π`]),
    hint: `A_L = 2πrh = 2π(${r})(${h}) = ${coef}π.`,
    reminder: 'Área lateral del cilindro = 2π·r·h.',
  }
}

export function areaLateralPrisma(rng = Math.random) {
  const l = randInt(rng, 2, 8), w = randInt(rng, 2, 8), h = randInt(rng, 3, 10)
  const per = 2 * (l + w)
  return {
    question: `Un prisma rectangular mide ${l}×${w}×${h}. ¿Cuál es su área lateral?`,
    ...makeOptions(per * h, [l * w * h, 2 * (l * w + l * h + w * h), per]),
    hint: `Perímetro de la base = 2(${l}+${w}) = ${per}; A_L = ${per}×${h}.`,
    reminder: 'Área lateral del prisma = perímetro de la base × altura.',
  }
}

export function carasPrisma(rng = Math.random) {
  const n = randInt(rng, 3, 10)
  return {
    question: `¿Cuántas caras tiene un prisma ${NOMBRE_POLIGONO[n]} (base de ${n} lados)?`,
    ...makeOptions(n + 2, [n, 2 * n, n + 1]),
    hint: 'Un prisma de n lados: n caras laterales + 2 bases.',
    reminder: 'Caras = n + 2.',
  }
}

export function aristasPrisma(rng = Math.random) {
  const n = randInt(rng, 3, 10)
  return {
    question: `Un prisma ${NOMBRE_POLIGONO[n]} tiene base de ${n} lados. ¿Cuántas aristas tiene?`,
    ...makeOptions(3 * n, [2 * n, n + 2, n * n]),
    hint: 'Aristas = 3n (n de cada base + n verticales).',
    reminder: 'Prisma de n lados: Vértices 2n, Aristas 3n, Caras n+2.',
  }
}

export const mundo7 = {
  id: 'mundo7', slug: 'montanas-geometria', name: 'Montañas de Geometría',
  emoji: '⛰️', color: 'bg-bloque5',
  description: 'Pitágoras, trigonometría, cilindro y prisma',
  levels: [
    {
      id: 'pitagoras', title: 'Teorema de Pitágoras', icon: '📐',
      briefing: [
        { type: 'why', body: <>
          En Minecraft, quieres construir una rampa diagonal entre dos puntos.
          <br />
          ¿Cuántos bloques necesitas? Pitágoras te da la distancia exacta.
          <br />
          También sirve para verificar ángulos rectos: si 3² + 4² = 5², ¡el ángulo es de 90°!
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            El <GlossaryTerm term="Teorema de Pitágoras" definition="En un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: a² + b² = c²">Teorema de Pitágoras</GlossaryTerm> es probablemente la fórmula más famosa de las matemáticas.
            Dice que en un <strong>triángulo rectángulo</strong> (el que tiene un ángulo de 90°),
            el lado más largo (hipotenusa) al cuadrado es igual a la suma de los cuadrados de los otros dos lados (catetos).
          </p>
          <div className="text-center my-4">
            <MathTex expr={"a^2 + b^2 = c^2"} display />
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">¿Por qué funciona? — Demostración con áreas</p>
            <p className="text-sm">
              Imagina que construyes un <strong>cuadrado</strong> en cada lado del triángulo.
              El área del cuadrado grande (sobre la hipotenusa) es <strong>exactamente igual</strong> a
              la suma de las áreas de los otros dos cuadrados.
              Es como si pudieras "llenar" el cuadrado grande con las piezas de los dos pequeños.
            </p>
            <div className="mt-2 text-sm">
              <p>Ejemplo clásico: Triángulo 3-4-5</p>
              <MathTex expr={"3^2 + 4^2 = 9 + 16 = 25 = 5^2 \\quad \\checkmark"} display />
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Confundir catetos con hipotenusa: la hipotenusa es SIEMPRE el lado más largo (frente al ángulo de 90°).',
          'Olvidar elevar al cuadrado: es a² + b² = c², no a + b = c.',
          'Usar Pitágoras en triángulos que NO son rectángulos — el teorema solo aplica a triángulos con ángulo de 90°.',
        ] },
        { type: 'widget', widgetId: 'pitagoras-calculadora', title: 'Calculadora de Pitágoras' },
      ],
      reto: { pick: 3, factories: [
        hipotenusa, catetoFaltante,
        staticQuestion({ question: "¿Cuál es el Teorema de Pitágoras?", options: ["a + b = c", "a² + b² = c²", "a × b = c", "a² × b² = c²"], correctAnswer: 1, hint: "Es la suma de los CUADRADOS de los catetos igual al CUADRADO de la hipotenusa.", reminder: "a² + b² = c², donde c es la hipotenusa (el lado más largo, frente al ángulo recto)." }),
      ] },
    },
    {
      id: 'trigonometria', title: 'Razones Trigonométricas', icon: '📐',
      briefing: [
        { type: 'content', body: <>
          <p>
            Las <strong>razones trigonométricas</strong> relacionan los <strong>ángulos</strong> de un triángulo rectángulo
            con sus <strong>lados</strong>. Son como "recetas" que te dicen cuánto mide cada lado según el ángulo.
          </p>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">Las tres razones principales (SOH-CAH-TOA):</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="glass rounded-xl p-3">
                <p className="text-2xl font-bold text-red-500">Sen</p>
                <MathTex expr={"\\sin(\\alpha) = \\frac{\\text{opuesto}}{\\text{hipotenusa}}"} />
                <p className="text-xs text-gray-500 mt-1"><strong>S</strong>eno = <strong>O</strong>puesto / <strong>H</strong>ipotenusa</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-2xl font-bold text-blue-500">Cos</p>
                <MathTex expr={"\\cos(\\alpha) = \\frac{\\text{adyacente}}{\\text{hipotenusa}}"} />
                <p className="text-xs text-gray-500 mt-1"><strong>C</strong>oseno = <strong>A</strong>dyacente / <strong>H</strong>ipotenusa</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-2xl font-bold text-green-500">Tan</p>
                <MathTex expr={"\\tan(\\alpha) = \\frac{\\text{opuesto}}{\\text{adyacente}}"} />
                <p className="text-xs text-gray-500 mt-1"><strong>T</strong>angente = <strong>O</strong>puesto / <strong>A</strong>dyacente</p>
              </div>
            </div>
            <p className="text-xs text-center text-red-600 mt-2">
              💡 Truco para memorizar: "<strong>SOH-CAH-TOA</strong>" — las iniciales de cada fórmula
            </p>
          </div>
        </> },
        { type: 'widget', widgetId: 'triangulo-interactivo', title: 'Triángulo interactivo — Cambia el ángulo' },
      ],
      reto: { pick: 3, factories: [
        senOpuesto, cosAdyacente,
        staticQuestion({ question: "¿Qué significa SOH-CAH-TOA?", options: ["Una marca de autos", "Un truco para memorizar seno, coseno y tangente", "Una fórmula de áreas", "Un tipo de triángulo"], correctAnswer: 1, hint: "SOH: Seno = Opuesto/Hipotenusa, CAH: Coseno = Adyacente/Hipotenusa, TOA: Tangente = Opuesto/Adyacente", reminder: "SOH-CAH-TOA te ayuda a recordar las razones trigonométricas." }),
      ] },
    },
    {
      id: 'cilindro', title: 'El Cilindro', icon: '🥫',
      briefing: [
        { type: 'content', body: <>
          <p>
            Un <strong>cilindro</strong> es como una lata de refresco: dos círculos (tapas) unidos por una superficie curva.
            Si "desenrollas" la superficie curva, obtienes un <strong>rectángulo</strong>. ¡Esa es su red o patrón!
          </p>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">Fórmulas del cilindro:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="glass rounded-md p-3 text-center">
                <p className="font-bold">Área Lateral</p>
                <MathTex expr={"A_L = 2\\pi r \\cdot h"} />
                <p className="text-xs text-gray-500 mt-1">Rectángulo desenrollado: base = perímetro del círculo</p>
              </div>
              <div className="glass rounded-md p-3 text-center">
                <p className="font-bold">Área Total</p>
                <MathTex expr={"A_T = 2\\pi r h + 2\\pi r^2"} />
                <p className="text-xs text-gray-500 mt-1">Lateral + 2 tapas circulares</p>
              </div>
            </div>
          </div>
        </> },
        { type: 'widget', widgetId: 'cilindro-calculadora', title: 'Calculadora del cilindro' },
      ],
      reto: { pick: 3, factories: [
        areaLateralCilindro,
        staticQuestion({ question: "¿Cuál es el área total de un cilindro?", options: ["Solo el área lateral", "Área lateral + área de las dos tapas", "πr²", "2πr"], correctAnswer: 1, hint: "Área total = área lateral + 2 × área de la base", reminder: "No olvides las dos tapas circulares (arriba y abajo)." }),
        staticQuestion({ question: "Si desenrollas un cilindro, ¿qué forma tiene la superficie lateral?", options: ["Un círculo", "Un rectángulo", "Un triángulo", "Una parábola"], correctAnswer: 1, hint: "La superficie lateral se convierte en un rectángulo: base = perímetro del círculo, altura = altura del cilindro", reminder: "El perímetro del círculo es 2πr, que se convierte en la base del rectángulo." }),
      ] },
    },
    {
      id: 'prisma', title: 'El Prisma', icon: '🧊',
      briefing: [
        { type: 'why', body: <>
          Estás diseñando una caja para guardar tus controles de videojuego.
          <br />
          Necesitas calcular exactamente cuánto cartón usar para no desperdiciar material.
          <br />
          Los prismas están en todas partes: cajas, casas, edificios, contenedores.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Un <GlossaryTerm term="Prisma" definition="Cuerpo geométrico con dos bases poligonales iguales y paralelas unidas por caras rectangulares">prisma</GlossaryTerm> es un cuerpo 3D con dos <strong>bases iguales y paralelas</strong>
            (pueden ser triángulos, cuadrados, pentágonos, etc.) unidas por rectángulos.
            Una caja de zapatos es un prisma rectangular. Un Toblerone es un prisma triangular.
          </p>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="font-semibold text-red-800 mb-2">Fórmulas del prisma:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="glass rounded-md p-3 text-center">
                <p className="font-bold">Área Lateral</p>
                <MathTex expr={"A_L = \\text{Perímetro base} \\times h"} />
              </div>
              <div className="glass rounded-md p-3 text-center">
                <p className="font-bold">Área Total</p>
                <MathTex expr={"A_T = A_L + 2 \\times A_{\\text{base}}"} />
              </div>
            </div>
          </div>
          <div className="mt-4 glass rounded-xl p-4 border">
            <p className="font-semibold mb-3">Datos importantes según el tipo de prisma:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-red-100">
                    <th className="px-3 py-2 text-left">Prisma</th>
                    <th className="px-3 py-2 text-center">Vértices</th>
                    <th className="px-3 py-2 text-center">Aristas</th>
                    <th className="px-3 py-2 text-center">Caras</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Triangular', 6, 9, 5],
                    ['Rectangular', 8, 12, 6],
                    ['Pentagonal', 10, 15, 7],
                    ['Hexagonal', 12, 18, 8],
                  ].map(([nombre, v, a, c]) => (
                    <tr key={nombre} className="border-t">
                      <td className="px-3 py-2 font-medium">{nombre}</td>
                      <td className="px-3 py-2 text-center">{v}</td>
                      <td className="px-3 py-2 text-center">{a}</td>
                      <td className="px-3 py-2 text-center">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 bg-red-50 rounded p-3 text-sm">
              <p className="font-semibold">Fórmulas generales para un prisma de n lados:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><strong>Vértices</strong>: <MathTex expr={"V = 2n"} /></li>
                <li><strong>Aristas</strong>: <MathTex expr={"A = 3n"} /></li>
                <li><strong>Caras</strong>: <MathTex expr={"C = n + 2"} /></li>
              </ul>
              <p className="text-xs text-gray-500 mt-1">Ejemplo: Prisma pentagonal (n=5) → V=10, A=15, C=7</p>
            </div>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Confundir prisma rectangular con prisma cuadrado — el rectangular tiene bases rectangulares, no cuadradas.',
          'Olvidar que el área total incluye las DOS bases, no solo una.',
          'Calcular mal el perímetro de la base para el área lateral.',
        ] },
      ],
      reto: { pick: 3, factories: [
        areaLateralPrisma, carasPrisma, aristasPrisma,
      ] },
    },
  ],
}
