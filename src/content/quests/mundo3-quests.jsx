import { staticQuestion, randInt, makeOptions } from '../../engine/generators'

// Quest 1 — el streamer que perdió sus stats (aproximación + potencias)
function viewsAproximadas(rng = Math.random) {
  const millones = randInt(rng, 2, 9)
  const miles = randInt(rng, 1, 9)
  const reales = millones * 1_000_000 + miles * 100_000 + randInt(rng, 0, 99_999)
  const aprox = `${millones}.${miles} millones`
  return {
    question: `El stream de RayoGamer marcó ${reales.toLocaleString('es')} visitas. ¿Cuál es la aproximación correcta a 1 decimal en millones?`,
    ...makeOptions(aprox, [`${millones}.${(miles + 1) % 10} millones`, `${millones + 1}.0 millones`, `${millones}.0 millones`]),
    hint: `Mira el dígito de las centenas de mil: ${miles} → primer decimal de millones.`,
    reminder: 'Para aproximar a millones con 1 decimal, el dígito de las centenas de mil es el decimal.',
  }
}
function danioPotenciado(rng = Math.random) {
  const base = randInt(rng, 2, 5)
  const exp = randInt(rng, 2, 3)
  const res = Math.pow(base, exp)
  return {
    question: `RayoGamer recupera un buff que multiplica su daño por ${base}^${exp}. ¿Por cuánto queda multiplicado?`,
    ...makeOptions(res, [base * exp, res + base, Math.pow(base, exp + 1)]),
    hint: `${base}^${exp} = ${base} multiplicado ${exp} veces.`,
    reminder: 'Potencia = multiplicación repetida.',
  }
}

// Quest 2 — reparar el servidor del clan (notación científica + radicales)
function usuariosNotacion(rng = Math.random) {
  const mant = randInt(rng, 2, 9)
  const exp = randInt(rng, 4, 7)
  const real = mant * Math.pow(10, exp)
  return {
    question: `El servidor del clan tiene ${real.toLocaleString('es')} cuentas. ¿Cómo se escribe en notación científica?`,
    ...makeOptions(`${mant} × 10^${exp}`, [`${mant} × 10^${exp + 1}`, `${mant}0 × 10^${exp - 1}`, `${mant} × 10^${exp - 1}`]),
    hint: 'La mantisa debe cumplir 1 ≤ a < 10; cuenta los ceros para el exponente.',
    reminder: 'a × 10^n con 1 ≤ a < 10.',
  }
}
function ladoBaseCuadrada(rng = Math.random) {
  const lado = randInt(rng, 4, 15)
  const area = lado * lado
  return {
    question: `La base cuadrada del servidor ocupa ${area} bloques². ¿Cuánto mide cada lado?`,
    ...makeOptions(lado, [area / 2, lado + 2, area]),
    hint: `√${area} = ? Busca el número que al cuadrado da ${area}.`,
    reminder: '√(lado²) = lado.',
  }
}

export const mundo3Quests = [
  {
    id: 'volcan-quest-1',
    title: 'Los stats perdidos de RayoGamer',
    emoji: '🎥',
    npc: 'RayoGamer',
    intro: 'RayoGamer perdió el panel de stats en pleno directo. ¡Ayúdalo a recalcularlos antes de que caiga el hype!',
    outro: '¡GG! RayoGamer recuperó sus stats y te manda un saludo en el próximo stream.',
    questions: [viewsAproximadas, danioPotenciado, staticQuestion({
      question: '¿Cuánto vale 7^0 (el multiplicador base cuando no hay buff)?',
      options: ['0', '1', '7', 'No existe'], correctAnswer: 1,
      hint: 'Cualquier número (≠0) elevado a la 0 es 1.', reminder: 'a^0 = 1 siempre.',
    })],
  },
  {
    id: 'volcan-quest-2',
    title: 'Reparar el servidor del clan',
    emoji: '🖥️',
    npc: 'Admin del clan',
    intro: 'El servidor del clan se cayó. El admin necesita tus cálculos de capacidad y dimensiones para levantarlo.',
    outro: '¡Servidor en línea! El clan te nombra ingeniero honorario.',
    questions: [usuariosNotacion, ladoBaseCuadrada, staticQuestion({
      question: 'Un cubo de almacenamiento tiene 27 unidades³ de volumen. ¿Cuánto mide su arista?',
      options: ['3', '9', '6', '27'], correctAnswer: 0,
      hint: '³√27 = ? Busca el número que multiplicado 3 veces da 27.', reminder: '³√a = b ⇔ b³ = a.',
    })],
  },
]
