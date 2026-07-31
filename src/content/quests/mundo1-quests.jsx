import { staticQuestion, randInt, makeOptions } from '../../engine/generators'
import { SEASON, pickSeason } from '../season'

// Quest 1 — el tesoro repartido (división, con y sin resto)
function botinPorCofre(rng = Math.random) {
  const tesoro = pickSeason(rng, SEASON.tesoros)
  const cofres = randInt(rng, 3, 8)
  let cada = randInt(rng, 4, 9)
  if (cada === cofres) cada = cofres === 9 ? 4 : cada + 1
  const total = cofres * cada
  return {
    question: `El Pirata Coco reparte ${total} ${tesoro} en ${cofres} cofres iguales. ¿Cuántas van en cada cofre?`,
    ...makeOptions(cada, [cofres, total, cada + cofres]),
    hint: `Reparte en partes iguales: ${total} ÷ ${cofres}.`,
    reminder: 'Repartir en partes iguales es dividir.',
  }
}

function loQueSobra(rng = Math.random) {
  const amigos = randInt(rng, 3, 7)
  const cada = randInt(rng, 4, 9)
  const resto = randInt(rng, 1, amigos - 1) // siempre sobra algo, pero menos que amigos
  const total = amigos * cada + resto
  return {
    question: `Coco reparte ${total} perlas entre ${amigos} piratas, a partes iguales. Después de dar a todos lo mismo, ¿cuántas perlas le sobran?`,
    ...makeOptions(resto, [cada, amigos, resto + amigos]),
    hint: `Cada pirata recibe ${cada} perlas. Eso son ${amigos} × ${cada} = ${amigos * cada}; el resto es lo que sobra.`,
    reminder: 'Lo que sobra al repartir se llama resto, y siempre es menor que el número de partes.',
  }
}

// Quest 2 — el faro de la isla (múltiplos y orden)
function destelloDelFaro(rng = Math.random) {
  const cada = randInt(rng, 3, 9)
  const correcto = cada * randInt(rng, 4, 9)
  return {
    question: `El faro de la Farera Luna destella cada ${cada} segundos. ¿En cuál de estos segundos habrá destello?`,
    ...makeOptions(correcto, [correcto + 1, correcto - 1, correcto + 2]),
    hint: `Habrá destello en los múltiplos de ${cada}: ${cada}, ${cada * 2}, ${cada * 3}…`,
    reminder: 'Los múltiplos de un número son su tabla de multiplicar.',
  }
}

function barcoMasCercano(rng = Math.random) {
  const set = new Set()
  while (set.size < 4) set.add(randInt(rng, 12, 99))
  const distancias = [...set]
  const menor = Math.min(...distancias)
  return {
    question: `Luna ve cuatro barcos a estas distancias en millas: ${distancias.join(', ')}. ¿Cuál es el que está más cerca?`,
    ...makeOptions(menor, distancias.filter(d => d !== menor)),
    hint: 'Más cerca es la distancia más pequeña.',
    reminder: 'El número menor es el que está más a la izquierda en la recta numérica.',
  }
}

export const mundo1Quests = [
  {
    id: 'isla-quest-1',
    title: 'El tesoro repartido',
    emoji: '🏴‍☠️',
    npc: 'Pirata Coco',
    intro: 'El Pirata Coco encontró un tesoro enorme, pero no sabe repartirlo y su tripulación empieza a enfadarse. ¡Ayúdale con las cuentas antes de que haya motín!',
    outro: '¡Reparto perfecto! Coco te nombra contable oficial del barco y te regala un mapa.',
    questions: [botinPorCofre, loQueSobra, staticQuestion({
      question: 'Coco reparte 20 galletas entre 4 loros, en partes iguales. ¿Cuántas le tocan a cada loro?',
      options: ['5', '4', '16', '80'],
      correctAnswer: 0,
      hint: '20 ÷ 4: ¿cuántas veces cabe el 4 en el 20?',
      reminder: 'Al repartir, la respuesta es lo que recibe cada uno, no el total.',
    })],
  },
  {
    id: 'isla-quest-2',
    title: 'El faro de la isla',
    emoji: '🗼',
    npc: 'Farera Luna',
    intro: 'Luna cuida el faro de la isla y esta noche hay niebla. Necesita que le ayudes con los destellos y con los barcos que se acercan.',
    outro: '¡Todos los barcos llegaron a puerto! Luna te deja encender el faro mañana.',
    questions: [destelloDelFaro, barcoMasCercano, staticQuestion({
      question: 'Luna anota estas alturas de olas en metros: 3, 7, 5 y 9. ¿Cuál de estas listas está ordenada de menor a mayor?',
      options: ['3, 5, 7, 9', '9, 7, 5, 3', '3, 7, 5, 9', '5, 3, 9, 7'],
      correctAnswer: 0,
      hint: 'Empieza por el más pequeño y ve subiendo.',
      reminder: 'De menor a mayor es como aparecen en la recta numérica, de izquierda a derecha.',
    })],
  },
]
