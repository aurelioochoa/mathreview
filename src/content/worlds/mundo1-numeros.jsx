import GlossaryTerm from '../../components/GlossaryTerm'
import { staticQuestion, randInt, makeOptions } from '../../engine/generators'
import { SEASON, pickSeason } from '../season'

// Mundo 1 — tono 8-11 años (spec de Fase 4 §3): frases cortas, sin incógnitas ni
// exponentes, resultados manejables y divisiones siempre exactas.

// ——— Nivel 1: operaciones básicas ———
export function sumaDelTesoro(rng = Math.random) {
  const tesoro = pickSeason(rng, SEASON.tesoros)
  const a = randInt(rng, 25, 60)
  const b = randInt(rng, 10, 20) // menor que a → la resta distractora nunca es negativa
  return {
    question: `Encuentras ${a} ${tesoro} en un cofre y ${b} más en otro. ¿Cuántas tienes en total?`,
    ...makeOptions(a + b, [a - b, a + b + 10, a + b - 1]),
    hint: `Junta las dos cantidades: ${a} + ${b}.`,
    reminder: 'Si juntas cantidades, sumas.',
  }
}

export function restaDelViaje(rng = Math.random) {
  const a = randInt(rng, 60, 99)
  const b = randInt(rng, 12, 35)
  return {
    question: `Llevabas ${a} conchas y regalaste ${b} a tu amigo. ¿Cuántas te quedan?`,
    ...makeOptions(a - b, [a + b, a - b + 10, a - b - 10]),
    hint: `Quitas lo que regalaste: ${a} − ${b}.`,
    reminder: 'Si quitas o regalas, restas.',
  }
}

export function multiplicaCriaturas(rng = Math.random) {
  const criatura = pickSeason(rng, SEASON.criaturas)
  const grupos = randInt(rng, 3, 9)
  const cada = randInt(rng, 4, 9)
  return {
    question: `En la isla hay ${grupos} cuevas y en cada una viven ${cada} criaturas tipo ${criatura}. ¿Cuántas criaturas hay?`,
    ...makeOptions(grupos * cada, [grupos + cada, grupos * cada + grupos, grupos * cada - cada]),
    hint: `Son ${grupos} grupos iguales de ${cada}: ${grupos} × ${cada}.`,
    reminder: 'Grupos iguales se cuentan multiplicando.',
  }
}

export function repartoExacto(rng = Math.random) {
  const snack = pickSeason(rng, SEASON.snacks)
  const cada = randInt(rng, 3, 9)
  let amigos = randInt(rng, 3, 8)
  if (amigos === cada) amigos = cada === 8 ? 3 : amigos + 1 // que la respuesta no coincida con un distractor
  const total = amigos * cada
  return {
    question: `Repartes ${total} ${snack} entre ${amigos} amigos, en partes iguales. ¿Cuántas le tocan a cada uno?`,
    ...makeOptions(cada, [amigos, total, cada + amigos]),
    hint: `Reparte en partes iguales: ${total} ÷ ${amigos}.`,
    reminder: 'Repartir en partes iguales es dividir.',
  }
}

// ——— Nivel 2: ordenar y comparar ———
function cuatroDistintos(rng, min, max) {
  const set = new Set()
  while (set.size < 4) set.add(randInt(rng, min, max))
  return [...set]
}

export function elMayorDeTodos(rng = Math.random) {
  const juego = pickSeason(rng, SEASON.juegos)
  const nums = cuatroDistintos(rng, 10, 99)
  const mayor = Math.max(...nums)
  return {
    question: `Cuatro amigos marcaron estos puntos en ${juego}: ${nums.join(', ')}. ¿Cuál es la puntuación más alta?`,
    ...makeOptions(mayor, nums.filter(n => n !== mayor)),
    hint: 'La más alta es la que está más a la derecha en la recta numérica.',
    reminder: 'Mayor = más grande = más a la derecha.',
  }
}

export function elMenorDeTodos(rng = Math.random) {
  const nums = cuatroDistintos(rng, 10, 99)
  const menor = Math.min(...nums)
  return {
    question: `Estas son las medallas de cuatro equipos: ${nums.join(', ')}. ¿Cuál es la cantidad más pequeña?`,
    ...makeOptions(menor, nums.filter(n => n !== menor)),
    hint: 'La más pequeña es la que está más a la izquierda en la recta numérica.',
    reminder: 'Menor = más pequeño = más a la izquierda.',
  }
}

