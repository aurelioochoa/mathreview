import { staticQuestion, randInt, makeOptions } from '../../engine/generators'
import { resolverLineal } from '../worlds/mundo4-algebra'

const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y] } return x }

// Quest 1 — el reparto del botín (MCD / MCM)
const COPRIMOS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [2, 7], [3, 7]]
function repartoBotin(rng = Math.random) {
  const d = randInt(rng, 3, 9)
  const [m, n] = COPRIMOS[randInt(rng, 0, COPRIMOS.length - 1)]
  const a = d * m, b = d * n
  return {
    question: `El gremio reparte ${a} espadas y ${b} escudos en lotes iguales, sin que sobre nada. ¿Cuál es el máximo de aventureros que reciben lo mismo?`,
    ...makeOptions(d, [2 * d, d + 1, d - 1]),
    hint: `Es el MCD de ${a} y ${b}.`,
    reminder: 'MCD = mayor divisor común de ambos.',
  }
}
function mcmHechizos(rng = Math.random) {
  const g = randInt(rng, 2, 4)
  const m = randInt(rng, 1, 5)
  const n = m + 1 + randInt(rng, 0, 3) // n > m siempre
  const a = g * m, b = g * n
  const mcm = Math.abs(a * b) / gcd(a, b)
  return {
    question: `Un hechizo de ataque se recarga cada ${a} turnos y uno de escudo cada ${b} turnos. Si ambos se activan ahora mismo, ¿en cuántos turnos volverán a coincidir?`,
    ...makeOptions(mcm, [a * b, gcd(a, b), a + b]),
    hint: `MCM(${a}, ${b}) = |${a}×${b}| / MCD(${a}, ${b}).`,
    reminder: 'MCM = múltiplo común más pequeño = |a×b| / MCD(a,b).',
  }
}

// Quest 2 — la cuenta del herrero (ecuaciones lineales / fracciones algebraicas)

export const mundo4Quests = [
  {
    id: 'castillo-quest-1',
    title: 'El reparto del botín',
    emoji: '💰',
    npc: 'Maestro del gremio',
    intro: 'El Maestro del gremio necesita repartir el botín de la última incursión en partes exactas. ¡Échale una mano con las cuentas!',
    outro: '¡Botín repartido sin sobras! El Maestro del gremio te da tu parte y un respeto ganado.',
    questions: [repartoBotin, mcmHechizos, staticQuestion({
      question: 'El maestro te reta: simplifica (x² − 9)/(x + 3). ¿Cuál es el resultado?',
      options: ['x − 3', 'x + 3', '(x − 3)/(x + 3)', 'x² − 3'],
      correctAnswer: 0,
      hint: 'x² − 9 = (x + 3)(x − 3). Cancela el factor común (x + 3).',
      reminder: 'Diferencia de cuadrados: a² − b² = (a + b)(a − b).',
    })],
  },
  {
    id: 'castillo-quest-2',
    title: 'La cuenta del herrero',
    emoji: '⚒️',
    npc: 'Herrero',
    intro: 'El Herrero del castillo se enredó con la factura de tu equipo. Ayúdalo a despejar las cuentas antes de que se enfríe la fragua.',
    outro: '¡Cuentas claras! El Herrero te forja un descuento para tu próxima visita.',
    questions: [resolverLineal, staticQuestion({
      question: 'El herrero cobra según la ecuación 2(x + 4) = 3x − 2, donde x son las horas de trabajo. ¿Cuánto vale x?',
      options: ['x = 6', 'x = 10', 'x = 8', 'x = -10'],
      correctAnswer: 1,
      hint: 'Expande: 2x + 8 = 3x − 2 → 8 + 2 = 3x − 2x → 10 = x.',
      reminder: 'Primero distribuye, luego agrupa términos semejantes.',
    }), staticQuestion({
      question: 'El herrero necesita simplificar esta fracción de materiales: (2x + 6)/(4x + 8). ¿Cuál es su forma más simple?',
      options: ['(x + 3)/(2x + 4)', '(x + 3)/(x + 2)', '(2x + 3)/(4x + 2)', '1/2'],
      correctAnswer: 0,
      hint: '2x + 6 = 2(x + 3) y 4x + 8 = 4(x + 2). El factor común de los coeficientes es 2 (no 4), así que 2/4 se reduce a 1/2.',
      reminder: 'Factoriza numerador y denominador, luego cancela solo factores comunes completos.',
    })],
  },
]
