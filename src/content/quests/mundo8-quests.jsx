import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }

// Quest 1 — el promedio del squad (estadística)
function mediaSquad(rng = Math.random) {
  const mean = randInt(rng, 9, 20)
  const d1 = randInt(rng, 1, 3), d2 = randInt(rng, 4, 8) // d1 < d2 siempre → 4 opciones distintas
  const vals = [mean - d2, mean - d1, mean, mean + d1, mean + d2] // promedian 'mean'
  const suma = vals.reduce((a, b) => a + b, 0)
  return {
    question: `El squad del Capitán cerró la partida con estas bajas por jugador: ${vals.join(', ')}. ¿Cuál es el promedio del squad?`,
    ...makeOptions(mean, [mean + d1, mean - d1, mean + d2]),
    hint: `Suma = ${suma} y son 5 jugadores → ${suma}/5.`,
    reminder: 'Media = suma de los valores / cantidad de valores.',
  }
}

// Quest 2 — las combinaciones del cofre (conteo)
// n - r >= 2 evita que P(n,r) coincida con n!.
function claveCofre(rng = Math.random) {
  const n = randInt(rng, 5, 7), r = randInt(rng, 2, 3)
  const p = fact(n) / fact(n - r)
  return {
    question: `El cofre del Mercader se abre colocando ${r} gemas en fila, elegidas entre ${n} gemas distintas. Si el orden importa, ¿cuántas claves posibles hay?`,
    ...makeOptions(p, [fact(n) / (fact(r) * fact(n - r)), fact(n), n + r]),
    hint: `P(${n}, ${r}) = ${n}!/(${n} - ${r})!.`,
    reminder: 'Permutación (el orden importa): P(n,r) = n!/(n−r)!.',
  }
}

// n >= 6 evita que C(n,r) coincida con n·r (C(5,2) = 10 = 5·2).
function loteMercader(rng = Math.random) {
  const n = randInt(rng, 6, 9), r = randInt(rng, 2, 3)
  const c = fact(n) / (fact(r) * fact(n - r))
  return {
    question: `El Mercader arma un lote con ${r} reliquias de las ${n} que tiene en el puesto. Si da igual el orden en que las meta, ¿cuántos lotes distintos puede armar?`,
    ...makeOptions(c, [fact(n) / fact(n - r), n * r, n + r]),
    hint: `C(${n}, ${r}) = ${n}!/(${r}!·(${n} - ${r})!).`,
    reminder: 'Combinación (el orden no importa): C(n,r) = n!/(r!(n−r)!).',
  }
}

// Quest 3 — la ruleta de la feria (probabilidad)
// Pares (num, den) coprimos con den != 2·num, para que el complemento
// (den-num)/den nunca coincida con la respuesta num/den.
const FRACCIONES = [[1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]]
function ruletaPremiada(rng = Math.random) {
  const [num, den] = FRACCIONES[randInt(rng, 0, FRACCIONES.length - 1)]
  const k = randInt(rng, 2, 4)
  const fav = num * k, total = den * k
  return {
    question: `La ruleta de la feria tiene ${total} casillas y ${fav} dan premio. ¿Cuál es la probabilidad de premio, simplificada?`,
    ...makeOptions(`${num}/${den}`, [`${den}/${num}`, `${den - num}/${den}`, `${num}/${den - num}`]),
    hint: `${fav}/${total} se simplifica dividiendo arriba y abajo entre ${k}.`,
    reminder: 'P(evento) = casos favorables / casos posibles, en su forma más simple.',
  }
}

export const mundo8Quests = [
  {
    id: 'feria-quest-1',
    title: 'El promedio del squad',
    emoji: '🎯',
    npc: 'Capitán',
    intro: 'El Capitán quiere presumir las estadísticas del squad en la feria, pero nadie sabe sacar los promedios. ¡Hazlo tú antes de que empiece la ronda!',
    outro: '¡Estadísticas listas! El Capitán te sube al cartel del squad como analista oficial.',
    questions: [mediaSquad, staticQuestion({
      question: 'Los 5 del squad marcaron 12, 7, 15, 9 y 21 puntos. ¿Cuál es la mediana?',
      options: ['12', '15', '9', '12.8'],
      correctAnswer: 0,
      hint: 'Ordena primero: 7, 9, 12, 15, 21. La mediana es el valor del medio (el tercero).',
      reminder: 'Mediana = valor central con los datos ordenados. Ojo: no es lo mismo que la media.',
    }), staticQuestion({
      question: 'En esa misma partida el mejor hizo 21 puntos y el peor 7. ¿Cuál es el rango?',
      options: ['14', '21', '7', '28'],
      correctAnswer: 0,
      hint: 'Rango = valor máximo − valor mínimo = 21 − 7.',
      reminder: 'El rango mide qué tan separados están los datos: máx − mín.',
    })],
  },
  {
    id: 'feria-quest-2',
    title: 'Las combinaciones del cofre',
    emoji: '🧰',
    npc: 'Mercader',
    intro: 'El Mercader de la feria olvidó la clave de su cofre y no sabe cuántas combinaciones tendría que probar. Ayúdalo a contarlas antes de que cierre el puesto.',
    outro: '¡Cofre abierto! El Mercader te deja escoger una reliquia del lote como pago.',
    questions: [claveCofre, loteMercader, staticQuestion({
      question: 'En el puesto de disfraces hay 3 sombreros, 4 capas y 2 máscaras. ¿Cuántos disfraces distintos se pueden armar?',
      options: ['24', '9', '12', '20'],
      correctAnswer: 0,
      hint: 'Cada elección es independiente: multiplica 3 × 4 × 2.',
      reminder: 'Principio multiplicativo: multiplica las opciones de cada decisión.',
    })],
  },
  {
    id: 'feria-quest-3',
    title: 'La ruleta de la feria',
    emoji: '🎰',
    npc: 'Croupier',
    intro: 'El Croupier apuesta a que no sabes calcular tus probabilidades reales en su ruleta. Demuéstrale lo contrario y llévate el premio.',
    outro: '¡Premio cobrado! El Croupier guarda la ruleta y admite que contigo no hace negocio.',
    questions: [ruletaPremiada, staticQuestion({
      question: 'En otra ruleta, la probabilidad de ganar es 2/7. ¿Cuál es la probabilidad de NO ganar?',
      options: ['5/7', '7/2', '2/5', '1/7'],
      correctAnswer: 0,
      hint: 'P(no ganar) = 1 − 2/7 = 7/7 − 2/7.',
      reminder: 'P(complemento) = 1 − P(evento).',
    }), staticQuestion({
      question: 'La ruleta de consolación tiene premio en TODAS sus casillas. ¿Cuál es la probabilidad de ganar?',
      options: ['1', '0', '1/2', 'Depende de la suerte'],
      correctAnswer: 0,
      hint: 'Todos los casos posibles son favorables: 8/8, 20/20… siempre da 1.',
      reminder: 'Evento seguro → P = 1. Evento imposible → P = 0. Siempre 0 ≤ P ≤ 1.',
    })],
  },
]
