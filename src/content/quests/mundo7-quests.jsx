import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

// Tripletas pitagóricas: garantizan lados enteros en las dos fábricas de la Quest 1.
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]]

// Quest 1 — la escalada segura (Pitágoras)
function cuerdaTirolesa(rng = Math.random) {
  const [a, b, c] = TRIPLES[randInt(rng, 0, TRIPLES.length - 1)]
  return {
    question: `El Sherpa tiende una tirolesa entre dos riscos separados ${a} m en horizontal, con ${b} m de desnivel. ¿Cuántos metros mide el tramo recto de cuerda?`,
    ...makeOptions(c, [a + b, a * a + b * b, Math.max(a, b)]),
    hint: `La cuerda es la hipotenusa: c = √(${a}² + ${b}²) = √${a * a + b * b}.`,
    reminder: 'a² + b² = c². La hipotenusa es el lado más largo.',
  }
}

function alturaRefugio(rng = Math.random) {
  const [a, b, c] = TRIPLES[randInt(rng, 0, TRIPLES.length - 1)]
  return {
    question: `Desde el campamento sale una cuerda de ${c} m en diagonal hasta el refugio, que queda ${a} m más allá en horizontal. ¿Cuántos metros sube en vertical?`,
    ...makeOptions(b, [c - a, c * c - a * a, c]),
    hint: `Despeja el cateto: b = √(${c}² - ${a}²) = √${c * c - a * a}.`,
    reminder: 'Si conoces la hipotenusa y un cateto: b² = c² - a².',
  }
}

// Quest 2 — el refugio cilíndrico (trigonometría 30° y cuerpos geométricos)
function rampaTreinta(rng = Math.random) {
  const hyp = 2 * randInt(rng, 2, 12) // par → altura entera
  const op = hyp / 2 // sen(30°) = 0.5
  return {
    question: `La Arquitecta diseña la rampa de acceso al refugio: ${hyp} m de largo con una inclinación de 30°. ¿Cuánta altura gana la rampa?`,
    ...makeOptions(op, [hyp, hyp * 2, op + 1]),
    hint: 'sen(30°) = 0.5 → altura = largo de la rampa × 0.5.',
    reminder: 'sen(α) = opuesto/hipotenusa → opuesto = hipotenusa × sen(α).',
  }
}

export const mundo7Quests = [
  {
    id: 'montanas-quest-1',
    title: 'La escalada segura',
    emoji: '🧗',
    npc: 'Sherpa',
    intro: 'El Sherpa no sube a nadie sin medir antes las cuerdas. Ayúdalo con los cálculos de la ruta o la expedición se queda en el campamento base.',
    outro: '¡Ruta asegurada! El Sherpa te regala su mosquetón de la suerte para la próxima cumbre.',
    questions: [cuerdaTirolesa, alturaRefugio, staticQuestion({
      question: 'Un aprendiz calcula una cuerda con catetos de 3 m y 4 m y dice que mide 7 m. ¿Cuánto mide en realidad?',
      options: ['5 m', '7 m', '25 m', '12 m'],
      correctAnswer: 0,
      hint: 'Los cuadrados no se pueden sumar por separado: √(9 + 16) = √25 = 5, no √9 + √16 = 7.',
      reminder: 'Primero suma los cuadrados y después saca la raíz: √(a² + b²).',
    })],
  },
  {
    id: 'montanas-quest-2',
    title: 'El refugio cilíndrico',
    emoji: '🏔️',
    npc: 'Arquitecta',
    intro: 'La Arquitecta de la montaña levanta un refugio cilíndrico antes de que llegue la tormenta, pero le faltan las medidas. ¡Échale una mano!',
    outro: '¡Refugio en pie! La Arquitecta te deja la litera junto a la estufa.',
    questions: [rampaTreinta, staticQuestion({
      question: 'El refugio es un cilindro de radio 3 m y altura 5 m. ¿Cuánta lona necesita la Arquitecta para forrar la pared curva (área lateral)?',
      options: ['30π m²', '15π m²', '45π m²', '8π m²'],
      correctAnswer: 0,
      hint: 'A_L = 2πrh = 2π(3)(5).',
      reminder: 'Área lateral del cilindro = 2π·r·h.',
    }), staticQuestion({
      question: 'La bodega anexa es un prisma de base hexagonal (6 lados). ¿Cuántas caras hay que impermeabilizar en total?',
      options: ['8', '6', '12', '18'],
      correctAnswer: 0,
      hint: 'Son las 6 caras laterales más las 2 bases.',
      reminder: 'Prisma de n lados: caras = n + 2, aristas = 3n, vértices = 2n.',
    })],
  },
]
