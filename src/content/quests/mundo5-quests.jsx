import { staticQuestion } from '../../engine/generators'
import { cuadrantePunto, cramerDeterminante } from '../worlds/mundo5-sistemas'

export const mundo5Quests = [
  {
    id: 'laberinto-quest-1',
    title: 'El cruce de caminos',
    emoji: '🧭',
    npc: 'Guía del laberinto',
    intro: 'El Guía del laberinto perdió el mapa de los cruces. Ayúdalo a ubicar puntos y caminos antes de que se pierda entre los pasillos.',
    outro: '¡Cruce resuelto! El Guía del laberinto te marca el camino más corto hacia la salida.',
    questions: [cuadrantePunto, staticQuestion({
      question: 'En el laberinto, la Ruta A mide 100 + 3x metros y la Ruta B mide 50 + 5x metros, donde x son los pasillos cruzados. ¿En qué valor de x se cruzan (miden lo mismo)?',
      options: ['x = 25', 'x = 10', 'x = 50', 'x = 75'],
      correctAnswer: 0,
      hint: 'Iguala las rutas: 100 + 3x = 50 + 5x → 100 − 50 = 5x − 3x → 50 = 2x.',
      reminder: 'Para hallar el cruce, iguala las dos expresiones y despeja x.',
    }), staticQuestion({
      question: 'Dos pasillos del laberinto son paralelos: por más que avances, nunca se cruzan. ¿Cuántas soluciones tiene el sistema que los representa?',
      options: ['Una solución única', 'Ninguna solución', 'Infinitas soluciones', 'Dos soluciones'],
      correctAnswer: 1,
      hint: 'Si los pasillos nunca se cruzan, no existe ningún punto (x, y) que satisfaga ambas ecuaciones.',
      reminder: 'Rectas paralelas → sin solución. Rectas idénticas → infinitas soluciones.',
    })],
  },
  {
    id: 'laberinto-quest-2',
    title: 'La cerradura de Cramer',
    emoji: '🔐',
    npc: 'Cerrajero',
    intro: 'El Cerrajero del laberinto guarda la salida detrás de una cerradura que solo se abre calculando determinantes. ¡Ayúdalo a resolverla!',
    outro: '¡Clic! La cerradura se abre. El Cerrajero te entrega la llave maestra del laberinto.',
    questions: [cramerDeterminante, staticQuestion({
      question: 'Para abrir la primera cerradura, el Cerrajero calculó D = 6 y Dx = 18. ¿Cuánto vale x?',
      options: ['3', '18', '6', '24'],
      correctAnswer: 0,
      hint: 'x = Dx / D = 18 / 6.',
      reminder: 'La regla de Cramer dice: x = Dx/D, y = Dy/D.',
    }), staticQuestion({
      question: 'El Cerrajero calcula el determinante de una cerradura y obtiene D = 0. ¿Qué significa esto?',
      options: ['Tiene una solución única', 'No tiene solución única (podría ser sin solución o infinitas)', 'El resultado siempre es x = 0, y = 0', 'Hay que multiplicar todo por −1'],
      correctAnswer: 1,
      hint: 'Si D = 0 no puedes dividir para hallar x = Dx/D, así que no hay una única solución.',
      reminder: 'D = 0 → rectas paralelas (sin solución) o coincidentes (infinitas soluciones).',
    })],
  },
]