export function signoCorrecto(rng = Math.random) {
  let a = randInt(rng, 5, 99)
  let b = randInt(rng, 5, 99)
  if (a === b) b = b === 99 ? b - 1 : b + 1 // siempre hay un mayor claro
  const correcto = a < b ? `${a} < ${b}` : `${a} > ${b}`
  const otro = a < b ? `${a} > ${b}` : `${a} < ${b}`
  return {
    question: `¿Qué signo va entre ${a} y ${b}?`,
    ...makeOptions(correcto, [otro, `${a} = ${b}`, 'No se pueden comparar']),
    hint: 'El pico del signo apunta siempre al número más pequeño.',
    reminder: '< es "menor que" y > es "mayor que". El pico mira al chico.',
  }
}

// ——— Nivel 3: múltiplos y divisores ———
export function encuentraMultiplo(rng = Math.random) {
  const n = randInt(rng, 3, 9)
  const correcto = n * randInt(rng, 3, 9)
  // n >= 3 garantiza que sumar 1, 2 o restar 1 nunca vuelve a caer en la tabla.
  return {
    question: `¿Cuál de estos números es múltiplo de ${n}?`,
    ...makeOptions(correcto, [correcto + 1, correcto - 1, correcto + 2]),
    hint: `Un múltiplo de ${n} sale de multiplicar ${n} por algún número entero.`,
    reminder: 'Los múltiplos de un número son su tabla de multiplicar.',
  }
}

const PRIMOS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
const COMPUESTOS = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28]

export function cualEsPrimo(rng = Math.random) {
  const primo = PRIMOS[randInt(rng, 0, PRIMOS.length - 1)]
  const pool = [...COMPUESTOS]
  const otros = []
  while (otros.length < 3) otros.push(...pool.splice(randInt(rng, 0, pool.length - 1), 1))
  return {
    question: '¿Cuál de estos números es primo?',
    ...makeOptions(primo, otros),
    hint: 'Un número primo solo se puede dividir entre 1 y él mismo.',
    reminder: 'Primo = exactamente dos divisores: el 1 y él mismo.',
  }
}

export function divideExacto(rng = Math.random) {
  const divisor = randInt(rng, 3, 9)
  const numero = divisor * randInt(rng, 4, 9)
  // Los distractores son vecinos del divisor que no dividen exacto al número.
  const otros = []
  for (let d = 2; otros.length < 3 && d <= 12; d++) {
    if (d !== divisor && numero % d !== 0) otros.push(d)
  }
  return {
    question: `¿Entre cuál de estos números se puede repartir ${numero} sin que sobre nada?`,
    ...makeOptions(divisor, otros),
    hint: `Prueba a dividir ${numero} entre cada opción y mira cuál no deja resto.`,
    reminder: 'Un divisor cabe justo, sin que sobre.',
  }
}

// ——— Nivel 4: jerarquía de operaciones ———
export function primeroMultiplicar(rng = Math.random) {
  const a = randInt(rng, 2, 9)
  const b = randInt(rng, 3, 9) // b >= 3 evita que a+b+c coincida con la respuesta
  let c = randInt(rng, 2, 9)
  if (c === a) c = a === 9 ? 2 : c + 1 // a != c evita que a*b+c coincida
  return {
    question: `¿Cuánto vale ${a} + ${b} × ${c}?`,
    ...makeOptions(a + b * c, [(a + b) * c, a + b + c, a * b + c]),
    hint: `La multiplicación va antes que la suma: primero ${b} × ${c} = ${b * c}.`,
    reminder: 'Primero × y ÷, después + y −.',
  }
}

export function primeroParentesis(rng = Math.random) {
  const a = randInt(rng, 2, 9)
  const b = randInt(rng, 3, 9)
  let c = randInt(rng, 2, 9)
  if (c === a) c = a === 9 ? 2 : c + 1
  return {
    question: `¿Cuánto vale (${a} + ${b}) × ${c}?`,
    ...makeOptions((a + b) * c, [a + b * c, a + b + c, a * b + c]),
    hint: `El paréntesis manda: primero ${a} + ${b} = ${a + b}, y eso se multiplica por ${c}.`,
    reminder: 'Lo que está entre paréntesis se hace primero, siempre.',
  }
}

