import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

const sg = (k) => (k >= 0 ? `+ ${k}` : `- ${-k}`)

// Quest 1 — trayectoria de la nave (pendiente / corte con el eje Y)
function ascensoNave(rng = Math.random) {
  const m = randInt(rng, 2, 9)
  const b = 2 * randInt(rng, 5, 30) + 1 // impar → b - m nunca coincide con m
  return {
    question: `El panel de la nave modela la altitud como f(t) = ${m}t + ${b} (t en segundos, altitud en km). ¿Cuántos km gana la nave por cada segundo?`,
    ...makeOptions(m, [b, m + b, b - m]),
    hint: `En f(t) = mt + b, el ritmo de subida es m: lo que multiplica a t. Aquí m = ${m}.`,
    reminder: 'Pendiente m = cuánto cambia f por cada unidad. b = punto de partida.',
  }
}

function corteRadar(rng = Math.random) {
  const m = randInt(rng, 2, 9)
  const b = randInt(rng, 10, 40)
  return {
    question: `En el radar, la ruta de la nave es f(x) = ${m}x + ${b}. ¿En qué punto cruza el eje Y de la pantalla?`,
    ...makeOptions(`(0, ${b})`, [`(${b}, 0)`, `(0, ${m})`, `(${m}, ${b})`]),
    hint: 'El eje Y se cruza cuando x = 0. Sustituye x = 0 en la función.',
    reminder: 'Corte con el eje Y = (0, b).',
  }
}

// Quest 2 — el salto del cohete (vértice de la parábola)
function apogeoCohete(rng = Math.random) {
  const h = randInt(rng, 2, 8) // segundo del apogeo
  let k = randInt(rng, 10, 60) // altura máxima
  if (k === h * h) k += 1 // evita c = 0 ("+ 0" queda feo en el enunciado)
  const b = 2 * h // con a = -1: h = -b/2a = b/2
  const c = k - h * h // f(h) = -h² + 2h² + c = h² + c = k
  return {
    question: `La simulación del salto da h(t) = -t² + ${b}t ${sg(c)} (t en segundos, altura en metros). ¿En qué segundo llega al punto más alto y a qué altura (vértice)?`,
    ...makeOptions(`(${h}, ${k})`, [`(${k}, ${h})`, `(${-h}, ${k})`, `(0, ${c})`]),
    hint: `t = -b/2a = -${b}/(2·(-1)) = ${h}. Luego sustituye: h(${h}) = ${k}.`,
    reminder: 'Vértice: h = -b/2a, k = f(h). Con a < 0 el vértice es el máximo.',
  }
}

export const mundo6Quests = [
  {
    id: 'estacion-quest-1',
    title: 'Trayectoria de la nave',
    emoji: '🛸',
    npc: 'Piloto',
    intro: 'El Piloto perdió la telemetría a mitad del ascenso y solo le queda la ecuación de la trayectoria. Ayúdalo a leerla antes de que la nave se salga de la ruta.',
    outro: '¡Ruta corregida! El Piloto te reserva el asiento de copiloto para el próximo despegue.',
    questions: [ascensoNave, corteRadar, staticQuestion({
      question: 'La estación detecta una nave cuya trayectoria tiene pendiente m = -4. ¿Qué está haciendo esa nave?',
      options: ['Descendiendo', 'Ascendiendo', 'Manteniendo la altitud', 'Girando en círculos'],
      correctAnswer: 0,
      hint: 'Una pendiente negativa hace que la recta baje de izquierda a derecha.',
      reminder: 'm > 0: sube. m < 0: baja. m = 0: horizontal.',
    })],
  },
  {
    id: 'estacion-quest-2',
    title: 'El salto del cohete',
    emoji: '🚀',
    npc: 'Ingeniera',
    intro: 'La Ingeniera de la estación necesita validar el salto de prueba del cohete antes de autorizar el lanzamiento. Sin los cálculos del vértice, no hay despegue.',
    outro: '¡Salto validado! La Ingeniera firma la autorización de lanzamiento con tu nombre en el informe.',
    questions: [apogeoCohete, staticQuestion({
      question: 'La Ingeniera revisa una trayectoria con a = -2. ¿Hacia dónde abre la parábola?',
      options: ['Hacia arriba (U)', 'Hacia abajo (∩)', 'Hacia la derecha', 'No abre: es una recta'],
      correctAnswer: 1,
      hint: 'El signo de a manda: a < 0 abre hacia abajo, y el vértice es el máximo.',
      reminder: 'a > 0: U hacia arriba. a < 0: ∩ hacia abajo.',
    }), staticQuestion({
      question: 'La Ingeniera calcula el discriminante de otra trayectoria y obtiene Δ = b² - 4ac = -20. ¿Qué le dice ese número sobre los cortes con el eje X?',
      options: ['Corta el eje X en dos puntos', 'Toca el eje X en un solo punto', 'No corta el eje X: no hay raíces reales', 'Corta el eje X en tres puntos'],
      correctAnswer: 2,
      hint: 'Δ < 0 deja una raíz cuadrada de número negativo, que no da un resultado real.',
      reminder: 'Δ > 0: 2 raíces. Δ = 0: 1 raíz doble. Δ < 0: sin raíces reales.',
    })],
  },
]