export const mundo1 = {
  id: 'mundo1', slug: 'isla-numerica', name: 'Isla Numérica',
  emoji: '🏝️', color: 'bg-world-isla',
  description: 'Operaciones básicas, orden, múltiplos y divisores',
  boss: { name: 'El Kraken Contador', emoji: '🐙', intro: 'El Kraken vive bajo el muelle y no deja salir de la isla a quien no domine sus números. ¡Demuéstrale que ya sabes!' },
  levels: [
    {
      id: 'operaciones', title: 'Operaciones básicas', icon: '🐚',
      briefing: [
        { type: 'why', body: <>
          Juntas monedas, repartes caramelos, cuentas cuántas vidas te quedan.
          <br />
          Todo eso son las cuatro operaciones, y son la base de TODO lo demás.
          <br />
          Si las dominas aquí, el resto de la isla se vuelve fácil.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Hay cuatro operaciones básicas, y cada una responde a una pregunta distinta:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="glass rounded-xl p-3"><strong>➕ Sumar</strong><br />Juntar cosas. 8 conchas + 5 conchas = 13 conchas.</div>
            <div className="glass rounded-xl p-3"><strong>➖ Restar</strong><br />Quitar o regalar. 13 − 5 = 8.</div>
            <div className="glass rounded-xl p-3"><strong>✖️ Multiplicar</strong><br />Sumar grupos iguales. 4 cuevas de 5 criaturas = 4 × 5 = 20.</div>
            <div className="glass rounded-xl p-3"><strong>➗ Dividir</strong><br />Repartir en partes iguales. 20 entre 4 amigos = 5 a cada uno.</div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Multiplicar y dividir son atajos: multiplicar es sumar muchas veces lo mismo, y dividir es repartir hasta que no sobre nada.
          </p>
        </> },
        { type: 'widget', widgetId: 'operaciones-visual', title: 'Conchas que se juntan, se regalan, se agrupan y se reparten' },
        { type: 'mistakes', items: [
          'Ojo al leer: "regalé" y "perdí" piden restar, aunque el problema tenga números grandes.',
          'Multiplicar no es sumar los dos números: 4 × 5 es 20, no 9.',
          'Al repartir, la respuesta es lo que le toca a CADA uno, no el total.',
        ] },
      ],
      reto: { pick: 3, factories: [sumaDelTesoro, restaDelViaje, multiplicaCriaturas, repartoExacto] },
    },
    {
      id: 'orden', title: 'Ordenar números', icon: '📏',
      briefing: [
        { type: 'why', body: <>
          ¿Quién va ganando? ¿Cuál es el récord? ¿Qué precio es más barato?
          <br />
          Para responder hay que comparar números, y para comparar hay un truco visual.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">
            Imagina todos los números colocados en una fila, de menor a mayor. Eso es la{' '}
            <GlossaryTerm term="Recta numérica" definition="Una línea donde los números se colocan en orden, de menor a mayor">recta numérica</GlossaryTerm>.
          </p>
          <div className="glass rounded-xl p-4 text-sm">
            <p className="mb-2">La regla es simple:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cuanto <strong>más a la derecha</strong>, <strong>mayor</strong> es el número.</li>
              <li>Cuanto <strong>más a la izquierda</strong>, <strong>menor</strong>.</li>
            </ul>
            <p className="mt-3 mb-1">Y para escribirlo se usan dos signos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>&lt;</strong> significa "menor que": 3 &lt; 8</li>
              <li><strong>&gt;</strong> significa "mayor que": 8 &gt; 3</li>
            </ul>
            <p className="mt-3 text-emerald-700 font-semibold">🐊 Truco: el pico del signo siempre apunta al número más pequeño.</p>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Confundir < con >. Recuerda el truco: el pico mira al chico.',
          'Pensar que un número es mayor porque tiene más dígitos escritos... eso sí funciona: 100 tiene más dígitos que 99, y es mayor. ¡Pero compruébalo siempre!',
        ] },
        { type: 'widget', widgetId: 'recta-numerica', title: 'Coloca dos números en la recta' },
      ],
      reto: { pick: 3, factories: [elMayorDeTodos, elMenorDeTodos, signoCorrecto] },
    },
    {
      id: 'multiplos-divisores', title: 'Múltiplos y divisores', icon: '🔢',
      briefing: [
        { type: 'why', body: <>
          ¿Se puede repartir una bolsa de 24 caramelos entre 5 amigos sin partir ninguno?
          <br />
          Los divisores responden justo eso: qué repartos salen exactos y cuáles no.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">Son dos ideas parecidas, y por eso se confunden. Míralas juntas:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="glass rounded-xl p-3">
              <strong>✖️ Múltiplos de 4</strong><br />
              Salen de multiplicar: 4, 8, 12, 16, 20…<br />
              <span className="text-gray-500">Es la tabla del 4. Hay infinitos.</span>
            </div>
            <div className="glass rounded-xl p-3">
              <strong>➗ Divisores de 12</strong><br />
              Caben justos: 1, 2, 3, 4, 6, 12.<br />
              <span className="text-gray-500">Siempre son unos pocos.</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Un <GlossaryTerm term="Número primo" definition="Número mayor que 1 que solo tiene dos divisores: el 1 y él mismo">número primo</GlossaryTerm> es
            uno especial: solo tiene <strong>dos</strong> divisores, el 1 y él mismo. Por ejemplo el 7: solo se puede repartir entre 1 persona o entre 7.
          </p>
          <p className="text-sm text-gray-500 mt-2">El 1 no es primo, porque solo tiene un divisor. Y el 2 sí lo es: es el único primo par.</p>
        </> },
        { type: 'mistakes', items: [
          'Cambiar múltiplos por divisores. Los múltiplos son más grandes (o iguales); los divisores, más pequeños (o iguales).',
          'Olvidar que todo número es divisor de sí mismo, y que el 1 divide a todos.',
          'Creer que todos los números impares son primos: el 9 es impar y no es primo (1, 3 y 9 lo dividen).',
        ] },
        { type: 'widget', widgetId: 'divisores-explorer', title: 'Explora divisores, múltiplos y primos' },
      ],
      reto: { pick: 3, factories: [encuentraMultiplo, cualEsPrimo, divideExacto] },
    },
    {
      id: 'jerarquia', title: 'Jerarquía de operaciones', icon: '🧮',
      briefing: [
        { type: 'why', body: <>
          Si dos personas resuelven 2 + 3 × 4 y les da 20 y 14, una está equivocada.
          <br />
          Existe un orden acordado en todo el mundo para que a todos les dé lo mismo.
        </> },
        { type: 'content', body: <>
          <p className="text-sm text-gray-600 mb-4">Cuando hay varias operaciones juntas, se resuelven en este orden:</p>
          <ol className="space-y-2 text-sm">
            <li className="glass rounded-xl p-3"><strong>1️⃣ Paréntesis ( )</strong> — lo de dentro, siempre lo primero.</li>
            <li className="glass rounded-xl p-3"><strong>2️⃣ Multiplicar y dividir</strong> — de izquierda a derecha.</li>
            <li className="glass rounded-xl p-3"><strong>3️⃣ Sumar y restar</strong> — de izquierda a derecha.</li>
          </ol>
          <div className="mt-4 glass rounded-xl p-4 text-sm">
            <p className="font-semibold mb-1">Ejemplo: 2 + 3 × 4</p>
            <p>Primero 3 × 4 = 12. Luego 2 + 12 = <strong className="text-violet-700">14</strong>.</p>
            <p className="mt-2 font-semibold mb-1">Y con paréntesis: (2 + 3) × 4</p>
            <p>Primero 2 + 3 = 5. Luego 5 × 4 = <strong className="text-emerald-700">20</strong>.</p>
            <p className="text-gray-500 mt-2">Mismos números, resultado distinto. Por eso los paréntesis importan tanto.</p>
          </div>
        </> },
        { type: 'mistakes', items: [
          'Resolver de izquierda a derecha sin mirar: 2 + 3 × 4 no es 20.',
          'Saltarse los paréntesis porque "son pocos números".',
          'Entre × y ÷ no hay preferencia: se hacen en el orden en que aparecen.',
        ] },
        { type: 'widget', widgetId: 'jerarquia-pasos', title: 'Compara con y sin paréntesis' },
      ],
      reto: { pick: 3, factories: [
        primeroMultiplicar,
        primeroParentesis,
        staticQuestion({
          question: '¿Qué operación se resuelve primero en 10 − 2 × 3?',
          options: ['La multiplicación 2 × 3', 'La resta 10 − 2', 'Da igual el orden', 'Se empieza por la derecha'],
          correctAnswer: 0,
          hint: 'Multiplicar y dividir van siempre antes que sumar y restar.',
          reminder: 'Orden: paréntesis → × ÷ → + −.',
        }),
      ] },
    },
  ],
}
